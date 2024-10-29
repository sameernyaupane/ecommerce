// src/routes/route.tsx
import Sidebar from "@/components/ui/sidebar";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { requireAuth, getAuthUser } from "@/controllers/auth";
import { stats } from "@/sample-data/stats";
import { chartData } from "@/sample-data/chartData";
import { recentOrders } from "@/sample-data/recentOrders";
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
import { Button } from "@/components/ui/button";
import { BadgeDelta } from "@/components/ui/badge-delta";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export async function loader({ request }: LoaderFunctionArgs) {
  await requireAuth(request);
  const user = await getAuthUser(request);

  return json({ user, stats, chartData, recentOrders });
}

export default function Admin() {
  const { user, stats, chartData, recentOrders } = useLoaderData<typeof loader>();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Responsive Sidebar - hidden on small screens */}
      <div className="flex flex-1">
        <aside className="hidden md:block w-64 bg-gray-50 border-r p-4">
          <Sidebar />
        </aside>

        {/* Main Admin Content */}
        <main className="flex-1 p-4 md:p-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 md:mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Admin</h1>
              <p className="text-muted-foreground mt-1 md:mt-0">
                Welcome back, {user?.name}
              </p>
            </div>
            <Button className="mt-2 md:mt-0">Download Report</Button>
          </div>

          {/* Stats Grid - Responsive Columns */}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-4 md:mb-8">
            {stats.map((stat) => (
              <Card key={stat.name}>
                <CardHeader className="flex items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">{stat.name}</CardTitle>
                  <span className="text-muted-foreground">📊</span>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="flex items-center pt-1">
                    <BadgeDelta className="text-xs" type={stat.changeType as "increase" | "decrease"}>
                      {stat.change}
                    </BadgeDelta>
                    <p className="text-xs text-muted-foreground ml-2">from last month</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Chart - Full Width on Small Screens */}
          <Card className="mb-4 md:mb-8">
            <CardHeader>
              <CardTitle>Revenue Over Time</CardTitle>
              <CardDescription>Monthly revenue for the current year</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 md:h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Recent Orders Table - Stacks on Small Screens */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>Latest transactions from your customers</CardDescription>
            </CardHeader>
            <CardContent>
              <Table className="table-fixed w-full">
                <TableHeader className="hidden md:table-header-group">
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentOrders.map((order) => (
                    <TableRow key={order.id} className="md:table-row flex flex-col md:flex-row md:flex-none border-b md:border-0 p-4 md:p-0 mb-2 md:mb-0">
                      <TableCell className="flex md:table-cell items-center md:items-start md:p-0 pb-2">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={`https://avatar.vercel.sh/${order.email}`} />
                            <AvatarFallback>{order.customer[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="font-medium">{order.customer}</span>
                            <span className="text-sm text-muted-foreground">{order.email}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="md:table-cell text-sm font-medium md:p-0 pb-2">{order.amount}</TableCell>
                      <TableCell className="md:table-cell md:p-0 pb-2">
                        <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          order.status === 'completed' 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {order.status}
                        </div>
                      </TableCell>
                      <TableCell className="md:table-cell text-sm md:p-0 pb-2">
                        {new Date(order.date).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
