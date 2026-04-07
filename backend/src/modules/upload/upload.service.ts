import { PrismaClient } from '@prisma/client';
import { createWriteStream, existsSync, mkdirSync, unlinkSync } from 'fs';
import { pipeline } from 'stream/promises';
import path from 'path';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

// Ensure upload directory exists
if (!existsSync(UPLOAD_DIR)) {
  mkdirSync(UPLOAD_DIR, { recursive: true });
}

export interface UploadResult {
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  path: string;
}

export const uploadService = {
  async uploadBundleFile(
    appId: string,
    componentId: string,
    file: {
      filename: string;
      mimetype: string;
      file: NodeJS.ReadableStream;
    }
  ): Promise<UploadResult> {
    // Verify component exists and belongs to the app
    const component = await prisma.component.findFirst({
      where: {
        id: componentId,
        appId: appId,
      },
    });

    if (!component) {
      throw new Error('Component not found');
    }

    // Generate unique filename
    const ext = path.extname(file.filename);
    const uniqueFilename = `${componentId}-${randomUUID()}${ext}`;
    const filePath = path.join(UPLOAD_DIR, uniqueFilename);

    // Save file to disk
    const writeStream = createWriteStream(filePath);
    await pipeline(file.file, writeStream);

    // Get file size
    const stats = await import('fs/promises').then(fs => fs.stat(filePath));

    // Update component with bundle file info
    await prisma.component.update({
      where: { id: componentId },
      data: {
        config: {
          ...(component.config as object || {}),
          bundleFile: {
            filename: uniqueFilename,
            originalName: file.filename,
            mimetype: file.mimetype,
            size: stats.size,
            uploadedAt: new Date().toISOString(),
          },
        },
      },
    });

    return {
      filename: uniqueFilename,
      originalName: file.filename,
      mimetype: file.mimetype,
      size: stats.size,
      path: filePath,
    };
  },

  async deleteBundleFile(appId: string, componentId: string): Promise<void> {
    const component = await prisma.component.findFirst({
      where: {
        id: componentId,
        appId: appId,
      },
    });

    if (!component) {
      throw new Error('Component not found');
    }

    const config = component.config as { bundleFile?: { filename: string } } | null;

    if (config?.bundleFile?.filename) {
      const filePath = path.join(UPLOAD_DIR, config.bundleFile.filename);

      if (existsSync(filePath)) {
        unlinkSync(filePath);
      }

      // Remove bundle file info from component
      await prisma.component.update({
        where: { id: componentId },
        data: {
          config: {
            ...(config || {}),
            bundleFile: null,
          },
        },
      });
    }
  },

  async getBundleFileInfo(appId: string, componentId: string) {
    const component = await prisma.component.findFirst({
      where: {
        id: componentId,
        appId: appId,
      },
    });

    if (!component) {
      throw new Error('Component not found');
    }

    const config = component.config as { bundleFile?: UploadResult } | null;
    return config?.bundleFile || null;
  },
};
