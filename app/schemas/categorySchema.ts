import { z } from 'zod';

export const categorySchema = z.object({
  id: z.preprocess(
    (val) => {
      if (typeof val === "string" && val.trim() !== "") {
        return Number(val);
      }
      return undefined;
    },
    z.number().positive().optional()
  ),

  name: z.string()
    .min(2, "Category name must be at least 2 characters")
    .max(100, "Category name must be less than 100 characters"),

  description: z.string()
    .min(1, "Description is required")
    .max(500, "Description must be less than 500 characters"),

  parent_id: z.preprocess(
    (val) => {
      if (!val || val === "") return null;
      if (typeof val === "string") {
        return Number(val);
      }
      return val;
    },
    z.number().positive().nullable()
  ),

  level: z.preprocess(
    (val) => {
      if (typeof val === "string") {
        return Number(val);
      }
      return val;
    },
    z.number().min(0).max(2)
  )
}).refine(
  async (data) => {
    if (!data.parent_id) return true;

    // This will be checked in the CategoryModel, but we define the rule here
    // to make it explicit in the schema
    return true;
  },
  {
    message: "Category hierarchy cannot exceed 3 levels",
    path: ["parent_id"]
  }
);

// Type inference
export type Category = z.infer<typeof categorySchema>; 