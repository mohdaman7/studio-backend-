import { BaseRepository } from './base.repository';
import { Sale, ISale } from '../models/Sale.model';
import { Purchase, IPurchase } from '../models/Purchase.model';
import { Product, IProduct } from '../models/Product.model';
import { Customer, ICustomer } from '../models/Customer.model';
import { Supplier, ISupplier } from '../models/Supplier.model';
import { Expense, IExpense } from '../models/Expense.model';
import { StockLedger, IStockLedger } from '../models/StockLedger.model';
import { Category, ICategory } from '../models/Category.model';
import { Brand, IBrand } from '../models/Brand.model';
import { AuditLog, IAuditLog } from '../models/AuditLog.model';
import { User, IUser } from '../models/User.model';
import mongoose from 'mongoose';
import { subDays, startOfDay } from 'date-fns';

// ─── Extended Sale Repository ───────────────────────────────────────────────
class SaleRepository extends BaseRepository<ISale> {
  constructor() {
    super(Sale);
  }

  async getDailySales(days: number = 7, branchId?: string) {
    const since = subDays(new Date(), days - 1);
    const matchStage: any = {
      saleDate: { $gte: startOfDay(since) },
      status: 'completed',
    };
    if (branchId) matchStage.branchId = new mongoose.Types.ObjectId(branchId);

    return this.model.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$saleDate' } },
          totalAmount: { $sum: '$grandTotal' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
  }

  async getSalesSummary(startDate: Date, endDate: Date) {
    return this.model.aggregate([
      {
        $match: {
          saleDate: { $gte: startDate, $lte: endDate },
          status: 'completed',
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$saleDate' } },
          totalAmount: { $sum: '$grandTotal' },
          totalTax: { $sum: '$taxTotal' },
          totalDiscount: { $sum: '$discount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
  }

  async getTopProducts(startDate: Date, endDate: Date, limit: number = 10) {
    return this.model.aggregate([
      {
        $match: {
          saleDate: { $gte: startDate, $lte: endDate },
          status: 'completed',
        },
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          totalQty: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.totalAmount' },
        },
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product',
        },
      },
      { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          productName: '$product.name',
          sku: '$product.sku',
          totalQty: 1,
          totalRevenue: 1,
        },
      },
    ]);
  }

  async getPaymentMethodBreakdown(startDate: Date, endDate: Date) {
    return this.model.aggregate([
      {
        $match: {
          saleDate: { $gte: startDate, $lte: endDate },
          status: 'completed',
        },
      },
      {
        $group: {
          _id: '$paymentMethod',
          total: { $sum: '$grandTotal' },
          count: { $sum: 1 },
        },
      },
    ]);
  }
}

// ─── Extended Purchase Repository ────────────────────────────────────────────
class PurchaseRepository extends BaseRepository<IPurchase> {
  constructor() {
    super(Purchase);
  }
}

// ─── Extended Product Repository ─────────────────────────────────────────────
class ProductRepository extends BaseRepository<IProduct> {
  constructor() {
    super(Product);
  }

  async findByBarcode(barcode: string) {
    return this.model.findOne({ barcode }).exec();
  }

  async findBySku(sku: string, companyId: string) {
    return this.model.findOne({ sku, companyId }).exec();
  }

  async getLowStockProducts(companyId: string, branchId?: string) {
    const filter: any = {
      companyId,
      isActive: true,
      hasVariants: false,
      $expr: { $lte: ['$stock', '$lowStockAlert'] },
    };
    return this.model.find(filter).populate('categoryId brandId').exec();
  }

  async adjustStock(productId: string, qty: number) {
    return this.model.findByIdAndUpdate(
      productId,
      { $inc: { stock: qty } },
      { new: true }
    ).exec();
  }
}

// ─── Extended Customer Repository ────────────────────────────────────────────
class CustomerRepository extends BaseRepository<ICustomer> {
  constructor() {
    super(Customer);
  }
}

// ─── Extended Supplier Repository ────────────────────────────────────────────
class SupplierRepository extends BaseRepository<ISupplier> {
  constructor() {
    super(Supplier);
  }
}

// ─── Extended Expense Repository ─────────────────────────────────────────────
class ExpenseRepository extends BaseRepository<IExpense> {
  constructor() {
    super(Expense);
  }

  async getExpenseSummary(startDate: Date, endDate: Date) {
    return this.model.aggregate([
      {
        $match: {
          date: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: '$category',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { totalAmount: -1 } },
    ]);
  }
}

// ─── Extended StockLedger Repository ─────────────────────────────────────────
class StockLedgerRepository extends BaseRepository<IStockLedger> {
  constructor() {
    super(StockLedger);
  }

  async createEntry(data: Partial<IStockLedger>) {
    return this.create(data);
  }
}

// ─── Extended Category Repository ────────────────────────────────────────────
class CategoryRepository extends BaseRepository<ICategory> {
  constructor() {
    super(Category);
  }
}

// ─── Extended Brand Repository ────────────────────────────────────────────────
class BrandRepository extends BaseRepository<IBrand> {
  constructor() {
    super(Brand);
  }
}

// ─── Extended AuditLog Repository ────────────────────────────────────────────
class AuditLogRepository extends BaseRepository<IAuditLog> {
  constructor() {
    super(AuditLog);
  }
}

// ─── Extended User Repository ─────────────────────────────────────────────────
class UserRepository extends BaseRepository<IUser> {
  constructor() {
    super(User);
  }

  async findByEmail(email: string) {
    return this.model.findOne({ email }).exec();
  }
}

// ─── Singleton Exports ────────────────────────────────────────────────────────
export const saleRepository = new SaleRepository();
export const purchaseRepository = new PurchaseRepository();
export const productRepository = new ProductRepository();
export const customerRepository = new CustomerRepository();
export const supplierRepository = new SupplierRepository();
export const expenseRepository = new ExpenseRepository();
export const stockLedgerRepository = new StockLedgerRepository();
export const categoryRepository = new CategoryRepository();
export const brandRepository = new BrandRepository();
export const auditLogRepository = new AuditLogRepository();
export const userRepository = new UserRepository();
