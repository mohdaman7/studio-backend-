import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IVariant {
  _id?: Types.ObjectId;
  id?: string;
  sku: string;
  size?: string;
  color?: string;
  material?: string;
  attributes?: Record<string, string>;
  price: number;
  salePrice?: number;
  costPrice: number;
  stock: number;
  lowStockAlert: number;
  barcode?: string;
  imageUrl?: string;
}

export interface IProduct extends Document {
  companyId: Types.ObjectId;
  name: string;
  slug: string;
  description?: string;
  sku: string;
  barcode?: string;
  size?: string;
  color?: string;
  subCategory?: string;
  categoryId?: Types.ObjectId;
  brandId?: Types.ObjectId;
  supplierId?: Types.ObjectId;
  hasVariants: boolean;
  variants: IVariant[];
  price: number;
  mrp?: number;
  salePrice?: number;
  costPrice: number;
  stock: number;
  lowStockAlert: number;
  unit: string;
  taxRate: number;
  imageUrls: string[];
  tags: string[];
  isActive: boolean;
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const variantSchema = new Schema<IVariant>({
  sku: { type: String, required: true },
  size: { type: String },
  color: { type: String },
  material: { type: String },
  attributes: { type: Map, of: String },
  price: { type: Number, required: true, min: 0 },
  salePrice: { type: Number, min: 0 },
  costPrice: { type: Number, required: true, default: 0, min: 0 },
  stock: { type: Number, required: true, default: 0, min: 0 },
  lowStockAlert: { type: Number, default: 5 },
  barcode: { type: String },
  imageUrl: { type: String },
});

const productSchema = new Schema<IProduct>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, lowercase: true, trim: true },
    description: { type: String },
    sku: { type: String, required: true, uppercase: true, trim: true },
    barcode: { type: String },
    size: { type: String },
    color: { type: String },
    subCategory: { type: String },
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category' },
    brandId: { type: Schema.Types.ObjectId, ref: 'Brand' },
    supplierId: { type: Schema.Types.ObjectId, ref: 'Supplier' },
    hasVariants: { type: Boolean, default: false },
    variants: [variantSchema],
    price: { type: Number, required: true, min: 0 },
    mrp: { type: Number },
    salePrice: { type: Number, min: 0 },
    costPrice: { type: Number, required: true, default: 0, min: 0 },
    stock: { type: Number, required: true, default: 0, min: 0 },
    lowStockAlert: { type: Number, default: 5 },
    unit: { type: String, default: 'pcs' },
    taxRate: { type: Number, default: 0, min: 0 },
    imageUrls: [{ type: String }],
    tags: [{ type: String }],
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

productSchema.index({ companyId: 1 });
productSchema.index({ sku: 1, companyId: 1 }, { unique: true });
productSchema.index({ barcode: 1 });
productSchema.index({ name: 'text', tags: 'text' });
productSchema.index({ categoryId: 1 });
productSchema.index({ brandId: 1 });
productSchema.index({ stock: 1 });
productSchema.index({ 'variants.barcode': 1 });
productSchema.index({ 'variants.sku': 1 });

export const Product = mongoose.model<IProduct>('Product', productSchema);
export default Product;
