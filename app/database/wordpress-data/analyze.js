import { sql } from './lib/db.js';
import { analyzeCategoryImages } from './analysis/category-images.js';

async function main() {
    try {
        console.log('Starting WordPress data analysis...');
        await analyzeCategoryImages();
        console.log('Analysis completed successfully!');
    } catch (error) {
        console.error('Error during analysis:', error);
    } finally {
        await sql.end();
    }
}

main().catch(console.error); 