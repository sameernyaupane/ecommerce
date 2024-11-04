import { z } from 'zod';

export const productSchema = z.object({
  id: z.preprocess((val) => {
    if (typeof val === "string" && val.trim() !== "") {
      return Number(val);
    }
    return undefined;
  }, z.number().positive().optional()),

  name: z.string()
    .min(2, "Product name must be at least 2 characters")
    .max(100, "Product name must be less than 100 characters"),

  description: z.string()
    .min(1, "Description is required")
    .max(500, "Description must be less than 500 characters"),

  price: z.preprocess((val) => {
    if (typeof val === "string" && val.trim() !== "") {
      return parseFloat(val);
    }
    return val;
  }, z.number().min(0.01, "Price must be greater than 0")),

  stock: z.preprocess((val) => {
    if (typeof val === "string" && val.trim() !== "") {
      return parseInt(val, 10);
    }
    return val;
  }, z.number().min(0, "Stock cannot be negative")),

  category_id: z.preprocess(
    (val) => {
      if (!val || val === "") return undefined;
      return typeof val === "string" ? Number(val) : val;
    },
    z.number().positive("Please select a category")
  ),

  gallery_images: z.array(z.any()).optional(),
});
