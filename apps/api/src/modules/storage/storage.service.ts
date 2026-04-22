import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
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
    this.endpoint = this.configService.get<string>('DO_SPACES_ENDPOINT') || 'https://sfo3.digitaloceanspaces.com';
    this.bucket = this.configService.get<string>('DO_SPACES_BUCKET') || 'koen';

    if (accessKey && secretKey) {
      this.s3Client = new S3Client({
        region,
        endpoint: this.endpoint,
        credentials: {
          accessKeyId: accessKey,
          secretAccessKey: secretKey,
        },
        forcePathStyle: false,
      });
      this.logger.log('DigitalOcean Spaces configured.');
    } else {
      this.logger.warn('DigitalOcean Spaces NOT configured. Using local filesystem fallback.');
    }
  }

  /**
   * Generates a temporary URL for the frontend to upload a file directly to S3.
   * This bypasses the API server for performance.
   */
  async getUploadUrl(key: string, contentType: string = 'audio/webm'): Promise<string> {
    if (!this.s3Client) throw new Error('Cloud storage not configured');

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
      // Removed ACL: 'public-read' to keep files private by default in Phase 3.6
    });

    return getSignedUrl(this.s3Client, command, { expiresIn: 300 }); // 5 minutes expiry
  }

  /**
   * Generates a temporary URL for viewing a private cloud file.
   */
  async getDownloadUrl(key: string): Promise<string> {
    if (!this.s3Client) throw new Error('Cloud storage not configured');
    
    // If the key is already a full URL, we extract the key part
    // (In case the DB stores the full URL from old Stage 1/3 uploads)
    const finalKey = key.includes('digitaloceanspaces.com') 
      ? key.split('.digitaloceanspaces.com/')[1] 
      : key;

    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: finalKey,
    });

    return getSignedUrl(this.s3Client, command, { expiresIn: 3600 }); // 1 hour expiry
  }

  /**
   * Uploads a file from the server (used for local processing fallbacks)
   */
  async uploadFile(file: Express.Multer.File, folder: string = 'audio'): Promise<string> {
    const key = `${folder}/${Date.now()}-${file.originalname}`;

    if (!this.s3Client) {
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
        }),
      );

      // Return the base key or a helper to identify it's in the cloud
      // With Phase 3.6, we should ideally store the KEY, not the full URL.
      const url = `${this.endpoint.replace('https://', `https://${this.bucket}.`)}/${key}`;
      return url;
    } catch (error) {
      this.logger.error('Failed to upload file to cloud storage', error.stack);
      throw error;
    }
  }
}

