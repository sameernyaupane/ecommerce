import { json, type LoaderFunctionArgs, type ActionFunctionArgs, redirect } from "@remix-run/node";
import { useLoaderData, useFetcher } from "@remix-run/react";
import { getAuthUser } from "@/controllers/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getFormProps, getInputProps, useForm } from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod';
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { Loader2, XCircleIcon } from "lucide-react";
import { UserModel } from "@/models/UserModel";
import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { changePasswordSchema } from "@/schemas/passwordSchema";

const profileSchema = z.object({
  id: z.string(),
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  profile_image: z.string().optional(),
});

export async function loader({ request }: LoaderFunctionArgs) {
  const authResult = await getAuthUser(request);
  
  if (!authResult?.data) {
    const searchParams = new URLSearchParams([
      ["redirectTo", new URL(request.url).pathname]
    ]);
    throw redirect(`/login?${searchParams}`);
  }

  // Get complete user data from database
  const user = await UserModel.findById(Number(authResult.data.id));
  if (!user) {
    throw new Error("User not found");
  }

  return json(
    { user },
    {
      headers: authResult.headers || undefined
    }
  );
}

export async function action({ request }: ActionFunctionArgs) {
  const authResult = await getAuthUser(request);
  
  if (!authResult?.data) {
    throw json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const intent = formData.get("intent");

  // Handle password change
  if (intent === "changePassword") {
    const submission = parseWithZod(formData, { schema: changePasswordSchema });

    if (submission.status !== "success") {
      return json(submission.reply());
    }

    try {
      // Get current user with password
      const user = await UserModel.findById(authResult.data.id);
      if (!user) {
        throw new Error("User not found");
      }

      // Verify current password
      const isValid = await UserModel.comparePassword(
        submission.value.currentPassword,
        user.password
      );

      if (!isValid) {
        return json(
          submission.reply({
            formErrors: ["Current password is incorrect"]
          }),
          { status: 400 }
        );
      }

      // Update password
      await UserModel.update(Number(authResult.data.id), {
        name: user.name,
        email: user.email,
        password: submission.value.newPassword
      });

      return json({ 
        success: true,
        message: "Password updated successfully" 
      });
    } catch (error: any) {
      return json(
        submission.reply({
          formErrors: [error.message || "Failed to update password"]
        }),
        { status: 400 }
      );
    }
  }

  // Handle profile update (existing code)
  const submission = parseWithZod(formData, { schema: profileSchema });

  if (submission.status !== "success") {
    return json(submission.reply());
  }

  try {
    const updatedUser = await UserModel.update(Number(authResult.data.id), {
      name: submission.value.name,
      email: submission.value.email,
      profileImage: submission.value.profile_image,
    });

    return json(
      { 
        success: true,
        message: "Profile updated successfully",
        user: updatedUser
      },
      {
        headers: authResult.headers || undefined
      }
    );
  } catch (error: any) {
    return json(
      submission.reply({
        formErrors: [error.message || "Failed to update profile"]
      }), 
      { status: 400 }
    );
  }
}

export default function DashboardProfile() {
  const { user } = useLoaderData<typeof loader>();
  const formFetcher = useFetcher();
  const deleteFetcher = useFetcher();
  const { toast } = useToast();
  const [profileImage, setProfileImage] = useState(user.profile_image || "");
  const passwordFetcher = useFetcher();
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const [form, fields] = useForm({
    id: "profile-form",
    defaultValue: {
      id: String(formFetcher.data?.user?.id || user.id || ""),
      name: formFetcher.data?.user?.name || user.name,
      email: formFetcher.data?.user?.email || user.email,
      profile_image: formFetcher.data?.user?.profile_image || user.profile_image,
      role: formFetcher.data?.user?.role || user.role,
    },
    lastResult: formFetcher.data,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: profileSchema });
    },
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  });

  const [passwordForm, passwordFields] = useForm({
    id: "password-form",
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: changePasswordSchema });
    },
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  });

  // Handle form submission result
  useEffect(() => {
    if (formFetcher.data?.success) {
      toast({
        description: formFetcher.data.message,
      });
    } else if (formFetcher.data?.error) {
      toast({
        variant: "destructive",
        description: formFetcher.data.error,
      });
    }
  }, [formFetcher.data, toast]);

  // Handle image deletion result
  useEffect(() => {
    if (deleteFetcher.state === "idle" && deleteFetcher.data) {
      if (deleteFetcher.data.success) {
        toast({
          description: "Profile image deleted successfully",
        });
      } else if (deleteFetcher.data.error) {
        toast({
          variant: "destructive",
          description: deleteFetcher.data.error || "Failed to delete image",
        });
      }
    }
  }, [deleteFetcher.state, deleteFetcher.data, toast]);

  // Handle image upload
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const imageFile = acceptedFiles[0];
    const formData = new FormData();
    formData.append("image", imageFile);

    try {
      const response = await fetch("/upload-profile-image", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (result.success) {
        setProfileImage(result.imageName);
      } else {
        toast({
          variant: "destructive",
          description: result.error || "Failed to upload image",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        description: "Error uploading image",
      });
    }
  }, [toast]);

  const { getRootProps, getInputProps: getDropzoneProps } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif']
    },
    maxFiles: 1,
  });

  const removeProfileImage = useCallback(() => {
    if (!profileImage) return;

    const formData = new FormData();
    formData.append("image_name", profileImage);
    formData.append("type", "profile");

    deleteFetcher.submit(formData, {
      method: "post",
      action: "/delete-image",
    });
    setProfileImage("");
  }, [profileImage, deleteFetcher]);

  // Handle password change result
  useEffect(() => {
    if (passwordFetcher.data?.success) {
      toast({
        description: passwordFetcher.data.message,
      });
      setShowPasswordForm(false);
    } else if (passwordFetcher.data?.error) {
      toast({
        variant: "destructive",
        description: passwordFetcher.data.error,
      });
    }
  }, [passwordFetcher.data, toast]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Profile Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>
              Member since {user.time_ago}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <formFetcher.Form 
              method="post" 
              {...getFormProps(form)}
              className="space-y-6"
            >
              <input type="hidden" {...getInputProps(fields.id, { type: "hidden" })} />

              <div className="space-y-2">
                <Label htmlFor={fields.name.id}>Name</Label>
                <Input
                  {...getInputProps(fields.name, { type: "text" })}
                  placeholder="Enter your name"
                />
                {fields.name.errors && (
                  <p className="text-red-500 text-sm">{fields.name.errors}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor={fields.email.id}>Email</Label>
                <Input
                  {...getInputProps(fields.email, { type: "email" })}
                  placeholder="Enter your email"
                />
                {fields.email.errors && (
                  <p className="text-red-500 text-sm">{fields.email.errors}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Role</Label>
                <Input
                  value={user.role}
                  disabled
                  className="bg-muted"
                />
              </div>

              <div className="space-y-2">
                <Label>Profile Image</Label>
                <input
                  type="hidden"
                  name="profile_image"
                  value={profileImage}
                />

                <div 
                  {...getRootProps()} 
                  className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50"
                >
                  <input {...getDropzoneProps()} />
                  <div className="flex flex-col items-center gap-2">
                    {profileImage ? (
                      <>
                        <div className="relative w-24 h-24">
                          <img
                            src={profileImage.startsWith('http') 
                              ? profileImage  // Google Auth image URL
                              : `/uploads/profiles/${profileImage}`}  // Local upload path
                            alt={user.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeProfileImage();
                            }}
                            className="absolute -top-2 -right-1 bg-white rounded-full p-1 shadow hover:bg-gray-200"
                          >
                            <XCircleIcon className="h-4 w-4 text-red-500" />
                          </button>
                        </div>
                        <p className="text-sm text-gray-500">Click or drop to replace image</p>
                      </>
                    ) : (
                      <>
                        <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                          <span className="text-2xl text-gray-500">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">Click or drop an image here</p>
                      </>
                    )}
                  </div>
                </div>
                {fields.profile_image?.errors && (
                  <p className="text-red-500 text-sm mt-1">{fields.profile_image.errors}</p>
                )}
                {formFetcher.data?.imageError && (
                  <p className="text-red-500 text-sm mt-1">{formFetcher.data.imageError}</p>
                )}
                {deleteFetcher.data?.error && (
                  <p className="text-red-500 text-sm mt-1">{deleteFetcher.data.error}</p>
                )}
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={formFetcher.state !== "idle"}
                >
                  {formFetcher.state !== "idle" ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </formFetcher.Form>
          </CardContent>
        </Card>

        {/* Password Management Card */}
        <Card>
          <CardHeader>
            <CardTitle>Password</CardTitle>
            <CardDescription>
              {user.google_id 
                ? "Your account is managed by Google"
                : "Change your password to keep your account secure"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {user.google_id ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  <span>Signed in with Google</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  To change your Google password, please visit your Google Account settings
                </p>
                <Button
                  variant="outline"
                  onClick={() => window.open('https://myaccount.google.com/security', '_blank')}
                  className="mt-2"
                >
                  Manage Google Account
                </Button>
              </div>
            ) : (
              // Existing password change form for non-Google users
              showPasswordForm ? (
                <passwordFetcher.Form
                  method="post"
                  {...getFormProps(passwordForm)}
                  className="space-y-4"
                >
                  <input type="hidden" name="intent" value="changePassword" />

                  <div className="space-y-2">
                    <Label htmlFor={passwordFields.currentPassword.id}>
                      Current Password
                    </Label>
                    <Input
                      {...getInputProps(passwordFields.currentPassword, { type: "password" })}
                      placeholder="Enter current password"
                    />
                    {passwordFields.currentPassword.errors && (
                      <p className="text-red-500 text-sm">{passwordFields.currentPassword.errors}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={passwordFields.newPassword.id}>
                      New Password
                    </Label>
                    <Input
                      {...getInputProps(passwordFields.newPassword, { type: "password" })}
                      placeholder="Enter new password"
                    />
                    {passwordFields.newPassword.errors && (
                      <p className="text-red-500 text-sm">{passwordFields.newPassword.errors}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={passwordFields.confirmPassword.id}>
                      Confirm New Password
                    </Label>
                    <Input
                      {...getInputProps(passwordFields.confirmPassword, { type: "password" })}
                      placeholder="Confirm new password"
                    />
                    {passwordFields.confirmPassword.errors && (
                      <p className="text-red-500 text-sm">{passwordFields.confirmPassword.errors}</p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      disabled={passwordFetcher.state !== "idle"}
                    >
                      {passwordFetcher.state !== "idle" ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        "Update Password"
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowPasswordForm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </passwordFetcher.Form>
              ) : (
                <Button 
                  variant="outline"
                  onClick={() => setShowPasswordForm(true)}
                >
                  Change Password
                </Button>
              )
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 