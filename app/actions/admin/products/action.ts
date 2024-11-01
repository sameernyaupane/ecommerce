import { json } from "@remix-run/node";
import { parseWithZod } from "@conform-to/zod";
import { ProductModel } from "@/models/ProductModel";
import type { ActionFunctionArgs } from "@remix-run/node";
import { productSchema } from "@/schemas/productSchema";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent")?.toString();

  if (intent === "delete") {
    const id = formData.get("id")?.toString();
    if (!id) return json({ error: "Invalid product ID" }, { status: 400 });
    
    try {
      await ProductModel.delete(id);
      return json({ success: true });
    } catch (error) {
      return json({ error: "Failed to delete product" }, { status: 500 });
    }
  }

  const submission = parseWithZod(formData, { schema: productSchema });

  if (submission.status !== 'success') {
    return json(submission.reply());
  }

  try {
    if (submission.value.id) {
      await ProductModel.update(submission.value.id, submission.value);
    } else {
      await ProductModel.create(submission.value);
    }
    return json({ success: true });
  } catch (error) {
    console.error("Error saving product:", error);
    return json(
      {
        ...submission,
        error: "Failed to save product, please try again.",
      },
      { status: 500 }
    );
  }
}
