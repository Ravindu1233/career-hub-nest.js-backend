import { Injectable } from '@nestjs/common';
import { existsSync, promises as fs } from 'fs';
import { join } from 'path';

@Injectable()
export class StorageService {
  /**
   * Convert a public URL path like "/uploads/jobs/x.jpg"
   * into local filesystem absolute path.
   */
  toDiskPath(publicPath: string) {
    // publicPath: /uploads/jobs/abc.jpg
    const relative = publicPath.replace(/^\/uploads\//, '');
    return join(process.cwd(), 'uploads', relative);
  }

  async deleteIfExists(publicPath?: string | null) {
    if (!publicPath) return;

    // Only allow deleting inside /uploads for safety
    if (!publicPath.startsWith('/uploads/')) return;

    const diskPath = this.toDiskPath(publicPath);
    if (!existsSync(diskPath)) return;

    try {
      await fs.unlink(diskPath);
    } catch {
      // ignore delete errors
    }
  }
}
