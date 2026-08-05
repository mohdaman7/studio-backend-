"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSkuBarcode = exports.duplicateProduct = void 0;
const productManagement_service_1 = require("../services/productManagement.service");
const apiResponse_1 = require("../utils/apiResponse");
const asyncHandler_1 = require("../utils/asyncHandler");
exports.duplicateProduct = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const companyId = req.user?.companyId;
    if (!companyId)
        return apiResponse_1.ApiResponse.badRequest(res, 'Company identification is missing');
    const duplicatedProduct = await productManagement_service_1.productManagementService.duplicateProduct(req.params.id, companyId);
    return apiResponse_1.ApiResponse.created(res, 'Product duplicated successfully', duplicatedProduct);
});
exports.generateSkuBarcode = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const companyId = req.user?.companyId;
    if (!companyId)
        return apiResponse_1.ApiResponse.badRequest(res, 'Company identification is missing');
    const result = await productManagement_service_1.productManagementService.generateSkuAndBarcode(companyId);
    return apiResponse_1.ApiResponse.success(res, 'SKU and Barcode generated successfully', result);
});
