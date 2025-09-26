import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';

interface R2Config {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  publicUrl: string;
}

class R2Service {
  private s3Client: S3Client;
  private bucketName: string;
  private publicUrl: string;

  constructor() {
    const config: R2Config = {
      accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
      accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
      bucketName: process.env.CLOUDFLARE_R2_BUCKET_NAME!,
      publicUrl: process.env.CLOUDFLARE_R2_PUBLIC_URL!
    };

    // Validate required environment variables
    if (!config.accountId || !config.accessKeyId || !config.secretAccessKey || !config.bucketName || !config.publicUrl) {
      throw new Error('Missing required Cloudflare R2 environment variables');
    }

    this.bucketName = config.bucketName;
    this.publicUrl = config.publicUrl;

    // Initialize S3 client for Cloudflare R2
    this.s3Client = new S3Client({
      region: 'auto',
      endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
  }

  /**
   * Upload an image to R2 storage
   */
  async uploadImage(
    buffer: Buffer,
    originalName: string,
    folder: 'prayer-requests' | 'avatars' = 'prayer-requests'
  ): Promise<string> {
    try {
      // Generate unique filename
      const fileExtension = originalName.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${folder}/${uuidv4()}.${fileExtension}`;

      // Process image with Sharp (optimize and resize)
      let processedBuffer: Buffer;
      
      if (folder === 'avatars') {
        // Resize avatars to 400x400
        processedBuffer = await sharp(buffer)
          .resize(400, 400, { fit: 'cover' })
          .jpeg({ quality: 85 })
          .toBuffer();
      } else {
        // Resize prayer request images to max 1200px width, maintain aspect ratio
        processedBuffer = await sharp(buffer)
          .resize(1200, null, { 
            fit: 'inside',
            withoutEnlargement: true 
          })
          .jpeg({ quality: 85 })
          .toBuffer();
      }

      // Upload to R2
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: fileName,
        Body: processedBuffer,
        ContentType: `image/${fileExtension === 'png' ? 'png' : 'jpeg'}`,
        CacheControl: 'public, max-age=31536000', // Cache for 1 year
      });

      await this.s3Client.send(command);

      // Return public URL
      const publicUrl = `${this.publicUrl}/${fileName}`;
      console.log(`✅ Image uploaded successfully: ${publicUrl}`);
      
      return publicUrl;
    } catch (error) {
      console.error('❌ Error uploading image to R2:', error);
      throw new Error('Failed to upload image');
    }
  }

  /**
   * Delete an image from R2 storage
   */
  async deleteImage(imageUrl: string): Promise<void> {
    try {
      // Extract key from URL
      const key = imageUrl.replace(`${this.publicUrl}/`, '');
      
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.s3Client.send(command);
      console.log(`✅ Image deleted successfully: ${imageUrl}`);
    } catch (error) {
      console.error('❌ Error deleting image from R2:', error);
      throw new Error('Failed to delete image');
    }
  }

  /**
   * Generate a presigned URL for direct upload (optional, for future use)
   */
  async generatePresignedUrl(
    fileName: string,
    folder: 'prayer-requests' | 'avatars' = 'prayer-requests',
    expiresIn: number = 3600
  ): Promise<string> {
    try {
      const key = `${folder}/${fileName}`;
      
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        ContentType: 'image/jpeg',
      });

      const presignedUrl = await getSignedUrl(this.s3Client, command, { expiresIn });
      return presignedUrl;
    } catch (error) {
      console.error('❌ Error generating presigned URL:', error);
      throw new Error('Failed to generate presigned URL');
    }
  }

  /**
   * Check if R2 service is properly configured
   */
  async healthCheck(): Promise<boolean> {
    try {
      // Try to list objects (this will fail if credentials are wrong)
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: 'health-check-dummy-key', // This key doesn't need to exist
      });

      // We expect this to fail with NoSuchKey, but not with authentication errors
      try {
        await this.s3Client.send(command);
      } catch (error: any) {
        // If it's NoSuchKey, credentials are working
        if (error.name === 'NoSuchKey') {
          return true;
        }
        // If it's an auth error, credentials are wrong
        if (error.name === 'SignatureDoesNotMatch' || error.name === 'InvalidAccessKeyId') {
          return false;
        }
        // Other errors might indicate network issues, but credentials are probably OK
        return true;
      }
      
      return true;
    } catch (error) {
      console.error('❌ R2 health check failed:', error);
      return false;
    }
  }
}

// Export a function that creates the service instance
let r2ServiceInstance: R2Service | null = null;

export default {
  getInstance(): R2Service {
    if (!r2ServiceInstance) {
      r2ServiceInstance = new R2Service();
    }
    return r2ServiceInstance;
  },

  // Proxy methods for convenience
  async uploadImage(buffer: Buffer, originalName: string, folder: 'prayer-requests' | 'avatars' = 'prayer-requests'): Promise<string> {
    return this.getInstance().uploadImage(buffer, originalName, folder);
  },

  async deleteImage(imageUrl: string): Promise<void> {
    return this.getInstance().deleteImage(imageUrl);
  },

  async generatePresignedUrl(fileName: string, folder: 'prayer-requests' | 'avatars' = 'prayer-requests', expiresIn: number = 3600): Promise<string> {
    return this.getInstance().generatePresignedUrl(fileName, folder, expiresIn);
  },

  async healthCheck(): Promise<boolean> {
    return this.getInstance().healthCheck();
  }
};
