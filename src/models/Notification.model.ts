import mongoose, { Schema, Document, Types } from 'mongoose';

export interface INotification extends Document {
  companyId: Types.ObjectId;
  branchId?: Types.ObjectId;
  title: string;
  message: string;
  type: 'low_stock' | 'credit_due' | 'purchase' | 'sale' | 'system';
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch' },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ['low_stock', 'credit_due', 'purchase', 'sale', 'system'], required: true },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

notificationSchema.index({ companyId: 1, isRead: 1 });

export const Notification = mongoose.model<INotification>('Notification', notificationSchema);
export default Notification;
