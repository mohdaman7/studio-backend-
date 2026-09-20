import { sseManager } from '../utils/sseManager';
import { Notification } from '../models/Notification.model';
import { User } from '../models/User.model';
import { Customer } from '../models/Customer.model';
import mongoose from 'mongoose';
import { Sale } from '../models/Sale.model';
import { Purchase } from '../models/Purchase.model';
import { CreditSale } from '../models/CreditSale.model';
import { Expense } from '../models/Expense.model';
import { Product } from '../models/Product.model';
import { StockLedger } from '../models/StockLedger.model';
import { AppError } from '../middlewares/error.middleware';
import { Request } from 'express';

export class TransactionService {
  // ─── Sales ─────────────────────────────────────────────────────────────────
  async getAllSales(req: Request) {
    const page = parseInt((req.query.page as string) || '1', 10);
    const limit = parseInt((req.query.limit as string) || '20', 10);
    const skip = (page - 1) * limit;
    const branchId = (req.user as any)?.branchId;
    const companyId = (req.user as any)?.companyId;

    const filter: any = {};
    if (companyId) filter.companyId = new mongoose.Types.ObjectId(companyId);
    if (branchId) filter.branchId = new mongoose.Types.ObjectId(branchId);
    if (req.query.status) filter.status = req.query.status;
    if (req.query.startDate || req.query.endDate) {
      filter.saleDate = {};
      if (req.query.startDate) filter.saleDate.$gte = new Date(req.query.startDate as string);
      if (req.query.endDate) filter.saleDate.$lte = new Date(req.query.endDate as string);
    }

    const [data, total] = await Promise.all([
      Sale.find(filter)
        .sort({ saleDate: -1 })
        .skip(skip)
        .limit(limit)
        .populate('customerId', 'name phone')
        .populate('cashierId', 'name')
        .lean()
        .exec(),
      Sale.countDocuments(filter).exec(),
    ]);

    return { data, total, page, limit };
  }

  async getSaleById(id: string) {
    const sale = await Sale.findById(id)
      .populate('customerId', 'name phone email')
      .populate('cashierId', 'name email')
      .populate('items.productId', 'name sku')
      .exec();
    if (!sale) throw new AppError('Sale not found', 404);
    return sale;
  }

