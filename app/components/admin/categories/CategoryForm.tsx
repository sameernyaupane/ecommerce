import { useForm, getInputProps, getFormProps } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { useFetcher } from "@remix-run/react";
import { useEffect, useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { XCircleIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { categorySchema } from "@/schemas/categorySchema";
import { useToast } from "@/hooks/use-toast";

type CategoryFormProps = {
  defaultValues?: any;
  categories: any[];
  onSuccess?: () => void;
};

export function CategoryForm({ defaultValues, categories, onSuccess }: CategoryFormProps) {
  const formFetcher = useFetcher();
  const deleteFetcher = useFetcher();
  const isSubmitting = formFetcher.state === "submitting";
  const { toast } = useToast();
  const [categoryImage, setCategoryImage] = useState(defaultValues?.image || "");

  const [form, fields] = useForm({
    id: "category-form",
    defaultValue: {
      id: defaultValues?.id || "",
      name: defaultValues?.name || "",
      description: defaultValues?.description || "",
      parent_id: defaultValues?.parent_id?.toString() || "null",
      image: categoryImage,
    },
    lastResult: formFetcher.data,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: categorySchema });
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
      const response = await fetch("/upload-category-image", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (result.success) {
        setCategoryImage(result.imageName);
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

  const removeCategoryImage = useCallback(() => {
    if (!categoryImage) return;

    const formData = new FormData();
    formData.append("image_name", categoryImage);
    formData.append("type", "category");

    deleteFetcher.submit(formData, {
      method: "post",
      action: "/delete-image",
    });
    setCategoryImage("");
  }, [categoryImage, deleteFetcher]);

  useEffect(() => {
    if (formFetcher.data?.success) {
      toast({
        description: defaultValues?.id 
          ? "Category updated successfully" 
          : "Category created successfully",
        variant: "success",
      });
      onSuccess?.();
    } else if (formFetcher.data?.error) {
      toast({
        variant: "destructive",
        description: formFetcher.data.error,
      });
    }
  }, [formFetcher.data, defaultValues?.id, toast, onSuccess]);

  // Filter available parent categories (only Level 1 and 2 can be parents)
  const availableParents = categories.filter(cat => 
    cat.level < 2 && (!defaultValues?.id || cat.id !== defaultValues.id)
  );

  return (
    <formFetcher.Form
      method="post"
      {...getFormProps(form)}
      className="space-y-4"
    >
      {defaultValues?.id && (
        <input type="hidden" {...getInputProps(fields.id, { type: "hidden" })} />
      )}

      <div>
        <Label htmlFor={fields.name.id}>Name</Label>
        <Input
          {...getInputProps(fields.name, { type: "text" })}
          placeholder="Enter category name"
          className="mt-1"
        />
        {fields.name.errors && (
          <p className="text-sm text-red-500 mt-1">{fields.name.errors}</p>
        )}
      </div>

      <div>
        <Label htmlFor={fields.description.id}>Description</Label>
        <Textarea
          {...getInputProps(fields.description, { type: "text" })}
          placeholder="Enter category description"
          className="mt-1"
        />
        {fields.description.errors && (
          <p className="text-sm text-red-500 mt-1">{fields.description.errors}</p>
        )}
      </div>

      <div>
        <Label htmlFor={fields.parent_id.id}>Parent Category</Label>
        <Select 
          {...getInputProps(fields.parent_id, { type: "select" })}
          defaultValue={defaultValues?.parent_id?.toString() || "null"}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select parent category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="null">None (Level 1)</SelectItem>
            {availableParents.map((category) => (
              <SelectItem 
                key={category.id} 
                value={category.id.toString()}
                disabled={category.level >= 2}
              >
                {category.name} ({category.level === 0 
                  ? "Level 1" 
                  : category.level === 1 
                    ? "Level 2" 
                    : "Level 3"})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {fields.parent_id.errors && (
          <p className="text-sm text-red-500 mt-1">{fields.parent_id.errors}</p>
        )}
      </div>

      <div>
        <Label>Category Image</Label>
        <input
          type="hidden"
          name="image"
          value={categoryImage}
        />

        <div 
          {...getRootProps()} 
          className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50"
        >
          <input {...getDropzoneProps()} />
          <div className="flex flex-col items-center gap-2">
            {categoryImage ? (
              <>
                <div className="relative w-24 h-24">
                  <img
                    src={`/uploads/categories/${categoryImage}`}
                    alt="Category Preview"
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeCategoryImage();
                    }}
                    className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow hover:bg-gray-100"
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
        {fields.image?.errors && (
          <p className="text-red-500 text-sm mt-1">{fields.image.errors}</p>
        )}
        {formFetcher.data?.imageError && (
          <p className="text-red-500 text-sm mt-1">{formFetcher.data.imageError}</p>
        )}
        {deleteFetcher.data?.error && (
          <p className="text-red-500 text-sm mt-1">{deleteFetcher.data.error}</p>
        )}
      </div>

      <div className="flex justify-end gap-4 mt-4">
        <Button
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving..." : defaultValues?.id ? "Update" : "Create"}
        </Button>
      </div>
    </formFetcher.Form>
  );
} 