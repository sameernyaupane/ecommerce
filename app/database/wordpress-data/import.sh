#!/bin/bash

# Get the project root directory
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

# Load environment variables from .env file if it exists
if [ -f "$PROJECT_ROOT/.env" ]; then
  export $(cat "$PROJECT_ROOT/.env" | grep -v '#' | awk '/=/ {print $1}')
fi

# PostgreSQL connection details
PG_DB=${PG_DATABASE:-"ecommerce_db"}
PG_USER=${PG_USERNAME:-"ecommerce_user"}
PG_PASSWORD=${PG_PASSWORD:-"test"}
PG_HOST=${PG_HOST:-"localhost"}

# MySQL WordPress connection details
WP_DB=${WP_DATABASE:-"wordpress"}
WP_USER=${WP_USERNAME:-"wordpress"}
WP_PASSWORD=${WP_PASSWORD:-"wordpress"}
WP_HOST=${WP_HOST:-"localhost"}

echo "Importing WordPress users and vendor details to PostgreSQL..."

# First, import users with roles and invalid password hash
mysql -h "$WP_HOST" -u "$WP_USER" -p"$WP_PASSWORD" "$WP_DB" -N -e "
    SELECT CONCAT(
        'INSERT INTO users (name, email, password, roles) VALUES (',
        QUOTE(COALESCE(
            (SELECT meta_value FROM wp_usermeta WHERE user_id = u.ID AND meta_key = 'first_name'),
            IF(u.display_name = u.user_login, u.user_nicename, u.display_name)
        )), ',',
        QUOTE(u.user_email), ',',
        '''INVALID_HASH_REQUIRES_RESET'', ',
        CASE 
            WHEN EXISTS (
                SELECT 1 FROM wp_usermeta 
                WHERE user_id = u.ID 
                AND meta_key = 'wp_capabilities' 
                AND meta_value LIKE '%administrator%'
            ) THEN '''{\\"admin\\", \\"user\\"}''::user_role[]'
            WHEN EXISTS (
                SELECT 1 FROM wp_usermeta 
                WHERE user_id = u.ID 
                AND meta_key = 'wp_capabilities' 
                AND (meta_value LIKE '%wcfm_vendor%' OR meta_value LIKE '%shop_vendor%')
            ) THEN '''{\\"vendor\\", \\"user\\"}''::user_role[]'
            ELSE '''{\\"user\\"}''::user_role[]'
        END,
        ');'
    ) 
    FROM wp_users u 
    WHERE user_email != '';" | \
PGPASSWORD="$PG_PASSWORD" psql -h "$PG_HOST" -U "$PG_USER" -d "$PG_DB"

