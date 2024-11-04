import { useForm, getInputProps, getFormProps } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { useFetcher } from "@remix-run/react";
import { useEffect } from "react";
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
  const isSubmitting = formFetcher.state === "submitting";
  const { toast } = useToast();

  const [form, fields] = useForm({
    id: "category-form",
    defaultValue: {
      id: defaultValues?.id || "",
      name: defaultValues?.name || "",
      description: defaultValues?.description || "",
      parent_id: defaultValues?.parent_id?.toString() || "null",
    },
    lastResult: formFetcher.data,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: categorySchema });
    },
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  });

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