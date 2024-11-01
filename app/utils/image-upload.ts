import path from "path";
import fs from "fs/promises";
import { v4 as uuidv4 } from "uuid";

// Configure upload settings
const UPLOAD_DIR = "public/uploads/products";
const PUBLIC_PATH = "/uploads/products";
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export class ImageUploadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ImageUploadError';
  }
}

export async function setupUploadsDirectory() {
  try {
    await fs.access(UPLOAD_DIR);
  } catch {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
  }
}

export async function processUploadedFile(file: File | null): Promise<string | null> {
  if (!file) return null;

  // Validate file type
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new ImageUploadError('Invalid file type. Only JPEG, PNG and WebP are allowed.');
  }

  // Validate file size
  if (file.size > MAX_SIZE) {
    throw new ImageUploadError('File size too large. Maximum size is 5MB.');
  }

  const uniqueId = uuidv4();
  const extension = file.type.split('/')[1];
  const filename = `${uniqueId}.${extension}`;
  const fullPath = path.join(UPLOAD_DIR, filename);
  
  try {
    // Convert File object to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Write file to disk
    await fs.writeFile(fullPath, buffer);
    
    // Return the public URL path
    return `${PUBLIC_PATH}/${filename}`;
  } catch (error) {
    console.error('Error saving file:', error);
    throw new ImageUploadError('Failed to save image file.');
  }
}

export async function deleteUploadedFile(filePath: string | null) {
  if (!filePath) return;
  
  try {
    // Convert public URL to filesystem path
    const relativePath = filePath.replace('/uploads/products/', '');
    const fullPath = path.join(UPLOAD_DIR, relativePath);
    
    // Check if file exists before attempting to delete
    await fs.access(fullPath);
    await fs.unlink(fullPath);
  } catch (error) {
    console.error('Error deleting file:', error);
    // Don't throw - we don't want to break the application if file deletion fails
  }
}