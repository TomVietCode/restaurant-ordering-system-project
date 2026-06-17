import { ApiProperty } from '@nestjs/swagger';

export class ApiResponseDto<T> {
  @ApiProperty({ description: 'Whether the request was successful', example: true })
  success: boolean;

  @ApiProperty({ description: 'Human-readable message', example: 'Operation completed' })
  message: string;

  @ApiProperty({ description: 'Response data payload', required: false })
  data?: T;

  /**
   * Factory: create a success response with data.
   */
  static success<T>(data: T, message = 'Success'): ApiResponseDto<T> {
    const response = new ApiResponseDto<T>();
    response.success = true;
    response.message = message;
    response.data = data;
    return response;
  }

  /**
   * Factory: create an error response.
   */
  static error(message: string): ApiResponseDto<null> {
    const response = new ApiResponseDto<null>();
    response.success = false;
    response.message = message;
    return response;
  }
}