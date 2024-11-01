import sql from "../database/sql";

export class ProductModel {
  // Insert a new product
  static async create({ name, description, price, stock }) {
    try {
      const [product] = await sql`
        INSERT INTO products (name, description, price, stock, created_at, updated_at)
        VALUES (${name}, ${description}, ${price}, ${stock}, NOW(), NOW())
        RETURNING *
      `;
      return product;
    } catch (err) {
      console.error('Error inserting product:', err);
      throw err;
    }
  }

  // Find a product by ID
  static async findById(id) {
    try {
      const [product] = await sql`
        SELECT * FROM products WHERE id = ${id}
      `;
      return product || null;
    } catch (err) {
      console.error('Error finding product by ID:', err);
      throw err;
    }
  }

  // Retrieve all products
  static async getAll() {
    try {
      const products = await sql`
        SELECT * FROM products ORDER BY created_at DESC
      `;
      return products;
    } catch (err) {
      console.error('Error retrieving all products:', err);
      throw err;
    }
  }

  // Update a product by ID
  static async update(id, { name, description, price, stock }) {
    try {
      const [updatedProduct] = await sql`
        UPDATE products
        SET name = ${name}, description = ${description}, price = ${price}, stock = ${stock}, updated_at = NOW()
        WHERE id = ${id}
        RETURNING *
      `;
      return updatedProduct;
    } catch (err) {
      console.error('Error updating product:', err);
      throw err;
    }
  }

  // Delete a product by ID
  static async delete(id) {
    try {
      await sql`
        DELETE FROM products WHERE id = ${id}
      `;
      return true;
    } catch (err) {
      console.error('Error deleting product:', err);
      throw err;
    }
  }
}
