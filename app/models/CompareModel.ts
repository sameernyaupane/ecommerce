import sql from "../database/sql";

export class CompareModel {
  static async toggle(userId: number, productId: number) {
    try {
      // Check if item exists
      const [existingItem] = await sql`
        SELECT id 
        FROM compare 
        WHERE user_id = ${userId} 
        AND product_id = ${productId}
        AND deleted_at IS NULL
      `;

      if (existingItem) {
        // Soft delete the item
        await sql`
          UPDATE compare
          SET deleted_at = NOW()
          WHERE id = ${existingItem.id}
        `;
        return false; // Item removed
      }

      // Create new item
      await sql`
        INSERT INTO compare (
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
      console.error('Error toggling compare item:', err);
      throw err;
    }
  }

  static async isInCompare(userId: number, productId: number) {
    try {
      const [result] = await sql`
        SELECT EXISTS (
          SELECT 1 
          FROM compare 
          WHERE user_id = ${userId} 
          AND product_id = ${productId}
          AND deleted_at IS NULL
        ) as exists
      `;
      return result.exists;
    } catch (err) {
      console.error('Error checking compare status:', err);
      throw err;
    }
  }
} 