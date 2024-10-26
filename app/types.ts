// types.ts
export type User = {
  id: string;
  name: string;
  email: string;
};


// Define a type for the product
export type Product = {
  id: number;
  name: string;
  image: string;
  price: string;
}

export type LoaderData = {
  user: User | null;
};