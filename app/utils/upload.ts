// app/utils/upload.ts
import fs from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

export async function uploadImageToTempFolder(file: File): Promise<{ name: string; path: string }> {
  const tempDir = path.join(process.cwd(), "public", "uploads",  "products");
  await fs.mkdir(tempDir, { recursive: true });

  const fileExtension = path.extname(file.name);
  const fileName = `${uuidv4()}${fileExtension}`;
  const filePath = path.join(tempDir, fileName);

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  await fs.writeFile(filePath, buffer);

  // Return both the image name and the path to access it
  return {
    name: fileName,
    path: `/uploads/products/${fileName}`,
  };
}
