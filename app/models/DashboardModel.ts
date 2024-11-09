import sql from "../database/sql";
import type { DashboardStat, ChartDataPoint, RecentOrder } from "@/types/dashboard";

export class DashboardModel {
  static async getStats(isAdmin: boolean = false) {
    if (isAdmin) {
      return this.getAdminStats();
    }
    return this.getUserStats();
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

  private static async getUserStats(userId?: number): Promise<DashboardStat[]> {
    const stats = await Promise.all([
      // Total Revenue
      sql`
        SELECT COALESCE(SUM(total_amount), 0) as total_revenue
        FROM orders
        WHERE created_at >= NOW() - INTERVAL '30 days'
        ${userId ? sql`AND user_id = ${userId}` : sql``}
      `,
      // Total Orders
      sql`
        SELECT COUNT(*) as total_orders
        FROM orders
        WHERE created_at >= NOW() - INTERVAL '30 days'
        ${userId ? sql`AND user_id = ${userId}` : sql``}
      `,
      // Total Customers
      sql`
        SELECT COUNT(DISTINCT user_id) as total_customers
        FROM orders
        WHERE created_at >= NOW() - INTERVAL '30 days'
        ${userId ? sql`AND user_id = ${userId}` : sql``}
      `,
      // Active Products
      sql`
        SELECT COUNT(*) as active_products
        FROM products
        WHERE stock > 0
      `,
      // Previous month's stats for comparison
      sql`
        SELECT COALESCE(SUM(total_amount), 0) as prev_revenue,
               COUNT(*) as prev_orders,
               COUNT(DISTINCT user_id) as prev_customers
        FROM orders
        WHERE created_at >= NOW() - INTERVAL '60 days'
          AND created_at < NOW() - INTERVAL '30 days'
        ${userId ? sql`AND user_id = ${userId}` : sql``}
      `
    ]);

    const [
      currentRevenue,
      currentOrders,
      currentCustomers,
      activeProducts,
      previousStats
    ] = stats.map(result => result[0]);

    const calculateChange = (current: number, previous: number) => {
      if (current === 0 && previous === 0) return 0;
      if (previous === 0) return 100;
      return ((current - previous) / previous) * 100;
    };

    const formatChange = (current: number, previous: number) => {
      const change = calculateChange(current, previous);
      if (!isFinite(change) || isNaN(change)) return "New";
      return `${change.toFixed(1)}%`;
    };

    return [
      {
        name: "Total Revenue",
        value: `$${Number(currentRevenue.total_revenue).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
        change: formatChange(currentRevenue.total_revenue, previousStats.prev_revenue),
        changeType: currentRevenue.total_revenue >= previousStats.prev_revenue ? "increase" : "decrease"
      },
      {
        name: "Orders",
        value: currentOrders.total_orders,
        change: formatChange(currentOrders.total_orders, previousStats.prev_orders),
        changeType: currentOrders.total_orders >= previousStats.prev_orders ? "increase" : "decrease"
      },
      {
        name: "Customers",
        value: currentCustomers.total_customers,
        change: formatChange(currentCustomers.total_customers, previousStats.prev_customers),
        changeType: currentCustomers.total_customers >= previousStats.prev_customers ? "increase" : "decrease"
      },
      {
        name: "Active Products",
        value: activeProducts.active_products,
        change: formatChange(activeProducts.active_products, previousStats.prev_customers),
        changeType: activeProducts.active_products >= previousStats.prev_customers ? "increase" : "decrease"
      }
    ];
  }

  static async getChartData(isAdmin: boolean = false, userId?: number): Promise<ChartDataPoint[]> {
    const results = await sql`
      SELECT 
        DATE_TRUNC('day', created_at) as date,
        COUNT(*) as order_count,
        COALESCE(SUM(total_amount), 0) as revenue
      FROM orders
      WHERE created_at >= NOW() - INTERVAL '30 days'
      ${userId ? sql`AND user_id = ${userId}` : sql``}
      GROUP BY DATE_TRUNC('day', created_at)
      ORDER BY date ${isAdmin ? sql`DESC` : sql`ASC`}
    `;

    return results.map(row => ({
      name: row.date,
      total: Number(row.revenue),
      orders: Number(row.order_count)
    }));
  }

  static async getRecentOrders(isAdmin: boolean = false, userId?: number): Promise<RecentOrder[]> {
    const orders = await sql`
      SELECT 
        o.*,
        u.email as user_email,
        u.name as user_name,
        u.profile_image,
        json_agg(
          json_build_object(
            'id', oi.id,
            'product_id', oi.product_id,
            'quantity', oi.quantity,
            'price_at_time', oi.price_at_time,
            'product_name', p.name
          )
        ) as items
      FROM orders o
      JOIN users u ON o.user_id = u.id
      JOIN order_items oi ON o.id = oi.order_id
      JOIN products p ON oi.product_id = p.id
      ${userId ? sql`WHERE o.user_id = ${userId}` : sql``}
      GROUP BY o.id, u.email, u.name, u.profile_image
      ORDER BY o.created_at DESC
      LIMIT 5
    `;

    return orders.map(order => ({
      id: order.id,
      customerName: order.user_name || 'Anonymous',
      customerEmail: order.user_email,
      customerAvatar: order.profile_image ? (
        order.profile_image.startsWith('http')
          ? order.profile_image  // Google Auth image URL
          : `/uploads/profiles/${order.profile_image}`  // Local upload path
      ) : null,
      product: order.items[0].product_name,
      status: order.status,
      amount: order.total_amount,
      date: order.created_at
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