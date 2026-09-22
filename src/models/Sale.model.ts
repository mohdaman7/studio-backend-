import mongoose, { Schema, Document, Types } from 'mongoose';

export type PaymentMethod = 'cash' | 'card' | 'upi' | 'credit' | 'mixed';
export type SaleStatus = 'completed' | 'refunded' | 'cancelled' | 'hold';

export interface ISaleItem {
  productId: Types.ObjectId;
  variantId?: Types.ObjectId;
  sku?: string;
  variantSku?: string;
  quantity: number;
  unitPrice: number;
  discount: number; // Item-level discount
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
}

export interface IReturnItem {
  productId: Types.ObjectId;
  variantId?: Types.ObjectId;
  sku?: string;
  variantSku?: string;
  name?: string;
  selectedSize?: string;
  selectedColor?: string;
  quantity: number;
  unitPrice: number;
  taxRate?: number;
  taxAmount?: number;
  totalAmount: number;
  originalInvoiceNumber?: string;
  reason?: string;
  condition?: 'restockable' | 'damaged_scrap';
}

export interface ISale extends Document {
  companyId: Types.ObjectId;
  branchId: Types.ObjectId;
  invoiceNumber: string; // e.g. INV-000001
  customerId?: Types.ObjectId; // Optional for Guest checkout
  items: ISaleItem[];
  isExchange: boolean;
  returnedItems: IReturnItem[];
  returnCreditTotal: number;
  netAmount: number;
  refundAmount: number;
  refundMethod?: string;
  subtotal: number;
  taxTotal: number;
  discount: number; // Order-level discount
  couponId?: Types.ObjectId;
  couponDiscount: number;
  grandTotal: number;
  paidAmount: number;
  dueAmount: number;
  paymentMethod: PaymentMethod;
  status: SaleStatus;
  notes?: string;
  cashierId: Types.ObjectId;
  saleDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const saleItemSchema = new Schema<ISaleItem>({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  variantId: { type: Schema.Types.ObjectId },
  quantity: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true, min: 0 },
  discount: { type: Number, required: true, default: 0, min: 0 },
  taxRate: { type: Number, required: true, default: 0, min: 0 },
  taxAmount: { type: Number, required: true, default: 0, min: 0 },
  totalAmount: { type: Number, required: true, min: 0 },
});

const returnItemSchema = new Schema<IReturnItem>({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  variantId: { type: Schema.Types.ObjectId },
  sku: { type: String },
  variantSku: { type: String },
  name: { type: String },
  selectedSize: { type: String },
  selectedColor: { type: String },
  quantity: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true, min: 0 },
  taxRate: { type: Number, default: 0 },
  taxAmount: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true, min: 0 },
  originalInvoiceNumber: { type: String },
  reason: { type: String, default: 'Exchange / Return' },
  condition: { type: String, enum: ['restockable', 'damaged_scrap'], default: 'restockable' },
});

const saleSchema = new Schema<ISale>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch', required: true },
    invoiceNumber: { type: String, required: true, unique: true },
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer' },
    items: [saleItemSchema],
    isExchange: { type: Boolean, default: false },
    returnedItems: [returnItemSchema],
    returnCreditTotal: { type: Number, default: 0, min: 0 },
    netAmount: { type: Number, default: 0 },
    refundAmount: { type: Number, default: 0, min: 0 },
    refundMethod: { type: String },
    subtotal: { type: Number, required: true, min: 0 },
    taxTotal: { type: Number, required: true, default: 0, min: 0 },
    discount: { type: Number, required: true, default: 0, min: 0 },
    couponId: { type: Schema.Types.ObjectId, ref: 'Coupon' },
    couponDiscount: { type: Number, required: true, default: 0, min: 0 },
    grandTotal: { type: Number, required: true, min: 0 },
    paidAmount: { type: Number, required: true, default: 0, min: 0 },
    dueAmount: { type: Number, required: true, default: 0, min: 0 },
    paymentMethod: {
      type: String,
      enum: ['cash', 'card', 'upi', 'credit', 'mixed'],
      required: true,
    },
    status: {
      type: String,
      enum: ['completed', 'refunded', 'cancelled', 'hold'],
      default: 'completed',
    },
    notes: { type: String },
    cashierId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    saleDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

saleSchema.index({ companyId: 1, branchId: 1 });
saleSchema.index({ invoiceNumber: 1 }, { unique: true });
saleSchema.index({ saleDate: -1 });

export const Sale = mongoose.model<ISale>('Sale', saleSchema);
export default Sale;
