import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { title, description } from "@/config.shared";
import type { MetaFunction } from "@remix-run/node";
import Slider from "@/components/Slider";
import FeaturedProducts from "@/components/FeaturedProducts";
import { ProductModel } from "@/models/ProductModel";

export const meta: MetaFunction = () => {
	return [
		{ title: title() },
		{ name: "description", content: description() },
	];
};

export async function loader({ }: LoaderFunctionArgs) {
	const products = await ProductModel.getFeaturedProducts();
	return json({ products });
}

export default function Index() {
	const { products } = useLoaderData<typeof loader>();

	return (
		<main className="container">
			<Slider />
			<FeaturedProducts products={products} />
		</main>
	);
}
