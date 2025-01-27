import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { requireRole } from "@/controllers/auth";
import { OrderModel } from "@/models/OrderModel";

const ITEMS_PER_PAGE = 10;

export async function loader({ request }: LoaderFunctionArgs) {
  await requireRole(['admin'])(request);
  
  const url = new URL(request.url);
  const page = Number(url.searchParams.get('page')) || 1;
  const sort = url.searchParams.get('sort') || 'created_at';
  const direction = url.searchParams.get('direction') || 'desc';
  const status = url.searchParams.get('status') || undefined;

  console.log('Admin Order Loader Params:', {
    page,
    sort,
    direction,
    status
  });

  const [orders, totalOrders] = await Promise.all([
    OrderModel.getPaginated({
      page,
      limit: ITEMS_PER_PAGE,
      sort,
      direction: direction as 'asc' | 'desc',
      status
    }),
    OrderModel.count({ status })
  ]);

  console.log('Orders Found:', orders.length);
  console.log('Total Orders:', totalOrders);

  return json({
    orders: orders.orders,
    totalOrders,
    totalPages: Math.ceil(totalOrders / ITEMS_PER_PAGE)
  });
} 