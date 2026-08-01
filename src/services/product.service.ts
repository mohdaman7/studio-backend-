import { Request } from 'express';
import { Product } from '../models/Product.model';
import { StockLedger } from '../models/StockLedger.model';
import { AppError } from '../middlewares/error.middleware';
import mongoose from 'mongoose';

export class ProductService {
  async getAll(req: Request) {
    const page = parseInt((req.query.page as string) || '1', 10);
    const limit = parseInt((req.query.limit as string) || '20', 10);
    const skip = (page - 1) * limit;
    const companyId = (req.user as any)?.companyId;

    const filter: any = {};
    if (companyId) filter.companyId = new mongoose.Types.ObjectId(companyId);
    if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';
    if (req.query.categoryId) filter.categoryId = new mongoose.Types.ObjectId(req.query.categoryId as string);
    if (req.query.brandId) filter.brandId = new mongoose.Types.ObjectId(req.query.brandId as string);
    if (req.query.search) {
      filter.$text = { $search: req.query.search as string };
    }
    if (req.query.lowStock === 'true') {
      filter.$expr = { $lte: ['$stock', '$lowStockAlert'] };
      filter.hasVariants = false;
    }

    const [data, total] = await Promise.all([
      Product.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('categoryId', 'name')
        .populate('brandId', 'name')
        .lean()
        .exec(),
      Product.countDocuments(filter).exec(),
    ]);

    return { data, total, page, limit };
  }

  async getById(id: string) {
    const product = await Product.findById(id)
      .populate('categoryId', 'name')
      .populate('brandId', 'name')
      .populate('supplierId', 'name phone')
      .exec();
    if (!product) throw new AppError('Product not found', 404);
    return product;
  }

  async getByBarcode(barcode: string) {
    const product = await Product.findOne({ barcode }).exec();
    if (!product) throw new AppError('Product not found', 404);
    return product;
  }

  async create(data: any, userId: string) {
    // Auto-generate slug
    const slug = data.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
    return Product.create({ ...data, slug });
  }

  async update(id: string, data: any) {
    if (data.name) {
      data.slug = data.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
    }
    const product = await Product.findByIdAndUpdate(id, data, { new: true, runValidators: true }).exec();
    if (!product) throw new AppError('Product not found', 404);
    return product;
  }

  async delete(id: string) {
    const product = await Product.findByIdAndDelete(id).exec();
    if (!product) throw new AppError('Product not found', 404);
    return product;
  }

  async adjustStock(data: any, userId: string) {
    const product = await Product.findById(data.productId);
    if (!product) throw new AppError('Product not found', 404);

    const prevStock = product.stock;
    const isIn = data.action === 'adjustment_in';
    product.stock = isIn ? prevStock + data.quantity : Math.max(0, prevStock - data.quantity);
    await product.save();

    await StockLedger.create({
      companyId: data.companyId || product.companyId,
      branchId: data.branchId,
      productId: product._id,
      action: data.action || 'adjustment_in',
      quantity: data.quantity,
      previousStock: prevStock,
      currentStock: product.stock,
      referenceType: 'Adjustment',
      notes: data.notes,
      performedBy: userId,
    });

    return { product, previousStock: prevStock, currentStock: product.stock };
  }

  async getStockHistory(productId: string) {
    return StockLedger.find({ productId: new mongoose.Types.ObjectId(productId) })
      .sort({ createdAt: -1 })
      .populate('performedBy', 'name')
      .lean()
      .exec();
  }

  async getLowStockProducts(companyId: string) {
    return Product.find({
      companyId: new mongoose.Types.ObjectId(companyId),
      isActive: true,
      hasVariants: false,
      $expr: { $lte: ['$stock', '$lowStockAlert'] },
    })
      .populate('categoryId', 'name')
      .lean()
      .exec();
  }
}

export const productService = new ProductService();
export default productService;
