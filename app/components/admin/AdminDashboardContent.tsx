import { useLoaderData } from "@remix-run/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BadgeDelta } from "@/components/ui/badge-delta";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { loader as adminLoader } from "@/routes/admin";
import type { Stat, ChartData, Order } from "@/types/dashboard";

export default function AdminDashboardContent() {
  const { stats, chartData, recentOrders } = useLoaderData<typeof adminLoader>();

  return (
    <>
      <header className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-4 md:mb-8">
        {stats.map((stat: Stat) => (
          <Card key={stat.name}>
            <CardHeader className="flex items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{stat.name}</CardTitle>
              <span className="text-muted-foreground">📊</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center pt-1">
                <BadgeDelta className="text-xs" type={stat.changeType}>
                  {stat.change}
                </BadgeDelta>
                <p className="text-xs text-muted-foreground ml-2">from last month</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Sales Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="total" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>Overview of latest transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentOrders.map((order: Order) => (
                <TableRow key={order.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={order.customerAvatar} alt={order.customerName} />
                        <AvatarFallback>
                          {order.customerName?.charAt(0) || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{order.customerName || 'Unknown'}</span>
                        <span className="text-xs text-muted-foreground">{order.customerEmail || 'No email'}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{order.product}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                      order.status === 'completed' ? 'bg-green-50 text-green-700' :
                      order.status === 'pending' ? 'bg-yellow-50 text-yellow-700' :
                      'bg-red-50 text-red-700'
                    }`}>
                      {order.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">${order.amount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
} 