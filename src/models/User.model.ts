import mongoose, { Schema, Document, Types } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  _id: Types.ObjectId;
  companyId: Types.ObjectId;
  branchId?: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: Types.ObjectId;
  isActive: boolean;
  isEmailVerified: boolean;
  verificationToken?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  refreshTokens?: string[];
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch' },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 8, select: false },
    phone: { type: String, trim: true },
    role: { type: Schema.Types.ObjectId, ref: 'Role', required: true },
    isActive: { type: Boolean, default: true },
    isEmailVerified: { type: Boolean, default: false },
    verificationToken: { type: String },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    refreshTokens: [{ type: String, select: false }],
    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);

// Encrypt Password
userSchema.pre('save', async function (this: any, next: any) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Compare Method
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Cleanup JSON serialisation
userSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete (ret as any).password;
    delete (ret as any).refreshTokens;
    delete (ret as any).verificationToken;
    delete (ret as any).resetPasswordToken;
    delete (ret as any).resetPasswordExpires;
    return ret;
  },
});

// Tenant isolation indexes
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ companyId: 1, email: 1 });
userSchema.index({ branchId: 1 });

export const User = mongoose.model<IUser>('User', userSchema);
export default User;
