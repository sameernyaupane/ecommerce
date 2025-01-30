import { getMysqlConnection, sql } from '../lib/db.js';
import fs from 'fs/promises';
import path from 'path';

// Add image handling function for vendor banners
async function copyVendorBanners(connection) {
    // Define WordPress and our upload paths
    const wpUploadsDir = '/home/sameer/vhosts/indibe/wp-content/uploads';
    const ourUploadsDir = path.join(process.cwd(), 'public', 'uploads', 'vendors');
    const ourDefaultDir = path.join(process.cwd(), 'public', 'uploads', 'default-vendors');
    
    try {
        await fs.mkdir(ourUploadsDir, { recursive: true });
        console.log('Created vendors uploads directory');

        const createDefaultBanner = async (vendorId) => {
            const defaultSourcePath = path.join(ourDefaultDir, 'banner.jpg');
            const defaultBanner = `banner-${vendorId}.jpg`;
            const defaultDestPath = path.join(ourUploadsDir, defaultBanner); // Copy to vendors directory
            
            try {
                await fs.copyFile(defaultSourcePath, defaultDestPath);
                console.log(`Created default banner for vendor ${vendorId}: ${defaultBanner}`);
                return defaultBanner;
            } catch (error) {
                console.error(`Error creating default banner for vendor ${vendorId}:`, error);
                return 'banner.jpg'; // Fallback if copy fails
            }
        };

        // First get all vendor settings
        const [vendorSettings] = await connection.execute(`
            SELECT user_id, meta_value 
            FROM wp_usermeta 
            WHERE meta_key = 'wcfmmp_profile_settings'
        `);

        // Create a map to store banner IDs
        const bannerIds = new Map();
        
        // Extract banner IDs from serialized data
        for (const vendor of vendorSettings) {
            if (vendor.meta_value && vendor.meta_value.includes('s:6:"banner"')) {
                const match = vendor.meta_value.match(/s:6:"banner";s:\d+:"(\d+)"/);
                if (match) {
                    bannerIds.set(vendor.user_id, match[1]);
                }
            }
        }

        // Now get the banner files using the collected IDs
        const bannerIdList = Array.from(bannerIds.values()).join(',');
        if (!bannerIdList) {
            console.log('No banner IDs found');
            return new Map();
        }

        const [banners] = await connection.execute(`
            SELECT 
                p.ID as post_id,
                p.guid as url,
                pma.meta_value as file_path
            FROM wp_posts p
            LEFT JOIN wp_postmeta pma ON p.ID = pma.post_id AND pma.meta_key = '_wp_attached_file'
            WHERE p.ID IN (${bannerIdList})
        `);

        // Create a map of vendor IDs to their banner filenames
        const vendorBannerMap = new Map();
        
        // Add allowed image extensions
        const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

        for (const banner of banners) {
            // Find the vendor ID for this banner
            const vendorId = Array.from(bannerIds.entries())
                .find(([_, bannerId]) => bannerId === banner.post_id.toString())?.[0];

            if (!vendorId) continue;

            try {
                // Get the correct file path
                const relativePath = banner.file_path || new URL(banner.url).pathname;
                const filename = path.basename(relativePath);

                // Check file extension
                const fileExtension = path.extname(filename).toLowerCase();
                if (!allowedExtensions.includes(fileExtension)) {
                    console.log(`Skipping non-image file: ${filename}`);
                    continue;
                }

                const sourcePath = path.join(wpUploadsDir, relativePath);
                const destPath = path.join(ourUploadsDir, filename);

                // Try to download the file if local copy fails
                try {
                    await fs.access(sourcePath);
                    await fs.copyFile(sourcePath, destPath);
                } catch (error) {
                    console.error(`Local file not found: ${sourcePath}`);
                    console.error('Will create default banner');
                    const defaultBanner = await createDefaultBanner(vendorId);
                    vendorBannerMap.set(vendorId, defaultBanner);
                    continue;
                }

                // Store the banner filename for this vendor
                vendorBannerMap.set(vendorId, filename);
            } catch (error) {
                console.error(`Error processing banner for vendor ${vendorId}:`, error);
                const defaultBanner = await createDefaultBanner(vendorId);
                vendorBannerMap.set(vendorId, defaultBanner);
            }
        }

        // For vendors without banners, create default ones
        const [vendors] = await connection.execute(`
            SELECT DISTINCT user_id 
            FROM wp_usermeta 
            WHERE meta_key = 'wp_capabilities' 
            AND (meta_value LIKE '%wcfm_vendor%' OR meta_value LIKE '%shop_vendor%')
        `);

        for (const vendor of vendors) {
            if (!vendorBannerMap.has(vendor.user_id)) {
                const defaultBanner = await createDefaultBanner(vendor.user_id);
                vendorBannerMap.set(vendor.user_id, defaultBanner);
            }
        }

        return vendorBannerMap;
    } catch (error) {
        console.error('Error copying vendor banners:', error);
        throw error;
    }
}

