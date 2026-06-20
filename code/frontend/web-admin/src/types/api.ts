// Shared API contract types — mirror the backend's response envelopes.
// See docs/database.md and code/backend/src/common/dtos.

/** Standard success envelope (backend `ApiResponseDto`). */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

/** Error envelope produced by the backend `HttpExceptionFilter`. */
export interface ApiErrorResponse {
  success: false;
  statusCode: number;
  // class-validator returns an array of messages; other errors return a string.
  message: string | string[];
  timestamp: string;
  path: string;
}

/** Paginated payload (backend `PaginationDto<T>`). */
export interface Paginated<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
