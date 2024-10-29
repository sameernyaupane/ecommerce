import {
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
	isRouteErrorResponse,
	useRouteError,
	useLoaderData
} from "@remix-run/react";

import { LoaderFunctionArgs, json } from "@remix-run/node";

import { getAuthUser } from "@/controllers/auth";

import { GlobalPendingIndicator } from "@/components/global-pending-indicator";
import { Header } from "@/components/Header";
import Footer from "./components/Footer";

import {
	ThemeSwitcherSafeHTML,
	ThemeSwitcherScript,
} from "@/components/theme-switcher";

import "./globals.css";

import { LoaderData } from "@/types";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getAuthUser(request);

  return json({ user });
};

function App({ children }: { children: React.ReactNode }) {
	const { user } = useLoaderData<LoaderData>();

	return (
		<ThemeSwitcherSafeHTML lang="en">
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<Meta />
				<Links />
				<ThemeSwitcherScript />
			</head>
			<body>
				<GlobalPendingIndicator />
				<Header user={user} />
				{children}
				<Footer />
				<ScrollRestoration />
				<Scripts />
			</body>
		</ThemeSwitcherSafeHTML>
	);
}

export default function Root() {
	return (
		<App>
			<Outlet />
		</App>
	);
}

export function ErrorBoundary() {
	const error = useRouteError();
	let status = 500;
	let message = "An unexpected error occurred.";
	let user = null; // You can optionally define user here

	if (isRouteErrorResponse(error)) {
		status = error.status;
		switch (error.status) {
			case 404:
				message = "Page Not Found";
				break;
			default:
				message = "An unexpected error occurred.";
				break;
		}
	} else {
		console.error(error);
	}

	return (
		<ThemeSwitcherSafeHTML lang="en">
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<Meta />
				<Links />
				<ThemeSwitcherScript />
			</head>
			<body>
				<GlobalPendingIndicator />
				<Header user={user} /> {/* No user data on error */}
				<div className="container prose py-8">
					<h1>{status}</h1>
					<p>{message}</p>
				</div>
				<Footer />
				<ScrollRestoration />
				<Scripts />
			</body>
		</ThemeSwitcherSafeHTML>
	);
}

