import sql from "../database/sql";
import argon2 from "argon2";
import { deleteImageFromServer } from "@/utils/upload";
import { formatDistanceToNow } from 'date-fns';

interface User {
  id: number | string;
  name: string;
  email: string;
  password: string;
  roles: string[];
  profile_image?: string;
  googleId?: string;
  time_ago?: string;
  created_at: Date;
}

export class UserModel {
  private static async createVendorDetails(sql: any, userId: number, name: string) {
    await sql`
      INSERT INTO vendor_details (
        user_id,
        brand_name,
        phone,
        product_description,
        status
      ) VALUES (
        ${userId},
        ${name}, 
        '',
        '',
        'approved'
      )
      ON CONFLICT (user_id) DO NOTHING
    `;
  }

  static async create({ 
    name, 
    email, 
    password, 
    profileImage, 
    googleId,
    roles = ['user'] 
  }: { 
    name: string; 
    email: string; 
    password: string;
    profileImage?: string | null;
    googleId?: string;
    roles?: ('user' | 'vendor' | 'admin')[];
  }) {
    try {
      return await sql.begin(async (sql) => {
        const hash = await argon2.hash(password);
        const formattedRoles = `{${roles.join(',')}}`;

        const [user] = await sql`
          INSERT INTO users (
            name, 
            email, 
            password, 
            profile_image, 
            google_id,
            roles, 
            created_at, 
            updated_at
          )
          VALUES (
            ${name}, 
            ${email}, 
            ${hash}, 
            ${profileImage || null}, 
            ${googleId || null},
            ${formattedRoles}::user_role[], 
            NOW(), 
            NOW()
          )
          RETURNING id, name, email, profile_image, roles, created_at
        `;

        if (roles.includes('vendor')) {
          await UserModel.createVendorDetails(sql, user.id, name);
        }
        
        return user;
      });
    } catch (err) {
      console.error('Error creating user:', err);
      throw err;
    }
  }

  static async update(id: number, { 
    name, 
    email, 
    password, 
    profileImage,
    googleId,
    roles 
  }: { 
    name: string; 
    email: string;
    password?: string;
    profileImage?: string | null;
    googleId?: string;
    roles?: ('user' | 'vendor' | 'admin')[];
  }) {
    try {
      return await sql.begin(async (sql) => {
        const updateData: any = {
          name,
          email,
          updated_at: new Date()
        };

        if (password) {
          updateData.password = await argon2.hash(password);
        }

        if (googleId) {
          updateData.google_id = googleId;
        }

        // Get current user roles
        const [currentUser] = await sql`
          SELECT roles FROM users WHERE id = ${id}
        `;

        if (roles) {
          const formattedRoles = `{${roles.join(',')}}`;
          updateData.roles = sql`${formattedRoles}::user_role[]`;
        }

        updateData.profile_image = profileImage !== undefined ? profileImage : null;

        const [updatedUser] = await sql`
          UPDATE users
          SET ${sql(updateData)}
          WHERE id = ${id}
          RETURNING id, name, email, profile_image, roles, created_at
        `;

        // Check if vendor role was added
        const hadVendorRole = currentUser.roles.includes('vendor');
        const hasVendorRole = roles?.includes('vendor');

        if (!hadVendorRole && hasVendorRole) {
          await UserModel.createVendorDetails(sql, id, name);
        }

        return updatedUser;
      });
    } catch (err) {
      console.error('Error updating user:', err);
      throw err;
    }
  }

  static async delete(id: number) {
    try {
      // Get the user's profile image before deleting
      const [user] = await sql`
        SELECT profile_image FROM users
        WHERE id = ${id}
      `;

      // Delete the user
      await sql`DELETE FROM users WHERE id = ${id}`;

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
      const users = await sql`
        SELECT 
          id, 
          name, 
          email, 
          profile_image, 
          roles, 
          created_at
        FROM users
        ORDER BY created_at DESC
      `;

      return users.map(user => ({
        ...user,
        time_ago: formatDistanceToNow(new Date(user.created_at), { addSuffix: true })
      }));
    } catch (err) {
      console.error('Error getting all users:', err);
      throw err;
    }
  }

  static async findById(id: string | number): Promise<User | null> {
    try {
      const [user] = await sql`
        SELECT 
          id, 
          name, 
          email, 
          profile_image, 
          roles, 
          google_id,
          created_at
        FROM users
        WHERE id = ${Number(id)}
      `;

      if (!user) return null;

      return {
        ...user,
        time_ago: formatDistanceToNow(new Date(user.created_at), { addSuffix: true })
      };
    } catch (err) {
      console.error('Error finding user by ID:', err);
      throw err;
    }
  }

