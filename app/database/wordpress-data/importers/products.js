import { getMysqlConnection, sql } from '../lib/db.js';
import fs from 'fs/promises';
import path from 'path';

// Add image handling functions
async function copyProductImages(mysqlConnection) {
    // Define WordPress and our upload paths
    const wpUploadsDir = '/home/sameer/vhosts/indibe/wp-content/uploads';
    const ourUploadsDir = path.join(process.cwd(), 'public', 'uploads', 'products');
    const ourDefaultDir = path.join(process.cwd(), 'public', 'uploads', 'default-products');
    
    try {
        // Ensure our upload directory exists
        await fs.mkdir(ourUploadsDir, { recursive: true });
        console.log('Created uploads directory');
        
        // First, get the product IDs we want to import
        console.log('Fetching product IDs...');
        const [productIds] = await mysqlConnection.execute(`
            SELECT ID 
            FROM wp_posts 
            WHERE post_type = 'product' 
            AND post_status = 'publish'
            ORDER BY ID
        `);

        const productIdList = productIds.map(p => p.ID).join(',');
        console.log(`Found ${productIds.length} products to process`);

        // Now get the images for these products - including gallery images
        console.log('Fetching product images from WordPress...');
        const [images] = await mysqlConnection.execute(`
            SELECT 
                p.ID as post_id,
                p.post_title,
                p.guid as url,
                pma.meta_value as file_path,
                pm.post_id as product_id,
                pm.meta_key,
                pm.meta_value
            FROM wp_posts p
            LEFT JOIN wp_postmeta pm ON p.ID = pm.meta_value 
                OR (pm.meta_key = '_product_image_gallery' AND FIND_IN_SET(p.ID, pm.meta_value))
            LEFT JOIN wp_postmeta pma ON p.ID = pma.post_id AND pma.meta_key = '_wp_attached_file'
            WHERE p.post_type = 'attachment'
            AND (pm.meta_key = '_thumbnail_id' OR pm.meta_key = '_product_image_gallery')
            AND pm.post_id IN (${productIdList})
            ORDER BY pm.post_id, pm.meta_key
        `);

       // console.log('Raw image data:', JSON.stringify(images, null, 2));
        console.log(`Found ${images.length} product images to import`);

        // Create a map of WordPress product IDs to their image filenames
        const productImageMap = new Map();
        
        // Add allowed image extensions
        const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

        for (const image of images) {
            try {
                // Get the correct file path
                const relativePath = image.file_path || path.basename(image.url);
                const filename = path.basename(relativePath);
                
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
                    //console.log(`Image already exists, skipping: ${filename}`);
                } catch {
                    // File doesn't exist, copy it
                    console.log(`Copying image from ${sourcePath} to ${destPath}`);
                    await fs.copyFile(sourcePath, destPath);
                    console.log(`Copied product image: ${filename}`);
                }
                
                // Initialize array for this product if it doesn't exist
                if (!productImageMap.has(image.product_id)) {
                    productImageMap.set(image.product_id, {
                        featured: null,
                        gallery: []
                    });
                }

                // Add image to the appropriate array based on meta_key
                const productImages = productImageMap.get(image.product_id);
                if (image.meta_key === '_thumbnail_id') {
                    productImages.featured = filename;
                } else if (image.meta_key === '_product_image_gallery') {
                    productImages.gallery.push(filename);
                }
            } catch (error) {
                console.error(`Error processing image for product ${image.post_title}:`, error);
                console.error('Image data:', image);
                throw new Error(`Failed to copy image for product ${image.post_title}`);
            }
        }

        // For any products without images, copy and use default image
        for (const product of productIds) {
            if (!productImageMap.has(product.ID) || !productImageMap.get(product.ID).featured) {
                const defaultImageSrc = path.join(ourDefaultDir, 'product.jpg');
                const defaultImageDest = path.join(ourUploadsDir, `default-${product.ID}.jpg`);
                
                try {
                    // Check if default image already exists
                    try {
                        await fs.access(defaultImageDest);
                        console.log(`Default image already exists, skipping: default-${product.ID}.jpg`);
                    } catch {
                        // File doesn't exist, copy it
                        await fs.copyFile(defaultImageSrc, defaultImageDest);
                        console.log(`Copied default image for product ${product.ID}`);
                    }
                    
                    productImageMap.set(product.ID, {
                        featured: `default-${product.ID}.jpg`,
                        gallery: productImageMap.get(product.ID)?.gallery || []
                    });
                } catch (error) {
                    console.error(`Failed to copy default image for product ${product.ID}:`, error);
                    throw new Error(`Failed to copy default image for product ${product.ID}`);
                }
            }
        }

        return productImageMap;
    } catch (error) {
        console.error('Error copying product images:', error);
        console.error(error.stack);
        throw error;
    }
}

