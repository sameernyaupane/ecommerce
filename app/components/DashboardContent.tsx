// app/routes/dashboard/DashboardContent.tsx
import { useLoaderData } from "@remix-run/react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BadgeDelta } from "@/components/ui/badge-delta";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { loader } from "@/routes/dashboard";

export default function DashboardContent() {
  const { stats, chartData, recentOrders } = useLoaderData<typeof loader>();
  
  return (
    <>
      <header className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
        </div>
      </header>

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

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Orders Overview</CardTitle>
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
                <Line type="monotone" dataKey="orders" stroke="#82ca9d" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
