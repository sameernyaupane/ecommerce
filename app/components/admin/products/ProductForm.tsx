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

interface ImageData {
  id: number | null; // Null for new images
  image_name: string;
  is_main: boolean;
}

export const ProductForm = ({
  defaultValues,
  onSuccess,
}: {
  defaultValues?: any;
  onSuccess?: () => void;
}) => {
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
        
        {/* Dropzone with Thumbnails */}
        <div className="pb-4">
          <Label htmlFor="gallery-images">Gallery Images</Label>
          <div className="border-dashed border-2">
            <div
              {...getGalleryImagesRootProps()}
              className="text-center cursor-pointer p-8 bg-gray-50 rounded"
            >
              <input {...getGalleryImagesInputProps()} />
              {isGalleryImagesDragActive ? (
                <p>Drop the images here ...</p>
              ) : (
                <p>Drag 'n' drop gallery images here, or click to select images</p>
              )}
            </div>

            {/* Thumbnails */}
            {galleryImages.length > 0 && (
              <div className="mt-2 grid grid-cols-3 gap-2">
                {galleryImages.map((image, index) => (
                  <div key={index} className="relative inline-block">
                    <img
                      src={`/uploads/products/${image.image_name}`}
                      alt={`Gallery Image ${index + 1}`}
                      className="max-h-32 w-full object-cover"
                    />
                    <div className="absolute top-2 left-2 bg-white bg-opacity-75 p-1 rounded flex items-center">
                      <input
                        type="radio"
                        name="main_image"
                        value={index}
                        checked={image.is_main}
                        onChange={() => setMainImage(index)}
                        className="mr-1"
                        aria-label={`Set image ${index + 1} as main`}
                      />
                      <span className="text-xs">Main</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeGalleryImage(index)}
                      className="absolute top-2 right-2 bg-white rounded-full p-1 shadow"
                      aria-label={`Remove gallery image ${index + 1}`}
                      disabled={deleteFetcher.state === "submitting"}
                    >
                      <XCircleIcon className="h-4 w-4 text-red-500" />
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
          </div>
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
          {defaultValues?.id ? "Edit Product" : "Add Product"}
        </Button>
      </div>
    </formFetcher.Form>
  );
};
