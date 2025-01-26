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
                pm_shipping_first.meta_value as shipping_first_name,
                pm_shipping_last.meta_value as shipping_last_name,
                pm_shipping_address_1.meta_value as shipping_address_1,
                pm_shipping_address_2.meta_value as shipping_address_2,
                pm_shipping_city.meta_value as shipping_city,
                pm_shipping_postcode.meta_value as shipping_postcode,
                pm_shipping_country.meta_value as shipping_country
            FROM wp_posts p
            LEFT JOIN wp_postmeta pm_total ON p.ID = pm_total.post_id AND pm_total.meta_key = '_order_total'
            LEFT JOIN wp_postmeta pm_currency ON p.ID = pm_currency.post_id AND pm_currency.meta_key = '_order_currency'
            LEFT JOIN wp_postmeta pm_payment_method ON p.ID = pm_payment_method.post_id AND pm_payment_method.meta_key = '_payment_method'
            LEFT JOIN wp_postmeta pm_shipping_total ON p.ID = pm_shipping_total.post_id AND pm_shipping_total.meta_key = '_order_shipping'
            LEFT JOIN wp_postmeta pm_billing_first ON p.ID = pm_billing_first.post_id AND pm_billing_first.meta_key = '_billing_first_name'
            LEFT JOIN wp_postmeta pm_billing_last ON p.ID = pm_billing_last.post_id AND pm_billing_last.meta_key = '_billing_last_name'
            LEFT JOIN wp_postmeta pm_billing_email ON p.ID = pm_billing_email.post_id AND pm_billing_email.meta_key = '_billing_email'
            LEFT JOIN wp_postmeta pm_billing_phone ON p.ID = pm_billing_phone.post_id AND pm_billing_phone.meta_key = '_billing_phone'
            LEFT JOIN wp_postmeta pm_shipping_first ON p.ID = pm_shipping_first.post_id AND pm_shipping_first.meta_key = '_shipping_first_name'
            LEFT JOIN wp_postmeta pm_shipping_last ON p.ID = pm_shipping_last.post_id AND pm_shipping_last.meta_key = '_shipping_last_name'
            LEFT JOIN wp_postmeta pm_shipping_address_1 ON p.ID = pm_shipping_address_1.post_id AND pm_shipping_address_1.meta_key = '_shipping_address_1'
            LEFT JOIN wp_postmeta pm_shipping_address_2 ON p.ID = pm_shipping_address_2.post_id AND pm_shipping_address_2.meta_key = '_shipping_address_2'
            LEFT JOIN wp_postmeta pm_shipping_city ON p.ID = pm_shipping_city.post_id AND pm_shipping_city.meta_key = '_shipping_city'
            LEFT JOIN wp_postmeta pm_shipping_postcode ON p.ID = pm_shipping_postcode.post_id AND pm_shipping_postcode.meta_key = '_shipping_postcode'
            LEFT JOIN wp_postmeta pm_shipping_country ON p.ID = pm_shipping_country.post_id AND pm_shipping_country.meta_key = '_shipping_country'
            WHERE p.post_type = 'shop_order'
            ORDER BY p.ID DESC
        `);
        console.log(`Found ${orders.length} orders to import`);

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
                    'stripe': 'square',
                };
                const pgPaymentMethod = paymentMethodMap[order.payment_method_wp] || 'cash_on_delivery';

                const orderData = {
                    wp_id: order.wp_id,
                    order_date: order.order_date,
                    status: pgStatus,
                    payment_method: pgPaymentMethod,
                    total_amount: parseFloat(order.total_sales) || 0,
                    shipping_fee: parseFloat(order.shipping_fee) || 0,
                    first_name: order.billing_first_name ?? '', // Default to empty string if null/undefined
                    last_name: order.billing_last_name ?? '',   // Default to empty string if null/undefined
                    email: order.billing_email ?? '',         // Default to empty string if null/undefined
                    address: `${order.shipping_address_1 ?? ''} ${order.shipping_address_2 ?? ''}`.trim(), // Default to empty string if null/undefined and trim
                    city: order.shipping_city ?? '',           // Default to empty string if null/undefined
                    postcode: order.shipping_postcode ?? '',       // Default to empty string if null/undefined
                    notes: null,
                };

                const [insertedOrder] = await sql`
                    INSERT INTO orders ${sql(orderData, 'wp_id', 'order_date', 'status', 'payment_method', 'total_amount', 'shipping_fee', 'first_name', 'last_name', 'email', 'address', 'city', 'postcode', 'notes')}
                    ON CONFLICT (wp_id) DO UPDATE SET
                    ${sql(orderData, 'order_date', 'status', 'payment_method', 'total_amount', 'shipping_fee', 'first_name', 'last_name', 'email', 'address', 'city', 'postcode', 'notes', 'updated_at')}
                    RETURNING id, wp_id
                `;
                console.log(`Imported order with WP ID: ${insertedOrder.wp_id}, PG ID: ${insertedOrder.id}`);

            } catch (error) {
                console.error('Error importing order:', error);
                console.error('Order data:', JSON.stringify(order, null, 2));
            }
        }

        console.log('Orders import process finished.');

    } catch (error) {
        console.error('Error during orders import:', error);
        throw error;
    } finally {
        await mysqlConnection.end();
    }
} 