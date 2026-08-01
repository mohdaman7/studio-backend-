import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IPurchaseItem {
  productId: Types.ObjectId;
  variantId?: Types.ObjectId;
  productName: string;
  sku: string;
  quantity: number;
  unitCost: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
}

export type PurchaseStatus = 'pending' | 'received' | 'partially_received' | 'cancelled';

export interface IPurchase extends Document {
  companyId: Types.ObjectId;
  branchId: Types.ObjectId;
  purchaseNumber: string;
  supplierId?: Types.ObjectId;
  items: IPurchaseItem[];
  subtotal: number;
  taxTotal: number;
  shippingCost: number;
  discount: number;
  grandTotal: number;
  paidAmount: number;
  dueAmount: number;
  paymentMethod: string;
  status: PurchaseStatus;
  notes?: string;
  invoiceFile?: string;
  receivedBy: Types.ObjectId;
  purchaseDate: Date;
  expectedDeliveryDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const purchaseItemSchema = new Schema<IPurchaseItem>({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  variantId: { type: Schema.Types.ObjectId },
  productName: { type: String, required: true },
  sku: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  unitCost: { type: Number, required: true, min: 0 },
  taxRate: { type: Number, default: 0, min: 0 },
  taxAmount: { type: Number, default: 0, min: 0 },
  totalAmount: { type: Number, required: true, min: 0 },
});

const purchaseSchema = new Schema<IPurchase>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch', required: true },
    purchaseNumber: { type: String, required: true, unique: true },
    supplierId: { type: Schema.Types.ObjectId, ref: 'Supplier' },
    items: [purchaseItemSchema],
    subtotal: { type: Number, required: true, min: 0 },
    taxTotal: { type: Number, default: 0, min: 0 },
    shippingCost: { type: Number, default: 0, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    grandTotal: { type: Number, required: true, min: 0 },
    paidAmount: { type: Number, default: 0, min: 0 },
    dueAmount: { type: Number, default: 0, min: 0 },
    paymentMethod: { type: String, default: 'cash' },
    status: {
      type: String,
      enum: ['pending', 'received', 'partially_received', 'cancelled'],
      default: 'received',
    },
    notes: { type: String },
    invoiceFile: { type: String },
    receivedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    purchaseDate: { type: Date, default: Date.now },
    expectedDeliveryDate: { type: Date },
  },
  { timestamps: true }
);

purchaseSchema.index({ companyId: 1, branchId: 1 });
purchaseSchema.index({ purchaseNumber: 1 }, { unique: true });
purchaseSchema.index({ supplierId: 1 });
purchaseSchema.index({ purchaseDate: -1 });

export const Purchase = mongoose.model<IPurchase>('Purchase', purchaseSchema);
export default Purchase;
