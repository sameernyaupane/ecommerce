import { json } from "@remix-run/node";
import type { ActionFunctionArgs } from "@remix-run/node";
import { CategoryModel } from "@/models/CategoryModel";
import { parseWithZod } from "@conform-to/zod";
import { categorySchema } from "@/schemas/categorySchema";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "delete") {
    const id = formData.get("id");
    if (!id) return json({ error: "ID is required" }, { status: 400 });

    try {
      await CategoryModel.delete(Number(id));
      return json({ success: true });
    } catch (error) {
      console.error("Error deleting category:", error);
      return json({ error: "Failed to delete category" }, { status: 500 });
    }
  }

  const submission = parseWithZod(formData, {
    schema: categorySchema,
  });

  if (submission.status !== "success") {
    return json(submission.reply());
  }

  try {
    const categoryData = submission.value;
    
    if (categoryData.id) {
      await CategoryModel.update(categoryData.id, categoryData);
    } else {
      await CategoryModel.create(categoryData);
    }

    return json({ success: true });
  } catch (error: any) {
    console.error("Error saving category:", error);
    
    if (error.message.includes("maximum depth")) {
      return json(
        submission.reply({
          formErrors: [error.message]
        }), 
        { status: 400 }
      );
    }

    return json(
      submission.reply({
        formErrors: ["An unexpected error occurred"]
      }), 
      { status: 500 }
    );
  }
} 