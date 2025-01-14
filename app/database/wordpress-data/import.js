import { sql } from './lib/db.js';
import { importUsers } from './importers/users.js';
import { importVendors } from './importers/vendors.js';

async function main() {
    try {
        await importUsers();
        await importVendors();
        console.log('All imports completed successfully!');
    } catch (error) {
        console.error('Error during import:', error);
    } finally {
        await sql.end();
    }
}

main().catch(console.error);