  async createSale(input: any, cashierId: string) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const invoiceNumber = `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const grandTotal = input.grandTotal || 0;
      const paidAmount = input.paidAmount || 0;
      const dueAmount = Math.max(0, grandTotal - paidAmount);
      const companyId = input.companyId;
      const branchId = input.branchId;

      // Deduct stock for each sold item and stage stock ledger records
      const ledgerEntries: any[] = [];
      for (const item of input.items) {
        const product = await Product.findById(item.productId).session(session);
        if (!product) continue;
        const previousStock = product.stock;
        let matchedVariantId: any = undefined;
        if (product.hasVariants && product.variants?.length) {
          const matchedVariant = product.variants.find(
            (v: any) => v.sku === item.variantSku || (v.size === item.selectedSize && v.color === item.selectedColor)
          );
          if (matchedVariant) {
            matchedVariantId = matchedVariant._id;
            matchedVariant.stock = Math.max(0, matchedVariant.stock - item.quantity);
          }
          product.stock = product.variants.reduce((sum: number, v: any) => sum + (v.stock || 0), 0);
          await product.save({ session });
        } else {
          product.stock = Math.max(0, product.stock - item.quantity);
          await product.save({ session });
        }
        ledgerEntries.push({
          companyId,
          branchId,
          productId: product._id,
          variantId: matchedVariantId,
          action: 'sale_out',
          quantity: item.quantity,
          previousStock,
          currentStock: product.stock,
          referenceType: 'Sale',
          notes: `POS Checkout ${invoiceNumber}${item.selectedSize ? ` [${item.selectedSize}]` : ''}`,
          performedBy: cashierId,
        });
      }
      const [sale] = await Sale.create([{
        companyId,
        branchId,
        invoiceNumber,
        customerId: input.customerId || undefined,
        items: input.items,
        subtotal: input.subtotal,
        taxTotal: input.taxTotal || 0,
        discount: input.discount || 0,
        couponDiscount: input.couponDiscount || 0,
        grandTotal,
        paidAmount,
        dueAmount,
        paymentMethod: input.paymentMethod,
        notes: input.notes,
        cashierId,
        saleDate: input.saleDate ? new Date(input.saleDate) : new Date(),
      }], { session });
      // Link referenceId to newly created sale and insert ledger records within transaction
      if (ledgerEntries.length > 0) {
        const finalizedLedger = ledgerEntries.map((l) => ({ ...l, referenceId: sale._id }));
        await StockLedger.create(finalizedLedger, { session });
      }

      if (input.paymentMethod === 'credit' && input.customerId) {
        await CreditSale.create([{
          companyId,
          branchId,
          customerId: input.customerId,
          saleId: sale._id,
          totalCreditAmount: grandTotal,
          paidAmount: paidAmount,
          dueAmount: grandTotal - paidAmount,
          dueDate: input.dueDate ? new Date(input.dueDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        }], { session });
      }

      await session.commitTransaction();

      // Broadcast sale in background & create system notification
      try {
        const [cashierUser, customerUser, productItems] = await Promise.all([
          User.findById(cashierId).select('name').lean(),
          input.customerId ? Customer.findById(input.customerId).select('name phone').lean() : null,
          Product.find({ _id: { $in: input.items.map((i: any) => i.productId) } }).select('name sku').lean(),
        ]);

        const cashierName = cashierUser?.name || 'Staff Member';
        const customerName = customerUser?.name || 'Walk-in Customer';
        const customerPhone = customerUser?.phone || '';

        const itemMap = new Map(productItems.map((p: any) => [p._id.toString(), p]));

        const notificationPayload = {
          id: sale._id.toString(),
          invoiceNumber: sale.invoiceNumber,
          cashierName,
          customerName,
          customerPhone,
          grandTotal: sale.grandTotal,
          subtotal: sale.subtotal,
          discount: sale.discount,
          tax: sale.taxTotal,
          paymentMethod: sale.paymentMethod,
          itemCount: sale.items?.length || 0,
          items: (sale.items || []).map((item: any) => {
            const p = itemMap.get(item.productId?.toString());
            return {
              name: p?.name || 'Product',
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              totalPrice: item.totalAmount || item.unitPrice * item.quantity,
              selectedSize: item.selectedSize,
              selectedColor: item.selectedColor,
              sku: p?.sku,
            };
          }),
          timestamp: sale.saleDate || new Date().toISOString(),
          isRead: false,
        };

        // Create persistent global Notification record for company
        await Notification.create({
          companyId,
          branchId,
          title: 'Live POS Sale Completed',
          message: `Sale ${sale.invoiceNumber} (₹${sale.grandTotal.toLocaleString()}) recorded by ${cashierName}`,
          type: 'sale',
          isGlobal: true,
          actionUrl: '/transactions',
        });

        // Broadcast to all company connected devices (Admin, Managers, Terminals)
        sseManager.broadcastCompanyEvent(companyId.toString(), 'new_sale', notificationPayload);
      } catch (broadcastErr) {
        console.error('Error broadcasting sale notification:', broadcastErr);
      }

      return sale;
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }
  }

  async cancelSale(id: string, userId: string) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const sale = await Sale.findById(id).session(session);
      if (!sale) throw new AppError('Sale not found', 404);
      if (sale.status !== 'completed') throw new AppError('Only completed sales can be cancelled', 400);
      sale.status = 'cancelled';
      await sale.save({ session });
      // Restore physical stock and record return in StockLedger
      for (const item of sale.items) {
        const product = await Product.findById(item.productId).session(session);
        if (!product) continue;
        const prevStock = product.stock;
        let matchedVariantId: any = undefined;
        if (product.hasVariants && product.variants?.length) {
          const matchedVariant = product.variants.find(
            (v: any) =>
              (item.variantId && v._id?.toString() === item.variantId?.toString()) ||
              (item.sku && v.sku === item.sku)
          );
          if (matchedVariant) {
            matchedVariantId = matchedVariant._id;
            matchedVariant.stock = (matchedVariant.stock || 0) + item.quantity;
          }
          product.stock = product.variants.reduce((sum: number, v: any) => sum + (v.stock || 0), 0);
          await product.save({ session });
        } else {
          product.stock = (product.stock || 0) + item.quantity;
          await product.save({ session });
        }
        await StockLedger.create([{
          companyId: sale.companyId,
          branchId: sale.branchId,
          productId: product._id,
          variantId: matchedVariantId,
          action: 'return_in',
          quantity: item.quantity,
          previousStock: prevStock,
          currentStock: product.stock,
          referenceType: 'Return',
          referenceId: sale._id,
          notes: `Stock Restored on Sale Cancelled: ${sale.invoiceNumber}`,
          performedBy: userId,
        }], { session });
      }
      // If credit sale was linked, clear due amount
      await CreditSale.updateMany(
        { saleId: sale._id },
        { $set: { dueAmount: 0 } },
        { session }
      );
      await session.commitTransaction();
      return sale;
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }
  }

  // ─── Purchases ──────────────────────────────────────────────────────────────
  async getAllPurchases(req: Request) {
    const page = parseInt((req.query.page as string) || '1', 10);
    const limit = parseInt((req.query.limit as string) || '20', 10);
    const skip = (page - 1) * limit;
    const companyId = (req.user as any)?.companyId;

    const filter: any = {};
    if (companyId) filter.companyId = new mongoose.Types.ObjectId(companyId);
    if (req.query.status) filter.status = req.query.status;
    if (req.query.supplierId) filter.supplierId = new mongoose.Types.ObjectId(req.query.supplierId as string);

    const [data, total] = await Promise.all([
      Purchase.find(filter)
        .sort({ purchaseDate: -1 })
        .skip(skip)
        .limit(limit)
        .populate('supplierId', 'name phone')
        .populate('receivedBy', 'name')
        .lean()
        .exec(),
      Purchase.countDocuments(filter).exec(),
    ]);

    return { data, total, page, limit };
  }

  async createPurchase(input: any, userId: string) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const purchaseNumber = `PO-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const companyId = input.companyId;
      const branchId = input.branchId;

