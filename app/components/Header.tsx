import { useLocation } from "@remix-run/react";
import NavBar from "./NavBar";
import MainMenu from "./MainMenu";
import SearchBar from "./SearchBar";
import { User } from "@/types";
import type { Category } from "@/schemas/categorySchema";

type HeaderProps = {
  user: User | null;
  categories: Category[];
};

export function Header({ user, categories }: HeaderProps) {
	const location = useLocation();

	// Check if the current path is '/dashboard'
	const isDashboard = location.pathname === "/dashboard";

	return (
		<>
			<div className="bg-lime-600">
				<NavBar user={user} />
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
