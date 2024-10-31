import { json } from "@remix-run/node";
import { ProductModel } from "@/models/product";
import type { LoaderFunctionArgs} from "@remix-run/node";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const products = await ProductModel.getAll();
    return json({ products });
  } catch (error) {
    console.error("Error loading products:", error);
    throw new Response("Failed to load products", { status: 500 });
  }
}