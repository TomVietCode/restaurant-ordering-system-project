import { Test, TestingModule } from '@nestjs/testing';
import { UploadsService } from './uploads.service.js';
import { ConfigService } from '@nestjs/config';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { BadRequestException } from '@nestjs/common';

// Mock S3 actions and requests
jest.mock('@aws-sdk/client-s3', () => {
  return {
    S3Client: jest.fn().mockImplementation(() => ({})),
    PutObjectCommand: jest.fn().mockImplementation((args) => args),
  };
});

jest.mock('@aws-sdk/s3-request-presigner', () => {
  return {
    getSignedUrl: jest.fn(),
  };
});

describe('UploadsService', () => {
  let service: UploadsService;

  const mockConfig = {
    's3.endpoint': 'https://sgp1.digitaloceanspaces.com',
    's3.bucket': 'restaurant-uploads',
    's3.accessKey': 'mock-access-key',
    's3.secretKey': 'mock-secret-key',
    's3.region': 'sgp1',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UploadsService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => mockConfig[key]),
          },
        },
      ],
    }).compile();

    service = module.get<UploadsService>(UploadsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generatePresignedUrl', () => {
    it('should generate a presigned PUT URL and build correct virtual-host public url', async () => {
      const mockUploadUrl = 'https://restaurant-uploads.sgp1.digitaloceanspaces.com/ioc-menu-items/mock-key?signature=...';
      (getSignedUrl as jest.Mock).mockResolvedValue(mockUploadUrl);

      const dto = {
        fileName: 'beef burger.PNG',
        fileType: 'image/png',
      };

      const result = await service.generatePresignedUrl(dto);

      expect(result).toBeDefined();
      expect(result.uploadUrl).toBe(mockUploadUrl);
      expect(result.key).toContain('ioc-menu-items/');
      expect(result.key).toContain('-beef-burger.png');
      expect(result.fileUrl).toContain('https://restaurant-uploads.sgp1.digitaloceanspaces.com/ioc-menu-items/');
      expect(getSignedUrl).toHaveBeenCalledTimes(1);
    });

    it('should throw BadRequestException if fileType is invalid (e.g. executable)', async () => {
      const dto = {
        fileName: 'hack.exe',
        fileType: 'application/octet-stream',
      };

      await expect(service.generatePresignedUrl(dto)).rejects.toThrow(BadRequestException);
    });
  });
});
