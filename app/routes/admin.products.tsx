import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useActionData, useLoaderData, useFetcher } from "@remix-run/react";
import { ProductModel } from "@/models/product";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { z } from "zod";
import { useForm, getFieldsetProps } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect, useState, useRef } from "react";
import { Pencil, MoreVertical, Trash } from "lucide-react";
import { useToast } from "@/hooks/use-toast"

// Define the validation schema using Zod
const productSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Product name is required").max(100, "Name is too long"),
  description: z.string().optional(),
  price: z.coerce.number().min(0.01, "Price must be greater than 0"),
  stock: z.coerce.number().int().min(0, "Stock cannot be negative"),
});

type ProductSchema = z.infer<typeof productSchema>;

// Action function with Zod validation
export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent")?.toString();

  if (intent === "delete") {
    const id = formData.get("id")?.toString();
    if (!id) return json({ error: "Invalid product ID" }, { status: 400 });
    
    try {
      await ProductModel.delete(id);
      return json({ success: true });
    } catch (error) {
      return json({ error: "Failed to delete product" }, { status: 500 });
    }
  }

  const submission = parseWithZod(formData, { schema: productSchema });

  if (!submission.value) {
    return json(submission, { status: 400 });
  }

  try {
    if (submission.value.id) {
      await ProductModel.update(submission.value.id, submission.value);
    } else {
      await ProductModel.create(submission.value);
    }
    return json({ success: true });
  } catch (error) {
    console.error("Error saving product:", error);
    return json(
      {
        ...submission,
        error: "Failed to save product, please try again.",
      },
      { status: 500 }
    );
  }
}

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const products = await ProductModel.getAll();
    return json({ products });
  } catch (error) {
    console.error("Error loading products:", error);
    throw new Response("Failed to load products", { status: 500 });
  }
}

const ProductForm = ({ 
  defaultValues,
  onSuccess 
}: { 
  defaultValues?: ProductSchema,
  onSuccess?: () => void 
}) => {
  const fetcher = useFetcher();
  const hasSubmitted = useRef(false);
  const { toast } = useToast();

  const [form, fields] = useForm({
    id: "product-form",
    defaultValue: defaultValues || {
      name: "",
      description: "",
      price: "",
      stock: "",
    },
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: productSchema });
    },
    shouldRevalidate: "onInput",
  });

  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data?.success && !hasSubmitted.current) {
      hasSubmitted.current = true;
      onSuccess?.();
      toast({
        description: defaultValues?.id ? "Product updated successfully." : "Product added successfully.",
      });
    } else if (fetcher.state === "submitting") {
      hasSubmitted.current = false;
    }
  }, [fetcher.state, fetcher.data, onSuccess, defaultValues?.id, toast]);

  return (
    <fetcher.Form method="post" noValidate {...getFieldsetProps(form)}>
      {defaultValues?.id && <input type="hidden" name="id" value={defaultValues.id} />}
      
      <div className="space-y-4">
        <div>
          <Label htmlFor={fields.name.id}>Product Name</Label>
          <Input {...getFieldsetProps(fields.name)} placeholder="Product Name" />
          {fields.name.error && <p className="text-red-500 text-sm mt-1">{fields.name.error}</p>}
        </div>

        <div>
          <Label htmlFor={fields.description.id}>Description</Label>
          <Input {...getFieldsetProps(fields.description)} placeholder="Description" />
          {fields.description.error && <p className="text-red-500 text-sm mt-1">{fields.description.error}</p>}
        </div>

        <div>
          <Label htmlFor={fields.price.id}>Price</Label>
          <Input {...getFieldsetProps(fields.price)} type="number" step="0.01" placeholder="Price" />
          {fields.price.error && <p className="text-red-500 text-sm mt-1">{fields.price.error}</p>}
        </div>

        <div>
          <Label htmlFor={fields.stock.id}>Stock Quantity</Label>
          <Input {...getFieldsetProps(fields.stock)} type="number" placeholder="Stock" />
          {fields.stock.error && <p className="text-red-500 text-sm mt-1">{fields.stock.error}</p>}
        </div>

        {form.error && <p className="text-red-500">{form.error}</p>}

        <Button type="submit" className="w-full">
          {defaultValues?.id ? "Update Product" : "Add Product"}
        </Button>
      </div>
    </fetcher.Form>
  );
};

const AdminProducts: React.FC = () => {
  const { products } = useLoaderData<typeof loader>();
  const [selectedProduct, setSelectedProduct] = useState<ProductSchema | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const fetcher = useFetcher();
  const { toast } = useToast();

  const handleDelete = async (id: string) => {
    fetcher.submit(
      { intent: "delete", id },
      { method: "post", action: window.location.pathname }
    );

    if (fetcher.data?.success) {
      toast({
        description: "Product deleted successfully.",
      });
    } else if (fetcher.data?.error) {
      toast({
        variant: "destructive",
        description: fetcher.data.error || "Failed to delete product.",
      });
    }

    await fetcher.load(window.location.pathname);
  };

  return (
    <>
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Products Management</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setSelectedProduct(null)}>Add New Product</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{selectedProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
                <DialogDescription>
                  {selectedProduct ? "Update product details" : "Fill out the form to add a new product"}
                </DialogDescription>
              </DialogHeader>
              <ProductForm
                defaultValues={selectedProduct || undefined}
                onSuccess={() => {
                  setSelectedProduct(null);
                  fetcher.load(window.location.pathname);
                  setIsDialogOpen(false);
                }}
              />
            </DialogContent>
          </Dialog>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">Stock</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>{product.description}</TableCell>
                <TableCell className="text-right">${product.price}</TableCell>
                <TableCell className="text-right">{product.stock}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedProduct(product);
                          setIsDialogOpen(true);
                        }}
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => handleDelete(product.id)}
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
};

export default AdminProducts;