  static async getPaginated({ 
    page = 1, 
    sort = 'id', 
    direction = 'asc' 
  }: {
    page: number;
    sort: string;
    direction: 'asc' | 'desc';
  }) {
    try {
      const ITEMS_PER_PAGE = 10;
      const offset = (page - 1) * ITEMS_PER_PAGE;

      // Only allow sorting by id and created_at
      const validSortFields = ['id', 'created_at'];
      const sortField = validSortFields.includes(sort) ? sort : 'id';

      // Get total count
      const [countResult] = await sql`
        SELECT COUNT(*) as total 
        FROM users 
      `;
      const totalUsers = countResult.total;

      // Get paginated and sorted results with CASE statements for better control
      const users = await sql`
        SELECT 
          id,
          name,
          email,
          roles,
          profile_image,
          created_at
        FROM users
        ORDER BY 
          CASE 
            WHEN ${sort} = 'created_at' AND ${direction} = 'desc' THEN created_at END DESC,
          CASE 
            WHEN ${sort} = 'created_at' AND ${direction} = 'asc' THEN created_at END ASC,
          CASE 
            WHEN ${sort} = 'id' AND ${direction} = 'desc' THEN id END DESC,
          CASE 
            WHEN ${sort} = 'id' AND ${direction} = 'asc' THEN id END ASC
      LIMIT ${ITEMS_PER_PAGE}
      OFFSET ${offset}
    `;

      return {
        users: users.map(user => ({
          ...user,
          time_ago: formatDistanceToNow(new Date(user.created_at), { addSuffix: true })
        })),
        totalUsers,
        totalPages: Math.ceil(totalUsers / ITEMS_PER_PAGE)
      };
    } catch (err) {
      console.error('Error retrieving paginated users:', err);
      throw err;
    }
  }

  static async findByEmail(email: string): Promise<User | null> {
    try {
      const [user] = await sql`
        SELECT 
          id, 
          name, 
          email, 
          password,
          profile_image, 
          roles, 
          created_at
        FROM users
        WHERE email = ${email}
      `;

      if (!user) return null;

      return {
        ...user,
        time_ago: formatDistanceToNow(new Date(user.created_at), { addSuffix: true })
      };
    } catch (err) {
      console.error('Error finding user by email:', err);
      throw err;
    }
  }

  static async comparePassword(plainPassword: string, hashedPassword: string) {
    try {
      if (!hashedPassword) {
        return false;
      }
      return await argon2.verify(hashedPassword, plainPassword);
    } catch (err) {
      console.error('Error comparing passwords:', err);
      return false; // Return false instead of throwing to handle invalid hash formats
    }
  }

  static async findByGoogleId(googleId: string) {
    try {
      const [user] = await sql`
        SELECT 
          id, 
          name, 
          email, 
          password,
          profile_image,
          google_id,
          roles, 
          created_at
        FROM users
        WHERE google_id = ${googleId}
      `;

      if (!user) return null;

      return {
        ...user,
        time_ago: formatDistanceToNow(new Date(user.created_at), { addSuffix: true })
      };
    } catch (err) {
      console.error('Error finding user by Google ID:', err);
      throw err;
    }
  }

  static async findByIdForPassword(id: string | number) {
    try {
      const [user] = await sql`
        SELECT 
          id, 
          name, 
          email, 
          profile_image, 
          roles, 
          google_id,
          created_at,
          CASE 
            WHEN password IS NOT NULL THEN true 
            ELSE false 
          END as has_password
        FROM users
        WHERE id = ${Number(id)}
      `;

      if (!user) return null;

      return {
        ...user,
        time_ago: formatDistanceToNow(new Date(user.created_at), { addSuffix: true })
      };
    } catch (err) {
      console.error('Error finding user by ID for password:', err);
      throw err;
    }
  }

  static async findByIdWithPasswordHash(id: string | number) {
    try {
      const [user] = await sql`
        SELECT 
          id, 
          name, 
          email, 
          password,
          profile_image, 
          roles, 
          google_id,
          created_at,
          CASE 
            WHEN password IS NOT NULL THEN true 
            ELSE false 
          END as has_password
        FROM users
        WHERE id = ${Number(id)}
      `;

      if (!user) return null;

      return {
        ...user,
        time_ago: formatDistanceToNow(new Date(user.created_at), { addSuffix: true })
      };
    } catch (err) {
      console.error('Error finding user by ID with password hash:', err);
      throw err;
    }
  }
}
