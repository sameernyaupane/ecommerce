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
    sort,
    direction,
    status
  }: {
    page: number;
    limit: number;
    sort: string;
    direction: 'asc' | 'desc';
    status?: string;
  }) {
    const offset = (page - 1) * limit;
    
    const orders = await sql`
      SELECT 
        o.*,
        json_agg(
          json_build_object(
            'id', oi.id,
            'product_id', oi.product_id,
            'product_name', p.name,
            'quantity', oi.quantity,
            'price_at_time', oi.price_at_time,
            'user_id', p.user_id
          )
        ) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.id
      ${status ? sql`WHERE o.status = ${status}` : sql``}
      GROUP BY o.id
      ORDER BY 
        CASE ${sort}
          WHEN 'created_at' THEN o.created_at::text
          WHEN 'total_amount' THEN o.total_amount::text
          WHEN 'id' THEN o.id::text
          ELSE o.created_at::text
        END ${direction === 'asc' ? sql`ASC` : sql`DESC`}
      LIMIT ${limit}
      OFFSET ${offset}
    `;

    return {
      orders: orders.map(order => ({
        ...order,
        items: order.items.filter(Boolean)
      })),
      page,
      limit
    };
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
    user_id: number,
    options: {
      page: number;
      limit: number;
      sortField?: string;
      sortDirection?: 'asc' | 'desc';
      status?: OrderStatus;
    }
  ) {
    const offset = (options.page - 1) * options.limit;
    
    let orderBy = 'created_at';
    if (['created_at', 'total_amount', 'id', 'status'].includes(options.sortField || '')) {
      orderBy = options.sortField!;
    }

    const direction = options.sortDirection === 'asc' ? 'ASC' : 'DESC';

    try {
      const orders = await sql`
        WITH vendor_orders AS (
          SELECT DISTINCT o.*
          FROM orders o
          JOIN order_items oi ON o.id = oi.order_id
          JOIN products p ON oi.product_id = p.id
          WHERE p.user_id = ${user_id}
          ${options.status ? sql`AND o.status = ${options.status}` : sql``}
        )
        SELECT 
          vo.id,
          vo.user_id,
          vo.payment_method,
          vo.total_amount,
          vo.shipping_fee,
          vo.first_name,
          vo.last_name,
          vo.email,
          vo.address,
          vo.city,
          vo.postcode,
          vo.country,
          vo.status,
          vo.created_at,
          vo.updated_at,
          COALESCE(json_agg(
            json_build_object(
              'id', oi.id,
              'product_id', p.id,
              'product_name', p.name,
              'quantity', oi.quantity,
              'price_at_time', oi.price_at_time,
              'user_id', p.user_id,
              'product_image', (
                SELECT image_name 
                FROM product_gallery_images 
                WHERE product_id = p.id 
                AND is_main = true 
                LIMIT 1
              )
            )
            ORDER BY oi.id
          ) FILTER (WHERE oi.id IS NOT NULL), '[]') as items
        FROM vendor_orders vo
        LEFT JOIN order_items oi ON vo.id = oi.order_id
        LEFT JOIN products p ON oi.product_id = p.id
        GROUP BY 
          vo.id,
          vo.user_id,
          vo.payment_method,
          vo.total_amount,
          vo.shipping_fee,
          vo.first_name,
          vo.last_name,
          vo.email,
          vo.address,
          vo.city,
          vo.postcode,
          vo.country,
          vo.status,
          vo.created_at,
          vo.updated_at
        ORDER BY 
          CASE WHEN ${orderBy} = 'created_at' THEN 1
               WHEN ${orderBy} = 'total_amount' THEN 2
               WHEN ${orderBy} = 'id' THEN 3
               WHEN ${orderBy} = 'status' THEN 4
               ELSE 5
          END,
          CASE WHEN ${orderBy} = 'created_at' THEN vo.created_at
          END ${direction === 'ASC' ? sql`ASC` : sql`DESC`},
          CASE WHEN ${orderBy} = 'total_amount' THEN vo.total_amount
          END ${direction === 'ASC' ? sql`ASC` : sql`DESC`},
          CASE WHEN ${orderBy} = 'id' THEN vo.id
          END ${direction === 'ASC' ? sql`ASC` : sql`DESC`},
          CASE WHEN ${orderBy} = 'status' THEN vo.status
          END ${direction === 'ASC' ? sql`ASC` : sql`DESC`},
          vo.created_at DESC
        LIMIT ${options.limit}
        OFFSET ${offset}
      `;

      return orders.map(order => ({
        ...order,
        time_ago: formatDistanceToNow(new Date(order.created_at), { addSuffix: true })
      }));
    } catch (err) {
      console.error('Error finding vendor orders:', err);
      throw err;
    }
  }

  static async countByVendor(
    user_id: number, 
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
        WHERE p.user_id = ${user_id}
        ${options?.status ? sql`AND o.status = ${options.status}` : sql``}
      `;
      
      return Number(count);
    } catch (err) {
      console.error('Error counting vendor orders:', err);
      throw err;
    }
  }

  static async count(options?: { status?: OrderStatus } = {}) {
    try {
      const [{ count }] = await sql`
        SELECT COUNT(DISTINCT o.id) 
        FROM orders o
        ${options.status ? sql`WHERE o.status = ${options.status}` : sql``}
      `;
      
      return Number(count);
    } catch (err) {
      console.error('Error counting orders:', err);
      throw err;
    }
  }
} 