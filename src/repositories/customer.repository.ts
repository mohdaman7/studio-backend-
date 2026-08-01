import { BaseRepository } from './base.repository';
import { Customer, ICustomer } from '../models/Customer.model';

export class CustomerRepository extends BaseRepository<ICustomer> {
  constructor() {
    super(Customer);
  }
}

export const customerRepository = new CustomerRepository();
export default customerRepository;
