import type { ActionFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { uploadImageToTempFolder } from "@/utils/upload";

export const action: ActionFunction = async ({ request }) => {
  try {
    const formData = await request.formData();
    const imageFile = formData.get("image");

    if (!imageFile || !(imageFile instanceof File)) {
      return json({ error: "No image provided" }, { status: 400 });
    }

    const imageName = await uploadImageToTempFolder(imageFile, "categories");

    return json({
      success: true,
      imageName,
    });
  } catch (error) {
    console.error("Error uploading category image:", error);
    return json({ error: "Failed to upload image" }, { status: 500 });
  }
};

export const loader = () => {
  throw new Response("Not Found", { status: 404 });
}; 