import NavBar from "./NavBar";
import MainMenu from "./MainMenu";
import SearchBar from "./SearchBar";

export function Header() {
	return (
		<>
			<div className="bg-lime-600	text-white">
				<NavBar></NavBar>
			</div>
			
			<SearchBar></SearchBar>
			<header className="flex items-center justify-between px-12 py-2 md:py-4">
				<MainMenu></MainMenu>
			</header>
		</>
	);
}
