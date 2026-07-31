import { Request } from 'express';
import { productRepository } from '../repositories/product.repository';
import { CompanySetting } from '../models/CompanySetting.model';
import { AppError } from '../middlewares/error.middleware';

export class ProductManagementService {
  /**
   * Generates custom enterprise SKU and code-128 barcode value dynamically.
   * Format: [SKU_PREFIX][Padding_NextNumber] (e.g. DRS000001)
   */
  async generateSkuAndBarcode(companyId: string): Promise<{ sku: string; barcode: string }> {
    let settings = await CompanySetting.findOne({ companyId });
    if (!settings) {
      settings = await CompanySetting.create({ companyId } as any);
    }

    const prefix = settings.barcodeSettings.skuPrefix || 'DRS';
    const nextNum = settings.nextInvoiceNumber;

    // Increment invoice sequence counter
    settings.nextInvoiceNumber += 1;
    await settings.save();

    const formattedNum = String(nextNum).padStart(6, '0');
    const sku = `${prefix}${formattedNum}`;
    
    // Barcode value mirrors unique SKU
    return { sku, barcode: sku };
  }

  async duplicateProduct(productId: string, companyId: string) {
    const existingProduct = await productRepository.findById(productId);
    if (!existingProduct) throw new AppError('Source product not found', 404);

    const generated = await this.generateSkuAndBarcode(companyId);

    const duplicatedData = {
      ...existingProduct.toJSON(),
      _id: undefined,
      name: `${existingProduct.name} (Copy)`,
      sku: generated.sku,
      barcode: generated.barcode,
      variants: existingProduct.variants.map((v) => ({
        ...v,
        _id: undefined,
        sku: `${generated.sku}-${v.size || 'U'}-${v.color || 'U'}`,
        barcode: `${generated.barcode}-${v.size || 'U'}-${v.color || 'U'}`,
        stock: 0, // Reset stock level on duplication
      })),
      createdAt: undefined,
      updatedAt: undefined,
    };

    return productRepository.create(duplicatedData as any);
  }
}

export const productManagementService = new ProductManagementService();
export default productManagementService;
