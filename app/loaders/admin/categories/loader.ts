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
    // Get paginated and sorted categories
    const { categories, totalCategories } = await CategoryModel.getPaginated({
      page,
      limit: ITEMS_PER_PAGE,
      sort,
      direction,
    });

    // Calculate total pages
    const totalPages = Math.ceil(totalCategories / ITEMS_PER_PAGE);

    return json({
      categories,
      totalCategories,
      totalPages,
    });
  } catch (error) {
    console.error("Error loading categories:", error);
    return json({ 
      categories: [], 
      totalCategories: 0, 
      totalPages: 0,
      error: "Failed to load categories" 
    }, { 
      status: 500 
    });
  }
} 