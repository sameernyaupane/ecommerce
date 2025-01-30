import { getMysqlConnection, sql } from '../lib/db.js';

export async function importOrders() {
    const mysqlConnection = await getMysqlConnection();

    try {
        console.log('Importing orders...');

        // Fetch order data from MySQL WordPress database
        const [orders] = await mysqlConnection.execute(`
            SELECT 
                p.ID as wp_id,
                p.post_date as order_date,
                p.post_status as order_status,
                pm_total.meta_value as total_sales,
                pm_currency.meta_value as currency,
                pm_payment_method.meta_value as payment_method_wp,
                pm_shipping_total.meta_value as shipping_fee,
                pm_billing_first.meta_value as billing_first_name,
                pm_billing_last.meta_value as billing_last_name,
                pm_billing_email.meta_value as billing_email,
                pm_billing_phone.meta_value as billing_phone,
                pm_billing_address_1.meta_value as billing_address_1,
                pm_billing_address_2.meta_value as billing_address_2,
                pm_billing_city.meta_value as billing_city,
                pm_billing_postcode.meta_value as billing_postcode,
                pm_billing_country.meta_value as billing_country,
                pm_order_key.meta_value as order_key,
                pm_customer_ip.meta_value as customer_ip,
                pm_customer_user_agent.meta_value as customer_user_agent,
                pm_created_via.meta_value as created_via,
                pm_payment_method_title.meta_value as payment_method_title
            FROM wp_posts p
            LEFT JOIN wp_postmeta pm_total ON p.ID = pm_total.post_id AND pm_total.meta_key = '_order_total'
            LEFT JOIN wp_postmeta pm_currency ON p.ID = pm_currency.post_id AND pm_currency.meta_key = '_order_currency'
            LEFT JOIN wp_postmeta pm_payment_method ON p.ID = pm_payment_method.post_id AND pm_payment_method.meta_key IN ('_payment_method', '_payment_method_title')
            LEFT JOIN wp_postmeta pm_shipping_total ON p.ID = pm_shipping_total.post_id AND pm_shipping_total.meta_key = '_order_shipping'
            LEFT JOIN wp_postmeta pm_billing_first ON p.ID = pm_billing_first.post_id AND pm_billing_first.meta_key = '_billing_first_name'
            LEFT JOIN wp_postmeta pm_billing_last ON p.ID = pm_billing_last.post_id AND pm_billing_last.meta_key = '_billing_last_name'
            LEFT JOIN wp_postmeta pm_billing_email ON p.ID = pm_billing_email.post_id AND pm_billing_email.meta_key = '_billing_email'
            LEFT JOIN wp_postmeta pm_billing_phone ON p.ID = pm_billing_phone.post_id AND pm_billing_phone.meta_key = '_billing_phone'
            LEFT JOIN wp_postmeta pm_billing_address_1 ON p.ID = pm_billing_address_1.post_id AND pm_billing_address_1.meta_key = '_billing_address_1'
            LEFT JOIN wp_postmeta pm_billing_address_2 ON p.ID = pm_billing_address_2.post_id AND pm_billing_address_2.meta_key = '_billing_address_2'
            LEFT JOIN wp_postmeta pm_billing_city ON p.ID = pm_billing_city.post_id AND pm_billing_city.meta_key = '_billing_city'
            LEFT JOIN wp_postmeta pm_billing_postcode ON p.ID = pm_billing_postcode.post_id AND pm_billing_postcode.meta_key = '_billing_postcode'
            LEFT JOIN wp_postmeta pm_billing_country ON p.ID = pm_billing_country.post_id AND pm_billing_country.meta_key = '_billing_country'
            LEFT JOIN wp_postmeta pm_customer_user_agent ON p.ID = pm_customer_user_agent.post_id AND pm_customer_user_agent.meta_key = '_customer_user_agent'
            LEFT JOIN wp_postmeta pm_order_key ON p.ID = pm_order_key.post_id AND pm_order_key.meta_key = '_order_key'
            LEFT JOIN wp_postmeta pm_created_via ON p.ID = pm_created_via.post_id AND pm_created_via.meta_key = '_created_via'
            LEFT JOIN wp_postmeta pm_payment_method_title ON p.ID = pm_payment_method_title.post_id AND pm_payment_method_title.meta_key = '_payment_method_title'
            LEFT JOIN wp_postmeta pm_customer_ip ON p.ID = pm_customer_ip.post_id AND pm_customer_ip.meta_key = '_customer_ip_address'
            WHERE p.post_type = 'shop_order'
            AND p.ID IN (
                SELECT MAX(posts.ID)
                FROM wp_posts posts
                LEFT JOIN wp_postmeta order_key_meta 
                    ON posts.ID = order_key_meta.post_id 
                    AND order_key_meta.meta_key = '_order_key'
                WHERE posts.post_type = 'shop_order'
                GROUP BY order_key_meta.meta_value
            )
            ORDER BY p.ID DESC
        `);
        console.log(`Found ${orders.length} orders to import`);

        // Get order items for each order
        const [orderItems] = await mysqlConnection.execute(`
            SELECT 
                order_items.order_id,
                order_items.order_item_name,
                order_items.order_item_type,
                MAX(CASE WHEN wc_meta.meta_key = '_product_id' THEN wc_meta.meta_value END) as wp_product_id,
                MAX(CASE WHEN wc_meta.meta_key = '_variation_id' THEN wc_meta.meta_value END) as variation_id,
                MAX(CASE WHEN wc_meta.meta_key = '_qty' THEN wc_meta.meta_value END) as quantity,
                MAX(CASE WHEN wc_meta.meta_key = '_line_total' THEN wc_meta.meta_value END) as price
            FROM wp_woocommerce_order_items as order_items
            LEFT JOIN wp_woocommerce_order_itemmeta wc_meta
                ON wc_meta.order_item_id = order_items.order_item_id
            WHERE order_items.order_item_type = 'line_item'
            GROUP BY order_items.order_id, order_items.order_item_id, order_items.order_item_name, order_items.order_item_type
            ORDER BY order_items.order_item_id ASC
        `);

        // Create a map of WordPress order items (simplified)
        const orderItemsMap = new Map();
        for (const item of orderItems) {
            if (!orderItemsMap.has(item.order_id)) {
                orderItemsMap.set(item.order_id, []);
            }
            orderItemsMap.get(item.order_id).push(item);
        }

        // Helper function to normalize product names for comparison
        function normalizeProductName(name) {
            return name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, ' ')  // Replace non-alphanumeric chars with space
                .trim()                        // Remove leading/trailing whitespace
                .replace(/\s+/g, ' ');         // Normalize spaces
        }

        for (const order of orders) {
            try {
                const statusMap = {
                    'wc-pending': 'pending',
                    'wc-processing': 'processing',
                    'wc-completed': 'delivered',
                    'wc-cancelled': 'cancelled',
                    'wc-refunded': 'cancelled',
                    'wc-failed': 'pending',
                    'pending': 'pending',
                    'processing': 'processing',
                    'completed': 'delivered',
                    'cancelled': 'cancelled',
                    'refunded': 'cancelled',
                    'failed': 'pending',
                };
                const pgStatus = statusMap[order.order_status] || 'pending';

                const paymentMethodMap = {
                    'cod': 'cash_on_delivery',
                    'paypal': 'paypal',
                    'square_credit_card': 'square',
                    'stripe': 'square',
                    'ppcp-gateway': 'paypal',
                    'credit_card': 'square',
                    'square': 'square'
                };

                const pgPaymentMethod = paymentMethodMap[order.payment_method_wp] || 
                                      (order.payment_method_title.toLowerCase().includes('credit card') ? 'square' : 'cash_on_delivery');

                const orderData = {
                    first_name: order.billing_first_name,
                    last_name: order.billing_last_name,
                    email: order.billing_email,
                    address: `${order.billing_address_1}\n${order.billing_address_2 || ''}`.trim(),
                    city: order.billing_city,
                    postcode: order.billing_postcode,
                    country: order.billing_country || 'GB',
                    user_agent: order.customer_user_agent,
                    customer_ip: order.customer_ip,
                    order_key: order.order_key,
                    total_amount: parseFloat(order.total_sales) || 0,
                    shipping_fee: parseFloat(order.shipping_fee) || 0,
                    payment_method: pgPaymentMethod,
                    created_at: new Date(order.order_date),
                    status: pgStatus
                };

                const [insertedOrder] = await sql`
                    INSERT INTO orders ${sql(orderData)}
                    ON CONFLICT (order_key) DO UPDATE SET
                        first_name = EXCLUDED.first_name,
                        last_name = EXCLUDED.last_name,
                        email = EXCLUDED.email,
                        address = EXCLUDED.address,
                        city = EXCLUDED.city,
                        postcode = EXCLUDED.postcode,
                        country = EXCLUDED.country,
                        total_amount = EXCLUDED.total_amount,
                        shipping_fee = EXCLUDED.shipping_fee,
                        payment_method = EXCLUDED.payment_method,
                        status = ${pgStatus},
                        updated_at = NOW()
                    RETURNING id
                `;

                console.log(`Imported new order ID: ${insertedOrder.id}`);

                // Get WordPress order items for this order
                const wpOrderItems = orderItemsMap.get(order.wp_id) || [];

                // Insert order items
                for (const item of wpOrderItems) {
                    try {
                        // Get our product ID that matches the WordPress product ID
                        const [wpProduct] = await mysqlConnection.execute(`
                            SELECT ID, post_title 
                            FROM wp_posts 
                            WHERE ID = ?
                        `, [item.wp_product_id]);

                        // Debug log for order #31707
                        if (order.order_key === 'wc_order_i9aGV025xL9jZ') {
                            console.log('\nDebug product lookup for #31707:');
                            console.log('WP Product ID:', item.wp_product_id);
                            console.log('WP Product:', wpProduct[0]?.post_title);
                            
                            // Also check our products table
                            const [pgProductCheck] = await sql`
                                SELECT id, name 
                                FROM products 
                                WHERE name = ${wpProduct[0]?.post_title}
                            `;
                            console.log('PG Product match:', pgProductCheck);
                        }

                        if (wpProduct.length > 0) {
                            const [pgProduct] = await sql`
                                SELECT id, name, price 
                                FROM products 
                                WHERE wp_id = ${item.wp_product_id}
                            `;

                            if (pgProduct) {
                                // Check if order item already exists before inserting
                                const [existingOrderItem] = await sql`
                                    SELECT id 
                                    FROM order_items
                                    WHERE order_id = ${insertedOrder.id}
                                    AND product_id = ${pgProduct.id}
                                `;

                                if (!existingOrderItem) {
                                    await sql`
                                        INSERT INTO order_items (
                                            order_id,
                                            product_id,
                                            quantity,
                                            price_at_time
                                        ) VALUES (
                                            ${insertedOrder.id},
                                            ${pgProduct.id},
                                            ${parseInt(item.quantity) || 1},
                                            ${parseFloat(item.price) || 0}
                                        )
                                    `;
                                    
                                    if (order.order_key === 'wc_order_i9aGV025xL9jZ') {
                                        console.log('Successfully inserted order item');
                                    }
                                }
                            } else if (order.order_key === 'wc_order_i9aGV025xL9jZ') {
                                console.log('No matching product found in PG database');
                            }
                        }
                    } catch (error) {
                        console.error('Error importing order item:', error);
                        console.error('Order item data:', JSON.stringify(item, null, 2));
                    }
                }

            } catch (error) {
                console.error('Error importing order:', error);
                console.error('Order data:', JSON.stringify(order, null, 2));
            }
        }

        console.log('Orders import process finished.');

        // Debug: Check products table content
        const [productsCheck] = await sql`
            SELECT id, wp_id, name 
            FROM products 
            WHERE wp_id IN (30438, 30462, 30577, 30447, 30445, 30457)
            ORDER BY wp_id
        `;
        console.log('\nProducts in database:', productsCheck);

        // Original verification query with more fields
        const [verifyOrder] = await sql`
            SELECT 
                o.id, 
                o.order_key, 
                o.total_amount,
                oi.quantity, 
                oi.price_at_time,
                p.id as product_id,
                p.wp_id as product_wp_id,
                p.name as product_name
            FROM orders o
            LEFT JOIN order_items oi ON o.id = oi.order_id
            LEFT JOIN products p ON oi.product_id = p.id
            WHERE o.order_key = 'wc_order_i9aGV025xL9jZ'
        `;

        console.log('\nVerifying order items for #31707:', JSON.stringify(verifyOrder, null, 2));

        // First, create the normalize_product_name function in PostgreSQL
        await sql`
            CREATE OR REPLACE FUNCTION normalize_product_name(name text) 
            RETURNS text AS $$
            BEGIN
                RETURN lower(regexp_replace(trim(regexp_replace(name, '[^a-zA-Z0-9]+', ' ', 'g')), '\s+', ' ', 'g'));
            END;
            $$ LANGUAGE plpgsql IMMUTABLE;
        `;

    } catch (error) {
        console.error('Error during orders import:', error);
        throw error;
    } finally {
        await mysqlConnection.end();
    }
} 