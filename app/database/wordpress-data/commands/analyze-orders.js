import { getMysqlConnection } from '../lib/db.js';

async function analyzeOrders() {
    const mysqlConnection = await getMysqlConnection();

    try {
        console.log('Analyzing WordPress order meta data...');

        const orderId = 31707;
        const [orders] = await mysqlConnection.execute(`
            SELECT ID as order_id
            FROM wp_posts
            WHERE post_type = 'shop_order'
            AND ID = ${orderId}
        `);

        if (orders.length === 0) {
            console.log(`Order ${orderId} not found in wp_posts table.`);
            return;
        }

        // Get order meta
        const [orderMeta] = await mysqlConnection.execute(`
            SELECT meta_key, meta_value
            FROM wp_postmeta
            WHERE post_id = ${orderId}
        `);

        const metaData = {};
        for (const meta of orderMeta) {
            metaData[meta.meta_key] = meta.meta_value;
        }

        console.log('\n--- Meta Data for Order ---');
        console.log(JSON.stringify(metaData, null, 2));

        // Query for order items
        const [orderItems] = await mysqlConnection.execute(`
            SELECT 
                oi.order_item_id,
                oi.order_item_name,
                oi.order_item_type,
                oim.meta_key,
                oim.meta_value
            FROM wp_woocommerce_order_items oi
            LEFT JOIN wp_woocommerce_order_itemmeta oim
                ON oi.order_item_id = oim.order_item_id
            WHERE oi.order_id = ${orderId}
        `);

        // Group items by order_item_id
        const groupedItems = orderItems.reduce((acc, item) => {
            if (!acc[item.order_item_id]) {
                acc[item.order_item_id] = {
                    name: item.order_item_name,
                    type: item.order_item_type,
                    meta: {}
                };
            }
            if (item.meta_key) {
                acc[item.order_item_id].meta[item.meta_key] = item.meta_value;
            }
            return acc;
        }, {});

        console.log(`\n--- Order Items ---`);
        console.log(JSON.stringify(groupedItems, null, 2));

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