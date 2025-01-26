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
                    country: order.billing_country,
                    user_agent: order.customer_user_agent,
                    customer_ip: order.customer_ip,
                    order_key: order.order_key,
                    total_amount: parseFloat(order.total_sales) || 0,
                    shipping_fee: parseFloat(order.shipping_fee) || 0,
                    payment_method: pgPaymentMethod,
                    created_at: new Date(order.order_date)
                };

                const [insertedOrder] = await sql`
                    INSERT INTO orders ${sql(orderData)}
                    RETURNING id
                `;

                console.log(`Imported new order ID: ${insertedOrder.id}`);

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