import sql from "../database/sql";

export class CartModel {
  static async addItem(userId: number, productId: number, quantity: number = 1) {
    try {
      // Check if item exists
      const [existingItem] = await sql`
        SELECT id, quantity 
        FROM cart 
        WHERE user_id = ${userId} 
        AND product_id = ${productId}
      `;

      if (existingItem) {
        // Update existing item
        const [updatedItem] = await sql`
          UPDATE cart 
          SET 
            quantity = ${existingItem.quantity + quantity},
            updated_at = NOW()
          WHERE id = ${existingItem.id}
          RETURNING *
        `;
        return updatedItem;
      }

      // Create new item
      const [newItem] = await sql`
        INSERT INTO cart (
          user_id, 
          product_id, 
          quantity, 
          created_at, 
          updated_at
        )
        VALUES (
          ${userId}, 
          ${productId}, 
          ${quantity}, 
          NOW(), 
          NOW()
        )
        RETURNING *
      `;

      return newItem;
    } catch (err) {
      console.error('Error adding item to cart:', err);
      throw err;
    }
  }

  static async removeItem(userId: number, productId: number) {
    try {
      await sql`
        DELETE FROM cart
        WHERE user_id = ${userId}
        AND product_id = ${productId}
      `;
    } catch (err) {
      console.error('Error removing cart item:', err);
      throw err;
    }
  }

  static async updateQuantity(userId: number, productId: number, quantity: number) {
    try {
      await sql`
        UPDATE cart
        SET 
          quantity = ${quantity},
          updated_at = NOW()
        WHERE user_id = ${userId}
        AND product_id = ${productId}
      `;
    } catch (err) {
      console.error('Error updating cart quantity:', err);
      throw err;
    }
  }

  static async getItems(userId: number) {
    try {
      const items = await sql`
        SELECT product_id, quantity
        FROM cart
        WHERE user_id = ${userId}
      `;
      
      return items.map(item => ({
        productId: item.product_id,
        quantity: item.quantity
      }));
    } catch (err) {
      console.error('Error fetching cart items:', err);
      throw err;
    }
  }

  static async getItemsWithDetails(userId: number) {
    try {
      const items = await sql`
        SELECT 
          c.product_id,
          c.quantity,
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
        FROM cart c
        JOIN products p ON c.product_id = p.id
        WHERE c.user_id = ${userId}
      `;
      return items.map(item => ({
        productId: item.product_id,
        quantity: item.quantity,
        name: item.name,
        price: item.price,
        mainImage: item.main_image
      }));
    } catch (err) {
      console.error('Error fetching cart items with details:', err);
      throw err;
    }
  }

  static async migrateItems(userId: number, items: { productId: number; quantity: number }[]) {
    try {
      await sql.begin(async (sql) => {
        for (const { productId, quantity } of items) {
          await sql`
            INSERT INTO cart (
              user_id, 
              product_id, 
              quantity, 
              created_at, 
              updated_at
            )
            VALUES (
              ${userId}, 
              ${productId}, 
              ${quantity}, 
              NOW(), 
              NOW()
            )
            ON CONFLICT (user_id, product_id) DO UPDATE
            SET quantity = cart.quantity + ${quantity}
          `;
        }
      });
    } catch (err) {
      console.error('Error migrating cart items:', err);
      throw err;
    }
  }

  static async getByUserId(userId: number) {
    try {
      const items = await sql`
        SELECT 
          c.product_id,
          c.quantity,
          p.name,
          p.price,
          p.stock,
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
        FROM cart c
        JOIN products p ON c.product_id = p.id
        WHERE c.user_id = ${userId}
        AND p.stock >= c.quantity  -- Ensure requested quantity is available
      `;

      if (!items.length) {
        return [];
      }

      return items.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
        name: item.name,
        price: Number(item.price), // Ensure price is a number
        stock: item.stock,
        main_image: item.main_image
      }));
    } catch (err) {
      console.error('Error getting cart items by user ID:', err);
      throw err;
    }
  }
} 