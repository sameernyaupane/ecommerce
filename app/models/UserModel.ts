import sql from "../database/sql";
import argon2 from "argon2";
import { deleteImageFromServer } from "@/utils/upload";

export class UserModel {
  static async create({ name, email, password, profileImage }: { 
    name: string; 
    email: string; 
    password: string;
    profileImage?: string | null;
  }) {
    try {
      const hash = await argon2.hash(password);

      const [user] = await sql`
        INSERT INTO users (name, email, password, profile_image, created_at, updated_at)
        VALUES (${name}, ${email}, ${hash}, ${profileImage || null}, NOW(), NOW())
        RETURNING id, name, email, profile_image, created_at
      `;
      
      return user;
    } catch (err) {
      console.error('Error creating user:', err);
      throw err;
    }
  }

  static async update(id: number, { 
    name, 
    email, 
    password, 
    profileImage 
  }: { 
    name: string; 
    email: string;
    password?: string;
    profileImage?: string | null;
  }) {
    try {
      // Start building the update object
      const updateData: any = {
        name,
        email,
        updated_at: new Date()
      };

      // If password is provided, hash it
      if (password) {
        updateData.password = await argon2.hash(password);
      }

      // Set profile_image to profileImage if defined, otherwise null
      updateData.profile_image = profileImage !== undefined ? profileImage : null;

      const [updatedUser] = await sql`
        UPDATE users
        SET ${sql(updateData)}
        WHERE id = ${id} AND deleted_at IS NULL
        RETURNING id, name, email, profile_image, created_at
      `;

      return updatedUser;
    } catch (err) {
      console.error('Error updating user:', err);
      throw err;
    }
  }

  static async delete(id: number) {
    try {
      // Get the user's profile image before soft deleting
      const [user] = await sql`
        SELECT profile_image FROM users
        WHERE id = ${id} AND deleted_at IS NULL
      `;

      // Soft delete the user
      await sql`
        UPDATE users
        SET deleted_at = NOW(), updated_at = NOW()
        WHERE id = ${id}
      `;

      // If there was a profile image, delete it from the server
      if (user?.profile_image) {
        await deleteImageFromServer(user.profile_image);
      }

      return { success: true };
    } catch (err) {
      console.error('Error deleting user:', err);
      throw err;
    }
  }

  static async getAll() {
    try {
      return await sql`
        SELECT id, name, email, profile_image, created_at
        FROM users
        WHERE deleted_at IS NULL
        ORDER BY created_at DESC
      `;
    } catch (err) {
      console.error('Error getting all users:', err);
      throw err;
    }
  }

  static async findById(id: number) {
    try {
      const [user] = await sql`
        SELECT id, name, email, profile_image, created_at
        FROM users
        WHERE id = ${id} AND deleted_at IS NULL
      `;
      return user || null;
    } catch (err) {
      console.error('Error finding user by ID:', err);
      throw err;
    }
  }
}
