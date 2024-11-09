import { json, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { parseWithZod } from "@conform-to/zod";
import { getAuthUser } from "@/controllers/auth";
import { UserModel } from "@/models/UserModel";
import { changePasswordSchema, setPasswordSchema } from "@/schemas/passwordSchema";
import { PasswordForm } from "@/components/PasswordForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export async function loader({ request }: LoaderFunctionArgs) {
  const authResult = await getAuthUser(request);
  
  if (!authResult?.data) {
    throw json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await UserModel.findByIdForPassword(Number(authResult.data.id));
  if (!user) {
    throw json({ error: "User not found" }, { status: 404 });
  }

  console.log('Loader user data:', {
    id: user.id,
    hasPassword: user.has_password,
    hasGoogleId: !!user.google_id,
    email: user.email
  });

  return json({ user });
}

export default function PasswordPage() {
  const { user } = useLoaderData<typeof loader>();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Password Settings</h1>
        <p className="text-muted-foreground">
          Manage your account password
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>
            {user.google_id && !user.password
              ? "Set up a password to enable email/password login"
              : "Update your password to keep your account secure"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PasswordForm 
            user={user}
            onSuccess={() => {
              // Could add navigation here if needed
              // navigate("/dashboard/profile");
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}

export async function action({ request }: ActionFunctionArgs) {
  const user = await requireAuth(request);
  
  const userWithHash = await UserModel.findByIdWithPasswordHash(user.id);
  if (!userWithHash) {
    throw new Error("User not found");
  }

  const formData = await request.formData();
  const shouldRequireCurrentPassword = userWithHash.has_password && !userWithHash.google_id;
  const submission = parseWithZod(formData, { 
    schema: shouldRequireCurrentPassword ? changePasswordSchema : setPasswordSchema 
  });

  if (submission.status !== "success") {
    return json(submission.reply());
  }

  try {
    if (shouldRequireCurrentPassword) {
      const isValid = await UserModel.comparePassword(
        submission.value.currentPassword,
        userWithHash.password
      );

      if (!isValid) {
        return json(
          submission.reply({
            fieldErrors: {
              currentPassword: ["Current password is incorrect"]
            }
          }),
          { status: 400 }
        );
      }
    }

    const user = await UserModel.findByIdForPassword(Number(authResult.data.id));
    if (!user) {
      throw new Error("User not found");
    }

    await UserModel.update(Number(authResult.data.id), {
      ...user,
      password: submission.value.newPassword
    });

    return json({ 
      success: true,
      message: !user.has_password
        ? "Password set successfully. You can now login with your email and password."
        : "Password updated successfully"
    });
  } catch (error: any) {
    console.error("Password update error:", error);
    return json(
      submission.reply({
        error: error.message || "Failed to update password"
      }),
      { status: 400 }
    );
  }
} 