      // Add stock for each received item
      for (const item of input.items) {
        const product = await Product.findById(item.productId).session(session);
        if (!product) throw new AppError(`Product ${item.productId} not found`, 404);

        const prevStock = product.stock;
        product.stock += item.quantity;
        await product.save({ session });

        await StockLedger.create([{
          companyId,
          branchId,
          productId: product._id,
          action: 'purchase_in',
          quantity: item.quantity,
          previousStock: prevStock,
          currentStock: product.stock,
          referenceType: 'Purchase',
          performedBy: userId,
        }], { session });
      }

      const [purchase] = await Purchase.create([{
        companyId,
        branchId,
        purchaseNumber,
        supplierId: input.supplierId || undefined,
        items: input.items,
        subtotal: input.subtotal,
        taxTotal: input.taxTotal || 0,
        shippingCost: input.shippingCost || 0,
        discount: input.discount || 0,
        grandTotal: input.grandTotal,
        paidAmount: input.paidAmount || input.grandTotal,
        dueAmount: Math.max(0, input.grandTotal - (input.paidAmount || input.grandTotal)),
        paymentMethod: input.paymentMethod || 'cash',
        status: 'received',
        notes: input.notes,
        receivedBy: userId,
        purchaseDate: input.purchaseDate ? new Date(input.purchaseDate) : new Date(),
      }], { session });

