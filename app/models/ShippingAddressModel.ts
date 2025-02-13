import sql from "../database/sql";

export class ShippingAddressModel {
  static async create({
    userId,
    firstName,
    lastName,
    email,
    address,
    city,
    postcode,
    country,
    isDefault = false
  }) {
    // If this is default, unset other defaults first
    if (isDefault) {
      await sql`
        UPDATE shipping_addresses 
        SET is_default = false 
        WHERE user_id = ${userId}
      `;
    }

    const [shippingAddress] = await sql`
      INSERT INTO shipping_addresses (
        user_id,
        first_name,
        last_name,
        email,
        address,
        city,
        postcode,
        country,
        is_default
      ) VALUES (
        ${userId},
        ${firstName},
        ${lastName},
        ${email},
        ${address},
        ${city},
        ${postcode},
        ${country},
        ${isDefault}
      )
      RETURNING *
    `;

    return shippingAddress;
  }

  static async getByUserId(userId: number) {
    return await sql`
      SELECT * FROM shipping_addresses
      WHERE user_id = ${userId}
      ORDER BY is_default DESC, created_at DESC
    `;
  }

  static async delete(id: number, userId: number) {
    return await sql`
      DELETE FROM shipping_addresses
      WHERE id = ${id} AND user_id = ${userId}
    `;
  }

  static async findById(id: number | string) {
    const [address] = await sql`
      SELECT * FROM shipping_addresses
      WHERE id = ${Number(id)}
      LIMIT 1
    `;
    if (!address) throw new Error('Address not found');
    return address;
  }

  static async update(id: number | string, {
    firstName,
    lastName,
    email,
    address,
    city,
    postcode,
    country
  }) {
    const [updatedAddress] = await sql`
      UPDATE shipping_addresses
      SET 
        first_name = ${firstName},
        last_name = ${lastName},
        email = ${email},
        address = ${address},
        city = ${city},
        postcode = ${postcode},
        country = ${country}
      WHERE id = ${Number(id)}
      RETURNING *
    `;
    if (!updatedAddress) throw new Error('Address not found');
    return updatedAddress;
  }
} 