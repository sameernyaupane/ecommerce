import type { ActionFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { uploadImageToTempFolder } from "@/utils/upload";
import { requireAuth } from "@/controllers/auth";

export const action: ActionFunction = async ({ request }) => {
  await requireAuth(request);
  const formData = await request.formData();
  const imageFile = formData.get("image");

  if (!imageFile || !(imageFile instanceof File)) {
    return json({ error: "No image provided" }, { status: 400 });
  }

  const imageName = await uploadImageToTempFolder(imageFile, "profiles");

  return json({
    success: true,
    imageName,
  });
};

export const loader = () => {
  throw new Response("Not Found", { status: 404 });
}; 