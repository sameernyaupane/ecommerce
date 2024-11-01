// app/routes/upload-images.tsx
import type { ActionFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { uploadImageToTempFolder } from "@/utils/upload";

export const action: ActionFunction = async ({ request }) => {
  try {
    const formData = await request.formData();

    // Initialize variables to hold image data
    let mainImage: { name: string; path: string } | null = null;
    const galleryImages: { name: string; path: string }[] = [];

    // Check if a main image is included
    const mainImageFile = formData.get("image");
    if (mainImageFile && mainImageFile instanceof File) {
      const { name, path: imagePath } = await uploadImageToTempFolder(mainImageFile);
      mainImage = { name, path: imagePath };
    }

    // Check if gallery images are included
    const galleryImageFiles = formData.getAll("images");
    if (galleryImageFiles.length > 0) {
      // Filter out any non-File entries
      const validGalleryFiles = galleryImageFiles.filter(
        (file): file is File => file instanceof File
      );

      const uploadedGalleryImages = await Promise.all(
        validGalleryFiles.map((file) => uploadImageToTempFolder(file))
      );

      galleryImages.push(...uploadedGalleryImages);
    }

    // Return the uploaded image data
    return json({
      success: true,
      mainImage,
      galleryImages,
    });
  } catch (error) {
    console.error("Error uploading images:", error);
    return json({ error: "Failed to upload images" }, { status: 500 });
  }
};

export const loader = () => {
  // Prevent GET requests
  throw new Response("Not Found", { status: 404 });
};
