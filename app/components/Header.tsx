import { useLocation } from "@remix-run/react";
import NavBar from "./NavBar";
import MainMenu from "./MainMenu";
import SearchBar from "./SearchBar";
import { User } from "@/types";

type HeaderProps = {
  user: User | null;
};

export function Header({ user }: HeaderProps) {
	const location = useLocation();

	// Check if the current path is '/dashboard'
	const isDashboard = location.pathname === "/dashboard";

	return (
		<>
			<div className="bg-lime-600 text-white">
				<NavBar user={user} />
			</div>

			{!isDashboard && (
				<>
					<SearchBar />
					<header className="flex items-center justify-between px-12 py-2 md:py-4">
						<MainMenu />
					</header>
				</>
			)}
		</>
	);
}
