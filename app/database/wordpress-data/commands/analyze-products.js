import { getMysqlConnection, sql } from '../lib/db.js';

export async function analyzeProducts() {
    const mysqlConnection = await getMysqlConnection();
    
    try {
        // 1. PostgreSQL table structure (simplified)
        const tableStructure = await sql`
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns
            WHERE table_name = 'products'
            ORDER BY ordinal_position;
        `;
        
        console.log('\n=== Products Table Structure ===');
        console.table(tableStructure);

        // 2. Test insert with valid category
        try {
            const [testProduct] = await sql`
                INSERT INTO products (
                    name,
                    description,
                    short_description,
                    price,
                    stock,
                    status,
                    category_id,
                    vendor_id
                ) VALUES (
                    'Test Product 2',
                    'Test Description',
                    'Short Description',
                    9.99,
                    10,
                    'published',
                    1,
                    1
                )
                ON CONFLICT (name) DO NOTHING
                RETURNING id, name, status, category_id
            `;
            
            console.log('\n=== Test Insert Success ===');
            console.log(testProduct);
        } catch (error) {
            console.log('\n=== Test Insert Failed ===');
            console.log('Error:', error.message);
        }

        // 3. Sample WordPress products with price
        const [wpProducts] = await mysqlConnection.execute(`
            SELECT 
                p.post_title as name,
                p.post_excerpt as short_description,
                p.post_content as description,
                p.post_status as wp_status,
                MAX(CASE WHEN pm.meta_key = '_regular_price' THEN pm.meta_value END) as price,
                MAX(CASE WHEN pm.meta_key = '_sale_price' THEN pm.meta_value END) as sale_price,
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
            GROUP BY p.ID, p.post_title, p.post_excerpt, p.post_content, p.post_status
            LIMIT 3
        `);

        console.log('\n=== Sample WordPress Products ===');
        console.table(wpProducts);

        // 4. Product status enum values
        const [enumValues] = await sql`
            SELECT enum_range(NULL::product_status);
        `;

        console.log('\n=== Valid Product Status Values ===');
        console.log(enumValues.enum_range);

        // 5. Products count
        const [{ count }] = await sql`
            SELECT COUNT(*) as count FROM products;
        `;

        console.log('\n=== Current Products Count ===');
        console.log(count);

        // 6. Check WordPress categories
        const [wpCategories] = await mysqlConnection.execute(`
            SELECT 
                t.term_id,
                t.name,
                tt.count as products_count
            FROM wp_terms t
            JOIN wp_term_taxonomy tt ON t.term_id = tt.term_id
            WHERE tt.taxonomy = 'product_cat'
            AND tt.count > 0
            ORDER BY tt.count DESC
            LIMIT 5
        `);

        console.log('\n=== WordPress Categories ===');
        console.table(wpCategories);

    } catch (error) {
        console.error('Analysis error:', error.message);
        throw error;
    } finally {
        await mysqlConnection.end();
    }
}

// Only run directly if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
    analyzeProducts().catch(error => {
        console.error('Unhandled error:', error.message);
        process.exit(1);
    });
} 