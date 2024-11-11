import sql from '../database/sql';
import { deleteImageFromServer } from "@/utils/upload";

interface GalleryImage {
  id: number;
  product_id: number;
  image_name: string;
  is_main: boolean;
  created_at: Date;
}

export class ProductGalleryImageModel {
  /**
   * Insert multiple gallery images for a product.
   * @param productId - The ID of the product.
   * @param images - An array of image objects to be inserted, each with image_name and is_main flag.
   */
  static async createMany(productId: number, images: { image_name: string; is_main: boolean }[]): Promise<void> {
    if (images.length === 0) return;

    try {
      // Ensure only one main image per product
      const mainImages = images.filter(image => image.is_main);
      if (mainImages.length > 1) {
        throw new Error("Only one image can be set as main");
      }

      // Create array of objects with all required fields
      const values = images.map(image => ({
        product_id: productId,
        image_name: image.image_name,
        is_main: image.is_main || false,
        created_at: new Date(),
        updated_at: new Date(),
      }));

      // Use sql.unnest for better performance and safety
      await sql`
        INSERT INTO product_gallery_images ${sql(values, 
          'product_id',
          'image_name',
          'is_main',
          'created_at',
          'updated_at'
        )}
      `;
    } catch (err) {
      console.error('Error inserting gallery images:', err);
      throw err;
    }
  }

  /**
   * Retrieve gallery images for a specific product.
   * @param productId - The ID of the product.
   * @returns An array of gallery images.
   */
  static async findByProductId(productId: number): Promise<GalleryImage[]> {
    try {
      return await sql<GalleryImage[]>`
        SELECT id, product_id, image_name, is_main, created_at
        FROM product_gallery_images
        WHERE product_id = ${productId}
        ORDER BY created_at ASC
      `;
    } catch (err) {
      console.error('Error retrieving gallery images:', err);
      throw err;
    }
  }

  /**
   * Find a gallery image by image name.
   * @param imageName - The image name.
   * @returns The gallery image or null if not found.
   */
  static async findByImageName(imageName: string): Promise<GalleryImage | null> {
    try {
      const [image] = await sql<GalleryImage[]>`
        SELECT id, product_id, image_name, is_main, created_at
        FROM product_gallery_images
        WHERE image_name = ${imageName}
        LIMIT 1
      `;
      return image || null;
    } catch (err) {
      console.error('Error retrieving gallery image by name:', err);
      throw err;
    }
  }

  /**
   * Unset `is_main` for all images of a product.
   * @param productId - The ID of the product.
   */
  static async updateAllImagesToNotMain(productId: number): Promise<void> {
    try {
      await sql`
        UPDATE product_gallery_images
        SET is_main = false
        WHERE product_id = ${productId}
      `;
    } catch (err) {
      console.error('Error unsetting main images:', err);
      throw err;
    }
  }

  /**
   * Update a gallery image by its ID.
   * @param id - The ID of the gallery image to update.
   * @param updateData - An object with fields to update.
   * @returns A promise that resolves when the update is complete.
   */
  static async update(id: number, updateData: Partial<GalleryImage>): Promise<void> {
    try {
      await sql`
        UPDATE product_gallery_images
        SET ${sql(updateData)}
        WHERE id = ${id}
      `;
    } catch (err) {
      console.error('Error updating gallery image:', err);
      throw err;
    }
  }

  /**
   * Update an image's `is_main` status by its image name.
   * @param imageName - The name of the image.
   * @param isMain - Boolean to set `is_main`.
   */
  static async updateByImageName(imageName: string, isMain: boolean): Promise<void> {
    try {
      await sql`
        UPDATE product_gallery_images
        SET is_main = ${isMain}, updated_at = NOW()
        WHERE image_name = ${imageName}
      `;
    } catch (err) {
      console.error('Error updating gallery image by name:', err);
      throw err;
    }
  }

  /**
   * Hard delete a gallery image by its ID.
   * @param id - The ID of the gallery image to delete.
   * @returns A boolean indicating if the deletion was successful.
   */
  static async delete(id: number): Promise<boolean> {
    try {
      // Get the image name before deleting
      const [image] = await sql<{ image_name: string }[]>`
        SELECT image_name FROM product_gallery_images WHERE id = ${id}
      `;

      if (image) {
        // Delete the physical file
        await deleteImageFromServer(image.image_name, "products");
      }

      const result = await sql`
        DELETE FROM product_gallery_images
        WHERE id = ${id}
      `;
      return result.count > 0;
    } catch (err) {
      console.error('Error deleting gallery image:', err);
      throw err;
    }
  }

  /**
   * Update the image name for a specific gallery image ID.
   * @param id - The ID of the gallery image to update.
   * @param newImageName - The new image name.
   */
  static async updateImageName(id: number, newImageName: string): Promise<void> {
    try {
      await sql`
        UPDATE product_gallery_images
        SET image_name = ${newImageName}, updated_at = NOW()
        WHERE id = ${id}
      `;
    } catch (err) {
      console.error('Error updating gallery image name:', err);
      throw err;
    }
  }
}
