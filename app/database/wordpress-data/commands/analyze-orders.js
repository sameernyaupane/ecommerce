import { getMysqlConnection } from '../lib/db.js';

async function analyzeOrders() {
    const mysqlConnection = await getMysqlConnection();

    try {
        console.log('Analyzing WordPress order meta data...');

        // Fetch a sample of orders IDs
        const [orders] = await mysqlConnection.execute(`
            SELECT
                p.ID as order_id
            FROM wp_posts p
            WHERE p.post_type = 'shop_order'
            ORDER BY p.ID DESC
            LIMIT 3 -- Reduced from 10 to 3 orders for quicker analysis
        `);

        if (orders.length === 0) {
            console.log('No orders found in wp_posts table.');
            return;
        }

        const orderIds = orders.map(order => order.order_id);
        console.log(`Analyzing meta for order IDs: ${orderIds.join(', ')}`);

        const allMetaKeys = new Set();
        const metaDataByOrder = {};

        for (const orderId of orderIds) {
            const [orderMeta] = await mysqlConnection.execute(`
                SELECT
                    pm.meta_key,
                    pm.meta_value
                FROM wp_postmeta pm
                WHERE pm.post_id = ${orderId}
                LIMIT 20 -- Add limit to meta data per order
            `);

            metaDataByOrder[orderId] = {};
            for (const meta of orderMeta) {
                metaDataByOrder[orderId][meta.meta_key] = meta.meta_value;
                allMetaKeys.add(meta.meta_key);
            }
        }

        console.log('\n--- All Meta Keys Found Across Sample Orders ---');
        console.log(Array.from(allMetaKeys).sort());

        console.log('\n--- Meta Data for Each Sample Order ---');
        console.log(JSON.stringify(metaDataByOrder, null, 2));


        console.log('\n--- Analysis Completed ---');

    } catch (error) {
        console.error('Error during order meta data analysis:', error);
        console.error(error.stack);
    } finally {
        await mysqlConnection.end();
    }
}

export { analyzeOrders };

// Remove the standalone analyzeOrders() call here
// This function will be called from the main import process