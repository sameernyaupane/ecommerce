import sql from "../database/sql";
import { UserModel } from "./UserModel";
import { formatDistanceToNow } from 'date-fns';
import crypto from 'crypto';

interface VendorDetails {
  id: number;
  user_id: number;
  brand_name: string;
  business_type: string;
  website?: string;
  phone: string;
  product_description: string;
  status: string;
  created_at: Date;
  time_ago?: string;
}

export class VendorModel {
  static async create({
    firstName,
    lastName,
    email,
    phone,
    brandName,
    website,
    businessType,
    productDescription
  }: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    brandName: string;
    website?: string;
    businessType: string;
    productDescription: string;
  }) {
    try {
      // Start a transaction
      return await sql.begin(async (sql) => {
        // First, create the user account
        const tempPassword = crypto.randomUUID();
        const user = await UserModel.create({
          name: `${firstName} ${lastName}`,
          email,
          password: tempPassword,
          roles: ['user', 'vendor']
        });

        // Then, create the vendor details
        const [vendorDetails] = await sql`
          INSERT INTO vendor_details (
            user_id,
            brand_name,
            business_type,
            website,
            phone,
            product_description,
            status
          ) VALUES (
            ${user.id},
            ${brandName},
            ${businessType},
            ${website || null},
            ${phone},
            ${productDescription},
            'pending'
          )
          RETURNING *
        `;

        return {
          user,
          vendorDetails,
          tempPassword // This should be sent via email in a real application
        };
      });
    } catch (err) {
      console.error('Error creating vendor:', err);
      throw err;
    }
  }

  static async findByUserId(userId: number): Promise<VendorDetails | null> {
    try {
      const [vendorDetails] = await sql`
        SELECT *
        FROM vendor_details
        WHERE user_id = ${userId}
      `;

      if (!vendorDetails) return null;

      return {
        ...vendorDetails,
        time_ago: formatDistanceToNow(new Date(vendorDetails.created_at), { addSuffix: true })
      };
    } catch (err) {
      console.error('Error finding vendor details:', err);
      throw err;
    }
  }
} 