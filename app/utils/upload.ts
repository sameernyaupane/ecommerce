// app/utils/upload.ts
import fs from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

export async function uploadImageToTempFolder(
  file: File, 
  folder: "profiles" | "products" | "categories" = "products"
): Promise<string> {
  const tempDir = path.join(process.cwd(), "public", "uploads", folder);
  await fs.mkdir(tempDir, { recursive: true });

  const fileExtension = path.extname(file.name);
  const fileName = `${uuidv4()}${fileExtension}`;
  const filePath = path.join(tempDir, fileName);

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  await fs.writeFile(filePath, buffer);

  return fileName;
}

export async function deleteImageFromServer(
  imageName: string, 
  folder: "profiles" | "products" | "categories" = "products"
): Promise<void> {
  if (imageName.includes("..") || imageName.includes("/")) {
    throw new Error("Invalid image name");
  }

  const tempDir = path.join(process.cwd(), "public", "uploads", folder);
  const imagePath = path.join(tempDir, imageName);

  try {
    await fs.access(imagePath);
  } catch {
    return;
  }

  await fs.unlink(imagePath);
}