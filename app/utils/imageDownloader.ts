import fs from 'fs';
import { mkdir, copyFile } from 'fs/promises';
import path from 'path';
import https from 'https';

const imageCache: Set<string> = new Set();

export async function downloadImage(url: string, filename: string, directory: string): Promise<string> {
  const uploadDir = path.join(process.cwd(), 'public', 'uploads', directory);
  const cacheDir = path.join(process.cwd(), 'public', 'uploads', 'cache');
  
  // Ensure directories exist
  await mkdir(uploadDir, { recursive: true });
  await mkdir(cacheDir, { recursive: true });
  
  const filepath = path.join(uploadDir, filename);
  const cacheKey = url.split('?')[0]; // Remove query parameters for cache key
  const cachedFilePath = path.join(cacheDir, Buffer.from(cacheKey).toString('base64') + '.jpg');
  
  // If image is already in cache, copy it
  if (imageCache.has(cacheKey)) {
    await copyFile(cachedFilePath, filepath);
    return filename;
  }

  return new Promise((resolve, reject) => {
    const timeout = 30000;
    
    const handleResponse = (response: any) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        const newUrl = response.headers.location;
        if (!newUrl) {
          reject(new Error('Redirect location not found'));
          return;
        }
        const request = https.get(newUrl, handleResponse);
        request.setTimeout(timeout);
        request.on('error', reject);
        request.on('timeout', () => {
          request.destroy();
          reject(new Error('Request timed out'));
        });
        return;
      }

      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download image: ${response.statusCode}`));
        return;
      }

      // Don't set encoding for binary data
      const cacheFileStream = fs.createWriteStream(cachedFilePath);
      response.pipe(cacheFileStream);

      cacheFileStream.on('finish', async () => {
        try {
          // Add to cache and copy to destination
          imageCache.add(cacheKey);
          await copyFile(cachedFilePath, filepath);
          cacheFileStream.close();
          resolve(filename);
        } catch (err) {
          reject(err);
        }
      });

      cacheFileStream.on('error', (err) => {
        fs.unlink(cachedFilePath, () => {});
        fs.unlink(filepath, () => {});
        reject(err);
      });

      response.on('error', (err) => {
        cacheFileStream.destroy();
        fs.unlink(cachedFilePath, () => {});
        fs.unlink(filepath, () => {});
        reject(err);
      });
    };

    const request = https.get(url, {
      timeout: timeout,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    }, handleResponse);

    request.on('error', reject);
    request.on('timeout', () => {
      request.destroy();
      reject(new Error('Request timed out'));
    });
  });
}

// Helper function to clear the cache directory
export async function clearImageCache(): Promise<void> {
  const cacheDir = path.join(process.cwd(), 'public', 'uploads', '.cache');
  try {
    await mkdir(cacheDir, { recursive: true });
    const files = await fs.promises.readdir(cacheDir);
    await Promise.all(
      files.map(file => 
        fs.promises.unlink(path.join(cacheDir, file)).catch(() => {})
      )
    );
  } catch (error) {
    console.error('Error clearing image cache:', error);
  }
} 