# Then, import vendor details for users with vendor role
mysql -h "$WP_HOST" -u "$WP_USER" -p"$WP_PASSWORD" "$WP_DB" -N -e "
    SELECT CONCAT(
        'INSERT INTO vendor_details (',
        'user_id, brand_name, website, phone, product_description, status, ',
        'address_line1, address_line2, city, state, postal_code, country, ',
        'store_banner_url, social_facebook, social_instagram, social_twitter, ',
        'business_hours, shipping_policy, return_policy',
        ') SELECT id, ',
        -- Basic info
        QUOTE(COALESCE(
            (SELECT meta_value FROM wp_usermeta WHERE user_id = u.ID AND meta_key = 'wcfmmp_store_name'),
            (SELECT meta_value FROM wp_usermeta WHERE user_id = u.ID AND meta_key = 'store_name'),
            u.display_name
        )), ', ',
        QUOTE(COALESCE(
            (SELECT meta_value FROM wp_usermeta WHERE user_id = u.ID AND meta_key = 'website'),
            (SELECT meta_value FROM wp_usermeta WHERE user_id = u.ID AND meta_key = '_wcfm_store_url'),
            ''
        )), ', ',
        QUOTE(COALESCE(
            (SELECT meta_value FROM wp_usermeta WHERE user_id = u.ID AND meta_key = 'billing_phone'),
            (SELECT meta_value FROM wp_usermeta WHERE user_id = u.ID AND meta_key = '_wcfm_billing_phone'),
            ''
        )), ', ',
        QUOTE(COALESCE(
            (SELECT meta_value FROM wp_usermeta WHERE user_id = u.ID AND meta_key = '_store_description'),
            (SELECT meta_value FROM wp_usermeta WHERE user_id = u.ID AND meta_key = 'description'),
            'Vendor products and services'
        )), ', ',
        CASE 
            WHEN EXISTS (
                SELECT 1 FROM wp_usermeta 
                WHERE user_id = u.ID 
                AND meta_key = 'wcfm_vendor_verification_data' 
                AND meta_value LIKE '%approve%'
            ) THEN '''approved'''
            ELSE '''pending'''
        END, ', ',
        -- Address fields
        QUOTE(COALESCE(
            (SELECT meta_value FROM wp_usermeta WHERE user_id = u.ID AND meta_key = 'billing_address_1'),
            (SELECT meta_value FROM wp_usermeta WHERE user_id = u.ID AND meta_key = '_wcfm_billing_address_1'),
            ''
        )), ', ',
        QUOTE(COALESCE(
            (SELECT meta_value FROM wp_usermeta WHERE user_id = u.ID AND meta_key = 'billing_address_2'),
            (SELECT meta_value FROM wp_usermeta WHERE user_id = u.ID AND meta_key = '_wcfm_billing_address_2'),
            ''
        )), ', ',
        QUOTE(COALESCE(
            (SELECT meta_value FROM wp_usermeta WHERE user_id = u.ID AND meta_key = 'billing_city'),
            (SELECT meta_value FROM wp_usermeta WHERE user_id = u.ID AND meta_key = '_wcfm_billing_city'),
            ''
        )), ', ',
        QUOTE(COALESCE(
            (SELECT meta_value FROM wp_usermeta WHERE user_id = u.ID AND meta_key = 'billing_state'),
            (SELECT meta_value FROM wp_usermeta WHERE user_id = u.ID AND meta_key = '_wcfm_billing_state'),
            ''
        )), ', ',
        QUOTE(COALESCE(
            (SELECT meta_value FROM wp_usermeta WHERE user_id = u.ID AND meta_key = 'billing_postcode'),
            (SELECT meta_value FROM wp_usermeta WHERE user_id = u.ID AND meta_key = '_wcfm_billing_postcode'),
            ''
        )), ', ',
        QUOTE(COALESCE(
            (SELECT meta_value FROM wp_usermeta WHERE user_id = u.ID AND meta_key = 'billing_country'),
            (SELECT meta_value FROM wp_usermeta WHERE user_id = u.ID AND meta_key = '_wcfm_billing_country'),
            ''
        )), ', ',
        -- Store banner and social media
        QUOTE(COALESCE(
            (SELECT meta_value FROM wp_usermeta WHERE user_id = u.ID AND meta_key = '_wcfm_store_banner'),
            ''
        )), ', ',
        QUOTE(COALESCE(
            (SELECT meta_value FROM wp_usermeta WHERE user_id = u.ID AND meta_key = '_social_facebook'),
            ''
        )), ', ',
        QUOTE(COALESCE(
            (SELECT meta_value FROM wp_usermeta WHERE user_id = u.ID AND meta_key = '_social_instagram'),
            ''
        )), ', ',
        QUOTE(COALESCE(
            (SELECT meta_value FROM wp_usermeta WHERE user_id = u.ID AND meta_key = '_social_twitter'),
            ''
        )), ', ',
        -- Business hours (as JSON)
        COALESCE(
            (SELECT CONCAT('''{', 
                GROUP_CONCAT(CONCAT('\"', 
                    REPLACE(meta_key, ''_wcfm_store_hours_'', ''''), 
                    '\": \"', 
                    meta_value, '\"'
                )), 
            '}''')
            FROM wp_usermeta 
            WHERE user_id = u.ID 
            AND meta_key LIKE ''_wcfm_store_hours_%''
            GROUP BY user_id),
            '''{}'''
        ), ', ',
        -- Policies
        QUOTE(COALESCE(
            (SELECT meta_value FROM wp_usermeta WHERE user_id = u.ID AND meta_key = '_wcfm_shipping_policy'),
            ''
        )), ', ',
        QUOTE(COALESCE(
            (SELECT meta_value FROM wp_usermeta WHERE user_id = u.ID AND meta_key = '_wcfm_refund_policy'),
            ''
        )),
        ' FROM users WHERE email = ', QUOTE(u.user_email), ' AND ''{vendor}'' = ANY(roles);'
    )
    FROM wp_users u
    WHERE EXISTS (
        SELECT 1 FROM wp_usermeta 
        WHERE user_id = u.ID 
        AND meta_key = 'wp_capabilities' 
        AND (meta_value LIKE '%wcfm_vendor%' OR meta_value LIKE '%shop_vendor%')
    );" | \
PGPASSWORD="$PG_PASSWORD" psql -h "$PG_HOST" -U "$PG_USER" -d "$PG_DB"

echo "WordPress user and vendor import complete!"
echo "Note: All imported users will need to use the 'Reset Password' feature to set their password."
