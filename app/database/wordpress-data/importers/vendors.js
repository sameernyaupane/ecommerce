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

        // Get all vendors (using WordPress connection)
        const [vendors] = await wpConnection.execute(`
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
            const bannerFilename = vendorBannerMap.get(vendor.user_id);

            const store_banner_url = bannerFilename ? `/uploads/vendors/${bannerFilename}` : '';

            // Use postgres.js sql template literal syntax
            const result = await appConnection`
                INSERT INTO vendor_details (
                    user_id, brand_name, website, phone, product_description,
                    status, address_line1, address_line2, city, state,
                    postal_code, country, store_banner_url
                ) VALUES (
                    ${vendor.user_id}, ${vendor.store_name || ''}, ${''}, ${''}, ${''}, 
                    ${'approved'}, ${''}, ${''}, ${''}, ${''}, 
                    ${''}, ${''}, ${store_banner_url}
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
                    store_banner_url = EXCLUDED.store_banner_url
            `;
            importedCount++;
        }

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