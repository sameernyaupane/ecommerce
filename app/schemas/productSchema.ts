// Product Schema
import { z } from 'zod';

export const productSchema = z.object({
  name: z.string().min(2, "Product name must be at least 2 characters"),
  description: z.string().optional(),
  price: z
    .number()
    .positive("Price must be a positive number")
    .max(99999, "Price should be realistic and less than 99999"),
  stock: z.number().nonnegative("Stock can't be negative")
});
