import sql from "../database/sql";
import { UserModel } from "./UserModel";
import { formatDistanceToNow } from 'date-fns';
import crypto from 'crypto';

interface VendorDetails {
  id: number;
  user_id: number;
  brand_name: string;
  website?: string;
  phone: string;
  product_description: string;
  status: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  store_banner_url?: string;
  social_facebook?: string;
  social_instagram?: string;
  social_twitter?: string;
  business_hours?: Record<string, string>;
  shipping_policy?: string;
  return_policy?: string;
  created_at: Date;
  updated_at: Date;
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
    productDescription,
    addressLine1,
    addressLine2,
    city,
    state,
    postalCode,
    country,
    storeBannerUrl,
    socialFacebook,
    socialInstagram,
    socialTwitter,
    businessHours,
    shippingPolicy,
    returnPolicy
  }: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    brandName: string;
    website?: string;
    productDescription: string;
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    storeBannerUrl?: string;
    socialFacebook?: string;
    socialInstagram?: string;
    socialTwitter?: string;
    businessHours?: Record<string, string>;
    shippingPolicy?: string;
    returnPolicy?: string;
  }) {
    try {
      return await sql.begin(async (sql) => {
        const tempPassword = crypto.randomUUID();
        const user = await UserModel.create({
          name: `${firstName} ${lastName}`,
          email,
          password: tempPassword,
          roles: ['user', 'vendor']
        });

        const [vendorDetails] = await sql`
          INSERT INTO vendor_details (
            user_id,
            brand_name,
            website,
            phone,
            product_description,
            status,
            address_line1,
            address_line2,
            city,
            state,
            postal_code,
            country,
            store_banner_url,
            social_facebook,
            social_instagram,
            social_twitter,
            business_hours,
            shipping_policy,
            return_policy
          ) VALUES (
            ${user.id},
            ${brandName},
            ${website || null},
            ${phone},
            ${productDescription},
            'pending',
            ${addressLine1 || null},
            ${addressLine2 || null},
            ${city || null},
            ${state || null},
            ${postalCode || null},
            ${country || null},
            ${storeBannerUrl || null},
            ${socialFacebook || null},
            ${socialInstagram || null},
            ${socialTwitter || null},
            ${businessHours ? JSON.stringify(businessHours) : null},
            ${shippingPolicy || null},
            ${returnPolicy || null}
          )
          RETURNING *
        `;

        return {
          user,
          vendorDetails,
          tempPassword
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

  static async getAllVendors(): Promise<VendorDetails[]> {
    try {
      const vendorDetails = await sql<VendorDetails[]>`
        SELECT *
        FROM vendor_details
      `;

      return vendorDetails.map(vendor => ({
        ...vendor,
        time_ago: formatDistanceToNow(new Date(vendor.created_at), { addSuffix: true })
      }));
    } catch (err) {
      console.error('Error getting all vendors:', err);
      throw err;
    }
  }

  static async update(id: number, {
    brand_name,
    website,
    phone,
    product_description,
    address_line1,
    address_line2,
    city,
    state,
    postal_code,
    country,
    store_banner_url,
    social_facebook,
    social_instagram,
    social_twitter,
    business_hours,
    shipping_policy,
    return_policy
  }: {
    brand_name: string;
    website?: string;
    phone: string;
    product_description: string;
    address_line1?: string;
    address_line2?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
    store_banner_url?: string;
    social_facebook?: string;
    social_instagram?: string;
    social_twitter?: string;
    business_hours?: Record<string, string>;
    shipping_policy?: string;
    return_policy?: string;
  }) {
    try {
      const [updatedVendor] = await sql`
        UPDATE vendor_details
        SET 
          brand_name = ${brand_name},
          website = ${website || null},
          phone = ${phone},
          product_description = ${product_description},
          address_line1 = ${address_line1 || null},
          address_line2 = ${address_line2 || null},
          city = ${city || null},
          state = ${state || null},
          postal_code = ${postal_code || null},
          country = ${country || null},
          store_banner_url = ${store_banner_url || null},
          social_facebook = ${social_facebook || null},
          social_instagram = ${social_instagram || null},
          social_twitter = ${social_twitter || null},
          business_hours = ${business_hours ? JSON.stringify(business_hours) : null},
          shipping_policy = ${shipping_policy || null},
          return_policy = ${return_policy || null},
          updated_at = NOW()
        WHERE id = ${id}
        RETURNING *
      `;

      return {
        ...updatedVendor,
        time_ago: formatDistanceToNow(new Date(updatedVendor.created_at), { addSuffix: true })
      };
    } catch (err) {
      console.error('Error updating vendor details:', err);
      throw err;
    }
  }

  static async findById(id: number): Promise<VendorDetails | null> {
    try {
      const [vendorDetails] = await sql`
        SELECT *
        FROM vendor_details
        WHERE id = ${id}
      `;

      if (!vendorDetails) return null;

      return {
        ...vendorDetails,
        time_ago: formatDistanceToNow(new Date(vendorDetails.created_at), { addSuffix: true })
      };
    } catch (err) {
      console.error('Error finding vendor by id:', err);
      throw err;
    }
  }
} 