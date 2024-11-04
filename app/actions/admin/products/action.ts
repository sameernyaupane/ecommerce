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
    const { id, name, description, price, stock, category_id, gallery_images } = submission.value;

    if (id) {
      // **Update Existing Product**
      product = await ProductModel.update(parseInt(id, 10), {
        name,
        description,
        price,
        stock,
        category_id,
      });

      if (gallery_images && gallery_images.length > 0) {
        // Unset all `is_main` flags before updating images
        await ProductGalleryImageModel.updateAllImagesToNotMain(parseInt(id, 10));

        // Ensure proper parsing of gallery_images
        let parsedGalleryImages;
        try {
          // First, ensure we're working with an array
          const initialArray = Array.isArray(gallery_images) ? gallery_images : [gallery_images];
          
          // Parse each item in the array if it's a string
          parsedGalleryImages = initialArray.map(item => {
            let parsed = item;
            while (typeof parsed === 'string') {
              try {
                parsed = JSON.parse(parsed);
              } catch (e) {
                break;
              }
            }
            return parsed;
          }).flat(); // Flatten in case we have nested arrays
        } catch (e) {
          console.error('Error parsing gallery_images:', e);
          throw new Error('Invalid gallery images format');
        }

        console.log('Parsed gallery images:', parsedGalleryImages);

        // Filter out new images (without id) and prepare data for batch insertion
        const newImages = parsedGalleryImages
          .filter((img: any) => !img.id)
          .map((img: any) => ({
            image_name: typeof img.image_name === 'string' ? img.image_name : undefined,
            is_main: Boolean(img.is_main),
          }))
          .filter(img => img.image_name !== undefined); // Filter out any images with undefined names

        if (newImages.length > 0) {
          await ProductGalleryImageModel.createMany(parseInt(id, 10), newImages);
        }

        console.log('New images to insert:', newImages);

        // Only update existing images that have `is_main: true`
        const existingImages = parsedGalleryImages
          .filter((img: any) => img.id && img.is_main);

        console.log('Existing images to update:', existingImages);
        
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
        category_id,
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
