// app/utils/upload.ts
import fs from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

export async function uploadImageToTempFolder(file: File): Promise<string> {
  const tempDir = path.join(process.cwd(), "public", "uploads",  "products");
  await fs.mkdir(tempDir, { recursive: true });

  const fileExtension = path.extname(file.name);
  const fileName = `${uuidv4()}${fileExtension}`;
  const filePath = path.join(tempDir, fileName);

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  await fs.writeFile(filePath, buffer);

  // Return both the image name
  return fileName
}

// New function to delete an image from the server
export async function deleteImageFromServer(imageName: string): Promise<void> {
  // Sanitize the image name to prevent directory traversal attacks
  if (imageName.includes("..") || imageName.includes("/")) {
    throw new Error("Invalid image name");
  }

  // Determine the path to the image
  const tempDir = path.join(process.cwd(), "public", "uploads",  "products");
  const imagePath = path.join(tempDir, imageName);

  // Check if the file exists before attempting to delete it
  try {
    await fs.access(imagePath);
  } catch {
    // File does not exist; nothing to delete
    return;
  }

  // Delete the image file
  await fs.unlink(imagePath);
}