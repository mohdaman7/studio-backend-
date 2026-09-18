import { Request } from 'express';
import { Category } from '../models/Category.model';
import { Brand } from '../models/Brand.model';
import { Supplier } from '../models/Supplier.model';
import { Customer } from '../models/Customer.model';
import { AppError } from '../middlewares/error.middleware';
import mongoose from 'mongoose';

// ─── Generic paginator ──────────────────────────────────────────────────────
function paginate(req: Request) {
  const page = parseInt((req.query.page as string) || '1', 10);
  const limit = parseInt((req.query.limit as string) || '20', 10);
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

// ─── Category Service ────────────────────────────────────────────────────────
class CategoryService {
  async getAll(req: Request) {
    const { page, limit, skip } = paginate(req);
    const companyId = (req.user as any)?.companyId;
    const filter: any = {};
    if (companyId) filter.companyId = new mongoose.Types.ObjectId(companyId);
    if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';

    const [data, total] = await Promise.all([
      Category.find(filter).sort({ name: 1 }).skip(skip).limit(limit).lean().exec(),
      Category.countDocuments(filter).exec(),
    ]);
    return { data, total, page, limit };
  }

  async create(body: any) {
    const slug = body.name.toLowerCase().replace(/\s+/g, '-');
    return Category.create({ ...body, slug });
  }

  async update(id: string, data: any) {
    if (data.name) data.slug = data.name.toLowerCase().replace(/\s+/g, '-');
    const item = await Category.findByIdAndUpdate(id, data, { new: true, runValidators: true }).exec();
    if (!item) throw new AppError('Category not found', 404);
    return item;
  }

  async delete(id: string) {
    const item = await Category.findByIdAndDelete(id).exec();
    if (!item) throw new AppError('Category not found', 404);
    return item;
  }
}

// ─── Brand Service ────────────────────────────────────────────────────────────
class BrandService {
  async getAll(req: Request) {
    const { page, limit, skip } = paginate(req);
    const companyId = (req.user as any)?.companyId;
    const filter: any = {};
    if (companyId) filter.companyId = new mongoose.Types.ObjectId(companyId);

    const [data, total] = await Promise.all([
      Brand.find(filter).sort({ name: 1 }).skip(skip).limit(limit).lean().exec(),
      Brand.countDocuments(filter).exec(),
    ]);
    return { data, total, page, limit };
  }

  async create(body: any) {
    const slug = body.name.toLowerCase().replace(/\s+/g, '-');
    return Brand.create({ ...body, slug });
  }

  async update(id: string, data: any) {
    if (data.name) data.slug = data.name.toLowerCase().replace(/\s+/g, '-');
    const item = await Brand.findByIdAndUpdate(id, data, { new: true, runValidators: true }).exec();
    if (!item) throw new AppError('Brand not found', 404);
    return item;
  }

  async delete(id: string) {
    const item = await Brand.findByIdAndDelete(id).exec();
    if (!item) throw new AppError('Brand not found', 404);
    return item;
  }
}

// ─── Supplier Service ─────────────────────────────────────────────────────────
class SupplierService {
  async getAll(req: Request) {
    const { page, limit, skip } = paginate(req);
    const companyId = (req.user as any)?.companyId;
    const filter: any = {};
    if (companyId) filter.companyId = new mongoose.Types.ObjectId(companyId);
    if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';

    const [data, total] = await Promise.all([
      Supplier.find(filter).sort({ name: 1 }).skip(skip).limit(limit).lean().exec(),
      Supplier.countDocuments(filter).exec(),
    ]);
    return { data, total, page, limit };
  }

  async create(body: any) {
    return Supplier.create(body);
  }

  async getById(id: string) {
    const item = await Supplier.findById(id).exec();
    if (!item) throw new AppError('Supplier not found', 404);
    return item;
  }

  async update(id: string, data: any) {
    const item = await Supplier.findByIdAndUpdate(id, data, { new: true, runValidators: true }).exec();
    if (!item) throw new AppError('Supplier not found', 404);
    return item;
  }

  async delete(id: string) {
    const item = await Supplier.findByIdAndDelete(id).exec();
    if (!item) throw new AppError('Supplier not found', 404);
    return item;
  }
}

// ─── Customer Service ─────────────────────────────────────────────────────────
class CustomerService {
  async getAll(req: Request) {
    const { page, limit, skip } = paginate(req);
    const companyId = (req.user as any)?.companyId;
    const filter: any = {};
    if (companyId) filter.companyId = new mongoose.Types.ObjectId(companyId);
    if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';
    if (req.query.search) {
      const search = req.query.search as string;
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const [data, total] = await Promise.all([
      Customer.find(filter).sort({ name: 1 }).skip(skip).limit(limit).lean().exec(),
      Customer.countDocuments(filter).exec(),
    ]);

    const customerIds = data.map((c: any) => c._id);
    const salesData = await mongoose.model('Sale').aggregate([
      { $match: { customerId: { $in: customerIds }, status: { $nin: ['cancelled', 'refunded'] } } },
      { $group: { _id: '$customerId', totalSpent: { $sum: '$grandTotal' } } }
    ]);

    const salesMap = salesData.reduce((acc: any, curr: any) => {
      acc[curr._id.toString()] = curr.totalSpent;
      return acc;
    }, {});

    const enhancedData = data.map((c: any) => ({
      ...c,
      totalSpent: salesMap[c._id.toString()] || 0,
    }));

    return { data: enhancedData, total, page, limit };
  }

  async getById(id: string) {
    const item = await Customer.findById(id).exec();
    if (!item) throw new AppError('Customer not found', 404);
    return item;
  }

  async create(body: any) {
    return Customer.create(body);
  }

  async update(id: string, data: any) {
    const item = await Customer.findByIdAndUpdate(id, data, { new: true, runValidators: true }).exec();
    if (!item) throw new AppError('Customer not found', 404);
    return item;
  }

  async delete(id: string) {
    const item = await Customer.findByIdAndDelete(id).exec();
    if (!item) throw new AppError('Customer not found', 404);
    return item;
  }
}

// ─── Singleton Exports ────────────────────────────────────────────────────────
export const categoryService = new CategoryService();
export const brandService = new BrandService();
export const supplierService = new SupplierService();
export const customerService = new CustomerService();

// Legacy default export for backward compat
export const masterDataService = {
  categoryService,
  brandService,
  supplierService,
  customerService,
};
export default masterDataService;
