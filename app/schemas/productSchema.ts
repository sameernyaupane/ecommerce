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

  gallery_images: z.preprocess((val) => {
    if (typeof val === "string" && val.trim() !== "") {
      try {
        const parsed = JSON.parse(val);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch (e) {
        // Parsing failed, will be caught by Zod
      }
    }
    return val;  // Already an array
  }, 
  z
    .array(
      z.object({
        id: z.preprocess((val) => {
          if (val === null || val === undefined) return undefined;
          if (typeof val === "string" && val.trim() !== "") {
            const num = Number(val);
            return isNaN(num) ? undefined : num;
          }
          return val;
        }, z.number().positive().optional()),  // Allow undefined for new images
        image_name: z.string().min(1, "Image name is required"),
        is_main: z.preprocess((val) => {
          if (typeof val === "string") {
            return val === "true";
          }
          return val;
        }, z.boolean().optional()),
      })
    )
    .min(1, "At least one gallery image is required.")
    .refine(
      (imgs) => imgs.filter(img => img.is_main).length === 1,
      {
        message: "Exactly one gallery image must be marked as main.",
      }
    )
  ),

});
