export interface Stat {
  name: string;
  value: string | number;
  change: string;
  changeType: 'increase' | 'decrease';
}

export interface ChartData {
  name: string;
  total: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerAvatar?: string;
  product: string;
  status: 'completed' | 'pending' | 'cancelled';
  amount: number;
} 