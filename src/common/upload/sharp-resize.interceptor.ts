import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, from } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import sharp from 'sharp';
import { promises as fs } from 'fs';
import { extname } from 'path';

@Injectable()
export class SharpResizeInterceptor implements NestInterceptor {
  constructor(
    private readonly maxWidth = 1280,
    private readonly quality = 80,
  ) {}

  intercept(_context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      switchMap(async (data) => {
        // This interceptor runs AFTER route handler, so not good for file transform.
        // We'll use a helper method approach instead.
        return data;
      }),
    );
  }

  static async resizeOnDisk(filePath: string) {
    // Detect extension; output same file (overwrite)
    const ext = extname(filePath).toLowerCase();

    const input = await fs.readFile(filePath);

    const pipeline = sharp(input).rotate().resize({
      width: 1280,
      withoutEnlargement: true,
    });

    let output: Buffer;

    if (ext === '.png') {
      output = await pipeline.png({ compressionLevel: 9 }).toBuffer();
    } else if (ext === '.webp') {
      output = await pipeline.webp({ quality: 80 }).toBuffer();
    } else {
      output = await pipeline.jpeg({ quality: 80 }).toBuffer();
    }

    // Basic sanity check
    if (!output || output.length < 100) {
      throw new BadRequestException('Invalid image file');
    }

    await fs.writeFile(filePath, output);
  }
}
