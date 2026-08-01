import mongoose, { Schema, Document, Types } from 'mongoose';

export type LedgerAction = 'purchase_in' | 'sale_out' | 'adjustment_in' | 'adjustment_out' | 'return_in' | 'return_out' | 'transfer_in' | 'transfer_out';

export interface IStockLedger extends Document {
  companyId: Types.ObjectId;
  branchId: Types.ObjectId;
  productId: Types.ObjectId;
  variantId?: Types.ObjectId;
  action: LedgerAction;
  quantity: number;
  previousStock: number;
  currentStock: number;
  referenceType: string; // 'Sale' | 'Purchase' | 'Adjustment' | 'Return'
  referenceId?: Types.ObjectId;
  notes?: string;
  performedBy: Types.ObjectId;
  createdAt: Date;
}

const stockLedgerSchema = new Schema<IStockLedger>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch', required: true },
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    variantId: { type: Schema.Types.ObjectId },
    action: {
      type: String,
      enum: ['purchase_in', 'sale_out', 'adjustment_in', 'adjustment_out', 'return_in', 'return_out', 'transfer_in', 'transfer_out'],
      required: true,
    },
    quantity: { type: Number, required: true },
    previousStock: { type: Number, required: true },
    currentStock: { type: Number, required: true },
    referenceType: { type: String, required: true },
    referenceId: { type: Schema.Types.ObjectId },
    notes: { type: String },
    performedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

stockLedgerSchema.index({ companyId: 1, branchId: 1 });
stockLedgerSchema.index({ productId: 1 });
stockLedgerSchema.index({ createdAt: -1 });

export const StockLedger = mongoose.model<IStockLedger>('StockLedger', stockLedgerSchema);
export default StockLedger;
