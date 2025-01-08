import mysql from 'mysql2/promise';
import postgres from 'postgres';
import dotenv from 'dotenv';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: '../../../.env' });

// Use postgres instead of pg
const sql = postgres({
    host: process.env.PG_HOST || 'localhost',
    user: process.env.PG_USERNAME || 'ecommerce_user',
    password: process.env.PG_PASSWORD || 'test',
    database: process.env.PG_DATABASE || 'ecommerce_db',
    port: Number(process.env.PG_PORT) || 5432
});

async function main() {
    // MySQL connection
    const mysqlConnection = await mysql.createConnection({
        host: process.env.WP_HOST || 'localhost',
        user: process.env.WP_USERNAME || 'wordpress',
        password: process.env.WP_PASSWORD || 'wordpress',
        database: process.env.WP_DATABASE || 'wordpress',
        port: process.env.WP_PORT || 3306
    });

    try {
        // First import users
        console.log('Importing users...');
        const [users] = await mysqlConnection.execute(`
            SELECT 
                u.ID,
                u.user_email,
                u.display_name,
                u.user_nicename,
                um_firstname.meta_value as first_name,
                CASE 
                    WHEN EXISTS (
                        SELECT 1 FROM wp_usermeta 
                        WHERE user_id = u.ID 
                        AND meta_key = 'wp_capabilities' 
                        AND meta_value LIKE '%administrator%'
                    ) THEN 'admin'
                    WHEN EXISTS (
                        SELECT 1 FROM wp_usermeta 
                        WHERE user_id = u.ID 
                        AND meta_key = 'wp_capabilities' 
                        AND (meta_value LIKE '%wcfm_vendor%' OR meta_value LIKE '%shop_vendor%')
                    ) THEN 'vendor'
                    ELSE 'user'
                END as role
            FROM wp_users u
            LEFT JOIN wp_usermeta um_firstname ON u.ID = um_firstname.user_id AND um_firstname.meta_key = 'first_name'
            WHERE user_email != ''
        `);

        for (const user of users) {
            // Convert role to PostgreSQL array
            const roles = user.role === 'user' 
                ? '{user}'
                : `{${user.role},user}`;

            await sql`
                INSERT INTO users (name, email, password, roles) 
                VALUES (
                    ${user.first_name || user.display_name},
                    ${user.user_email},
                    ${'INVALID_HASH_REQUIRES_RESET'},
                    ${roles}::user_role[]
                )
                ON CONFLICT (email) DO UPDATE 
                SET roles = ${roles}::user_role[]
            `;
        }

        // Then import vendor details
        console.log('Importing vendor details...');
        const [vendors] = await mysqlConnection.execute(`
            SELECT 
                u.ID,
                u.user_email,
                u.display_name,
                COALESCE(store.meta_value, u.display_name) as store_name,
                COALESCE(website.meta_value, '') as website,
                COALESCE(phone.meta_value, '') as phone,
                COALESCE(description.meta_value, '') as description,
                COALESCE(address1.meta_value, '') as address_line1,
                COALESCE(address2.meta_value, '') as address_line2,
                COALESCE(city.meta_value, '') as city,
                COALESCE(state.meta_value, '') as state,
                COALESCE(postcode.meta_value, '') as postal_code,
                COALESCE(country.meta_value, '') as country,
                COALESCE(banner.meta_value, '') as store_banner_url,
                COALESCE(facebook.meta_value, '') as social_facebook,
                COALESCE(instagram.meta_value, '') as social_instagram,
                COALESCE(twitter.meta_value, '') as social_twitter,
                COALESCE(shipping.meta_value, '') as shipping_policy,
                COALESCE(refund.meta_value, '') as return_policy
            FROM wp_users u
            LEFT JOIN wp_usermeta store ON u.ID = store.user_id AND store.meta_key = 'store_name'
            LEFT JOIN wp_usermeta website ON u.ID = website.user_id AND website.meta_key = 'website'
            LEFT JOIN wp_usermeta phone ON u.ID = phone.user_id AND phone.meta_key = '_wcfm_billing_phone'
            LEFT JOIN wp_usermeta description ON u.ID = description.user_id AND description.meta_key = '_wcfm_store_description'
            LEFT JOIN wp_usermeta address1 ON u.ID = address1.user_id AND address1.meta_key = '_wcfm_billing_address_1'
            LEFT JOIN wp_usermeta address2 ON u.ID = address2.user_id AND address2.meta_key = '_wcfm_billing_address_2'
            LEFT JOIN wp_usermeta city ON u.ID = city.user_id AND city.meta_key = '_wcfm_billing_city'
            LEFT JOIN wp_usermeta state ON u.ID = state.user_id AND state.meta_key = '_wcfm_billing_state'
            LEFT JOIN wp_usermeta postcode ON u.ID = postcode.user_id AND postcode.meta_key = '_wcfm_billing_postcode'
            LEFT JOIN wp_usermeta country ON u.ID = country.user_id AND country.meta_key = '_wcfm_billing_country'
            LEFT JOIN wp_usermeta banner ON u.ID = banner.user_id AND banner.meta_key = '_wcfm_store_banner'
            LEFT JOIN wp_usermeta facebook ON u.ID = facebook.user_id AND facebook.meta_key = '_social_facebook'
            LEFT JOIN wp_usermeta instagram ON u.ID = instagram.user_id AND instagram.meta_key = '_social_instagram'
            LEFT JOIN wp_usermeta twitter ON u.ID = twitter.user_id AND twitter.meta_key = '_social_twitter'
            LEFT JOIN wp_usermeta shipping ON u.ID = shipping.user_id AND shipping.meta_key = '_wcfm_shipping_policy'
            LEFT JOIN wp_usermeta refund ON u.ID = refund.user_id AND refund.meta_key = '_wcfm_refund_policy'
            WHERE EXISTS (
                SELECT 1 FROM wp_usermeta 
                WHERE user_id = u.ID 
                AND meta_key = 'wp_capabilities' 
                AND (meta_value LIKE '%wcfm_vendor%' OR meta_value LIKE '%shop_vendor%')
            )
        `);

        for (const vendor of vendors) {
            const [user] = await sql`
                SELECT id FROM users WHERE email = ${vendor.user_email}
            `;

            if (user) {
                await sql`
                    INSERT INTO vendor_details (
                        user_id, brand_name, website, phone, product_description,
                        status, address_line1, address_line2, city, state,
                        postal_code, country, store_banner_url, social_facebook,
                        social_instagram, social_twitter, business_hours,
                        shipping_policy, return_policy
                    ) VALUES (
                        ${user.id},
                        ${vendor.store_name},
                        ${vendor.website},
                        ${vendor.phone},
                        ${vendor.description},
                        ${'approved'},
                        ${vendor.address_line1},
                        ${vendor.address_line2},
                        ${vendor.city},
                        ${vendor.state},
                        ${vendor.postal_code},
                        ${vendor.country},
                        ${vendor.store_banner_url},
                        ${vendor.social_facebook},
                        ${vendor.social_instagram},
                        ${vendor.social_twitter},
                        ${JSON.stringify({ hours: '' })},
                        ${vendor.shipping_policy},
                        ${vendor.return_policy}
                    )
                    ON CONFLICT (user_id) DO UPDATE SET
                        brand_name = ${vendor.store_name},
                        website = ${vendor.website},
                        phone = ${vendor.phone},
                        product_description = ${vendor.description},
                        status = ${'approved'},
                        address_line1 = ${vendor.address_line1},
                        address_line2 = ${vendor.address_line2},
                        city = ${vendor.city},
                        state = ${vendor.state},
                        postal_code = ${vendor.postal_code},
                        country = ${vendor.country},
                        store_banner_url = ${vendor.store_banner_url},
                        social_facebook = ${vendor.social_facebook},
                        social_instagram = ${vendor.social_instagram},
                        social_twitter = ${vendor.social_twitter},
                        business_hours = ${JSON.stringify({ hours: '' })},
                        shipping_policy = ${vendor.shipping_policy},
                        return_policy = ${vendor.return_policy}
                `;
            }
        }

        console.log('Import completed successfully!');
    } catch (error) {
        console.error('Error during import:', error);
    } finally {
        await mysqlConnection.end();
        await sql.end();
    }
}

main().catch(console.error);
