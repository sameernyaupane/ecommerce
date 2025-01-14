import { getMysqlConnection, sql } from '../lib/db.js';
import fs from 'fs/promises';
import path from 'path';

// Cache for downloaded category images
const downloadedCategoryImages = [];

// Copy all default category images
async function copyDefaultCategoryImages() {
    console.log('Copying default category images...');
    
    const defaultCategoriesDir = path.join(process.cwd(), 'public', 'uploads', 'default-categories');
    const categoriesDir = path.join(process.cwd(), 'public', 'uploads', 'categories');
    
    try {
        // Create categories directory if it doesn't exist
        await fs.mkdir(categoriesDir, { recursive: true });
        
        // Read all files from default-categories directory
        const files = await fs.readdir(defaultCategoriesDir);
        
        for (const file of files) {
            if (file.endsWith('.jpg') || file.endsWith('.png') || file.endsWith('.jpeg')) {
                await fs.copyFile(
                    path.join(defaultCategoriesDir, file),
                    path.join(categoriesDir, file)
                );
                downloadedCategoryImages.push({
                    filename: file,
                    extension: path.extname(file)
                });
                console.log(`Copied category image: ${file}`);
            }
        }
        
        console.log(`Successfully copied ${downloadedCategoryImages.length} category images`);
    } catch (error) {
        console.error('Error copying default category images:', error);
        throw error;
    }
}

export async function importCategories() {
    const mysqlConnection = await getMysqlConnection();
    const categoryIdMap = new Map();
    
    try {
        console.log('Importing categories...');

        // First copy the default images
        await copyDefaultCategoryImages();

        // First pass: Insert top-level categories
        console.log('Importing top-level categories...');
        const [categories] = await mysqlConnection.execute(`
            SELECT 
                t.term_id,
                t.name,
                t.slug,
                tt.description,
                tt.parent,
                MAX(CASE WHEN tm.meta_key = 'order' THEN tm.meta_value END) as display_order,
                MAX(CASE WHEN tm.meta_key = 'product_count_product_cat' THEN tm.meta_value END) as product_count,
                MAX(CASE WHEN tm.meta_key = 'display_type' THEN tm.meta_value END) as display_type,
                MAX(CASE WHEN tm.meta_key = 'layout' THEN tm.meta_value END) as layout,
                MAX(CASE WHEN tm.meta_key = 'left_sidebar' THEN tm.meta_value END) as left_sidebar,
                MAX(CASE WHEN tm.meta_key = 'right_sidebar' THEN tm.meta_value END) as right_sidebar
            FROM wp_terms t
            JOIN wp_term_taxonomy tt ON t.term_id = tt.term_id
            LEFT JOIN wp_termmeta tm ON t.term_id = tm.term_id
            WHERE tt.taxonomy = 'product_cat'
            GROUP BY t.term_id, t.name, t.slug, tt.description, tt.parent
            ORDER BY tt.parent ASC, t.name ASC
        `);

        for (const category of categories) {
            if (category.parent === 0) {
                // Get a random image for this category
                const randomImage = downloadedCategoryImages[
                    Math.floor(Math.random() * downloadedCategoryImages.length)
                ];
                
                const [insertedCategory] = await sql`
                    INSERT INTO product_categories (
                        name,
                        slug,
                        description,
                        parent_id,
                        level,
                        display_order,
                        product_count,
                        display_type,
                        layout,
                        left_sidebar,
                        right_sidebar,
                        image
                    ) VALUES (
                        ${category.name},
                        ${category.slug},
                        ${category.description || ''},
                        ${null},
                        ${0},
                        ${parseInt(category.display_order) || 0},
                        ${parseInt(category.product_count) || 0},
                        ${category.display_type || null},
                        ${category.layout || null},
                        ${category.left_sidebar || null},
                        ${category.right_sidebar || null},
                        ${randomImage ? randomImage.filename : 'default-category.jpg'}
                    )
                    ON CONFLICT (name) DO UPDATE 
                    SET 
                        slug = EXCLUDED.slug,
                        description = EXCLUDED.description,
                        display_order = EXCLUDED.display_order,
                        product_count = EXCLUDED.product_count,
                        display_type = EXCLUDED.display_type,
                        layout = EXCLUDED.layout,
                        left_sidebar = EXCLUDED.left_sidebar,
                        right_sidebar = EXCLUDED.right_sidebar,
                        image = EXCLUDED.image,
                        updated_at = NOW()
                    RETURNING id
                `;
                categoryIdMap.set(category.term_id, insertedCategory.id);
            }
        }

        // Second pass: Insert child categories (now allowing up to level 3)
        console.log('Importing child categories...');
        for (const category of categories) {
            if (category.parent !== 0) {
                const parentId = categoryIdMap.get(category.parent);
                if (parentId) {
                    const [parentCategory] = await sql`
                        SELECT level FROM product_categories WHERE id = ${parentId}
                    `;
                    
                    const level = parentCategory.level + 1;
                    if (level <= 3) {  // Changed from 2 to 3
                        // Get a random image for this category
                        const randomImage = downloadedCategoryImages[
                            Math.floor(Math.random() * downloadedCategoryImages.length)
                        ];

                        const [insertedCategory] = await sql`
                            INSERT INTO product_categories (
                                name,
                                slug,
                                description,
                                parent_id,
                                level,
                                display_order,
                                product_count,
                                display_type,
                                layout,
                                left_sidebar,
                                right_sidebar,
                                image
                            ) VALUES (
                                ${category.name},
                                ${category.slug},
                                ${category.description || ''},
                                ${parentId},
                                ${level},
                                ${parseInt(category.display_order) || 0},
                                ${parseInt(category.product_count) || 0},
                                ${category.display_type || null},
                                ${category.layout || null},
                                ${category.left_sidebar || null},
                                ${category.right_sidebar || null},
                                ${randomImage ? randomImage.filename : 'default-category.jpg'}
                            )
                            ON CONFLICT (name) DO UPDATE 
                            SET 
                                slug = EXCLUDED.slug,
                                description = EXCLUDED.description,
                                parent_id = EXCLUDED.parent_id,
                                level = EXCLUDED.level,
                                display_order = EXCLUDED.display_order,
                                product_count = EXCLUDED.product_count,
                                display_type = EXCLUDED.display_type,
                                layout = EXCLUDED.layout,
                                left_sidebar = EXCLUDED.left_sidebar,
                                right_sidebar = EXCLUDED.right_sidebar,
                                image = EXCLUDED.image,
                                updated_at = NOW()
                            RETURNING id
                        `;
                        categoryIdMap.set(category.term_id, insertedCategory.id);
                    } else {
                        console.warn(`Skipping category ${category.name} as it would exceed maximum depth of 3`);
                    }
                }
            }
        }

        console.log('Categories import completed successfully!');
        
        // Store the ID mapping for use in product import
        global.categoryIdMap = categoryIdMap;
        
    } catch (error) {
        console.error('Error importing categories:', error);
        throw error;
    } finally {
        await mysqlConnection.end();
    }
} 