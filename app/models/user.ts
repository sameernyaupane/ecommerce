import sql from "../database/db";
import argon2 from "argon2";

export class UserModel {
  // Insert a new user into the database with a hashed password
  static async create({ name, email, password }) {
    try {
      const hash = await argon2.hash(password);  // Hash the password with argon2

      const [user] = await sql`
        INSERT INTO users (name, email, password, updated_at)
        VALUES (${name}, ${email}, ${hash}, NOW())
        RETURNING *
      `;
      return user;
    } catch (err) {
      console.error('Error inserting user:', err);
      throw err;
    }
  }

  // Find a user by email
  static async findByEmail(email) {
    try {
      const [user] = await sql`
        SELECT * FROM users WHERE email = ${email}
      `;
      return user || null;
    } catch (err) {
      console.error('Error finding user by email:', err);
      throw err;
    }
  }

  // Find a user by ID
  static async findById(id) {
    try {
      const [user] = await sql`
        SELECT * FROM users WHERE id = ${id}
      `;
      return user || null;
    } catch (err) {
      console.error('Error finding user by ID:', err);
      throw err;
    }
  }

  // Compare the password input with the hashed password stored in the database
  static async comparePassword(plainPassword, user) {
    const isMatch = await argon2.verify(user.password, plainPassword);  // Compare with argon2
    return isMatch;
  }
}
