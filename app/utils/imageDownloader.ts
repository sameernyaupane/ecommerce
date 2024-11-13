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
    const timeout = 30000; // Increase timeout to 30 seconds
    
    const handleResponse = (response: any) => {
      // Handle redirects
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

      // Don't set encoding - we want the raw binary data
      response.setEncoding('binary');
      
      const fileStream = fs.createWriteStream(filepath);
      
      response.pipe(fileStream);

      fileStream.on('finish', () => {
        fileStream.close();
        resolve(filename);
      });

      fileStream.on('error', (err) => {
        fs.unlink(filepath, () => {}); // Cleanup on error
        reject(err);
      });

      response.on('error', (err) => {
        fileStream.destroy();
        fs.unlink(filepath, () => {}); // Cleanup on error
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