export async function importProducts() {
    const mysqlConnection = await getMysqlConnection();
    
    try {
        console.log('Importing all products...');

        // Copy product images first
        console.log('Starting image copy...');
        const productImageMap = await copyProductImages(mysqlConnection);
        console.log('Finished copying images');

        // First, get our category mapping
        const [wpCategories] = await mysqlConnection.execute(`
            SELECT t.term_id, t.name
            FROM wp_terms t
            JOIN wp_term_taxonomy tt ON t.term_id = tt.term_id
            WHERE tt.taxonomy = 'product_cat'
        `);

        // Get our new category IDs
        const pgCategories = await sql`
            SELECT id, name
            FROM product_categories
        `;

        // Create a mapping from WordPress category names to our category IDs
        const categoryMap = new Map();
        for (const wpCat of wpCategories) {
            const pgCat = pgCategories.find(pc => pc.name === wpCat.name);
            if (pgCat) {
                categoryMap.set(wpCat.term_id.toString(), pgCat.id);
            }
        }

        // Get default category ID for fallback
        const [defaultCategory] = await sql`
            SELECT id FROM product_categories LIMIT 1
        `;
        const defaultCategoryId = defaultCategory?.id || 1;

        const [products] = await mysqlConnection.execute(`
            SELECT 
                p.ID as wp_id,
                p.post_title as name,
                p.post_excerpt as short_description,
                p.post_content as description,
                MAX(CASE WHEN pm.meta_key = '_regular_price' THEN pm.meta_value END) as price,
                MAX(CASE WHEN pm.meta_key = '_stock' THEN pm.meta_value END) as stock,
                MAX(CASE WHEN pm.meta_key = '_stock_status' THEN pm.meta_value END) as stock_status,
                GROUP_CONCAT(DISTINCT tt.term_id) as category_ids,
                MAX(CASE WHEN vpm.meta_key = '_wcfm_product_author' THEN vpm.meta_value END) as user_id
            FROM wp_posts p
            LEFT JOIN wp_postmeta pm ON p.ID = pm.post_id
            LEFT JOIN wp_term_relationships tr ON p.ID = tr.object_id
            LEFT JOIN wp_term_taxonomy tt ON tr.term_taxonomy_id = tt.term_taxonomy_id 
                AND tt.taxonomy = 'product_cat'
            LEFT JOIN wp_postmeta vpm ON p.ID = vpm.post_id
            WHERE p.post_type = 'product'
            AND p.post_status IN ('publish', 'private', 'archived')  -- Added 'archived' status
            GROUP BY p.ID, p.post_title, p.post_excerpt, p.post_content
            ORDER BY p.ID
        `);

        console.log(`Found ${products.length} products to import`);

        // Get all valid user IDs from our database
        const pgUsers = await sql`
            SELECT id FROM users
        `;
        const validUserIds = new Set(pgUsers.map(u => u.id));

        let importedCount = 0;
        for (const product of products) {
            try {
                // Get the first valid category ID from our mapping
                const categoryIds = product.category_ids ? product.category_ids.split(',') : [];
                let categoryId = defaultCategoryId;
                
                for (const wpCatId of categoryIds) {
                    if (categoryMap.has(wpCatId)) {
                        categoryId = categoryMap.get(wpCatId);
                        break;
                    }
                }

                // Only set user_id if it exists in our database
                const wpUserId = parseInt(product.user_id) || null;
                const validUserId = validUserIds.has(wpUserId) ? wpUserId : null;

                const productData = {
                    wp_id: parseInt(product.wp_id),
                    name: product.name,
                    description: product.description || '',
                    short_description: product.short_description || '',
                    price: parseFloat(product.price) || 0,
                    stock: parseInt(product.stock) || 0,
                    category_id: categoryId,
                    user_id: validUserId,  // Use validated user ID
                    status: product.stock_status === 'instock' ? 'published' : 'draft'
                };

                // For products without images, use the default image with path relative to /uploads
                const imageData = productImageMap.get(product.wp_id) || { 
                    featured: '/default-products/product.jpg',  // Full path from /uploads
                    gallery: [] 
                };

                // Insert the product first
                const [insertedProduct] = await sql`
                    INSERT INTO products ${sql(productData)}
                    ON CONFLICT (wp_id) 
                    DO UPDATE SET 
                        name = EXCLUDED.name,
                        description = EXCLUDED.description,
                        short_description = EXCLUDED.short_description,
                        price = EXCLUDED.price,
                        stock = EXCLUDED.stock,
                        status = EXCLUDED.status,
                        category_id = EXCLUDED.category_id,
                        user_id = EXCLUDED.user_id,
                        updated_at = NOW()
                    RETURNING id, wp_id, name
                `;

                // Insert the featured image
                if (imageData.featured) {
                    try {
                        console.log(`Inserting featured image for product ${insertedProduct.id}:`, {
                            product_id: insertedProduct.id,
                            image_name: imageData.featured,
                            is_main: true
                        });

                        await sql`
                            DELETE FROM product_gallery_images 
                            WHERE product_id = ${insertedProduct.id} 
                            AND is_main = true
                        `;

                        await sql`
                            INSERT INTO product_gallery_images 
                            (product_id, image_name, is_main)
                            VALUES 
                            (${insertedProduct.id}, ${imageData.featured}, true)
                        `;
                    } catch (error) {
                        console.error('Error inserting featured image:', error);
                        console.error('Product ID:', insertedProduct.id);
                        console.error('Image name:', imageData.featured);
                    }
                }

                // Insert gallery images if any
                if (imageData.gallery && imageData.gallery.length > 0) {
                    for (const galleryImage of imageData.gallery) {
                        try {
                            console.log(`Inserting gallery image for product ${insertedProduct.id}:`, {
                                product_id: insertedProduct.id,
                                image_name: galleryImage,
                                is_main: false
                            });

                            await sql`
                                INSERT INTO product_gallery_images 
                                (product_id, image_name, is_main)
                                VALUES 
                                (${insertedProduct.id}, ${galleryImage}, false)
                            `;
                        } catch (error) {
                            console.error('Error inserting gallery image:', error);
                            console.error('Product ID:', insertedProduct.id);
                            console.error('Image name:', galleryImage);
                        }
                    }
                }

                importedCount++;
                if (importedCount % 10 === 0) {
                    console.log(`Imported ${importedCount} products...`);
                }
            } catch (error) {
                console.error(`Error importing product ${product.name}:`, error);
                console.error('Product data:', JSON.stringify(product, null, 2));
                continue;
            }
        }

        console.log(`Successfully imported ${importedCount} products`);
        
    } catch (error) {
        console.error('Error importing products:', error);
        throw error;
    } finally {
        await mysqlConnection.end();
    }
} 