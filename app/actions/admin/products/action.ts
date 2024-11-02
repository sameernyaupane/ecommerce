import { json } from "@remix-run/node";
import { parseWithZod } from "@conform-to/zod";
import { ProductModel } from "@/models/ProductModel";
import type { ActionFunctionArgs } from "@remix-run/node";
import { productSchema } from "@/schemas/productSchema";
import { ProductGalleryImageModel } from "@/models/ProductGalleryImageModel";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent")?.toString();

  // Handle Delete Intent
  if (intent === "delete") {
    const id = formData.get("id")?.toString();

    if (!id) {
      return json({ error: "Invalid product ID" }, { status: 400 });
    }

    try {
      // Soft delete the product and its associated gallery images
      await ProductModel.delete(parseInt(id, 10));
      return json({ success: true });
    } catch (error) {
      console.error("Error deleting product:", error);
      return json({ error: "Failed to delete product" }, { status: 500 });
    }
  }

  // Handle Create/Update Intents
  const submission = parseWithZod(formData, { schema: productSchema });

  if (submission.status !== "success") {
    return json(submission.reply(), { status: 400 });
  }

  try {
    let product;
    const { id, name, description, price, stock, gallery_images } = submission.value;

    if (id) {
      // **Update Existing Product**
      product = await ProductModel.update(parseInt(id, 10), {
        name,
        description,
        price,
        stock,
      });

      if (gallery_images && gallery_images.length > 0) {
        // Unset all `is_main` flags before updating images
        await ProductGalleryImageModel.updateAllImagesToNotMain(parseInt(id, 10));

        // Filter out new images (without id) and prepare data for batch insertion
        const newImages = gallery_images
          .filter(img => !img.id)
          .map(img => ({
            image_name: img.image_name,
            is_main: img.is_main ?? false,
          }));

        if (newImages.length > 0) {
          await ProductGalleryImageModel.createMany(parseInt(id, 10), newImages);
        }

        // Only update existing images that have `is_main: true`
        const existingImages = gallery_images.filter(img => img.id && img.is_main);
        for (const img of existingImages) {
          await ProductGalleryImageModel.update(img.id, { is_main: true });
        }
      }
    } else {
      // **Create New Product**
      product = await ProductModel.create({
        name,
        description,
        price,
        stock,
      });

      if (gallery_images && gallery_images.length > 0) {
        // Insert all images, including the one marked as `is_main`
        const newImages = gallery_images.map(img => ({
          image_name: img.image_name,
          is_main: img.is_main ?? false,
        }));

        await ProductGalleryImageModel.createMany(product.id, newImages);
      }
    }

    return json({ success: true });
  } catch (error) {
    console.error("Error saving product:", error);
    return json({ error: "Submission failed due to server error." }, { status: 500 });
  }
}
