import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { readFileSync } from 'fs';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly s3Client: S3Client;
  private readonly bucket: string;
  private readonly endpoint: string;

  constructor(private readonly configService: ConfigService) {
    const accessKey = this.configService.get<string>('DO_SPACES_KEY');
    const secretKey = this.configService.get<string>('DO_SPACES_SECRET');
    const region = this.configService.get<string>('DO_SPACES_REGION') || 'us-east-1';
    this.endpoint = this.configService.get<string>('DO_SPACES_ENDPOINT') || '';
    this.bucket = this.configService.get<string>('DO_SPACES_BUCKET') || '';

    if (accessKey && secretKey && this.endpoint) {
      this.s3Client = new S3Client({
        region,
        endpoint: this.endpoint,
        credentials: {
          accessKeyId: accessKey,
          secretAccessKey: secretKey,
        },
        forcePathStyle: false, // DO Spaces usually works better with this false (subdomain style)
      });
      this.logger.log('DigitalOcean Spaces configured.');
    } else {
      this.logger.warn('DigitalOcean Spaces NOT configured. Using local filesystem (unstable for production).');
    }
  }

  async uploadFile(file: Express.Multer.File, folder: string = 'audio'): Promise<string> {
    const key = `${folder}/${Date.now()}-${file.originalname}`;

    if (!this.s3Client) {
      // Fallback to returning local path if S3 isn't configured (Stage 1 behavior)
      return file.path;
    }

    try {
      const fileContent = readFileSync(file.path);

      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: fileContent,
          ContentType: file.mimetype,
          ACL: 'public-read',
        }),
      );

      // DigitalOcean Spaces public URL format: https://[bucket].[endpoint]/[key]
      // We often use a custom domain or the standard DO one.
      const url = `${this.endpoint.replace('https://', `https://${this.bucket}.`)}/${key}`;
      this.logger.log(`Uploaded file to cloud: ${url}`);
      return url;
    } catch (error) {
      this.logger.error('Failed to upload file to cloud storage', error.stack);
      throw error;
    }
  }
}

