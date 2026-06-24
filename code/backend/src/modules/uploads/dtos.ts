import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class CreatePresignedUrlDto {
  @ApiProperty({
    description: 'The original name of the file to upload',
    example: 'burger.png',
  })
  @IsNotEmpty()
  @IsString()
  fileName: string;

  @ApiProperty({
    description: 'The MIME type of the file',
    example: 'image/png',
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^image\/(jpeg|png|webp)$/, {
    message: 'Only JPEG, PNG, and WEBP image formats are allowed',
  })
  fileType: string;
}

export class PresignedUrlResponseDto {
  @ApiProperty({
    description: 'The S3 presigned PUT URL to perform the upload to',
    example: 'https://restaurant-uploads.sgp1.digitaloceanspaces.com/menu-items/abc-123-burger.png?AWSAccessKeyId=...',
  })
  uploadUrl: string;

  @ApiProperty({
    description: 'The public CDN/Space URL of the file after upload completes',
    example: 'https://restaurant-uploads.sgp1.digitaloceanspaces.com/menu-items/abc-123-burger.png',
  })
  fileUrl: string;

  @ApiProperty({
    description: 'The unique key (file path) in the bucket',
    example: 'menu-items/abc-123-burger.png',
  })
  key: string;
}