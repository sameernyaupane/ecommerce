import { useForm, getInputProps, getFormProps } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { useFetcher } from "@remix-run/react";
import { useEffect, useCallback, useState } from "react";
import { XCircleIcon } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createUserSchema, editUserSchema } from "@/schemas/userSchema";
import { Checkbox } from "@/components/ui/checkbox";

interface UserFormProps {
  defaultValues?: {
    id?: string;
    name?: string;
    email?: string;
    profile_image?: string;
    roles?: string[];
  };
  onSuccess?: () => void;
}

export function UserForm({ defaultValues, onSuccess }: UserFormProps) {
  const formFetcher = useFetcher();
  const deleteFetcher = useFetcher();
  const { toast } = useToast();
  const [profileImage, setProfileImage] = useState(defaultValues?.profile_image || "");
  
  const [form, fields] = useForm({
    id: "user-form",
    defaultValue: {
      id: defaultValues?.id || "",
      name: defaultValues?.name || "",
      email: defaultValues?.email || "",
      password: "",
      profile_image: profileImage,
      roles: defaultValues?.roles || [],
    },
    lastResult: formFetcher.data,
    onValidate({ formData }) {
      return parseWithZod(formData, { 
        schema: defaultValues?.id ? editUserSchema : createUserSchema 
      });
    },
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  });

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
    formData.append("type", "profile"); // Just indicate it's a profile image

    deleteFetcher.submit(formData, {
      method: "post",
      action: "/delete-image",
    });
    setProfileImage("");
  }, [profileImage, deleteFetcher]);

  // Handle form submission result
  useEffect(() => {
    if (formFetcher.data?.success) {
      toast({
        variant: "success",
        description: formFetcher.data.message,
      });
      onSuccess?.();
    } else if (formFetcher.data?.error) {
      toast({
        variant: "destructive",
        description: formFetcher.data.error,
      });
    }
  }, [formFetcher.data, defaultValues?.id, toast, onSuccess]);

  // Add after the form submission effect
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

  return (
    <formFetcher.Form 
      method="post" 
      {...getFormProps(form)}
      className="space-y-6"
    >
      <input type="hidden" {...getInputProps(fields.id, { type: "hidden" })} />

      <div>
        <Label htmlFor={fields.name.id}>Name</Label>
        <Input
          {...getInputProps(fields.name, { type: "text" })}
          placeholder="Enter name"
        />
        {fields.name.errors && (
          <p className="text-red-500 text-sm mt-1">{fields.name.errors}</p>
        )}
      </div>

      <div>
        <Label htmlFor={fields.email.id}>Email</Label>
        <Input
          {...getInputProps(fields.email, { type: "email" })}
          placeholder="Enter email"
        />
        {fields.email.errors && (
          <p className="text-red-500 text-sm mt-1">{fields.email.errors}</p>
        )}
      </div>

      <div>
        <Label htmlFor={fields.password.id}>
          {defaultValues?.id ? "New Password (optional)" : "Password"}
        </Label>
        <Input
          {...getInputProps(fields.password, { type: "password" })}
          placeholder={defaultValues?.id ? "Leave blank to keep current" : "Enter password"}
        />
        {fields.password.errors && (
          <p className="text-red-500 text-sm mt-1">{fields.password.errors}</p>
        )}
      </div>

      <div>
        <Label>Roles</Label>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="role-user"
              name="roles"
              value="user"
              defaultChecked={defaultValues?.roles?.includes('user') || true}
            />
            <Label htmlFor="role-user">User</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="role-vendor"
              name="roles"
              value="vendor"
              defaultChecked={defaultValues?.roles?.includes('vendor') || false}
            />
            <Label htmlFor="role-vendor">Vendor</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="role-admin"
              name="roles"
              value="admin"
              defaultChecked={defaultValues?.roles?.includes('admin') || false}
            />
            <Label htmlFor="role-admin">Admin</Label>
          </div>
        </div>
        {fields.roles?.errors && (
          <p className="text-red-500 text-sm mt-1">{fields.roles.errors}</p>
        )}
      </div>

      <div>
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
                    src={`/uploads/profiles/${profileImage}`}
                    alt="Profile Preview"
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
                  <span className="text-gray-500">No image</span>
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

      <div className="flex justify-end gap-4">
        <Button
          type="submit"
          disabled={formFetcher.state !== "idle"}
        >
          {formFetcher.state !== "idle" ? (
            "Saving..."
          ) : defaultValues?.id ? (
            "Update User"
          ) : (
            "Create User"
          )}
        </Button>
      </div>
    </formFetcher.Form>
  );
} 