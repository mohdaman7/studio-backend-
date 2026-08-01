import mongoose, { Schema, Document, Types } from 'mongoose';

export type NotificationType = 'low_stock' | 'credit_due' | 'purchase' | 'sale' | 'system' | 'info' | 'warning' | 'error';

export interface INotification extends Document {
  companyId: Types.ObjectId;
  branchId?: Types.ObjectId;
  userId?: Types.ObjectId;    // Target user (null = global broadcast)
  isGlobal: boolean;          // Broadcast to all users in company
  title: string;
  message: string;
  type: NotificationType;
  actionUrl?: string;         // Frontend deep-link
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch' },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    isGlobal: { type: Boolean, default: false },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ['low_stock', 'credit_due', 'purchase', 'sale', 'system', 'info', 'warning', 'error'],
      required: true,
    },
    actionUrl: { type: String },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

notificationSchema.index({ companyId: 1, isRead: 1 });
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ isGlobal: 1, companyId: 1 });

export const Notification = mongoose.model<INotification>('Notification', notificationSchema);
export default Notification;
