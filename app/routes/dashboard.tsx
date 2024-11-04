import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, Outlet, useLocation } from "@remix-run/react";
import { requireAuth } from "@/controllers/auth";
import DashboardContent from "@/components/DashboardContent";
import UserSidebar from "@/components/ui/user-sidebar";

// Sample data imports (you'll replace these with real data)
import { stats } from "@/sample-data/stats";
import { chartData } from "@/sample-data/chartData";
import { recentOrders } from "@/sample-data/recentOrders";

export async function loader({ request }: LoaderFunctionArgs) {
  await requireAuth(request);
  return json({ stats, chartData, recentOrders });
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