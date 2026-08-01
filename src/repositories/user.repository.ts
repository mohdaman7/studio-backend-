import { BaseRepository } from './base.repository';
import { User, IUser } from '../models/User.model';

export class UserRepository extends BaseRepository<IUser> {
  constructor() {
    super(User);
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return User.findOne({ email }).select('+password').exec();
  }
}

export const userRepository = new UserRepository();
export default userRepository;
