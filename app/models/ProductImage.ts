import sql from "../database/sql";
import { deleteUploadedFile } from "@/utils/upload";

// Helper to manage product images in the database
class ProductImageModel {
  static async create({ productId, mainImageUrl, galleryImageUrls }) {
    try {
      // Insert main image
      await sql`
        UPDATE products 
        SET main_image_url = ${mainImageUrl}
        WHERE id = ${productId}
      `;

      // Insert gallery images
      if (galleryImageUrls?.length) {
        await sql`
          INSERT INTO product_gallery_images (product_id, image_url, created_at)
          SELECT ${productId}, url, NOW()
          FROM unnest(${galleryImageUrls}::text[]) AS url
        `;
      }
    } catch (err) {
      console.error('Error inserting product images:', err);
      throw err;
    }
  }

  static async getGalleryImages(productId) {
    try {
      const images = await sql`
        SELECT image_url
        FROM product_gallery_images
        WHERE product_id = ${productId}
        ORDER BY created_at ASC
      `;
      return images.map(img => img.image_url);
    } catch (err) {
      console.error('Error getting gallery images:', err);
      throw err;
    }
  }

  static async updateGalleryImages(productId, galleryImageUrls) {
    try {
      // Get existing gallery images for cleanup
      const existingImages = await this.getGalleryImages(productId);
      
      // Delete existing gallery images from database
      await sql`
        DELETE FROM product_gallery_images
        WHERE product_id = ${productId}
      `;

      // Delete existing files
      await Promise.all(existingImages.map(imageUrl => deleteUploadedFile(imageUrl)));

      // Insert new gallery images
      if (galleryImageUrls?.length) {
        await sql`
          INSERT INTO product_gallery_images (product_id, image_url, created_at)
          SELECT ${productId}, url, NOW()
          FROM unnest(${galleryImageUrls}::text[]) AS url
        `;
      }
    } catch (err) {
      console.error('Error updating gallery images:', err);
      throw err;
    }
  }

  static async deleteProductImages(productId) {
    try {
      // Get all images associated with the product
      const [product] = await sql`
        SELECT main_image_url FROM products WHERE id = ${productId}
      `;
      const galleryImages = await this.getGalleryImages(productId);

      // Delete files
      if (product?.main_image_url) {
        await deleteUploadedFile(product.main_image_url);
      }
      await Promise.all(galleryImages.map(imageUrl => deleteUploadedFile(imageUrl)));

      // Clear database records
      await sql`DELETE FROM product_gallery_images WHERE product_id = ${productId}`;
      await sql`UPDATE products SET main_image_url = NULL WHERE id = ${productId}`;
    } catch (err) {
      console.error('Error deleting product images:', err);
      throw err;
    }
  }
}
