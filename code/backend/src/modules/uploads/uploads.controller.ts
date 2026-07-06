import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { UploadsService } from './uploads.service';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from '@common/decorators';
import { Role } from '@common/enums';
import { CreatePresignedUrlDto, PresignedUrlResponseDto } from './dtos';
import { ApiResponseDto } from '@common/dtos/api-response.dto';

@ApiTags('Uploads')
@ApiBearerAuth('JWT-auth')
@Roles(Role.OWNER) 
@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post('presigned-url')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Generate a presigned PUT URL for menu item image upload',
  })
  @ApiResponse({
    status: 200,
    description: 'Presigned URL generated successfully',
    type: PresignedUrlResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid file format or missing configurations',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Access Denied - Owners only' })
  async getPresignedUrl(
    @Body() dto: CreatePresignedUrlDto,
  ): Promise<ApiResponseDto<PresignedUrlResponseDto>> {
    const data = await this.uploadsService.generatePresignedUrl(dto);
    return ApiResponseDto.success(data, 'Presigned URL generated successfully');
  }
}