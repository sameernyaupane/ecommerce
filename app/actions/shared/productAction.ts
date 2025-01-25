import { json } from "@remix-run/node";
import { parseWithZod } from "@conform-to/zod";
import { ProductModel } from "@/models/ProductModel";
import { productSchema } from "@/schemas/productSchema";
import { ProductGalleryImageModel } from "@/models/ProductGalleryImageModel";

export async function handleProductAction(formData: FormData, vendorId?: number) {
  const intent = formData.get("intent")?.toString();

  // Handle Delete Intent
  if (intent === "delete") {
    const id = formData.get("id")?.toString();

    if (!id) {
      return json({ error: "Invalid product ID" }, { status: 400 });
    }

    try {
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

    const productData = {
      name,
      description,
      price,
      stock,
      category_id,
      ...(userId && { user_id: userId }), // Only include user_id if provided
    };

    if (id) {
      product = await ProductModel.update(parseInt(id, 10), productData);

      if (gallery_images?.length > 0) {
        await ProductGalleryImageModel.updateAllImagesToNotMain(parseInt(id, 10));
        
        let parsedGalleryImages = parseGalleryImages(gallery_images);

        const newImages = parsedGalleryImages
          .filter((img: any) => !img.id)
          .map((img: any) => ({
            image_name: typeof img.image_name === 'string' ? img.image_name : undefined,
            is_main: Boolean(img.is_main),
          }))
          .filter(img => img.image_name !== undefined);

        if (newImages.length > 0) {
          await ProductGalleryImageModel.createMany(parseInt(id, 10), newImages);
        }

        const existingImages = parsedGalleryImages
          .filter((img: any) => img.id && img.is_main);
        
        for (const img of existingImages) {
          await ProductGalleryImageModel.update(img.id, { is_main: true });
        }
      }
    } else {
      product = await ProductModel.create(productData);

      if (gallery_images?.length > 0) {
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

function parseGalleryImages(gallery_images: any) {
  try {
    const initialArray = Array.isArray(gallery_images) ? gallery_images : [gallery_images];
    
    return initialArray.map(item => {
      let parsed = item;
      while (typeof parsed === 'string') {
        try {
          parsed = JSON.parse(parsed);
        } catch (e) {
          break;
        }
      }
      return parsed;
    }).flat();
  } catch (e) {
    console.error('Error parsing gallery_images:', e);
    throw new Error('Invalid gallery images format');
  }
} 