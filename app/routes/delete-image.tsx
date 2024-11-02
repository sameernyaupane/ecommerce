// app/routes/delete-image.tsx
import type { ActionFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { ProductGalleryImageModel } from "@/models/ProductGalleryImageModel";
import { deleteImageFromServer } from "@/utils/upload"; // Ensure this utility is properly implemented

export const action: ActionFunction = async ({ request }) => {
  try {
    const formData = await request.formData();
    const id = formData.get("id");
    const imageName = formData.get("image_name");

    if (id) {
      // **Soft Delete:** If 'id' exists, perform a soft delete
      const parsedId = parseInt(id.toString(), 10);
      if (isNaN(parsedId)) {
        return json({ error: "Invalid image ID." }, { status: 400 });
      }

      const success = await ProductGalleryImageModel.softDelete(parsedId);
      if (!success) {
        return json({ error: "Image not found or already deleted." }, { status: 404 });
      }

      return json({ success: true, message: "Image soft deleted successfully." });
    } else if (imageName) {
      // **Hard Delete:** If 'id' does not exist but 'imageName' is provided, perform a hard delete
      // Ensure that 'imageName' corresponds to a temporary image or an image not yet associated with a product
      await deleteImageFromServer(imageName);

      // Optionally, delete any temporary records if applicable
      // For example, if you have a temp_images table, you can remove the record here
      // await TempImageModel.deleteByImageName(imageName);

      return json({ success: true, message: "Image hard deleted successfully." });
    } else {
      return json({ error: "No image identifier provided." }, { status: 400 });
    }
  } catch (error) {
    console.error("Error in /delete-image action:", error);
    return json({ error: "Failed to delete image." }, { status: 500 });
  }
};

export const loader = () => {
  // Prevent GET requests
  throw new Response("Not Found", { status: 404 });
};
