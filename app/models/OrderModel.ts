import sql from "../database/sql";
import { formatDistanceToNow } from 'date-fns';

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentMethod = 'cash_on_delivery' | 'amazon-pay' | 'google-pay' | 'square' | 'paypal';

export class OrderModel {
  static async create({
    userId,
    items,
    shippingDetails,
    totalAmount,
    shippingFee,
    paymentMethod,
    notes,
    saveAddress = false
  }: {
    userId?: number;
    items: Array<{ productId: number; quantity: number; price: number; }>;
    shippingDetails: {
      firstName: string;
      lastName: string;
      email: string;
      address: string;
      city: string;
      postcode: string;
    };
    totalAmount: number;
    shippingFee: number;
    paymentMethod: PaymentMethod;
    notes?: string;
    saveAddress?: boolean;
  }) {
    try {
      return await sql.begin(async (sql) => {
        // Save shipping address only if user is logged in and requested
        if (userId && saveAddress) {
          await sql`
            INSERT INTO shipping_addresses (
              user_id,
              first_name,
              last_name,
              email,
              address,
              city,
              postcode,
              is_default
            ) VALUES (
              ${userId},
              ${shippingDetails.firstName},
              ${shippingDetails.lastName},
              ${shippingDetails.email},
              ${shippingDetails.address},
              ${shippingDetails.city},
              ${shippingDetails.postcode},
              true
            )
          `;
        }

        // Create the order
        const [order] = await sql`
          INSERT INTO orders (
            user_id,
            payment_method,
            total_amount,
            shipping_fee,
            first_name,
            last_name,
            email,
            address,
            city,
            postcode,
            notes,
            status
          ) VALUES (
            ${userId || null},
            ${paymentMethod},
            ${totalAmount},
            ${shippingFee},
            ${shippingDetails.firstName},
            ${shippingDetails.lastName},
            ${shippingDetails.email},
            ${shippingDetails.address},
            ${shippingDetails.city},
            ${shippingDetails.postcode},
            ${notes || null},
            'pending'
          )
          RETURNING *
        `;

        // Create order items
        await sql`
          INSERT INTO order_items (
            order_id,
            product_id,
            quantity,
            price_at_time
          )
          SELECT 
            ${order.id},
            product_id,
            quantity,
            price
          FROM 
            unnest(${sql.array(items.map(i => i.productId))}::integer[],
                  ${sql.array(items.map(i => i.quantity))}::integer[],
                  ${sql.array(items.map(i => i.price))}::decimal[])
            AS t(product_id, quantity, price)
        `;

        // Update product stock
        await Promise.all(
          items.map(({ productId, quantity }) =>
            sql`
              UPDATE products
              SET stock = stock - ${quantity}
              WHERE id = ${productId}
            `
          )
        );

        // Clear user's cart only if logged in
        if (userId) {
          await sql`
            DELETE FROM cart
            WHERE user_id = ${userId}
          `;
        }

        return order;
      });
    } catch (err) {
      console.error('Error creating order:', err);
      throw err;
    }
  }

  static async getByUserId(userId: number) {
    try {
      const orders = await sql`
        SELECT 
          o.*,
          json_agg(
            json_build_object(
              'id', oi.id,
              'product_id', oi.product_id,
              'quantity', oi.quantity,
              'price_at_time', oi.price_at_time,
              'product_name', p.name,
              'product_image', (
                SELECT image_name 
                FROM product_gallery_images 
                WHERE product_id = p.id 
                AND is_main = true 
                LIMIT 1
              )
            )
          ) as items
        FROM orders o
        JOIN order_items oi ON o.id = oi.order_id
        JOIN products p ON oi.product_id = p.id
        WHERE o.user_id = ${userId}
        GROUP BY o.id
        ORDER BY o.created_at DESC
      `;

      return orders.map(order => ({
        ...order,
        time_ago: formatDistanceToNow(new Date(order.created_at), { addSuffix: true })
      }));
    } catch (err) {
      console.error('Error getting user orders:', err);
      throw err;
    }
  }

  static async updateStatus(orderId: number, status: OrderStatus) {
    try {
      const [order] = await sql`
        UPDATE orders
        SET 
          status = ${status},
          updated_at = NOW()
        WHERE id = ${orderId}
        RETURNING *
      `;
      return order;
    } catch (err) {
      console.error('Error updating order status:', err);
      throw err;
    }
  }

  static async getById(orderId: number) {
    try {
      const [order] = await sql`
        SELECT 
          o.*,
          json_agg(
            json_build_object(
              'id', oi.id,
              'product_id', oi.product_id,
              'quantity', oi.quantity,
              'price', oi.price_at_time,
              'product', json_build_object(
                'id', p.id,
                'name', p.name,
                'image', (
                  SELECT image_name 
                  FROM product_gallery_images 
                  WHERE product_id = p.id 
                  AND is_main = true 
                  LIMIT 1
                )
              )
            )
          ) as items
        FROM orders o
        JOIN order_items oi ON o.id = oi.order_id
        JOIN products p ON oi.product_id = p.id
        WHERE o.id = ${orderId}
        GROUP BY o.id
      `;

      if (!order) return null;

      return {
        ...order,
        shipping_details: {
          firstName: order.first_name,
          lastName: order.last_name,
          email: order.email,
          address: order.address,
          city: order.city,
          postcode: order.postcode
        },
        time_ago: formatDistanceToNow(new Date(order.created_at), { addSuffix: true })
      };
    } catch (err) {
      console.error('Error getting order:', err);
      throw err;
    }
  }

