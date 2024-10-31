import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm, getInputProps, getFormProps } from "@conform-to/react";
import { useFetcher } from "@remix-run/react";
import { useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast"
import { productSchema } from "@/schemas/productSchema";
import { parseWithZod } from "@conform-to/zod";
import { Button } from "@/components/ui/button";

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

  let lastResult;

  const [form, fields] = useForm({
    id: "product-form",
    defaultValue: {
      name: defaultValues?.name || "",
      description: defaultValues?.description || "",
      price: defaultValues?.price?.toString() || "",
      stock: defaultValues?.stock?.toString() || "",
    },
    lastResult: fetcher.state === 'idle' ? lastResult : null,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: productSchema });
    },
    shouldValidate: 'onBlur',
    shouldRevalidate: "onInput",
  });

  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data?.success && !hasSubmitted.current) {
      hasSubmitted.current = true;
      onSuccess?.();
      toast({
        description: defaultValues?.id ? "Product edited successfully." : "Product added successfully.",
        variant: 'success'
      });
    } else if (fetcher.state === "idle" && fetcher.data?.error && !hasSubmitted.current) {
      hasSubmitted.current = true;
      lastResult = fetcher.data

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

        {form.errors && <p className="text-red-500">{form.errors}</p>}

        <Button type="submit" className="w-full">
          {defaultValues?.id ? "Update Product" : "Add Product"}
        </Button>
      </div>
    </fetcher.Form>
  );
};



