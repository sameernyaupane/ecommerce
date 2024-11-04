import { useLocation } from "@remix-run/react";
import NavBar from "./NavBar";
import MainMenu from "./MainMenu";
import SearchBar from "./SearchBar";
import type { Category } from "@/schemas/categorySchema";

type HeaderProps = {
	categories: Category[];
};

export function Header({ categories }: HeaderProps) {
	const location = useLocation();
	const isDashboard = location.pathname === "/dashboard" || location.pathname === "/admin";

	return (
		<>
			<div className="bg-lime-600">
				<NavBar />
			</div>

			{!isDashboard && (
				<>
					<SearchBar />
					<header className="flex items-center justify-between py-2 md:py-4">
						<MainMenu categories={categories} />
					</header>
				</>
			)}
		</>
	);
}
