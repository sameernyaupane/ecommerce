import sql from "../database/sql";
import { formatDistanceToNow } from 'date-fns';

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentMethod = 'cash_on_delivery' | 'card' | 'bank_transfer';

export class OrderModel {
  static async create({
    userId,
    items,
    shippingDetails,
    totalAmount,
    shippingFee,
    paymentMethod,
    saveAddress = false
  }: {
    userId: number;
    items: Array<{ productId: number; quantity: number; price: number; }>;
    shippingDetails: {
      firstName: string;
      lastName: string;
      email: string;
      address: string;
      city: string;
      postcode: string;
      notes?: string;
    };
    totalAmount: number;
    shippingFee: number;
    paymentMethod: PaymentMethod;
    saveAddress?: boolean;
  }) {
    try {
      return await sql.begin(async (sql) => {
        // Save shipping address if requested
        if (saveAddress) {
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
            notes
          ) VALUES (
            ${userId},
            ${paymentMethod},
            ${totalAmount},
            ${shippingFee},
            ${shippingDetails.firstName},
            ${shippingDetails.lastName},
            ${shippingDetails.email},
            ${shippingDetails.address},
            ${shippingDetails.city},
            ${shippingDetails.postcode},
            ${shippingDetails.notes || null}
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

        // Clear user's cart
        await sql`
          DELETE FROM cart
          WHERE user_id = ${userId}
        `;

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
    direction = 'desc'
  }: {
    page: number;
    limit: number;
    sort?: string;
    direction?: 'asc' | 'desc';
  }) {
    try {
      const offset = (page - 1) * limit;

      const [{ count }] = await sql`
        SELECT COUNT(*) FROM orders
      `;

      // Create the order by clause safely
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
                  'price_at_time', oi.price_at_time
                )
              )
              FROM order_items oi
              WHERE oi.order_id = o.id
            ),
            '[]'::json
          ) as items
        FROM orders o
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
} 