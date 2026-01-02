import sharp from 'sharp';
import { promises as fs } from 'fs';
import { extname } from 'path';
import { BadRequestException } from '@nestjs/common';

export async function resizeOnDisk(filePath: string, width: number) {
  const ext = extname(filePath).toLowerCase();
  const input = await fs.readFile(filePath);

  const pipeline = sharp(input)
    .rotate()
    .resize({ width, withoutEnlargement: true });

  let output: Buffer;

  if (ext === '.png')
    output = await pipeline.png({ compressionLevel: 9 }).toBuffer();
  else if (ext === '.webp')
    output = await pipeline.webp({ quality: 80 }).toBuffer();
  else output = await pipeline.jpeg({ quality: 80 }).toBuffer();

  if (!output || output.length < 100)
    throw new BadRequestException('Invalid image');
  await fs.writeFile(filePath, output);
}
