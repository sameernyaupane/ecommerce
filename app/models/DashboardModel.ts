import sql from "../database/sql";
import type { DashboardStat, ChartDataPoint, RecentOrder } from "@/types/dashboard";

export class DashboardModel {
  static async getStats(isAdmin: boolean = false, userId?: number, isVendor: boolean = false): Promise<DashboardStat[]> {
    if (isAdmin) {
      return this.getAdminStats();
    } else if (isVendor && userId) {
      return this.getVendorStats(userId);
    } else if (userId) {
      return this.getUserStats(userId);
    } else {
      // Fallback or handle error appropriately
      console.error("No role or userId provided for getStats");
      return [];
    }
  }

  private static async getAdminStats(): Promise<DashboardStat[]> {
    const stats = await Promise.all([
      // Total Revenue (all time)
      sql`
        SELECT 
          COALESCE(SUM(total_amount), 0) as total_revenue,
          COUNT(*) as total_orders,
          COUNT(DISTINCT user_id) as total_customers
        FROM orders
      `,
      // Current month stats
      sql`
        SELECT 
          COALESCE(SUM(total_amount), 0) as current_revenue,
          COUNT(*) as current_orders,
          COUNT(DISTINCT user_id) as current_customers
        FROM orders
        WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE)
      `,
      // Previous month stats
      sql`
        SELECT 
          COALESCE(SUM(total_amount), 0) as prev_revenue,
          COUNT(*) as prev_orders,
          COUNT(DISTINCT user_id) as prev_customers
        FROM orders
        WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
          AND created_at < DATE_TRUNC('month', CURRENT_DATE)
      `,
      // Total Products
      sql`SELECT COUNT(*) as total_products FROM products`
    ]);

    const [totalStats, currentStats, prevStats, productStats] = stats.map(result => result[0]);

    return [
      {
        name: "Total Revenue",
        value: this.formatCurrency(totalStats.total_revenue),
        change: this.formatChange(currentStats.current_revenue, prevStats.prev_revenue),
        changeType: this.getChangeType(currentStats.current_revenue, prevStats.prev_revenue)
      },
      {
        name: "Total Orders",
        value: totalStats.total_orders,
        change: this.formatChange(currentStats.current_orders, prevStats.prev_orders),
        changeType: this.getChangeType(currentStats.current_orders, prevStats.prev_orders)
      },
      {
        name: "Total Customers",
        value: totalStats.total_customers,
        change: this.formatChange(currentStats.current_customers, prevStats.prev_customers),
        changeType: this.getChangeType(currentStats.current_customers, prevStats.prev_customers)
      },
      {
        name: "Total Products",
        value: productStats.total_products,
        change: "0%",
        changeType: "stable"
      }
    ];
  }

