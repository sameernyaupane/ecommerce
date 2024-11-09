import { redirect, json, type LoaderFunctionArgs } from "@remix-run/node";
import { 
  Outlet, 
  useLocation, 
  useLoaderData, 
  useNavigation,
  useRouteError,
  isRouteErrorResponse 
} from "@remix-run/react";
import Sidebar from "@/components/ui/sidebar";
import { requireRole } from "@/controllers/auth";
import AdminDashboardContent from "@/components/admin/AdminDashboardContent";
import { DashboardModel } from "@/models/DashboardModel";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireRole(['admin'])(request);
  
  const [stats, chartData, recentOrders] = await Promise.all([
    DashboardModel.getStats(true),
    DashboardModel.getChartData(true),
    DashboardModel.getRecentOrders(true)
  ]);
  
  return json({ user, stats, chartData, recentOrders });
}

export default function Admin() {
  const { user } = useLoaderData<typeof loader>();
  const location = useLocation();
  const navigation = useNavigation();
  const isBaseRoute = location.pathname === "/admin";
  const isLoading = navigation.state === "loading";

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen container max-w-7xl py-2">
      <div className="flex flex-1 gap-4">
        <aside className="hidden md:block w-48">
          <Sidebar />
        </aside>
        <main className="flex-1 border rounded-lg p-4 md:p-8">
          {isBaseRoute ? <AdminDashboardContent /> : <Outlet />}
        </main>
      </div>
    </div>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  console.log("Admin Error Boundary:", error); // Add this log
  
  let message = "You do not have permission to access this area";
  let status = 403;

  if (isRouteErrorResponse(error)) {
    message = error.data?.message || message;
    status = error.status;
  } else if (error instanceof Error) {
    message = error.message;
    status = 500;
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="bg-destructive/10 text-destructive p-8 rounded-lg max-w-md mx-auto">
          <h1 className="text-2xl font-semibold mb-4">{status}</h1>
          <p className="mb-4">{message}</p>
          <a 
            href="/"
            className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
          >
            Return to Home
          </a>
        </div>
      </div>
    </div>
  );
}
