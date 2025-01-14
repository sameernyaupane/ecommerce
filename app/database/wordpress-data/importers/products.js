import { getMysqlConnection, sql } from '../lib/db.js';

export async function importProducts() {
    const mysqlConnection = await getMysqlConnection();
    
    try {
        console.log('Importing products...');

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

        // Log category mapping for debugging
        console.log('Category mapping:', Object.fromEntries(categoryMap));

        // Get default category ID for fallback
        const [defaultCategory] = await sql`
            SELECT id FROM product_categories LIMIT 1
        `;
        const defaultCategoryId = defaultCategory?.id || 1;

        // Get published products with their metadata
        const [products] = await mysqlConnection.execute(`
            SELECT 
                p.post_title as name,
                p.post_excerpt as short_description,
                p.post_content as description,
                MAX(CASE WHEN pm.meta_key = '_regular_price' THEN pm.meta_value END) as price,
                MAX(CASE WHEN pm.meta_key = '_stock' THEN pm.meta_value END) as stock,
                MAX(CASE WHEN pm.meta_key = '_stock_status' THEN pm.meta_value END) as stock_status,
                GROUP_CONCAT(DISTINCT tt.term_id) as category_ids
            FROM wp_posts p
            LEFT JOIN wp_postmeta pm ON p.ID = pm.post_id
            LEFT JOIN wp_term_relationships tr ON p.ID = tr.object_id
            LEFT JOIN wp_term_taxonomy tt ON tr.term_taxonomy_id = tt.term_taxonomy_id 
                AND tt.taxonomy = 'product_cat'
            WHERE p.post_type = 'product'
            AND p.post_status = 'publish'
            GROUP BY p.ID, p.post_title, p.post_excerpt, p.post_content
        `);

        console.log(`Found ${products.length} published products to import`);

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

                const productData = {
                    name: product.name,
                    description: product.description || '',
                    short_description: product.short_description || '',
                    price: parseFloat(product.price) || 0,
                    stock: parseInt(product.stock) || 0,
                    category_id: categoryId,
                    vendor_id: 1 // Default vendor for now
                };

                // Handle status separately since it's an enum
                const [insertedProduct] = await sql`
                    INSERT INTO products ${sql(productData, 'name', 'description', 'short_description', 'price', 'stock', 'category_id', 'vendor_id')}
                    ON CONFLICT (name) DO UPDATE 
                    SET 
                        description = EXCLUDED.description,
                        short_description = EXCLUDED.short_description,
                        price = EXCLUDED.price,
                        stock = EXCLUDED.stock,
                        status = ${product.stock_status === 'instock' ? 'published' : 'draft'},
                        category_id = EXCLUDED.category_id,
                        vendor_id = EXCLUDED.vendor_id,
                        updated_at = NOW()
                    RETURNING id, name
                `;

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