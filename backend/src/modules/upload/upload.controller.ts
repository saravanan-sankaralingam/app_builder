import { FastifyRequest, FastifyReply } from 'fastify';
import { uploadService } from './upload.service.js';

interface UploadParams {
  appId: string;
  componentId: string;
}

export const uploadController = {
  async uploadBundle(
    request: FastifyRequest<{ Params: UploadParams }>,
    reply: FastifyReply
  ) {
    try {
      const { appId, componentId } = request.params;

      const data = await request.file();

      if (!data) {
        return reply.status(400).send({ error: 'No file uploaded' });
      }

      // Validate file type
      if (!data.filename.endsWith('.zip')) {
        return reply.status(400).send({ error: 'Only ZIP files are allowed' });
      }

      const result = await uploadService.uploadBundleFile(appId, componentId, {
        filename: data.filename,
        mimetype: data.mimetype,
        file: data.file,
      });

      return reply.status(200).send({
        message: 'File uploaded successfully',
        file: {
          filename: result.filename,
          originalName: result.originalName,
          mimetype: result.mimetype,
          size: result.size,
        },
      });
    } catch (error) {
      console.error('Upload error:', error);

      if (error instanceof Error && error.message === 'Component not found') {
        return reply.status(404).send({ error: 'Component not found' });
      }

      return reply.status(500).send({ error: 'Failed to upload file' });
    }
  },

  async deleteBundle(
    request: FastifyRequest<{ Params: UploadParams }>,
    reply: FastifyReply
  ) {
    try {
      const { appId, componentId } = request.params;

      await uploadService.deleteBundleFile(appId, componentId);

      return reply.status(200).send({ message: 'File deleted successfully' });
    } catch (error) {
      console.error('Delete error:', error);

      if (error instanceof Error && error.message === 'Component not found') {
        return reply.status(404).send({ error: 'Component not found' });
      }

      return reply.status(500).send({ error: 'Failed to delete file' });
    }
  },

  async getBundleInfo(
    request: FastifyRequest<{ Params: UploadParams }>,
    reply: FastifyReply
  ) {
    try {
      const { appId, componentId } = request.params;

      const fileInfo = await uploadService.getBundleFileInfo(appId, componentId);

      if (!fileInfo) {
        return reply.status(404).send({ error: 'No bundle file found' });
      }

      return reply.status(200).send(fileInfo);
    } catch (error) {
      console.error('Get bundle info error:', error);

      if (error instanceof Error && error.message === 'Component not found') {
        return reply.status(404).send({ error: 'Component not found' });
      }

      return reply.status(500).send({ error: 'Failed to get bundle info' });
    }
  },
};
