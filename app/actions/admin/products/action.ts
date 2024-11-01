import { json } from "@remix-run/node";
import { parseWithZod } from "@conform-to/zod";
import { ProductModel } from "@/models/ProductModel";
import type { ActionFunctionArgs } from "@remix-run/node";
import { productSchema } from "@/schemas/productSchema";
import { 
  processUploadedFile, 
} from "@/utils/image-upload";

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

  /* try {
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
  } */
  try {
    // Process main image
    const mainImageFile = formData.get("mainImage") as File | null;
    const mainImageUrl = await processUploadedFile(mainImageFile);

    if (!mainImageUrl && !formData.get("id")) {
      return json({
        success: false,
        error: "Main image is required for new products"
      }, { status: 400 });
    }

    // Process gallery images
    const galleryFiles = formData.getAll("galleryImages") as File[];
    const galleryUrls = await Promise.all(
      galleryFiles.map(file => processUploadedFile(file))
    );
    
    // Filter out null values from gallery URLs
    const validGalleryUrls = galleryUrls.filter((url): url is string => url !== null);

    const productData = {
      name: submission.value.name,
      description: submission.value.description,
      price: parseFloat(submission.value.price),
      stock: parseInt(submission.value.stock),
    };

    // Update or create product
    const productId = formData.get("id") as string | null;
    
    if (productId) {
      // Update existing product
      await ProductModel.update(productId, productData);
      if (mainImageUrl || validGalleryUrls.length > 0) {
        await ProductImageModel.updateGalleryImages(productId, validGalleryUrls);
        if (mainImageUrl) {
          await sql`
            UPDATE products 
            SET main_image_url = ${mainImageUrl}
            WHERE id = ${productId}
          `;
        }
      }
    } else {
      // Create new product
      const product = await ProductModel.create(productData);
      await ProductImageModel.create({
        productId: product.id,
        mainImageUrl,
        galleryImageUrls: validGalleryUrls
      });
    }

    return json({ success: true });

  } catch (error) {
    console.error('Error processing product:', error);
    return json({
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    }, { status: 500 });
  }
}
