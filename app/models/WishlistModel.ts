import sql from "../database/sql";

export class WishlistModel {
  static async toggle(userId: number, productId: number) {
    try {
      // Check if item exists
      const [existingItem] = await sql`
        SELECT id 
        FROM wishlist 
        WHERE user_id = ${userId} 
        AND product_id = ${productId}
        AND deleted_at IS NULL
      `;

      if (existingItem) {
        // Soft delete the item
        await sql`
          UPDATE wishlist
          SET deleted_at = NOW()
          WHERE id = ${existingItem.id}
        `;
        return false; // Item removed
      }

      // Create new item
      await sql`
        INSERT INTO wishlist (
          user_id, 
          product_id, 
          created_at
        )
        VALUES (
          ${userId}, 
          ${productId}, 
          NOW()
        )
      `;
      return true; // Item added
    } catch (err) {
      console.error('Error toggling wishlist item:', err);
      throw err;
    }
  }

  static async isInWishlist(userId: number, productId: number) {
    try {
      const [result] = await sql`
        SELECT EXISTS (
          SELECT 1 
          FROM wishlist 
          WHERE user_id = ${userId} 
          AND product_id = ${productId}
          AND deleted_at IS NULL
        ) as exists
      `;
      return result.exists;
    } catch (err) {
      console.error('Error checking wishlist status:', err);
      throw err;
    }
  }

  static async add(userId: number, productId: number) {
    try {
      // Check if item exists
      const [existingItem] = await sql`
        SELECT id 
        FROM wishlist 
        WHERE user_id = ${userId} 
        AND product_id = ${productId}
        AND deleted_at IS NULL
      `;

      if (!existingItem) {
        // Only create if it doesn't exist
        await sql`
          INSERT INTO wishlist (
            user_id, 
            product_id, 
            created_at
          )
          VALUES (
            ${userId}, 
            ${productId}, 
            NOW()
          )
        `;
      }
      return true;
    } catch (err) {
      console.error('Error adding wishlist item:', err);
      throw err;
    }
  }

  static async getItems(userId: number) {
    try {
      const items = await sql`
        SELECT 
          w.product_id,
          p.name,
          p.price,
          p.image_name
        FROM wishlist w
        JOIN products p ON w.product_id = p.id
        WHERE w.user_id = ${userId}
        AND w.deleted_at IS NULL
      `;
      return items;
    } catch (err) {
      console.error('Error fetching wishlist items:', err);
      throw err;
    }
  }
} 