  private static async getVendorStats(vendorId: number): Promise<DashboardStat[]> {
    const stats = await Promise.all([
      // Total Revenue
      sql`
        SELECT COALESCE(SUM(oi.quantity * oi.price_at_time), 0) as total_revenue
        FROM orders o
        JOIN order_items oi ON o.id = oi.order_id
        JOIN products p ON oi.product_id = p.id
        WHERE o.created_at >= NOW() - INTERVAL '30 days'
        AND p.vendor_id = ${vendorId}
      `,
      // Total Orders
      sql`
        SELECT COUNT(DISTINCT o.id) as total_orders
        FROM orders o
        JOIN order_items oi ON o.id = oi.order_id
        JOIN products p ON oi.product_id = p.id
        WHERE o.created_at >= NOW() - INTERVAL '30 days'
        AND p.vendor_id = ${vendorId}
      `,
      // Total Customers (for vendor, should be only their customers)
      sql`
        SELECT COUNT(DISTINCT o.user_id) as total_customers
        FROM orders o
        JOIN order_items oi ON o.id = oi.order_id
        JOIN products p ON oi.product_id = p.id
        WHERE o.created_at >= NOW() - INTERVAL '30 days'
        AND p.vendor_id = ${vendorId}
      `,
      // Active Products for vendor
      sql`
        SELECT COUNT(*) as active_products
        FROM products
        WHERE stock > 0
        AND vendor_id = ${vendorId}
      `,
      // Previous month's stats for comparison
      sql`
        SELECT
          COALESCE(SUM(oi.quantity * oi.price_at_time), 0) as prev_revenue,
          COUNT(DISTINCT o.id) as prev_orders,
          COUNT(DISTINCT o.user_id) as prev_customers
        FROM orders o
        JOIN order_items oi ON o.id = oi.order_id
        JOIN products p ON oi.product_id = p.id
        WHERE o.created_at >= NOW() - INTERVAL '60 days'
          AND o.created_at < NOW() - INTERVAL '30 days'
        AND p.vendor_id = ${vendorId}
      `
    ]);

    const [
      currentRevenue,
      currentOrders,
      currentCustomers,
      activeProducts,
      previousStats
    ] = stats.map(result => result[0]);

    return [
      {
        name: "Total Revenue",
        value: `$${Number(currentRevenue.total_revenue).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
        change: this.formatChange(currentRevenue.total_revenue, previousStats.prev_revenue),
        changeType: currentRevenue.total_revenue >= previousStats.prev_revenue ? "increase" : "decrease"
      },
      {
        name: "Orders",
        value: currentOrders.total_orders,
        change: this.formatChange(currentOrders.total_orders, previousStats.prev_orders),
        changeType: currentOrders.total_orders >= previousStats.prev_orders ? "increase" : "decrease"
      },
      {
        name: "Customers",
        value: currentCustomers.total_customers,
        change: this.formatChange(currentCustomers.total_customers, previousStats.prev_customers),
        changeType: currentCustomers.total_customers >= previousStats.prev_customers ? "increase" : "decrease"
      },
      {
        name: "Active Products",
        value: activeProducts.active_products,
        change: "0%",
        changeType: "stable"
      }
    ];
  }

  private static async getUserStats(userId: number): Promise<DashboardStat[]> {
    const stats = await Promise.all([
      // Total Orders by User
      sql`
        SELECT COUNT(*) as total_orders
        FROM orders
        WHERE created_at >= NOW() - INTERVAL '30 days'
        AND user_id = ${userId}
      `,
      // Total Spend by User
      sql`
        SELECT COALESCE(SUM(total_amount), 0) as total_spend
        FROM orders
        WHERE created_at >= NOW() - INTERVAL '30 days'
        AND user_id = ${userId}
      `,
      // Favorite Categories (most ordered categories)
      sql`
        SELECT
          c.name as category_name,
          COUNT(oi.product_id) as order_count
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        JOIN product_categories c ON p.category_id = c.id
        JOIN orders o ON oi.order_id = o.id
        WHERE o.user_id = ${userId}
        AND o.created_at >= NOW() - INTERVAL '30 days'
        GROUP BY c.name
        ORDER BY order_count DESC
        LIMIT 3
      `,
      // Previous month's stats for comparison (Orders and Spend)
      sql`
        SELECT
          COALESCE(SUM(CASE WHEN stat_type = 'spend' THEN stat_value ELSE 0 END), 0) as prev_spend,
          COALESCE(SUM(CASE WHEN stat_type = 'orders' THEN stat_value ELSE 0 END), 0) as prev_orders
        FROM (
          SELECT
            COUNT(*) as stat_value,
            'orders' as stat_type
          FROM orders
          WHERE created_at >= NOW() - INTERVAL '60 days'
            AND created_at < NOW() - INTERVAL '30 days'
            AND user_id = ${userId}
          UNION ALL
          SELECT
            COALESCE(SUM(total_amount), 0) as stat_value,
            'spend' as stat_type
          FROM orders
          WHERE created_at >= NOW() - INTERVAL '60 days'
            AND created_at < NOW() - INTERVAL '30 days'
            AND user_id = ${userId}
        ) as monthly_stats
      `
    ]);

    console.log("Stats results:", stats);

    if (!stats) {
      console.error("Stats is undefined!");
      return [];
    }

    const [
      currentOrders,
      currentSpend,
      favoriteCategories,
      previousStats
    ] = stats.map(result => {
      console.log("Result in map:", result);
      return result ? result[0] : undefined;
    });

    if (!currentOrders || !currentSpend || !favoriteCategories || !previousStats) {
      console.error("One of the stat results is undefined:", {
        currentOrders, currentSpend, favoriteCategories, previousStats
      });
      return [];
    }

    return [
      {
        name: "Orders",
        value: currentOrders.total_orders,
        change: this.formatChange(currentOrders.total_orders, previousStats.prev_orders),
        changeType: this.getChangeType(currentOrders.total_orders, previousStats.prev_orders)
      },
      {
        name: "Total Spend",
        value: `$${Number(currentSpend.total_spend).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
        change: this.formatChange(currentSpend.total_spend, previousStats.prev_spend),
        changeType: this.getChangeType(currentSpend.total_spend, previousStats.prev_spend)
      },
      {
        name: "Favorite Categories",
        value: favoriteCategories.map((cat: { category_name: string, order_count: number }) => cat.category_name).join(', ') || 'None',
        change: "0%", // No change comparison for categories
        changeType: "stable"
      },
      {
        name: "Products Ordered", // Example, you can replace with another relevant stat
        value: '-', // Replace with actual calculation if needed
        change: "0%",
        changeType: "stable"
      }
    ];
  }

  static async getChartData(isAdmin: boolean = false, userId?: number, isVendor: boolean = false): Promise<ChartDataPoint[]> {
    const results = await sql`
      SELECT
        DATE_TRUNC('day', o.created_at) as date,
        COUNT(DISTINCT o.id) as order_count,
        COALESCE(SUM(oi.quantity * oi.price_at_time), 0) as revenue
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN products p ON oi.product_id = p.id
      WHERE o.created_at >= NOW() - INTERVAL '30 days'
      ${isAdmin ? sql`` : isVendor && typeof userId === 'number' ? sql`AND p.vendor_id = ${userId}` : typeof userId === 'number' ? sql`AND o.user_id = ${userId}` : sql``}
      GROUP BY DATE_TRUNC('day', o.created_at)
      ORDER BY date ${isAdmin ? sql`DESC` : sql`ASC`}
    `;

    return results.map(row => ({
      name: row.date,
      total: Number(row.revenue),
      orders: Number(row.order_count)
    }));
  }

  static async getRecentOrders(isAdmin: boolean = false, userId?: number, isVendor: boolean = false): Promise<RecentOrder[]> {
    const orders = await sql`
      SELECT
        o.*,
        u.email as user_email,
        u.name as user_name,
        u.profile_image,
        json_agg(
          CASE WHEN p.vendor_id = ${typeof userId === 'number' ? userId : null} THEN
            json_build_object(
              'id', oi.id,
              'product_id', oi.product_id,
              'quantity', oi.quantity,
              'price_at_time', oi.price_at_time,
              'product_name', p.name
            )
          ELSE
            NULL -- Exclude items not belonging to the vendor
          END
        ) FILTER (WHERE p.vendor_id = ${typeof userId === 'number' ? userId : null}) as items
      FROM orders o
      JOIN users u ON o.user_id = u.id
      JOIN order_items oi ON o.id = oi.order_id
      JOIN products p ON oi.product_id = p.id
      WHERE EXISTS ( -- Ensure order contains at least one item from the vendor
        SELECT 1
        FROM order_items oi2
        JOIN products p2 ON oi2.product_id = p2.id
        WHERE oi2.order_id = o.id AND p2.vendor_id = ${typeof userId === 'number' ? userId : null}
      )
      ${(isVendor && typeof userId === 'number') ? sql`AND p.vendor_id = ${userId}` : sql``}
      GROUP BY o.id, u.email, u.name, u.profile_image
      ORDER BY o.created_at DESC
      LIMIT 5
    `;

    return orders.map(order => ({
      ...order,
      // Filter out NULL items from json_agg (excluded items)
      items: (order.items || []).filter(item => item !== null)
    }));
  }

  private static formatCurrency(amount: number): string {
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
  }

  private static calculateChange(current: number, previous: number): number {
    if (current === 0 && previous === 0) return 0;
    if (previous === 0) return 100;
    return ((current - previous) / previous) * 100;
  }

  private static formatChange(current: number, previous: number): string {
    const change = this.calculateChange(current, previous);
    if (!isFinite(change) || isNaN(change)) return "New";
    return `${change.toFixed(1)}%`;
  }

  private static getChangeType(current: number, previous: number): "increase" | "decrease" | "stable" {
    if (current === previous) return "stable";
    return current > previous ? "increase" : "decrease";
  }
} 