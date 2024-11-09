import { json } from "@remix-run/node";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { OrderModel } from "@/models/OrderModel";

const ITEMS_PER_PAGE = 10;

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const page = Number(url.searchParams.get('page')) || 1;
  const sort = url.searchParams.get('sort') || 'created_at';
  const direction = (url.searchParams.get('direction') || 'desc') as 'asc' | 'desc';

  const paginatedResult = await OrderModel.getPaginated({
    page,
    limit: ITEMS_PER_PAGE,
    sort,
    direction,
  });

  return json({
    orders: paginatedResult.orders,
    totalOrders: paginatedResult.totalOrders,
    totalPages: paginatedResult.totalPages,
  });
} 