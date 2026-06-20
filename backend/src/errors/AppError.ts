export class AppError extends Error {
  readonly statusCode: number;
  readonly code?: string;
  readonly isOperational: boolean;

  constructor(message: string, statusCode = 500, code?: string) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string, code?: string) {
    return new AppError(message, 400, code);
  }

  static unauthorized(message = 'Not authorized') {
    return new AppError(message, 401, 'UNAUTHORIZED');
  }

  static forbidden(message = 'Access denied') {
    return new AppError(message, 403, 'FORBIDDEN');
  }

  static notFound(message = 'Resource not found') {
    return new AppError(message, 404, 'NOT_FOUND');
  }

  static conflict(message: string, code?: string) {
    return new AppError(message, 409, code ?? 'CONFLICT');
  }

  static unprocessable(message: string) {
    return new AppError(message, 422, 'UNPROCESSABLE');
  }

  static serviceUnavailable(message: string) {
    return new AppError(message, 503, 'SERVICE_UNAVAILABLE');
  }
}