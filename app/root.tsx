// app/root.tsx
import { LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData, Links, Meta, Outlet, Scripts, ScrollRestoration, isRouteErrorResponse, useRouteError } from "@remix-run/react";
import { getAuthUser } from "@/controllers/auth";
import { Header } from "@/components/Header";
import Footer from "@/components/Footer";
import { GlobalPendingIndicator } from "@/components/global-pending-indicator";
import {
	ThemeSwitcherSafeHTML,
	ThemeSwitcherScript,
} from "@/components/theme-switcher";
import "./globals.css";
import { LoaderData } from "@/types";

// Root loader to fetch user data
export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getAuthUser(request);
  return json<LoaderData>({ user });
}

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
				<div className="min-h-screen">
					{children}
				</div>
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
	if (isRouteErrorResponse(error)) {
		status = error.status;
		switch (error.status) {
			case 404:
				message = "Page Not Found";
				break;
		}
	} else {
		console.error(error);
	}

	return (
		<App>
			<div className="container prose py-8">
				<h1>{status}</h1>
				<p>{message}</p>
			</div>
		</App>
	);
}
