import sql from "../database/sql";

export class WishlistModel {
  static async isInWishlist(userId: number, productId: number) {
    try {
      const [result] = await sql`
        SELECT EXISTS (
          SELECT 1 
          FROM wishlist 
          WHERE user_id = ${userId} 
          AND product_id = ${productId}
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
        SELECT w.product_id
        FROM wishlist w
        WHERE w.user_id = ${userId}
      `;
      return items.map(item => ({
        productId: item.product_id
      }));
    } catch (err) {
      console.error('Error fetching wishlist items:', err);
      throw err;
    }
  }

  static async getItemsWithDetails(userId: number) {
    try {
      const items = await sql`
        SELECT 
          w.product_id,
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
        FROM wishlist w
        JOIN products p ON w.product_id = p.id
        WHERE w.user_id = ${userId}
      `;
      return items.map(item => ({
        productId: item.product_id,
        name: item.name,
        price: item.price,
        mainImage: item.main_image
      }));
    } catch (err) {
      console.error('Error fetching wishlist items with details:', err);
      throw err;
    }
  }

  static async remove(userId: number, productId: number) {
    try {
      // Hard delete the item
      await sql`
        DELETE FROM wishlist
        WHERE user_id = ${userId}
        AND product_id = ${productId}
      `;
      return true;
    } catch (err) {
      console.error('Error removing wishlist item:', err);
      throw err;
    }
  }

  static async migrateItems(userId: number, items: number[]) {
    try {
      await sql.begin(async (sql) => {
        for (const productId of items) {
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
            ON CONFLICT (user_id, product_id) DO NOTHING
          `;
        }
      });
    } catch (err) {
      console.error('Error migrating wishlist items:', err);
      throw err;
    }
  }
} 