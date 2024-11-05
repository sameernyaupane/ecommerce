import { json } from "@remix-run/node";
import { ProductModel } from "@/models/ProductModel";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const productIds = url.searchParams.get("productIds")?.split(",");

  if (!productIds) {
    return json({ products: [] });
  }

  try {
    const products = await Promise.all(
      productIds.map(id => ProductModel.findById(parseInt(id, 10)))
    );

    // Filter out any null values (products that weren't found)
    const validProducts = products.filter((p): p is NonNullable<typeof p> => p !== null);

    return json({ products: validProducts });
  } catch (error) {
    console.error("Error fetching cart products:", error);
    return json({ error: "Failed to fetch products" }, { status: 500 });
  }
} 