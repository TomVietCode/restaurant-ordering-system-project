import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  // Use NestJS Logger to log errors server-side
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const isDevelopment = process.env.NODE_ENV === 'development';

    // Determine HTTP status code (default to 500 for unhandled exceptions)
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message: string | string[];
    let error: string | undefined;
    let stack: string | undefined;

    // Handle NestJS HttpExceptions (expected domain/validation/auth errors)
    if (exception instanceof HttpException) {
      const exceptionResponse = exception.getResponse();
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null
      ) {
        message = (exceptionResponse as any).message || exception.message;
        error = (exceptionResponse as any).error;
      } else {
        message = exception.message;
      }
      stack = exception.stack;
    } 
    // Handle standard Error instances (internal errors, database failures, etc.)
    else if (exception instanceof Error) {
      // Mask internal errors in production, but expose exact message in development
      message = isDevelopment ? exception.message : 'Internal server error';
      error = exception.name;
      stack = exception.stack;
    } 
    // Fallback for any unknown exception types
    else {
      message = 'Internal server error';
    }

    // Log the error server-side for troubleshooting
    if (status >= 500) {
      this.logger.error(
        `[${request.method}] ${request.url} - Internal Server Error`,
        exception instanceof Error ? exception.stack : JSON.stringify(exception),
      );
    } else {
      this.logger.warn(
        `[${request.method}] ${request.url} - Client Error (${status}): ${
          typeof message === 'object' ? JSON.stringify(message) : message
        }`,
      );
    }

    // Build standard error response envelope
    const errorResponse: any = {
      success: false,
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    // Add optional error field if available (e.g. "Bad Request")
    if (error) {
      errorResponse.error = error;
    }

    // Expose stack trace details ONLY in development environment
    if (isDevelopment && stack) {
      errorResponse.stack = stack;
    }

    response.status(status).json(errorResponse);
  }
}
