import { BaseRepository } from './base.repository';
import { Product, IProduct } from '../models/Product.model';

export class ProductRepository extends BaseRepository<IProduct> {
  constructor() {
    super(Product);
  }
}

export const productRepository = new ProductRepository();
export default productRepository;
