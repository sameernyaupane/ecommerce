import { json } from "@remix-run/node";
import { parseWithZod } from "@conform-to/zod";
import { createUserSchema, editUserSchema } from "@/schemas/userSchema";
import { UserModel } from "@/models/UserModel";
import { requireAuth } from "@/controllers/auth";
import { deleteImageFromServer } from "@/utils/upload";

export async function action({ request }: { request: Request }) {
  //await requireAuth(request);
  
  const formData = await request.formData();
  const intent = formData.get("intent")?.toString();

  // Handle delete intent
  if (intent === "delete") {
    const id = formData.get("id")?.toString();
    if (!id) {
      return json({ error: "Invalid user ID" }, { status: 400 });
    }

    try {
      // Get user profile image before deletion
      const user = await UserModel.findById(parseInt(id, 10));
      if (user?.profile_image) {
        await deleteImageFromServer(user.profile_image, "profiles");
      }
      
      // Delete the user
      await UserModel.delete(parseInt(id, 10));
      return json({ success: true });
    } catch (error) {
      console.error("Error deleting user:", error);
      return json({ error: "Failed to delete user" }, { status: 500 });
    }
  }

  // Handle create/update intents
  const submission = parseWithZod(formData, {
    schema: formData.get("id") ? editUserSchema : createUserSchema,
  });

  if (submission.status !== "success") {
    return json(submission.reply(), { status: 400 });
  }

  try {
    const userData = submission.value;
    const isUpdate = userData.id !== undefined;

    if (isUpdate) {
      const updatedUser = await UserModel.update(userData.id, {
        name: userData.name,
        email: userData.email,
        password: userData.password, // Optional, will be handled by UserModel
        profileImage: userData.profile_image
      });

      return json({ 
        success: true, 
        message: "User edited successfully.",
        user: updatedUser 
      });
    } else {
      const newUser = await UserModel.create({
        name: userData.name,
        email: userData.email,
        password: userData.password,
        profileImage: userData.profile_image
      });

      return json({ 
        success: true, 
        message: "User created successfully.",
        user: newUser 
      });
    }
  } catch (error: any) {
    console.error("Error processing user:", error);
    
    // Handle unique constraint violation
    if (error.code === '23505') {
      return json(
        submission.reply({
          formErrors: ["Email already exists"]
        }), 
        { status: 400 }
      );
    }

    // Handle other database errors
    return json(
      submission.reply({
        formErrors: ["An unexpected error occurred"]
      }), 
      { status: 500 }
    );
  }
} 