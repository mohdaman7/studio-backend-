import { Types } from 'mongoose';

export interface AuthenticatedRequest {
  user?: {
    userId: string;
    email: string;
    role: string;
    companyId: string;
    branchId?: string;
  };
}
