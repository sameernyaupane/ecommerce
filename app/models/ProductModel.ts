import sql from "../database/sql";

import { ProductGalleryImageModel } from "@/models/ProductGalleryImageModel";
import { deleteImageFromServer } from "@/utils/upload";
import { formatDistanceToNow } from 'date-fns';

export class ProductModel {
  // Insert a new product
  static async create({ name, description, price, stock, mainImage }: { 
    name: string; 
    description: string; 
    price: number; 
    stock: number; 
    mainImage?: string | null 
  }) {
    try {
      const [product] = await sql`
        INSERT INTO products (name, description, price, stock, created_at, updated_at)
        VALUES (${name}, ${description}, ${price}, ${stock}, NOW(), NOW())
        RETURNING *
      `;
      
      if (mainImage) {
        // Insert the main image into product_gallery_images with is_main = true
        await ProductGalleryImageModel.createMany(product.id, [{ image_name: mainImage, is_main: true }]);
      }

      return product;
    } catch (err) {
      console.error('Error inserting product:', err);
      throw err;
    }
  }

  // Update a product by ID
  static async update(id: number, { name, description, price, stock, mainImage }: { 
    name: string; 
    description: string; 
    price: number; 
    stock: number; 
    mainImage?: string | null 
  }) {
    try {
      const [updatedProduct] = await sql`
        UPDATE products
        SET name = ${name}, description = ${description}, price = ${price}, stock = ${stock}, updated_at = NOW()
        WHERE id = ${id}
        RETURNING *
      `;

      if (mainImage) {
        // Check if a main image already exists
        const existingMainImage = await sql<{ id: number; image_name: string; }[]>`
          SELECT id, image_name 
          FROM product_gallery_images 
          WHERE product_id = ${id} AND is_main = TRUE AND deleted_at IS NULL
          LIMIT 1
        `;

        if (existingMainImage.length > 0) {
          // Delete the old image file
          await deleteImageFromServer(existingMainImage[0].image_name, "products");
          // Update existing main image
          const mainImageId = existingMainImage[0].id;
          await ProductGalleryImageModel.updateMainImage(mainImageId, mainImage);
        } else {
          // Insert new main image
          await ProductGalleryImageModel.createMany(id, [{ image_name: mainImage, is_main: true }]);
        }
      }

      return updatedProduct;
    } catch (err) {
      console.error('Error updating product:', err);
      throw err;
    }
  }

  // Retrieve all products with gallery images, excluding soft deleted
  static async getAll() {
    try {
      const products = await sql`
        SELECT 
          p.*,
          COALESCE(
            json_agg(
              json_build_object(
                'id', g.id,
                'image_name', g.image_name,
                'is_main', g.is_main,
                'created_at', g.created_at
              )
              ORDER BY g.created_at  
            ) FILTER (WHERE g.deleted_at IS NULL), 
            '[]'
          ) AS gallery_images
        FROM products p
        LEFT JOIN product_gallery_images g ON p.id = g.product_id
        WHERE p.deleted_at IS NULL
        GROUP BY p.id
        ORDER BY p.created_at DESC
      `;

      return products.map(product => ({
        ...product,
        time_ago: formatDistanceToNow(new Date(product.created_at), { addSuffix: true }),
        gallery_images: product.gallery_images.map((img: any) => ({
          ...img,
          time_ago: formatDistanceToNow(new Date(img.created_at), { addSuffix: true })
        }))
      }));
    } catch (err) {
      console.error('Error retrieving all products with gallery images:', err);
      throw err;
    }
  }

  // Find a product by ID excluding soft deleted
  static async findById(id: number) {
    try {
      const [product] = await sql`
        SELECT 
          p.*,
          COALESCE(
            json_agg(
              json_build_object(
                'id', g.id,
                'image_name', g.image_name,
                'is_main', g.is_main,
                'created_at', g.created_at
              )
              ORDER BY g.created_at  
            ) FILTER (WHERE g.deleted_at IS NULL), 
            '[]'
          ) AS gallery_images
        FROM products p
        LEFT JOIN product_gallery_images g ON p.id = g.product_id
        WHERE p.id = ${id} AND p.deleted_at IS NULL
        GROUP BY p.id
      `;

      if (!product) return null;

      return {
        ...product,
        time_ago: formatDistanceToNow(new Date(product.created_at), { addSuffix: true }),
        gallery_images: product.gallery_images.map((img: any) => ({
          ...img,
          time_ago: formatDistanceToNow(new Date(img.created_at), { addSuffix: true })
        }))
      };
    } catch (err) {
      console.error('Error finding product by ID:', err);
      throw err;
    }
  }

  // Soft delete a product by setting deleted_at and soft delete associated gallery images
  static async delete(id: number) {
    try {
      // Start a transaction to ensure atomicity
      await sql.begin(async (sqlTransaction) => {
        // Soft delete the product
        await sqlTransaction`
          UPDATE products
          SET deleted_at = NOW(), updated_at = NOW()
          WHERE id = ${id}
        `;

        // Soft delete all associated gallery images
        await sqlTransaction`
          UPDATE product_gallery_images
          SET deleted_at = NOW()
          WHERE product_id = ${id}
        `;
      });

      return { success: true };
    } catch (err) {
      console.error('Error soft deleting product and its images:', err);
      throw err;
    }
  }

}
