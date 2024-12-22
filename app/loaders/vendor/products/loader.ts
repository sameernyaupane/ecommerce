import { json } from "@remix-run/node";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { ProductModel } from "@/models/ProductModel";
import { CategoryModel } from "@/models/CategoryModel";
import { requireVendor } from "@/controllers/auth";

const ITEMS_PER_PAGE = 10;

export async function loader({ request }: LoaderFunctionArgs) {
  const vendor = await requireVendor(request);
  const url = new URL(request.url);
  const page = Number(url.searchParams.get('page')) || 1;
  const sort = url.searchParams.get('sort') || 'id';
  const direction = (url.searchParams.get('direction') || 'asc') as 'asc' | 'desc';

  const [paginatedResult, allCategories] = await Promise.all([
    ProductModel.getPaginated({
      page,
      limit: ITEMS_PER_PAGE,
      sort,
      direction,
      vendorId: vendor.id
    }),
    CategoryModel.getAll()
  ]);

  return json({
    products: paginatedResult.products,
    allCategories,
    totalProducts: paginatedResult.totalProducts,
    totalPages: paginatedResult.totalPages,
  });
}