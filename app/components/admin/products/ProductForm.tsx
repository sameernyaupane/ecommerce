import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm, getInputProps, getFormProps } from "@conform-to/react";
import { useFetcher } from "@remix-run/react";
import { useEffect, useRef, useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { productSchema } from "@/schemas/productSchema";
import { parseWithZod } from "@conform-to/zod";
import { Button } from "@/components/ui/button";
import { useDropzone } from "react-dropzone";
import { XCircleIcon } from "@heroicons/react/24/solid";
import { v4 as uuidv4 } from "uuid";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ImageData {
  id: number | null;
  image_name: string;
  is_main: boolean;
}

type ProductFormProps = {
  defaultValues?: any;
  categories: any[];
  onSuccess?: () => void;
};

export const ProductForm = ({
  defaultValues,
  categories,
  onSuccess,
}: ProductFormProps) => {
  const formFetcher = useFetcher();
  const uploadFetcher = useFetcher();
  const deleteFetcher = useFetcher();
  const hasSubmitted = useRef(false);
  const { toast } = useToast();

  const [form, fields] = useForm({
    id: "product-form",
    defaultValue: {
      name: defaultValues?.name || "",
      description: defaultValues?.description || "",
      price: defaultValues?.price?.toString() || "",
      stock: defaultValues?.stock?.toString() || "",
      category_id: defaultValues?.category_id?.toString() || "",
    },
    lastResult: formFetcher.data,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: productSchema });
    },
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  });

  const [galleryImages, setGalleryImages] = useState<ImageData[]>(() => {
    if (!defaultValues?.gallery_images?.length) return [];
    const images = defaultValues.gallery_images.map((img: any) => ({
      id: img.id,
      image_name: img.image_name,
      is_main: Boolean(img.is_main),
    }));
    if (!images.some(img => img.is_main) && images.length > 0) {
      images[0].is_main = true;
    }
    return images;
  });

  const [mainImageIndex, setMainImageIndex] = useState<number>(() => {
    if (!defaultValues?.gallery_images?.length) return 0;
    const index = defaultValues.gallery_images.findIndex((img: any) => img.is_main);
    return index !== -1 ? index : 0;
  });

  const onDropGalleryImages = useCallback(
    (acceptedFiles: File[]) => {
      const formData = new FormData();
      acceptedFiles.forEach((file) => {
        const uniqueName = `${uuidv4()}_${file.name}`;
        formData.append("images", file, uniqueName);
      });
      uploadFetcher.submit(formData, {
        method: "post",
        action: "/upload-images",
        encType: "multipart/form-data",
      });
    },
    [uploadFetcher]
  );

  const {
    getRootProps: getGalleryImagesRootProps,
    getInputProps: getGalleryImagesInputProps,
    isDragActive: isGalleryImagesDragActive,
  } = useDropzone({
    onDrop: onDropGalleryImages,
    accept: { "image/*": [] },
    multiple: true,
  });

  useEffect(() => {
    if (uploadFetcher.state === "idle" && uploadFetcher.data) {
      if (uploadFetcher.data.galleryImages) {
        const newImages: ImageData[] = uploadFetcher.data.galleryImages.map(
          (img: any) => ({
            id: null,
            image_name: img.image_name,
            is_main: false,
          })
        );
        setGalleryImages((prev) => {
          const updated = [...prev, ...newImages];
          if (!updated.some((img) => img.is_main) && updated.length > 0) {
            updated[0].is_main = true;
            setMainImageIndex(0);
          }
          return updated;
        });
      } else if (uploadFetcher.data.error) {
        toast({
          variant: "destructive",
          description: uploadFetcher.data.error || "Failed to upload images.",
        });
      }
    }
  }, [uploadFetcher.state, uploadFetcher.data, toast]);

  const removeGalleryImage = (index: number) => {
    const image = galleryImages[index];
    const formData = new FormData();
    if (image.id) {
      formData.append("id", image.id.toString());
    } else {
      formData.append("image_name", image.image_name);
    }
    deleteFetcher.submit(formData, {
      method: "post",
      action: "/delete-image",
    });
    setGalleryImages((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      if ((image.is_main || !updated.some(img => img.is_main)) && updated.length > 0) {
        updated[0].is_main = true;
        setMainImageIndex(0);
      } else {
        const newMainIndex = updated.findIndex((img) => img.is_main);
        setMainImageIndex(newMainIndex);
      }
      return updated;
    });
  };

  useEffect(() => {
    if (deleteFetcher.state === "idle" && deleteFetcher.data) {
      if (deleteFetcher.data.success) {
        const deletedImageId = parseInt(deleteFetcher.data.id, 10);
        setGalleryImages((prev) => {
          const updated = prev.filter((img) => img.id !== deletedImageId);
          if (!updated.some((img) => img.is_main) && updated.length > 0) {
            updated[0].is_main = true;
            setMainImageIndex(0);
          } else {
            setMainImageIndex(updated.findIndex((img) => img.is_main));
          }
          return updated;
        });
      } else if (deleteFetcher.data.error) {
        toast({
          variant: "destructive",
          description: deleteFetcher.data.error || "Failed to delete image.",
        });
      }
    }
  }, [deleteFetcher.state, deleteFetcher.data, toast]);

  const setMainImage = (index: number) => {
    setGalleryImages((prev) =>
      prev.map((img, i) => ({
        ...img,
        is_main: i === index,
      }))
    );
    setMainImageIndex(index);
  };

  useEffect(() => {
    if (formFetcher.state === "idle" && formFetcher.data?.success && !hasSubmitted.current) {
      hasSubmitted.current = true;
      onSuccess?.();
      toast({
        description: defaultValues?.id
          ? "Product edited successfully."
          : "Product added successfully.",
        variant: "success",
      });
    } else if (formFetcher.state === "submitting") {
      hasSubmitted.current = false;
    }
  }, [formFetcher.state, formFetcher.data, onSuccess, defaultValues?.id, toast]);

  return (
    <formFetcher.Form method="post" noValidate {...getFormProps(form)}>
      {defaultValues?.id && (
        <input type="hidden" name="id" value={defaultValues.id} />
      )}

      <div className="space-y-4">
        <div>
          <Label htmlFor={fields.name.id}>Product Name</Label>
          <Input
            {...getInputProps(fields.name, { required: true })}
            placeholder="Product Name"
            defaultValue={defaultValues?.name}
          />
          {fields.name.errors && (
            <p className="text-red-500 text-sm mt-1">{fields.name.errors}</p>
          )}
        </div>

        <div>
          <Label htmlFor={fields.description.id}>Description</Label>
          <Input
            {...getInputProps(fields.description, { required: true })}
            placeholder="Description"
            defaultValue={defaultValues?.description}
          />
          {fields.description.errors && (
            <p className="text-red-500 text-sm mt-1">
              {fields.description.errors}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor={fields.price.id}>Price</Label>
          <Input
            {...getInputProps(fields.price, { required: true })}
            type="number"
            step="0.01"
            placeholder="Price"
            defaultValue={defaultValues?.price?.toString()}
          />
          {fields.price.errors && (
            <p className="text-red-500 text-sm mt-1">{fields.price.errors}</p>
          )}
        </div>

        <div>
          <Label htmlFor={fields.stock.id}>Stock Quantity</Label>
          <Input
            {...getInputProps(fields.stock, { required: true })}
            type="number"
            placeholder="Stock"
            defaultValue={defaultValues?.stock?.toString()}
          />
          {fields.stock.errors && (
            <p className="text-red-500 text-sm mt-1">{fields.stock.errors}</p>
          )}
        </div>

        <div>
          <Label htmlFor={fields.category_id.id}>Category</Label>
          <Select
            name={fields.category_id.name}
            defaultValue={defaultValues?.category_id?.toString()}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id.toString()}>
                  {category.path}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {fields.category_id.errors && (
            <p className="text-red-500 text-sm mt-1">{fields.category_id.errors}</p>
          )}
        </div>

        {/* Separated Dropzone and Gallery Display */}
        <div className="pb-4">
          <Label htmlFor="gallery-images">Gallery Images</Label>
          
          {/* Dropzone Area */}
          <div
            {...getGalleryImagesRootProps()}
            className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 mb-4"
          >
            <input {...getGalleryImagesInputProps()} />
            <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center mx-auto">
              <span className="text-gray-500">Drop here</span>
            </div>
            <p className="text-sm text-gray-500">Click or drop images here</p>
          </div>

          {/* Gallery Display Area - Separated from Dropzone */}
          {galleryImages.length > 0 && (
            <div className="mt-2 grid grid-cols-3 gap-2">
              {galleryImages.map((image, index) => (
                <div
                  key={index}
                  className="relative inline-block cursor-pointer group"
                  onClick={() => setMainImage(index)}
                >
                  <img
                    src={`/uploads/products/${image.image_name}`}
                    alt={`Gallery Image ${index + 1}`}
                    className="max-h-32 w-full object-cover rounded-lg"
                  />
                  {image.is_main && (
                    <span className="absolute bottom-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                      Main
                    </span>
                  )}
                  <span className="absolute inset-0 bg-black bg-opacity-25 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity text-xs rounded-lg">
                    {image.is_main ? "Main Image" : "Click to set as main image"}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeGalleryImage(index);
                    }}
                    className="absolute -top-2 -right-1 bg-white rounded-full p-1 shadow hover:bg-gray-200"
                    aria-label={`Remove gallery image ${index + 1}`}
                    disabled={deleteFetcher.state === "submitting"}
                  >
                    <XCircleIcon className="h-5 w-5 text-red-500" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {fields.gallery_images?.errors && (
            <p className="text-red-500 text-sm mt-1">
              {fields.gallery_images.errors}
            </p>
          )}
          {uploadFetcher.data?.error && (
            <p className="text-red-500 text-sm mt-1">{uploadFetcher.data.error}</p>
          )}
          {deleteFetcher.data?.error && (
            <p className="text-red-500 text-sm mt-1">{deleteFetcher.data.error}</p>
          )}
        </div>

        <input
          type="hidden"
          name="gallery_images"
          value={JSON.stringify(galleryImages)}
        />

        {form.errors && <p className="text-red-500">{form.errors}</p>}

        <Button
          type="submit"
          className="w-full"
          disabled={formFetcher.state === "submitting"}
        >
          Submit
        </Button>
      </div>
    </formFetcher.Form>
  );
};
