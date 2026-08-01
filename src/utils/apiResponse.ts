import { Response } from 'express';

export class ApiResponse {
  static success(res: Response, message: string, data: any = {}, statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  }

  static created(res: Response, message: string, data: any = {}) {
    return this.success(res, message, data, 201);
  }

  static paginated(
    res: Response,
    message: string,
    data: any[],
    page: number,
    limit: number,
    total: number,
    extra: Record<string, any> = {}
  ) {
    const totalPages = Math.ceil(total / limit);
    return res.status(200).json({
      success: true,
      message,
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
      ...extra,
    });
  }

  static error(res: Response, message: string, statusCode = 500, code = 'INTERNAL_ERROR', errors: any = undefined) {
    return res.status(statusCode).json({
      success: false,
      message,
      code,
      ...(errors && { errors })
    });
  }

  static badRequest(res: Response, message: string, errors: any = undefined) {
    return this.error(res, message, 400, 'BAD_REQUEST', errors);
  }

  static unauthorized(res: Response, message = 'Unauthorized') {
    return this.error(res, message, 401, 'UNAUTHORIZED');
  }

  static notFound(res: Response, message = 'Resource not found') {
    return this.error(res, message, 404, 'NOT_FOUND');
  }

  static forbidden(res: Response, message = 'Access denied') {
    return this.error(res, message, 403, 'FORBIDDEN');
  }
}
export default ApiResponse;

