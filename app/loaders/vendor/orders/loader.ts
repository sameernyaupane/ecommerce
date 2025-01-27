import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { requireVendor } from "@/controllers/auth";
import { OrderModel } from "@/models/OrderModel";

const ITEMS_PER_PAGE = 10;

export async function loader({ request }: LoaderFunctionArgs) {
  const { vendorDetails } = await requireVendor(request);
  
  if (!vendorDetails?.id) {
    throw json(
      { message: "Vendor details not found", status: 404 },
      { status: 404 }
    );
  }

  const url = new URL(request.url);
  const page = Number(url.searchParams.get("page")) || 1;
  const sortField = url.searchParams.get("sortField") || "created_at";
  const sortDirection = url.searchParams.get("sortDirection") || "desc";
  const status = url.searchParams.get("status") || undefined;

  console.log('Vendor Order Loader Params:', {
    vendorId: vendorDetails.id,
    page,
    sortField,
    sortDirection,
    status
  });

  const [orders, totalOrders] = await Promise.all([
    OrderModel.findByVendor(vendorDetails.id, {
      page,
      limit: ITEMS_PER_PAGE,
      sortField,
      sortDirection,
      status
    }),
    OrderModel.countByVendor(vendorDetails.id, { status })
  ]);

  console.log('Orders Found:', orders.length);
  console.log('Total Orders:', totalOrders);

  return json({
    orders,
    totalOrders,
    totalPages: Math.ceil(totalOrders / ITEMS_PER_PAGE)
  });
} 