      await session.commitTransaction();
      return purchase;
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }
  }

  // ─── Credit Sales ───────────────────────────────────────────────────────────
  async getCreditSales(req: Request) {
    const page = parseInt((req.query.page as string) || '1', 10);
    const limit = parseInt((req.query.limit as string) || '20', 10);
    const skip = (page - 1) * limit;
    const companyId = (req.user as any)?.companyId;

    const filter: any = {};
    if (companyId) filter.companyId = new mongoose.Types.ObjectId(companyId);
    if (req.query.status) filter.status = req.query.status;
    if (req.query.customerId) filter.customerId = new mongoose.Types.ObjectId(req.query.customerId as string);

    const [data, total] = await Promise.all([
      CreditSale.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('customerId', 'name phone')
        .populate('saleId')
        .lean()
        .exec(),
      CreditSale.countDocuments(filter).exec(),
    ]);

    return { data, total, page, limit };
  }

  async recordCreditPayment(creditId: string, input: any, userId: string) {
    const credit = await CreditSale.findById(creditId);
    if (!credit) throw new AppError('Credit sale record not found', 404);

    const amount = input.amount;
    credit.paidAmount += amount;
    credit.dueAmount = Math.max(0, credit.dueAmount - amount);

    if (credit.dueAmount === 0) {
      credit.status = 'settled';
    }

    credit.paymentLogs.push({
      amount,
      paymentMethod: input.paymentMethod || 'cash',
      paidAt: new Date(),
      receivedBy: new mongoose.Types.ObjectId(userId),
    });

    return credit.save();
  }

  // ─── Expenses ───────────────────────────────────────────────────────────────
  async getAllExpenses(req: Request) {
    const page = parseInt((req.query.page as string) || '1', 10);
    const limit = parseInt((req.query.limit as string) || '20', 10);
    const skip = (page - 1) * limit;
    const companyId = (req.user as any)?.companyId;

    const filter: any = {};
    if (companyId) filter.companyId = new mongoose.Types.ObjectId(companyId);
    if (req.query.category) filter.category = req.query.category;

    const [data, total] = await Promise.all([
      Expense.find(filter).sort({ date: -1 }).skip(skip).limit(limit).populate('createdBy', 'name').lean().exec(),
      Expense.countDocuments(filter).exec(),
    ]);

    return { data, total, page, limit };
  }

  async createExpense(input: any, userId: string) {
    return Expense.create({
      companyId: input.companyId,
      branchId: input.branchId,
      title: input.title,
      amount: input.amount,
      category: input.category,
      date: input.date ? new Date(input.date) : new Date(),
      notes: input.notes,
      paymentMethod: input.paymentMethod || 'cash',
      createdBy: userId,
    });
  }

  // ─── Inventory Adjustments ──────────────────────────────────────────────────
  async adjustInventory(input: any, userId: string) {
    const product = await Product.findById(input.productId);
    if (!product) throw new AppError('Product not found', 404);

    const prevStock = product.stock;
    const isAddition = input.action === 'adjustment_in';
    product.stock = isAddition ? prevStock + input.quantity : Math.max(0, prevStock - input.quantity);
    await product.save();

    await StockLedger.create({
      companyId: input.companyId || product.companyId,
      branchId: input.branchId,
      productId: product._id,
      action: input.action || 'adjustment_in',
      quantity: input.quantity,
      previousStock: prevStock,
      currentStock: product.stock,
      referenceType: 'Adjustment',
      notes: input.notes,
      performedBy: userId,
    });

    return { product, previousStock: prevStock, currentStock: product.stock };
  }

  async getStockLedger(req: Request) {
    const page = parseInt((req.query.page as string) || '1', 10);
    const limit = parseInt((req.query.limit as string) || '20', 10);
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (req.query.productId) filter.productId = new mongoose.Types.ObjectId(req.query.productId as string);

    const [data, total] = await Promise.all([
      StockLedger.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('productId', 'name sku')
        .populate('performedBy', 'name')
        .lean()
        .exec(),
      StockLedger.countDocuments(filter).exec(),
    ]);

    return { data, total, page, limit };
  }
}

export const transactionService = new TransactionService();
export default transactionService;
