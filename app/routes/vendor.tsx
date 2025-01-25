import { redirect, json, type LoaderFunctionArgs } from "@remix-run/node";
import { 
  Outlet, 
  useLocation, 
  useLoaderData, 
  useNavigation,
  useRouteError,
  isRouteErrorResponse 
} from "@remix-run/react";
import Sidebar from "@/components/vendor/sidebar";
import { requireVendor } from "@/controllers/auth";
import DashboardContent from "@/components/vendor/DashboardContent";
import { DashboardModel } from "@/models/DashboardModel";
import { ProductModel } from "@/models/ProductModel";

export async function loader({ request }: LoaderFunctionArgs) {
  const { vendorDetails, ...user } = await requireVendor(request);
  
  if (!vendorDetails?.id) {
    throw json(
      { message: "Vendor details not found", status: 404 },
      { status: 404 }
    );
  }

  // Only load dashboard data if we're on the base vendor route
  const url = new URL(request.url);
  const isBaseRoute = url.pathname === "/vendor";
  
  if (isBaseRoute) {
    const [stats, chartData, recentOrders, productCount] = await Promise.all([
      DashboardModel.getStats(false, vendorDetails.id, true),
      DashboardModel.getChartData(false, vendorDetails.id, true),
      DashboardModel.getRecentOrders(false, vendorDetails.id, true),
      ProductModel.countByVendor(vendorDetails.user_id)
    ]);
    
    return json({ 
      user,
      vendorDetails: {
        ...vendorDetails,
        product_count: productCount
      },
      stats, 
      chartData, 
      recentOrders 
    });
  }
  
  // For other routes, just return user and vendor details with product count
  const productCount = await ProductModel.countByVendor(vendorDetails.user_id);
  
  return json({ 
    user,
    vendorDetails: {
      ...vendorDetails,
      product_count: productCount
    }
  });
}

export default function Vendor() {
  const { user, vendorDetails } = useLoaderData<typeof loader>();
  const location = useLocation();
  const navigation = useNavigation();
  const isBaseRoute = location.pathname === "/vendor";
  const isLoading = navigation.state === "loading";

  console.log(vendorDetails)

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
          <Sidebar vendorDetails={vendorDetails} />
        </aside>
        <main className="flex-1 border rounded-lg p-4 md:p-8">
          {isBaseRoute ? (
            <DashboardContent 
              user={user}
              vendorDetails={vendorDetails}
              stats={useLoaderData<typeof loader>().stats}
              chartData={useLoaderData<typeof loader>().chartData}
              recentOrders={useLoaderData<typeof loader>().recentOrders}
            />
          ) : (
            <Outlet />
          )}
        </main>
      </div>
    </div>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  
  let message = "You do not have permission to access the vendor area";
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
          {status === 403 ? (
            <div className="space-y-4">
              <p className="text-sm">
                To become a vendor, please complete the vendor registration process.
              </p>
              <a 
                href="/vendor-registration"
                className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
              >
                Register as Vendor
              </a>
            </div>
          ) : (
            <a 
              href="/"
              className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
            >
              Return to Home
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
