import { Request, Response } from 'express';
import { productManagementService } from '../services/productManagement.service';
import { ApiResponse } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';

export const duplicateProduct = asyncHandler(async (req: any, res: Response) => {
  const companyId = req.user?.companyId;
  if (!companyId) return ApiResponse.badRequest(res, 'Company identification is missing');

  const duplicatedProduct = await productManagementService.duplicateProduct(req.params.id, companyId);
  return ApiResponse.created(res, 'Product duplicated successfully', duplicatedProduct);
});

export const generateSkuBarcode = asyncHandler(async (req: any, res: Response) => {
  const companyId = req.user?.companyId;
  if (!companyId) return ApiResponse.badRequest(res, 'Company identification is missing');

  const result = await productManagementService.generateSkuAndBarcode(companyId);
  return ApiResponse.success(res, 'SKU and Barcode generated successfully', result);
});
