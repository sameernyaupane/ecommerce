// app/models/product.ts
import sql from "@/database/sql";

export async function getProducts() {
  return await sql`SELECT * FROM products ORDER BY id DESC`;
}

export async function getProductById(id: number) {
  const [product] = await sql`SELECT * FROM products WHERE id = ${id}`;
  return product;
}

export async function createProduct(data: { name: string; description?: string; price: number }) {
  return await sql`
    INSERT INTO products (name, description, price)
    VALUES (${data.name}, ${data.description || null}, ${data.price})
    RETURNING *
  `;
}

export async function updateProduct(id: number, data: { name?: string; description?: string; price?: number }) {
  return await sql`
    UPDATE products 
    SET 
      name = COALESCE(${data.name}, name), 
      description = COALESCE(${data.description}, description), 
      price = COALESCE(${data.price}, price)
    WHERE id = ${id}
    RETURNING *
  `;
}

export async function deleteProduct(id: number) {
  return await sql`DELETE FROM products WHERE id = ${id} RETURNING *`;
}
