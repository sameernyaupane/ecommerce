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
                    console.log('Debug - Found banner ID:', {
                        user_id: vendor.user_id,
                        banner_id: match[1]
                    });
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

        console.log('Debug - Found banner files:', banners);

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
                
                console.log('Debug - Processing banner:', {
                    vendor_id: vendorId,
                    relativePath,
                    filename,
                    url: banner.url
                });

                // Check file extension
                const fileExtension = path.extname(filename).toLowerCase();
                if (!allowedExtensions.includes(fileExtension)) {
                    console.log(`Skipping non-image file: ${filename}`);
                    continue;
                }

                const sourcePath = path.join(wpUploadsDir, relativePath);
                const destPath = path.join(ourUploadsDir, filename);

                // Check if image already exists
                try {
                    await fs.access(destPath);
                    console.log(`Banner already exists: ${filename}`);
                } catch {
                    // File doesn't exist, try to copy it
                    try {
                        console.log(`Copying banner from ${sourcePath} to ${destPath}`);
                        await fs.copyFile(sourcePath, destPath);
                        console.log(`Copied vendor banner: ${filename}`);
                    } catch (copyError) {
                        console.error(`Source banner not found, will use default: ${sourcePath}`);
                        continue;
                    }
                }

                // Store the banner filename for this vendor
                vendorBannerMap.set(vendorId, filename);
                console.log('Debug - Set banner for vendor:', {
                    vendor_id: vendorId,
                    filename
                });

            } catch (error) {
                console.error(`Error processing banner for vendor ${vendorId}:`, error);
            }
        }

        // For vendors without banners, use a default banner URL
        const [vendors] = await connection.execute(`
            SELECT DISTINCT user_id 
            FROM wp_usermeta 
            WHERE meta_key = 'wp_capabilities' 
            AND (meta_value LIKE '%wcfm_vendor%' OR meta_value LIKE '%shop_vendor%')
        `);

        for (const vendor of vendors) {
            if (!vendorBannerMap.has(vendor.user_id)) {
                // Instead of copying a file, just use a default URL
                vendorBannerMap.set(vendor.user_id, 'default-vendor-banner.jpg');
            }
        }

        return vendorBannerMap;
    } catch (error) {
        console.error('Error copying vendor banners:', error);
        throw error;
    }
}

export async function importVendors() {
    let connection;
    try {
        // Get database connection
        connection = await getMysqlConnection();

        // Get vendor banners first
        const vendorBannerMap = await copyVendorBanners(connection);
        console.log('Debug - Vendor banner map:', Object.fromEntries(vendorBannerMap));

        // Get all vendors
        const [vendors] = await connection.execute(`
            SELECT 
                u.ID as user_id,
                u.user_email,
                um1.meta_value as store_name,
                um2.meta_value as profile_settings
            FROM wp_users u
            JOIN wp_usermeta um ON u.ID = um.user_id
            LEFT JOIN wp_usermeta um1 ON u.ID = um1.user_id AND um1.meta_key = 'store_name'
            LEFT JOIN wp_usermeta um2 ON u.ID = um2.user_id AND um2.meta_key = 'wcfmmp_profile_settings'
            WHERE um.meta_key = 'wp_capabilities'
            AND (um.meta_value LIKE '%wcfm_vendor%' OR um.meta_value LIKE '%shop_vendor%')
        `);

        let importedCount = 0;
        let skippedCount = 0;

        for (const vendor of vendors) {
            // Get the banner filename for this vendor
            const bannerFilename = vendorBannerMap.get(vendor.user_id);
            console.log('Debug - Processing vendor:', {
                vendor_id: vendor.user_id,
                bannerFilename,
                has_banner: vendorBannerMap.has(vendor.user_id)
            });

            // Construct the banner URL
            const store_banner_url = bannerFilename ? `/uploads/vendors/${bannerFilename}` : '';

            // Use INSERT ... ON DUPLICATE KEY UPDATE for MySQL
            const [result] = await connection.execute(`
                INSERT INTO vendor_details (
                    user_id, brand_name, website, phone, product_description,
                    status, address_line1, address_line2, city, state,
                    postal_code, country, store_banner_url
                ) VALUES (
                    ?, ?, ?, ?, ?,
                    ?, ?, ?, ?, ?,
                    ?, ?, ?
                )
                ON DUPLICATE KEY UPDATE
                    brand_name = VALUES(brand_name),
                    website = VALUES(website),
                    phone = VALUES(phone),
                    product_description = VALUES(product_description),
                    status = VALUES(status),
                    address_line1 = VALUES(address_line1),
                    address_line2 = VALUES(address_line2),
                    city = VALUES(city),
                    state = VALUES(state),
                    postal_code = VALUES(postal_code),
                    country = VALUES(country),
                    store_banner_url = VALUES(store_banner_url)
            `, [
                vendor.user_id,
                vendor.store_name || '',
                '', // website
                '', // phone
                '', // description
                'approved',
                '', // address_line1
                '', // address_line2
                '', // city
                '', // state
                '', // postal_code
                '', // country
                store_banner_url
            ]);

            console.log('Debug - Vendor import result:', {
                vendor_id: vendor.user_id,
                store_banner_url,
                affected_rows: result.affectedRows
            });

            importedCount++;
        }

        console.log(`
Vendors import summary:
------------------------
Total vendors processed: ${vendors.length}
Successfully imported: ${importedCount}
Skipped (no user match): ${skippedCount}
        `);

    } catch (error) {
        console.error('Error importing vendors:', error);
        throw error;
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

// Helper function to parse PHP serialized profile settings
function parseProfileSettings(settingsString) {
    try {
        // Basic parsing of the serialized PHP string
        const settings = {};
        const matches = settingsString.match(/s:\d+:"([^"]+)";s:\d+:"([^"]+)"|s:\d+:"([^"]+)";a:\d+:{([^}]+)}/g);
        if (matches) {
            matches.forEach(match => {
                const [key, value] = match.split(';').map(part => 
                    part.replace(/^s:\d+:"/, '').replace(/"$/, '')
                );
                settings[key] = value;
            });
        }
        return settings;
    } catch (error) {
        console.error('Error parsing profile settings:', error);
        return {};
    }
} 