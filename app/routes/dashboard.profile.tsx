import { json, type LoaderFunctionArgs, type ActionFunctionArgs, redirect } from "@remix-run/node";
import { useLoaderData, useFetcher } from "@remix-run/react";
import { requireAuth } from "@/controllers/auth";
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

const profileSchema = z.object({
  id: z.string(),
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  profile_image: z.string().optional(),
});

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireAuth(request);

  // Get complete user data from database
  const userData = await UserModel.findById(Number(user.id));
  if (!userData) {
    throw new Error("User not found");
  }

  return json(
    { user: userData }
  );
}

export async function action({ request }: ActionFunctionArgs) {
  const user = await requireAuth(request);
  
  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema: profileSchema });

  if (submission.status !== "success") {
    return json(submission.reply());
  }

  try {
    const updatedUser = await UserModel.update(user.id, {
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
      </div>
    </div>
  );
} 