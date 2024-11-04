import sql from "../database/sql";

import { ProductGalleryImageModel } from "@/models/ProductGalleryImageModel";
import { deleteImageFromServer } from "@/utils/upload";
import { formatDistanceToNow } from 'date-fns';

export class ProductModel {
  // Insert a new product
  static async create({ name, description, price, stock, category_id, gallery_images }: {
    name: string;
    description: string;
    price: number;
    stock: number;
    category_id?: number | null;
    gallery_images?: any[];
  }) {
    try {
      const [product] = await sql`
        INSERT INTO products (
          name, 
          description, 
          price, 
          stock,
          category_id
        ) 
        VALUES (
          ${name}, 
          ${description}, 
          ${price}, 
          ${stock},
          ${category_id}
        )
        RETURNING *
      `;

      // Handle gallery images if provided
      if (gallery_images?.length) {
        await Promise.all(
          gallery_images.map((image, index) =>
            sql`
              INSERT INTO product_images (
                product_id, 
                image_name, 
                is_main
              )
              VALUES (
                ${product.id}, 
                ${image.image_name}, 
                ${image.is_main}
              )
            `
          )
        );
      }

      return product;
    } catch (err) {
      console.error('Error creating product:', err);
      throw err;
    }
  }

  // Update a product by ID
  static async update(id: number, { name, description, price, stock, category_id, gallery_images }: {
    name: string;
    description: string;
    price: number;
    stock: number;
    category_id?: number | null;
    gallery_images?: any[];
  }) {
    try {
      const [product] = await sql`
        UPDATE products 
        SET 
          name = ${name},
          description = ${description},
          price = ${price},
          stock = ${stock},
          category_id = ${category_id},
          updated_at = NOW()
        WHERE id = ${id}
        RETURNING *
      `;

      // Handle gallery images if provided
      if (gallery_images?.length) {
        // Delete existing images
        await sql`DELETE FROM product_images WHERE product_id = ${id}`;

        // Insert new images
        await Promise.all(
          gallery_images.map((image, index) =>
            sql`
              INSERT INTO product_images (
                product_id, 
                image_name, 
                is_main
              )
              VALUES (
                ${id}, 
                ${image.image_name}, 
                ${image.is_main}
              )
            `
          )
        );
      }

      return product;
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

  // Add this method to the ProductModel class
  static async getPaginated({ page, limit, sort, direction }: PaginationParams) {
    try {
      const offset = (page - 1) * limit;
      
      // Get total count first
      const [{ count }] = await sql<[{ count: number }]>`
        SELECT COUNT(*) 
        FROM products 
        WHERE deleted_at IS NULL
      `;

      const totalProducts = Number(count);

      // Get products with category information
      const products = await sql`
        SELECT 
          p.*,
          c.name as category_name,
          COALESCE(
            json_agg(
              json_build_object(
                'id', pi.id,
                'image_name', pi.image_name,
                'is_main', pi.is_main
              )
              ORDER BY pi.id ASC
            ) FILTER (WHERE pi.id IS NOT NULL),
            '[]'
          ) as gallery_images
        FROM products p
        LEFT JOIN product_categories c ON p.category_id = c.id
        LEFT JOIN product_gallery_images pi ON p.id = pi.product_id AND pi.deleted_at IS NULL
        WHERE p.deleted_at IS NULL
        GROUP BY p.id, c.id, c.name
        ORDER BY 
          CASE WHEN ${sort} = 'id' THEN
            CASE WHEN ${direction} = 'asc' THEN p.id END
          END ASC NULLS LAST,
          CASE WHEN ${sort} = 'id' THEN
            CASE WHEN ${direction} = 'desc' THEN p.id END
          END DESC NULLS LAST,
          CASE WHEN ${sort} = 'name' THEN
            CASE WHEN ${direction} = 'asc' THEN p.name END
          END ASC NULLS LAST,
          CASE WHEN ${sort} = 'name' THEN
            CASE WHEN ${direction} = 'desc' THEN p.name END
          END DESC NULLS LAST,
          CASE WHEN ${sort} = 'created_at' THEN
            CASE WHEN ${direction} = 'asc' THEN p.created_at END
          END ASC NULLS LAST,
          CASE WHEN ${sort} = 'created_at' THEN
            CASE WHEN ${direction} = 'desc' THEN p.created_at END
          END DESC NULLS LAST,
          p.id DESC
        LIMIT ${limit}
        OFFSET ${offset}
      `;

      return {
        products: products.map(product => ({
          ...product,
          gallery_images: product.gallery_images || [],
          time_ago: formatDistanceToNow(new Date(product.created_at), { addSuffix: true })
        })),
        totalProducts,
        totalPages: Math.ceil(totalProducts / limit)
      };
    } catch (err) {
      console.error('Error retrieving paginated products:', err);
      throw err;
    }
  }

  static async getByCategoryId(categoryId: number) {
    const products = await sql`
      SELECT 
        p.*,
        COALESCE(
          json_agg(
            json_build_object(
              'id', pgi.id,
              'image_name', pgi.image_name,
              'is_main', pgi.is_main
            )
            ORDER BY pgi.id ASC
          ) FILTER (WHERE pgi.id IS NOT NULL),
          '[]'
        ) as gallery_images
      FROM products p
      LEFT JOIN product_gallery_images pgi ON p.id = pgi.product_id AND pgi.deleted_at IS NULL
      WHERE p.category_id = ${categoryId}
      AND p.deleted_at IS NULL
      GROUP BY p.id
      ORDER BY p.created_at DESC;
    `;
    
    return products.map(product => ({
      ...product,
      gallery_images: product.gallery_images || [],
      time_ago: formatDistanceToNow(new Date(product.created_at), { addSuffix: true })
    }));
  }

}
