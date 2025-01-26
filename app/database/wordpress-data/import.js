import { sql } from './lib/db.js';
import { importUsers } from './importers/users.js';
import { importVendors } from './importers/vendors.js';
import { importCategories } from './importers/categories.js';
import { importProducts } from './importers/products.js';
import { importOrders } from './importers/orders.js';
import { analyzeOrders } from './commands/analyze-orders.js';

async function main() {
    try {
        await importUsers();
        await importVendors();
        await importCategories();
        await importProducts();
        await importOrders();
        //await analyzeOrders();
    } catch (error) {
        console.error('Error during import:', error);
    } finally {
        await sql.end();
    }
}

main().catch(console.error);
