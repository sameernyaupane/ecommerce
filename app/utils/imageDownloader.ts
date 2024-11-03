import fs from 'fs';
import { mkdir } from 'fs/promises';
import path from 'path';
import https from 'https';

export async function downloadImage(url: string, filename: string, directory: string): Promise<string> {
  const uploadDir = path.join(process.cwd(), 'public', 'uploads', directory);
  
  // Ensure directory exists
  await mkdir(uploadDir, { recursive: true });
  
  const filepath = path.join(uploadDir, filename);
  
  return new Promise((resolve, reject) => {
    const handleResponse = (response: any) => {
      // Handle redirects
      if (response.statusCode === 301 || response.statusCode === 302) {
        const newUrl = response.headers.location;
        if (!newUrl) {
          reject(new Error('Redirect location not found'));
          return;
        }
        https.get(newUrl, handleResponse).on('error', reject);
        return;
      }

      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download image: ${response.statusCode}`));
        return;
      }

      const fileStream = fs.createWriteStream(filepath);
      response.pipe(fileStream);

      fileStream.on('finish', () => {
        fileStream.close();
        resolve(filename);
      });

      fileStream.on('error', (err) => {
        fs.unlink(filepath, () => {}); // Ignore unlink errors
        reject(err);
      });
    };

    https.get(url, handleResponse).on('error', reject);
  });
} 