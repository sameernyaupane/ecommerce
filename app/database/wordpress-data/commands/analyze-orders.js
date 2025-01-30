import { getMysqlConnection } from '../lib/db.js';

async function analyzeOrders() {
    const mysqlConnection = await getMysqlConnection();

    try {
        console.log('Analyzing WordPress order meta data...');

        // Fetch specific order ID
        const debugOrderId = 31707;
        const [orders] = await mysqlConnection.execute(`
            SELECT
                p.ID as order_id
            FROM wp_posts p
            WHERE p.post_type = 'shop_order'
            AND p.ID = ${debugOrderId}
        `);

        if (orders.length === 0) {
            console.log(`Order ${debugOrderId} not found in wp_posts table.`);
            return;
        }

        const orderIds = orders.map(order => order.order_id);
        console.log(`Analyzing meta for order ID: ${orderIds.join(', ')}`);

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

        // Add detailed debugging for specific order ID
        if (orderIds.includes(debugOrderId)) {
            console.log(`\n--- Debug: Meta Data for Order ${debugOrderId} ---`);
            console.log(JSON.stringify(metaDataByOrder[debugOrderId], null, 2));

            // Query for order items specifically
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
                WHERE oi.order_id = ${debugOrderId}
            `);

            console.log(`\n--- Debug: Order Items for Order ${debugOrderId} ---`);
            console.log(JSON.stringify(orderItems, null, 2));

            // Group items by order_item_id for better readability
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

            console.log(`\n--- Debug: Grouped Order Items for Order ${debugOrderId} ---`);
            console.log(JSON.stringify(groupedItems, null, 2));
        }

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