  static async getPaginated({
    page,
    limit,
    sort = 'created_at',
    direction = 'desc',
    userId
  }: {
    page: number;
    limit: number;
    sort?: string;
    direction?: 'asc' | 'desc';
    userId?: number;
  }) {
    try {
      const offset = (page - 1) * limit;

      // Ensure userId is included in the WHERE clause if provided
      const whereClause = userId ? sql`WHERE o.user_id = ${userId}` : sql``;

      const [{ count }] = await sql`
        SELECT COUNT(*) FROM orders o
        ${whereClause}
      `;

      const orderByClause = sql`${sql(sort)} ${direction === 'desc' ? sql`DESC` : sql`ASC`}`;

      const orders = await sql`
        SELECT 
          o.*,
          COALESCE(
            (
              SELECT json_agg(
                json_build_object(
                  'id', oi.id,
                  'product_id', oi.product_id,
                  'quantity', oi.quantity,
                  'price_at_time', oi.price_at_time,
                  'product_name', p.name
                )
              )
              FROM order_items oi
              JOIN products p ON oi.product_id = p.id
              WHERE oi.order_id = o.id
            ),
            '[]'::json
          ) as items
        FROM orders o
        ${whereClause}
        ORDER BY ${orderByClause}
        LIMIT ${limit}
        OFFSET ${offset}
      `;

      return {
        orders: orders.map(order => ({
          ...order,
          time_ago: formatDistanceToNow(new Date(order.created_at), { addSuffix: true })
        })),
        totalOrders: Number(count),
        totalPages: Math.ceil(Number(count) / limit)
      };
    } catch (err) {
      console.error('Error getting paginated orders:', err);
      throw err;
    }
  }

  static async updatePaymentMethod(orderId: number, paymentMethod: PaymentMethod) {
    try {
      const [order] = await sql`
        UPDATE orders
        SET 
          payment_method = ${paymentMethod},
          updated_at = NOW()
        WHERE id = ${orderId}
        RETURNING *
      `;
      return order;
    } catch (err) {
      console.error('Error updating order payment method:', err);
      throw err;
    }
  }

  static async findByVendor(
    vendorId: number, 
    options: {
      page: number;
      limit: number;
      sortField?: string;
      sortDirection?: 'asc' | 'desc';
      status?: OrderStatus;
    }
  ) {
    try {
      const { page, limit, sortField = 'created_at', sortDirection = 'desc', status } = options;
      const offset = (page - 1) * limit;

      // Convert camelCase field names to snake_case for database queries
      const dbSortField = sortField.replace(/([A-Z])/g, '_$1').toLowerCase();

      // First get total count for pagination
      const [{ count }] = await sql`
        SELECT COUNT(DISTINCT o.id) 
        FROM orders o
        JOIN order_items oi ON o.id = oi.order_id
        JOIN products p ON oi.product_id = p.id
        WHERE p.user_id = ${vendorId}
        ${status ? sql`AND o.status = ${status}` : sql``}
      `;

      // Then get the orders with vendor's products
      const orders = await sql`
        SELECT 
          o.*,
          (
            SELECT json_agg(
              json_build_object(
                'id', oi2.id,
                'product_id', p2.id,
                'name', p2.name,
                'quantity', oi2.quantity,
                'price_at_time', oi2.price_at_time,
                'image', (
                  SELECT image_name 
                  FROM product_gallery_images 
                  WHERE product_id = p2.id 
                  AND is_main = true 
                  LIMIT 1
                )
              )
            )
            FROM order_items oi2
            JOIN products p2 ON oi2.product_id = p2.id
            WHERE oi2.order_id = o.id
            AND p2.user_id = ${vendorId}
          ) as vendor_items
        FROM orders o
        JOIN order_items oi ON o.id = oi.order_id
        JOIN products p ON oi.product_id = p.id
        WHERE p.user_id = ${vendorId}
        ${status ? sql`AND o.status = ${status}` : sql``}
        GROUP BY o.id
        ORDER BY o.${sql(dbSortField)} ${sortDirection === 'desc' ? sql`DESC` : sql`ASC`}
        LIMIT ${limit}
        OFFSET ${offset}
      `;

      return {
        orders: orders.map(order => ({
          ...order,
          items: order.vendor_items,
          time_ago: formatDistanceToNow(new Date(order.created_at), { addSuffix: true })
        })),
        totalOrders: Number(count),
        totalPages: Math.ceil(Number(count) / limit)
      };
    } catch (err) {
      console.error('Error getting vendor orders:', err);
      throw err;
    }
  }

  static async countByVendor(
    vendorId: number, 
    options?: {
      status?: OrderStatus;
    }
  ) {
    try {
      const [{ count }] = await sql`
        SELECT COUNT(DISTINCT o.id) 
        FROM orders o
        JOIN order_items oi ON o.id = oi.order_id
        JOIN products p ON oi.product_id = p.id
        WHERE p.user_id = ${vendorId}
        ${options?.status ? sql`AND o.status = ${options.status}` : sql``}
      `;
      
      return Number(count);
    } catch (err) {
      console.error('Error counting vendor orders:', err);
      throw err;
    }
  }
} 