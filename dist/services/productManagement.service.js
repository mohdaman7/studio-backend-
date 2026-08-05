"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productManagementService = exports.ProductManagementService = void 0;
const product_repository_1 = require("../repositories/product.repository");
const CompanySetting_model_1 = require("../models/CompanySetting.model");
const error_middleware_1 = require("../middlewares/error.middleware");
class ProductManagementService {
    /**
     * Generates custom enterprise SKU and code-128 barcode value dynamically.
     * Format: [SKU_PREFIX][Padding_NextNumber] (e.g. DRS000001)
     */
    async generateSkuAndBarcode(companyId) {
        let settings = await CompanySetting_model_1.CompanySetting.findOne({ companyId });
        if (!settings) {
            settings = await CompanySetting_model_1.CompanySetting.create({ companyId });
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
    async duplicateProduct(productId, companyId) {
        const existingProduct = await product_repository_1.productRepository.findById(productId);
        if (!existingProduct)
            throw new error_middleware_1.AppError('Source product not found', 404);
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
        return product_repository_1.productRepository.create(duplicatedData);
    }
}
exports.ProductManagementService = ProductManagementService;
exports.productManagementService = new ProductManagementService();
exports.default = exports.productManagementService;
