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

      // Deduct stock for each sold item
      for (const item of input.items) {
        const product = await Product.findById(item.productId).session(session);
        if (!product) throw new AppError(`Product ${item.productId} not found`, 404);

        if (!product.hasVariants) {
          if (product.stock < item.quantity) {
            throw new AppError(`Insufficient stock for product: ${product.name}`, 400);
          }
          const prevStock = product.stock;
          product.stock -= item.quantity;
          await product.save({ session });

          await StockLedger.create([{
            companyId,
            branchId,
            productId: product._id,
            action: 'sale_out',
            quantity: item.quantity,
            previousStock: prevStock,
            currentStock: product.stock,
            referenceType: 'Sale',
            performedBy: cashierId,
          }], { session });
        }
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
      return sale;
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }
  }

  async cancelSale(id: string, userId: string) {
    const sale = await Sale.findById(id);
    if (!sale) throw new AppError('Sale not found', 404);
    if (sale.status !== 'completed') throw new AppError('Only completed sales can be cancelled', 400);
    sale.status = 'cancelled';
    return sale.save();
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
