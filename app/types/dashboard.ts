export interface DashboardStat {
  name: string;
  value: string | number;
  change: string;
  changeType: "increase" | "decrease";
}

export interface ChartDataPoint {
  name: string;
  total: number;
  orders: number;
}

export interface RecentOrder {
  id: number;
  customerName: string;
  customerEmail: string;
  customerAvatar: string | null;
  product: string;
  status: string;
  amount: string;
  date: string;
}

export interface DashboardData {
  stats: DashboardStat[];
  chartData: ChartDataPoint[];
  recentOrders: RecentOrder[];
} 