export async function importVendors() {
    let wpConnection;
    let appConnection;
    try {
        // Get both database connections
        wpConnection = await getMysqlConnection();
        appConnection = await sql;

        // Get vendor banners first (using WordPress connection)
        const vendorBannerMap = await copyVendorBanners(wpConnection);

        // Get all vendors with extended metadata
        const [vendors] = await wpConnection.execute(`
            SELECT 
                u.ID as user_id,
                u.user_email,
                u.user_nicename,
                GROUP_CONCAT(
                    CONCAT(um.meta_key, '=', um.meta_value) 
                    SEPARATOR '|||'
                ) as all_metadata,
                MAX(CASE WHEN um.meta_key = 'store_name' THEN um.meta_value END) as store_name,
                MAX(CASE WHEN um.meta_key = 'wcfmmp_profile_settings' THEN um.meta_value END) as profile_settings,
                MAX(CASE WHEN um.meta_key = 'first_name' THEN um.meta_value END) as first_name,
                MAX(CASE WHEN um.meta_key = 'last_name' THEN um.meta_value END) as last_name,
                MAX(CASE WHEN um.meta_key = 'billing_phone' THEN um.meta_value END) as phone,
                MAX(CASE WHEN um.meta_key = 'billing_address_1' THEN um.meta_value END) as address_1,
                MAX(CASE WHEN um.meta_key = 'billing_address_2' THEN um.meta_value END) as address_2,
                MAX(CASE WHEN um.meta_key = 'billing_city' THEN um.meta_value END) as city,
                MAX(CASE WHEN um.meta_key = 'billing_state' THEN um.meta_value END) as state,
                MAX(CASE WHEN um.meta_key = 'billing_postcode' THEN um.meta_value END) as postcode,
                MAX(CASE WHEN um.meta_key = 'billing_country' THEN um.meta_value END) as country
            FROM wp_users u
            JOIN wp_usermeta um ON u.ID = um.user_id
            WHERE EXISTS (
                SELECT 1 FROM wp_usermeta um_cap 
                WHERE um_cap.user_id = u.ID 
                AND um_cap.meta_key = 'wp_capabilities'
                AND (um_cap.meta_value LIKE '%wcfm_vendor%' OR um_cap.meta_value LIKE '%shop_vendor%')
            )
            GROUP BY u.ID, u.user_email, u.user_nicename
        `);

        let importedCount = 0;
        let skippedCount = 0;

        // Log metadata for analysis
        console.log('\n=== Vendor Metadata Analysis ===\n');
        
        for (const vendor of vendors) {
            // Enhanced metadata logging
            if (importedCount < 3) {
                console.log(`\n=== Vendor ${vendor.user_id} (${vendor.user_email}) Detailed Metadata ===`);
                
                // Log all raw metadata
                console.log('\nRAW METADATA:');
                const metadataEntries = vendor.all_metadata.split('|||');
                metadataEntries.forEach(entry => {
                    const [key, ...valueParts] = entry.split('=');
                    const value = valueParts.join('='); // Rejoin in case value contains =
                    console.log(`  ${key}: ${value.substring(0, 100)}${value.length > 100 ? '...' : ''}`);
                });

                // Log parsed profile settings
                console.log('\nPARSED PROFILE SETTINGS:');
                const settings = parseProfileSettings(vendor.profile_settings || '');
                console.log(JSON.stringify(settings, null, 2));
            }

            const bannerFilename = vendorBannerMap.get(vendor.user_id);
            const store_banner_url = bannerFilename ? `/uploads/vendors/${bannerFilename}` : '';

            // Parse profile settings
            const settings = parseProfileSettings(vendor.profile_settings || '');
            
            // Use postgres.js sql template literal syntax
            const result = await appConnection`
                INSERT INTO vendor_details (
                    user_id, brand_name, website, phone, product_description,
                    status, address_line1, address_line2, city, state,
                    postal_code, country, store_banner_url, store_slug,
                    store_email, social_facebook, social_instagram, social_twitter,
                    social_youtube, social_pinterest, social_linkedin,
                    show_email, show_phone, show_address, show_map,
                    show_description, show_policy, banner_type, 
                    store_name_position, store_ppp, shipping_policy,
                    return_policy, cancellation_policy
                ) VALUES (
                    ${vendor.user_id}, 
                    ${vendor.store_name || ''}, 
                    ${settings.website || ''}, 
                    ${vendor.phone || settings.phone || ''}, 
                    ${settings.shop_description || ''}, 
                    ${'approved'}, 
                    ${vendor.address_1 || settings.address?.street_1 || ''}, 
                    ${vendor.address_2 || settings.address?.street_2 || ''}, 
                    ${vendor.city || settings.address?.city || ''}, 
                    ${vendor.state || settings.address?.state || ''}, 
                    ${vendor.postcode || settings.address?.zip || ''}, 
                    ${vendor.country || settings.address?.country || ''}, 
                    ${store_banner_url},
                    ${vendor.user_nicename || ''},
                    ${vendor.user_email || ''},
                    ${settings.social_fb || null},
                    ${settings.social_instagram || null},
                    ${settings.social_twitter || null},
                    ${settings.social_youtube || null},
                    ${settings.social_pinterest || null},
                    ${settings.social_linkedin || null},
                    ${settings.store_hide_email !== 'yes'},
                    ${settings.store_hide_phone !== 'yes'},
                    ${settings.store_hide_address !== 'yes'},
                    ${settings.store_hide_map !== 'yes'},
                    ${settings.store_hide_description !== 'yes'},
                    ${settings.store_hide_policy !== 'yes'},
                    ${settings.banner_type || null},
                    ${settings.store_name_position || null},
                    ${settings.store_ppp || null},
                    ${settings.wcfm_shipping_policy || null},
                    ${settings.wcfm_refund_policy || null},
                    ${settings.wcfm_cancellation_policy || null}
                )
                ON CONFLICT (user_id) DO UPDATE SET
                    brand_name = EXCLUDED.brand_name,
                    website = EXCLUDED.website,
                    phone = EXCLUDED.phone,
                    product_description = EXCLUDED.product_description,
                    status = EXCLUDED.status,
                    address_line1 = EXCLUDED.address_line1,
                    address_line2 = EXCLUDED.address_line2,
                    city = EXCLUDED.city,
                    state = EXCLUDED.state,
                    postal_code = EXCLUDED.postal_code,
                    country = EXCLUDED.country,
                    store_banner_url = EXCLUDED.store_banner_url,
                    store_slug = EXCLUDED.store_slug,
                    store_email = EXCLUDED.store_email,
                    social_facebook = EXCLUDED.social_facebook,
                    social_instagram = EXCLUDED.social_instagram,
                    social_twitter = EXCLUDED.social_twitter,
                    social_youtube = EXCLUDED.social_youtube,
                    social_pinterest = EXCLUDED.social_pinterest,
                    social_linkedin = EXCLUDED.social_linkedin,
                    show_email = EXCLUDED.show_email,
                    show_phone = EXCLUDED.show_phone,
                    show_address = EXCLUDED.show_address,
                    show_map = EXCLUDED.show_map,
                    show_description = EXCLUDED.show_description,
                    show_policy = EXCLUDED.show_policy,
                    banner_type = EXCLUDED.banner_type,
                    store_name_position = EXCLUDED.store_name_position,
                    store_ppp = EXCLUDED.store_ppp,
                    shipping_policy = EXCLUDED.shipping_policy,
                    return_policy = EXCLUDED.return_policy,
                    cancellation_policy = EXCLUDED.cancellation_policy
            `;
            importedCount++;
        }

        console.log(`\nImported ${importedCount} vendors`);
        if (skippedCount > 0) {
            console.log(`Skipped ${skippedCount} vendors`);
        }

        // Add verification query
        console.log('\n=== Checking Imported Vendor Data ===\n');
        const vendorCheck = await appConnection`
            SELECT *
            FROM vendor_details
            ORDER BY user_id
            LIMIT 1;
        `;
        
        console.log('Sample vendor record:');
        console.log(JSON.stringify(vendorCheck[0], null, 2));

    } catch (error) {
        console.error('Error importing vendors:', error);
        throw error;
    } finally {
        if (wpConnection) {
            await wpConnection.end();
        }
        // Don't close the appConnection as it might be used elsewhere
    }
}

// Enhance the parseProfileSettings function to extract more data
function parseProfileSettings(settingsString) {
    try {
        const settings = {};
        
        // Extract social media links
        const socialPattern = /s:(\d+):"social_([^"]+)";s:\d+:"([^"]+)"/g;
        let socialMatch;
        while ((socialMatch = socialPattern.exec(settingsString)) !== null) {
            settings[`social_${socialMatch[2]}`] = socialMatch[3];
        }

        // Extract store settings
        const storeSettingsPattern = /s:(\d+):"([^"]+)";[sb]:\d+:(?:"([^"]+)"|([01]))/g;
        let settingsMatch;
        while ((settingsMatch = storeSettingsPattern.exec(settingsString)) !== null) {
            const key = settingsMatch[2];
            const value = settingsMatch[3] || settingsMatch[4];
            settings[key] = value;
        }

        return settings;
    } catch (error) {
        console.error('Error parsing profile settings:', error);
        return {};
    }
} 