import { Link } from "@remix-run/react";


import NavBar from "./NavBar";

export function Header() {
	

	return (
		<>
			<NavBar></NavBar>
			<header className="flex items-center justify-between px-12 py-2 md:py-4 bg-lime-600">
				<div>
					<div className="flex items-center space-x-4">
						<Link className="flex items-center space-x-2" to="/">
							{/* <HomeIcon className="h-6 w-6" /> */}
							<span className="text-sm font-bold">Sell with INDIBE</span>
						</Link>
						<Link className="flex items-center space-x-2" to="/">
							{/* <HomeIcon className="h-6 w-6" /> */}
							<span className="text-sm font-bold">Vendor Login</span>
						</Link>
					</div>
				</div>
			</header>
		</>
	);
}
