// src/common/services/storage.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class StorageService {
  private readonly uploadPath = join(process.cwd(), 'uploads', 'messages');
  private readonly maxFileSize = 10 * 1024 * 1024; // 10MB

  private async ensureUploadDirExists(path: string = this.uploadPath) {
    try {
      if (!existsSync(path)) {
        await mkdir(path, { recursive: true });
        console.log(`✅ Created directory: ${path}`);
      }
    } catch (error) {
      console.error(`❌ Failed to create directory ${path}:`, error.message);
      throw new BadRequestException(
        `Không thể tạo thư mục lưu file. Vui lòng liên hệ quản trị viên.`,
      );
    }
  }

  /**
   * Upload file to local storage
   */
  async uploadFile(
    file: Express.Multer.File,
    subfolder: string = '',
  ): Promise<string> {
    // Generate unique filename first
    const fileExtension = file.originalname.split('.').pop();
    const fileName = `${uuidv4()}.${fileExtension}`;
    
    // Determine full path
    const fullPath = subfolder
      ? join(this.uploadPath, subfolder, fileName)
      : join(this.uploadPath, fileName);

    // Ensure directory exists (including subfolder if needed)
    const targetDir = subfolder
      ? join(this.uploadPath, subfolder)
      : this.uploadPath;
    await this.ensureUploadDirExists(targetDir);

    // Validate file size
    if (file.size > this.maxFileSize) {
      throw new BadRequestException(
        `File quá lớn. Kích thước tối đa là ${this.maxFileSize / 1024 / 1024}MB`,
      );
    }

    // Validate file type
    const allowedMimeTypes = [
      // Images
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      // Documents
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      // Archives
      'application/zip',
      'application/x-rar-compressed',
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Định dạng file không được hỗ trợ. Chỉ chấp nhận: ảnh, PDF, Word, Excel, ZIP',
      );
    }

    // Write file to disk
    try {
      await writeFile(fullPath, file.buffer);
      console.log(`✅ File saved: ${fullPath}`);
    } catch (error) {
      console.error(`❌ Failed to write file ${fullPath}:`, error.message);
      throw new BadRequestException(
        `Không thể lưu file. Vui lòng thử lại.`,
      );
    }

    // Return relative URL path
    const relativePath = subfolder
      ? `/uploads/messages/${subfolder}/${fileName}`
      : `/uploads/messages/${fileName}`;

    return relativePath;
  }

  /**
   * Get file type from mimetype
   */
  getFileType(mimetype: string): 'image' | 'file' {
    if (mimetype.startsWith('image/')) {
      return 'image';
    }
    return 'file';
  }
}
