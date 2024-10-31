import Sidebar from "@/components/ui/sidebar";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, Outlet, useLocation } from "@remix-run/react";
import { requireAuth, getAuthUser } from "@/controllers/auth";
import DashboardContent from "../components/DashboardContent";
import { Button } from "@/components/ui/button";

// Sample data imports
import { stats } from "@/sample-data/stats";
import { chartData } from "@/sample-data/chartData";
import { recentOrders } from "@/sample-data/recentOrders";

export async function loader({ request }: LoaderFunctionArgs) {
  await requireAuth(request);
  const user = await getAuthUser(request);

  return json({ user, stats, chartData, recentOrders });
}

export default function Admin() {
  const { user } = useLoaderData<typeof loader>();
  const location = useLocation();

  // Check if the current path is exactly "/admin"
  const isBaseRoute = location.pathname === "/admin";

  return (
    <div className="flex flex-col min-h-screen container max-w-7xl py-2">
      <div className="flex flex-1">
        <aside className="hidden md:block w-64 bg-gray-50 border-r p-4">
          <Sidebar />
        </aside>

        <main className="flex-1 p-4 md:p-8 border rounded">
          <header className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold">Admin</h1>
              <p className="text-muted-foreground">Welcome back, {user?.name}</p>
            </div>
            <Button>Download Report</Button>
          </header>

          {/* Render DashboardContent only for /admin base route */}
          {isBaseRoute ? <DashboardContent /> : <Outlet />}
        </main>
      </div>
    </div>
  );
}
