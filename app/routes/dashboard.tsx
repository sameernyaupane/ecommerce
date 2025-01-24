import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, Outlet, useLocation } from "@remix-run/react";
import { requireAuth } from "@/controllers/auth";
import { DashboardModel } from "@/models/DashboardModel";
import DashboardContent from "@/components/DashboardContent";
import UserSidebar from "@/components/ui/user-sidebar";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireAuth(request);
  
  try {
    const [stats, chartData, recentOrders] = await Promise.all([
      DashboardModel.getStats(false, user.id, false),
      DashboardModel.getChartData(false, user.id, false),
      DashboardModel.getRecentOrders(false, user.id, false)
    ]);
    return json({ stats, chartData, recentOrders, user });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return json({ stats: [], chartData: [], recentOrders: [], user, error: error.message }, { status: 500 });
  }
}

export default function Dashboard() {
  const location = useLocation();
  const isBaseRoute = location.pathname === "/dashboard";

  return (
    <div className="flex flex-col min-h-screen container max-w-7xl py-2">
      <div className="flex flex-1 gap-4">
        <aside className="hidden md:block w-48">
          <UserSidebar />
        </aside>

        <main className="flex-1 border rounded-lg p-4 md:p-8">
          {isBaseRoute ? <DashboardContent /> : <Outlet />}
        </main>
      </div>
    </div>
  );
} 