import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';
import { CreatePresignedUrlDto, PresignedUrlResponseDto } from './dtos';

@Injectable()
export class UploadsService {
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly endpoint: string;

  constructor(private readonly configService: ConfigService) {
    const endpoint = this.configService.get<string>('s3.endpoint');
    const bucket = this.configService.get<string>('s3.bucket');
    const accessKey = this.configService.get<string>('s3.accessKey');
    const secretKey = this.configService.get<string>('s3.secretKey');
    const region = this.configService.get<string>('s3.region');

    if (!endpoint || !bucket || !accessKey || !secretKey || !region) {
      throw new Error('S3 / DigitalOcean Spaces configuration is missing in environment variables.');
    }

    this.bucketName = bucket;
    this.endpoint = endpoint;

    this.s3Client = new S3Client({
      endpoint: this.endpoint,
      region: region,
      credentials: {
        accessKeyId: accessKey,
        secretAccessKey: secretKey,
      },
      // Keep false to generate standard virtual-host URLs
      forcePathStyle: false,
    });
  }

  /**
   * Generates a temporary presigned URL for PUT uploads.
   *
   * @param dto Input filename and MIME type
   * @returns Presigned URL, unique key, and final public URL
   */
  async generatePresignedUrl(dto: CreatePresignedUrlDto): Promise<PresignedUrlResponseDto> {
    const { fileName, fileType } = dto;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(fileType)) {
      throw new BadRequestException(`Invalid file type. Allowed formats: ${allowedTypes.join(', ')}`);
    }

    // Sanitize filename & create unique key
    const parts = fileName.split('.');
    const extension = parts.length > 1 ? parts.pop()?.toLowerCase() : '';
    const baseName = parts.join('.');
    const sanitizedBaseName = baseName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 50);

    const uniqueId = randomUUID().toString().substring(0, 8);
    const folder = 'ioc-menu-items'
    const key = `${folder}/${uniqueId}-${sanitizedBaseName}${extension ? `.${extension}` : ''}`;

    // Create PUT command
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      ContentType: fileType,
      ACL: 'public-read',
    });

    try {
      // URL expires in 5 minutes (300 seconds)
      const uploadUrl = await getSignedUrl(this.s3Client, command, {
        expiresIn: 300,
      });

      // Construct public URL
      const cleanEndpoint = this.endpoint.replace(/\/$/, '');
      let fileUrl = '';
      if (cleanEndpoint.includes('digitaloceanspaces.com')) {
        // DigitalOcean Spaces uses: https://bucket.region.digitaloceanspaces.com/key
        const protocol = cleanEndpoint.startsWith('https://') ? 'https://' : 'http://';
        const domainOnly = cleanEndpoint.replace(/^https?:\/\//, '');
        fileUrl = `${protocol}${this.bucketName}.${domainOnly}/${key}`;
      } else {
        // Path-style fallback
        fileUrl = `${cleanEndpoint}/${this.bucketName}/${key}`;
      }

      return {
        uploadUrl,
        fileUrl,
        key,
      };
    } catch (error) {
      throw new BadRequestException(`Failed to generate presigned URL: ${error instanceof Error ? error.message : 'Unknown S3 error'}`);
    }
  }
}
