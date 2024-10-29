// app/routes/admin/products.tsx
import { json, redirect, type ActionFunctionArgs } from "@remix-run/node";
import { useLoaderData, Form, useTransition } from "@remix-run/react";
import * as productModel from "@/models/product";
import { parseWithZod } from "@conform-to/zod";
import { conform, useConform } from "@conform-to/react";
import { z } from "zod";

// Define schema for validation
const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().optional(),
  price: z.preprocess(
    (val) => parseFloat(String(val)),
    z.number().min(0, "Price must be a positive number")
  ),
});

// Loader to fetch all products
export async function loader() {
  const products = await productModel.getProducts();
  return json({ products });
}

// Action to handle create, update, and delete
export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const actionType = formData.get("_action");

  // Use parseWithZod for validation
  const submission = parseWithZod(formData, { schema: productSchema });

  if (submission.status !== "success") {
    // If validation fails, return errors to the client
    return submission.reply();
  }

  const { name, description, price } = submission.value;

  if (actionType === "create") {
    await productModel.createProduct({ name, description, price });
  } else if (actionType === "update") {
    const id = parseInt(formData.get("id") as string, 10);
    await productModel.updateProduct(id, { name, description, price });
  } else if (actionType === "delete") {
    const id = parseInt(formData.get("id") as string, 10);
    await productModel.deleteProduct(id);
  }

  return redirect("/admin/products");
}

// Component for managing products
export default function AdminProducts() {
  const { products } = useLoaderData();
  const transition = useTransition();
  const [form, { name, description, price }] = useConform({
    schema: productSchema,
    shouldValidate: "onBlur",
  });

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Manage Products</h1>

      {/* Product Form */}
      <Form method="post" className="space-y-4" {...form.props}>
        <input type="hidden" name="_action" value="create" />
        <div>
          <label htmlFor="name">Name</label>
          <input {...conform.input(name)} className="input" />
          {name.error && <p className="text-red-600">{name.error.message}</p>}
        </div>
        <div>
          <label htmlFor="description">Description</label>
          <textarea {...conform.input(description)} className="textarea" />
        </div>
        <div>
          <label htmlFor="price">Price</label>
          <input type="number" step="0.01" {...conform.input(price)} className="input" />
          {price.error && <p className="text-red-600">{price.error.message}</p>}
        </div>
        <button type="submit" className="btn btn-primary">
          {transition.state === "submitting" ? "Saving..." : "Add Product"}
        </button>
      </Form>

      {/* Product List */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold">Product List</h2>
        <ul className="divide-y">
          {products.map((product) => (
            <li key={product.id} className="py-4 flex justify-between">
              <div>
                <h3 className="font-bold">{product.name}</h3>
                <p>{product.description}</p>
                <p>${product.price}</p>
              </div>
              <div className="space-x-2">
                <Form method="post">
                  <input type="hidden" name="_action" value="delete" />
                  <input type="hidden" name="id" value={product.id} />
                  <button type="submit" className="btn btn-danger">Delete</button>
                </Form>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
