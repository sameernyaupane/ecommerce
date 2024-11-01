import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm, getInputProps, getFormProps } from "@conform-to/react";
import { useFetcher } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";
import { useToast } from "@/hooks/use-toast"
import { productSchema } from "@/schemas/productSchema";
import { parseWithZod } from "@conform-to/zod";
import { Button } from "@/components/ui/button";
import { ImageIcon, XIcon, PlusIcon } from "lucide-react";

export const ProductForm = ({
  defaultValues,
  onSuccess
}: {
  defaultValues?: null,
  onSuccess?: () => void
}) => {
  const fetcher = useFetcher();
  const hasSubmitted = useRef(false);
  const { toast } = useToast();
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(
    defaultValues?.mainImageUrl || null
  );
  const [galleryImagePreviews, setGalleryImagePreviews] = useState<string[]>(
    defaultValues?.galleryImageUrls || []
  );
  const mainImageInputRef = useRef<HTMLInputElement>(null);
  const galleryImageInputRef = useRef<HTMLInputElement>(null);

  const [form, fields] = useForm({
    id: "product-form",
    defaultValue: {
      name: defaultValues?.name || "",
      description: defaultValues?.description || "",
      price: defaultValues?.price?.toString() || "",
      stock: defaultValues?.stock?.toString() || "",
    },
    lastResult: fetcher.data,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: productSchema });
    },
    shouldValidate: 'onBlur',
    shouldRevalidate: "onInput",
  });

  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMainImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGalleryImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newPreviews: string[] = [];

    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result as string);
        if (newPreviews.length === files.length) {
          setGalleryImagePreviews(prev => [...prev, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeMainImage = () => {
    setMainImagePreview(null);
    if (mainImageInputRef.current) {
      mainImageInputRef.current.value = '';
    }
  };

  const removeGalleryImage = (indexToRemove: number) => {
    setGalleryImagePreviews(prev => 
      prev.filter((_, index) => index !== indexToRemove)
    );
    if (galleryImageInputRef.current) {
      galleryImageInputRef.current.value = '';
    }
  };

  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data?.success && !hasSubmitted.current) {
      hasSubmitted.current = true;
      onSuccess?.();
      toast({
        description: defaultValues?.id ? "Product edited successfully." : "Product added successfully.",
        variant: 'success'
      });
    } else if (fetcher.state === "submitting") {
      hasSubmitted.current = false;
    }
  }, [fetcher.state, fetcher.data, onSuccess, defaultValues?.id, toast]);


  return (
    <fetcher.Form method="post" noValidate {...getFormProps(form)}>
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
            <p className="text-red-500 text-sm mt-1">{fields.description.errors}</p>
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

         {/* Main Image Upload */}
         <div>
          <Label>Main Product Image (Required)</Label>
          <div className="flex items-center space-x-4">
            <input 
              type="file" 
              name="mainImage" 
              ref={mainImageInputRef}
              accept="image/*" 
              onChange={handleMainImageChange} 
              className="hidden" 
              id="mainImage" 
            />
            <label 
              htmlFor="mainImage" 
              className="cursor-pointer flex items-center justify-center w-32 h-32 border-2 border-dashed rounded-lg hover:bg-gray-100"
            >
              {mainImagePreview ? (
                <div className="relative">
                  <img 
                    src={mainImagePreview} 
                    alt="Main product" 
                    className="w-full h-full object-cover rounded-lg" 
                  />
                  <button 
                    type="button"
                    onClick={removeMainImage}
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                  >
                    <XIcon size={16} />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center text-gray-500">
                  <ImageIcon size={32} />
                  <span className="text-sm mt-2">Upload Image</span>
                </div>
              )}
            </label>
          </div>
        </div>

        {/* Gallery Images Upload */}
        <div>
          <Label>Gallery Images (Optional)</Label>
          <div className="flex flex-wrap gap-4">
            {galleryImagePreviews.map((preview, index) => (
              <div key={index} className="relative w-32 h-32">
                <img 
                  src={preview} 
                  alt={`Gallery ${index + 1}`} 
                  className="w-full h-full object-cover rounded-lg" 
                />
                <button 
                  type="button"
                  onClick={() => removeGalleryImage(index)}
                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                >
                  <XIcon size={16} />
                </button>
              </div>
            ))}
            
            <input 
              type="file" 
              name="galleryImages" 
              ref={galleryImageInputRef}
              accept="image/*" 
              multiple 
              onChange={handleGalleryImagesChange} 
              className="hidden" 
              id="galleryImages" 
            />
            <label 
              htmlFor="galleryImages" 
              className="cursor-pointer flex items-center justify-center w-32 h-32 border-2 border-dashed rounded-lg hover:bg-gray-100"
            >
              <div className="flex flex-col items-center text-gray-500">
                <PlusIcon size={32} />
                <span className="text-sm mt-2">Add Images</span>
              </div>
            </label>
          </div>
        </div>

        {form.errors && <p className="text-red-500">{form.errors}</p>}

        <Button type="submit" className="w-full">
          {defaultValues?.id ? "Update Product" : "Add Product"}
        </Button>
      </div>
    </fetcher.Form>
  );
};



