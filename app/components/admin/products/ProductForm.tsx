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

interface ImageData {
  name: string;
  path: string;
}

export const ProductForm = ({
  defaultValues,
  onSuccess,
}: {
  defaultValues?: any;
  onSuccess?: () => void;
}) => {
  const fetcher = useFetcher();
  const hasSubmitted = useRef(false);
  const { toast } = useToast();

  const [form, fields] = useForm({
    id: "product-form",
    defaultValue: {
      name: defaultValues?.name || "",
      description: defaultValues?.description || "",
      price: defaultValues?.price?.toString() || "",
      stock: defaultValues?.stock?.toString() || "",
      mainImageName: defaultValues?.mainImageName || "",
      galleryImageNames: defaultValues?.galleryImageNames || [],
    },
    lastResult: fetcher.data,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: productSchema });
    },
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  });

  useEffect(() => {
    if (
      fetcher.state === "idle" &&
      fetcher.data?.success &&
      !hasSubmitted.current
    ) {
      hasSubmitted.current = true;
      onSuccess?.();
      toast({
        description: defaultValues?.id
          ? "Product edited successfully."
          : "Product added successfully.",
        variant: "success",
      });
    } else if (fetcher.state === "submitting") {
      hasSubmitted.current = false;
    }
  }, [fetcher.state, fetcher.data, onSuccess, defaultValues?.id, toast]);

  // State for images
  const [mainImage, setMainImage] = useState<ImageData | null>(
    defaultValues?.mainImage || null
  );
  const [galleryImages, setGalleryImages] = useState<ImageData[]>(
    defaultValues?.galleryImages || []
  );

  // Separate fetchers for main image and gallery images
  const mainImageFetcher = useFetcher();
  const galleryImagesFetcher = useFetcher();

  // Handler for main image upload
  const onDropMainImage = useCallback(
    (acceptedFiles: File[]) => {
      const formData = new FormData();
      formData.append("image", acceptedFiles[0]);

      mainImageFetcher.submit(formData, {
        method: "post",
        action: "/upload-images",
        encType: "multipart/form-data",
      });
    },
    [mainImageFetcher]
  );

  // Handler for gallery images upload
  const onDropGalleryImages = useCallback(
    (acceptedFiles: File[]) => {
      const formData = new FormData();
      acceptedFiles.forEach((file) => {
        formData.append("images", file);
      });

      galleryImagesFetcher.submit(formData, {
        method: "post",
        action: "/upload-images",
        encType: "multipart/form-data",
      });
    },
    [galleryImagesFetcher]
  );

  // Handle main image upload result
  useEffect(() => {
    if (mainImageFetcher.state === "idle" && mainImageFetcher.data) {
      if (mainImageFetcher.data.mainImage) {
        setMainImage(mainImageFetcher.data.mainImage);
      }
    }
  }, [mainImageFetcher]);

  // Handle gallery images upload result
  useEffect(() => {
    if (galleryImagesFetcher.state === "idle" && galleryImagesFetcher.data) {
      if (galleryImagesFetcher.data.galleryImages) {
        setGalleryImages((prev) => [
          ...prev,
          ...galleryImagesFetcher.data.galleryImages,
        ]);
      }
    }
  }, [galleryImagesFetcher]);

  // Dropzone for main image
  const {
    getRootProps: getMainImageRootProps,
    getInputProps: getMainImageInputProps,
    isDragActive: isMainImageDragActive,
  } = useDropzone({
    onDrop: onDropMainImage,
    accept: { "image/*": [] },
    multiple: false,
  });

  // Dropzone for gallery images
  const {
    getRootProps: getGalleryImagesRootProps,
    getInputProps: getGalleryImagesInputProps,
    isDragActive: isGalleryImagesDragActive,
  } = useDropzone({
    onDrop: onDropGalleryImages,
    accept: { "image/*": [] },
    multiple: true,
  });

  return (
    <fetcher.Form method="post" noValidate {...getFormProps(form)}>
      {defaultValues?.id && (
        <input type="hidden" name="id" value={defaultValues.id} />
      )}

      {/* Hidden inputs for images */}
      {mainImage && (
        <input type="hidden" name="mainImageName" value={mainImage.name} />
      )}
      {galleryImages.map((image, index) => (
        <input
          key={index}
          type="hidden"
          name="galleryImageNames"
          value={image.name}
        />
      ))}

      <div className="space-y-4">
        {/* Product Name */}
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

        {/* Description */}
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

        {/* Price */}
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

        {/* Stock Quantity */}
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

        {/* Main Image Upload */}
        <div>
          <Label htmlFor="main-image">Main Image</Label>
          <div
            {...getMainImageRootProps()}
            className="border-dashed border-2 p-4 text-center"
          >
            <input {...getMainImageInputProps()} />
            {isMainImageDragActive ? (
              <p>Drop the image here ...</p>
            ) : (
              <p>
                Drag 'n' drop main image here, or click to select image
              </p>
            )}
          </div>
          {mainImage && (
            <img
              src={mainImage.path}
              alt="Main Image"
              className="mt-2 max-h-48"
            />
          )}
          {!mainImage && (
            <p className="text-red-500 text-sm mt-1">
              Main image is required.
            </p>
          )}
        </div>

        {/* Gallery Images Upload */}
        <div>
          <Label htmlFor="gallery-images">Gallery Images (Optional)</Label>
          <div
            {...getGalleryImagesRootProps()}
            className="border-dashed border-2 p-4 text-center"
          >
            <input {...getGalleryImagesInputProps()} />
            {isGalleryImagesDragActive ? (
              <p>Drop the images here ...</p>
            ) : (
              <p>
                Drag 'n' drop gallery images here, or click to select images
              </p>
            )}
          </div>
          {galleryImages.length > 0 && (
            <div className="mt-2 grid grid-cols-3 gap-2">
              {galleryImages.map((image, index) => (
                <img
                  key={index}
                  src={image.path}
                  alt={`Gallery Image ${index + 1}`}
                  className="max-h-32"
                />
              ))}
            </div>
          )}
        </div>

        {form.errors && <p className="text-red-500">{form.errors}</p>}

        <Button type="submit" className="w-full">
          {defaultValues?.id ? "Update Product" : "Add Product"}
        </Button>
      </div>
    </fetcher.Form>
  );
};
