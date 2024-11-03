import { json } from "@remix-run/node";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { ProductModel } from "@/models/ProductModel";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const page = Number(url.searchParams.get('page')) || 1;
  const sort = url.searchParams.get('sort') || 'id';
  const direction = (url.searchParams.get('direction') || 'asc') as 'asc' | 'desc';

  const { products, totalProducts, totalPages } = await ProductModel.getPaginated({
    page,
    sort,
    direction
  });

  return json({
    products,
    totalProducts,
    page,
    totalPages
  });
}