import { json } from "@remix-run/node";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { CategoryModel } from "@/models/CategoryModel";

const ITEMS_PER_PAGE = 10;

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const page = Number(url.searchParams.get("page")) || 1;
  const sort = url.searchParams.get("sort") || "id";
  const direction = url.searchParams.get("direction") || "asc";

  try {
    // Get both paginated and all categories in parallel
    const [paginatedResult, allCategories] = await Promise.all([
      CategoryModel.getPaginated({
        page,
        limit: ITEMS_PER_PAGE,
        sort,
        direction,
      }),
      CategoryModel.getAll()
    ]);

    const { categories, totalCategories } = paginatedResult;
    const totalPages = Math.ceil(totalCategories / ITEMS_PER_PAGE);

    return json({
      categories,
      allCategories,
      totalCategories,
      totalPages,
    });
  } catch (error) {
    console.error("Error loading categories:", error);
    return json({ 
      categories: [], 
      allCategories: [],
      totalCategories: 0, 
      totalPages: 0,
      error: "Failed to load categories" 
    }, { 
      status: 500 
    });
  }
} 