import sql from "../database/sql";

import { ProductGalleryImageModel } from "@/models/ProductGalleryImageModel";
import { deleteImageFromServer } from "@/utils/upload";
import { formatDistanceToNow } from 'date-fns';

export class ProductModel {
  // Insert a new product
  static async create({ name, description, price, stock, category_id, user_id, gallery_images }: {
    name: string;
    description: string;
    price: number;
    stock: number;
    category_id?: number | null;
    user_id?: number;
    gallery_images?: any[];
  }) {
    try {
      const [product] = await sql`
        INSERT INTO products (
          name, 
          description, 
          price, 
          stock,
          category_id,
          user_id
        ) 
        VALUES (
          ${name}, 
          ${description}, 
          ${price}, 
          ${stock},
          ${category_id},
          ${user_id}
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
  static async update(id: number, { name, description, price, stock, category_id, user_id, gallery_images }: {
    name: string;
    description: string;
    price: number;
    stock: number;
    category_id?: number | null;
    user_id?: number;
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
          user_id = ${user_id},
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

  // Retrieve all products with gallery images
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
            ), 
            '[]'
          ) AS gallery_images
        FROM products p
        LEFT JOIN product_gallery_images g ON p.id = g.product_id
        WHERE p.status != 'draft'
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

  // Find a product by ID
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
            ), 
            '[]'
          ) AS gallery_images
        FROM products p
        LEFT JOIN product_gallery_images g ON p.id = g.product_id
        WHERE p.id = ${id}
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

  // Delete a product and its associated gallery images
  static async delete(id: number) {
    try {
      // Start a transaction to ensure atomicity
      await sql.begin(async (sqlTransaction) => {
        // Delete all associated gallery images first
        await sqlTransaction`
          DELETE FROM product_gallery_images
          WHERE product_id = ${id}
        `;

        // Delete the product
        await sqlTransaction`
          DELETE FROM products
          WHERE id = ${id}
        `;
      });

      return { success: true };
    } catch (err) {
      console.error('Error deleting product and its images:', err);
      throw err;
    }
  }

  // Add this method to the ProductModel class
  static async getPaginated({ page, limit, sort, direction, vendorId }: PaginationParams & { vendorId?: number }) {
    try {
      const offset = (page - 1) * limit;
      
      // Base count query
      let countQuery = sql`SELECT COUNT(*) FROM products`;
      
      // Add vendor filter if vendorId is provided
      if (vendorId) {
        countQuery = sql`SELECT COUNT(*) FROM products WHERE user_id = ${vendorId}`;
      }
      
      // Get total count
      const [{ count }] = await countQuery;
      const totalProducts = Number(count);

      // Base products query
      let productsQuery = sql`
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
            ), 
            '[]'
          ) as gallery_images
        FROM products p
        LEFT JOIN product_categories c ON p.category_id = c.id
        LEFT JOIN product_gallery_images pi ON p.id = pi.product_id
      `;

      // Add vendor filter if vendorId is provided
      if (vendorId) {
        productsQuery = sql`
          ${productsQuery}
          WHERE p.user_id = ${vendorId}
        `;
      }

      // Complete the query with GROUP BY, ORDER BY, and pagination
      const products = await sql`
        ${productsQuery}
        GROUP BY p.id, c.id, c.name
        ORDER BY 
          CASE WHEN ${sort} = 'id' AND ${direction} = 'asc' THEN p.id END ASC NULLS LAST,
          CASE WHEN ${sort} = 'id' AND ${direction} = 'desc' THEN p.id END DESC NULLS LAST,
          CASE WHEN ${sort} = 'name' AND ${direction} = 'asc' THEN p.name END ASC NULLS LAST,
          CASE WHEN ${sort} = 'name' AND ${direction} = 'desc' THEN p.name END DESC NULLS LAST,
          CASE WHEN ${sort} = 'created_at' AND ${direction} = 'asc' THEN p.created_at END ASC NULLS LAST,
          CASE WHEN ${sort} = 'created_at' AND ${direction} = 'desc' THEN p.created_at END DESC NULLS LAST,
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
          ), 
          '[]'
        ) as gallery_images
      FROM products p
      LEFT JOIN product_gallery_images pgi ON p.id = pgi.product_id
      WHERE p.category_id = ${categoryId}
      GROUP BY p.id
      ORDER BY p.created_at DESC;
    `;
    
    return products.map(product => ({
      ...product,
      gallery_images: product.gallery_images || [],
      time_ago: formatDistanceToNow(new Date(product.created_at), { addSuffix: true })
    }));
  }

  // Add this new method
  static async getDetailsByIds(productIds: number[]) {
    try {
      const items = await sql`
        SELECT 
          p.id as product_id,
          p.name,
          p.price,
          (
            SELECT json_build_object(
              'id', pgi.id,
              'image_name', pgi.image_name,
              'is_main', pgi.is_main
            )
            FROM product_gallery_images pgi 
            WHERE pgi.product_id = p.id 
            ORDER BY pgi.is_main DESC NULLS LAST
            LIMIT 1
          ) as main_image
        FROM products p
        WHERE p.id = ANY(${productIds})
      `;

      return items;
    } catch (err) {
      console.error('Error fetching product details by IDs:', err);
      throw err;
    }
  }

  static async countByVendor(vendorId: number): Promise<number> {
    try {
      const [result] = await sql`
        SELECT COUNT(*) as count
        FROM products
        WHERE user_id = ${vendorId}
      `;
      return result.count;
    } catch (err) {
      console.error('Error counting products by vendor:', err);
      throw err;
    }
  }
}
