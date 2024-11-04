// types.ts
import type { Category } from "@/schemas/categorySchema";

export type User = {
  id: string;
  name: string;
  email: string;
};

export type Product = {
  id: number;
  name: string;
  image: string;
  price: string;
}

export type LoaderData = {
  user: User | null;
  categories: Category[];
};