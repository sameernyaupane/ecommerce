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
        AND deleted_at IS NULL
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
        UPDATE cart
        SET deleted_at = NOW()
        WHERE user_id = ${userId}
        AND product_id = ${productId}
        AND deleted_at IS NULL
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
        AND deleted_at IS NULL
      `;
    } catch (err) {
      console.error('Error updating cart quantity:', err);
      throw err;
    }
  }
} 