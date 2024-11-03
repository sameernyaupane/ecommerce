import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { useFetcher } from "@remix-run/react";
import { useEffect } from "react";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const categorySchema = z.object({
  id: z.number().optional(),
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().min(1, "Description is required"),
  parent_id: z.string().optional().transform(val => val ? Number(val) : null),
});

type CategoryFormProps = {
  defaultValues?: any;
  categories: any[];
  onSuccess?: () => void;
};

export function CategoryForm({ defaultValues, categories, onSuccess }: CategoryFormProps) {
  const fetcher = useFetcher();
  const isSubmitting = fetcher.state === "submitting";

  const [form, fields] = useForm({
    id: "category-form",
    defaultValue: defaultValues,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: categorySchema });
    },
    shouldValidate: "onBlur",
  });

  useEffect(() => {
    if (fetcher.data?.success && onSuccess) {
      onSuccess();
    }
  }, [fetcher.data, onSuccess]);

  // Filter available parent categories based on level
  const availableParents = categories.filter(cat => 
    cat.level < 2 && (!defaultValues?.id || cat.id !== defaultValues.id)
  );

  return (
    <fetcher.Form
      method="post"
      {...form.props}
    >
      {defaultValues?.id && (
        <input type="hidden" name="id" value={defaultValues.id} />
      )}

      <div className="grid gap-4 py-4">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            name="name"
            defaultValue={defaultValues?.name}
            className="mt-1"
          />
          {fields.name.error && (
            <p className="text-sm text-red-500 mt-1">{fields.name.error}</p>
          )}
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            defaultValue={defaultValues?.description}
            className="mt-1"
          />
          {fields.description.error && (
            <p className="text-sm text-red-500 mt-1">{fields.description.error}</p>
          )}
        </div>

        <div>
          <Label htmlFor="parent_id">Parent Category</Label>
          <Select 
            name="parent_id" 
            defaultValue={defaultValues?.parent_id?.toString()}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select parent category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="null">None (Top Level)</SelectItem>
              {availableParents.map((category) => (
                <SelectItem 
                  key={category.id} 
                  value={category.id.toString()}
                  disabled={category.level >= 2}
                >
                  {category.path}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex justify-end gap-4 mt-4">
          <Button
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : defaultValues ? "Update" : "Create"}
          </Button>
        </div>
      </div>
    </fetcher.Form>
  );
} 