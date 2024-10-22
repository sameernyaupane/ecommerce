import { title, description } from "@/config.shared";
import type { MetaFunction } from "@remix-run/node";
import Slider from "@/components/Slider";
import FeaturedProducts from "@/components/FeaturedProducts";

export const meta: MetaFunction = () => {
	return [
		{ title: title() },
		{ name: "description", content: description() },
	];
};

export default function Index() {
	return (
		<main className="container">
			<Slider />
			
			<FeaturedProducts />		
		</main>
	);
}
