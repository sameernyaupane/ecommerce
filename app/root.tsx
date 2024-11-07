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
import { useEffect, useState, useRef } from "react";

import { getSession, getUserFromSession, commitSession } from "@/sessions";

import { GlobalPendingIndicator } from "@/components/global-pending-indicator";
import { Header } from "@/components/Header";
import Footer from "./components/Footer";

import {
	ThemeSwitcherSafeHTML,
	ThemeSwitcherScript,
} from "@/components/theme-switcher";

import "./globals.css";

import { LoaderData } from "@/types";

import { Toaster } from "@/components/ui/toaster"

import { CategoryModel } from "@/models/CategoryModel";

import { Breadcrumb } from "@/components/Breadcrumb";

import { useMigrateGuestData } from "@/utils/migrateGuestData";

import { useShoppingState } from "@/hooks/use-shopping-state";


export async function loader({ request }: LoaderFunctionArgs) {
	try {
		// Get session from request cookie
		const session = await getSession(request.headers.get("Cookie"));
		const user = await getUserFromSession(request);
		const categories = await CategoryModel.getAll();
		
		// Clear migration flag if it exists
		const needsMigration = session.get("needsMigration");
		if (needsMigration) {
			session.unset("needsMigration");
		}
		
		// Check for logout header from previous response
		const headers = request.headers;
		const isLogout = headers.get("X-Logout");
		
		return json(
			{
				user,
				categories,
				needsMigration,
				ENV: {
					STRIPE_PUBLIC_KEY: process.env.STRIPE_PUBLIC_KEY,
					// ... other env vars needed on client
				},
				isLogout: !!isLogout
			},
			{
				headers: {
					...(needsMigration ? {
						"Set-Cookie": await commitSession(session)
					} : {}),
					...(isLogout ? {
						// Add meta tag to indicate logout
						"X-Logout": "true"
					} : {})
				}
			}
		);
	} catch (error) {
		console.error("Error loading data:", error);
		return json({
			categories: [],
			error: "Failed to load data"
		});
	}
}

function App({ children }: { children: React.ReactNode }) {
	const { user, categories, needsMigration, isLogout } = useLoaderData<typeof loader>();
	const [migrationAttempted, setMigrationAttempted] = useState(false);
	const { migrateData, state: migrationState } = useMigrateGuestData();
	const shoppingState = useShoppingState();
	const initialSyncDone = useRef(false);

	// Handle logout
	useEffect(() => {
		if (isLogout) {
			shoppingState.reset();
			initialSyncDone.current = false;
		}
	}, [isLogout]);

	// Handle authentication state and data migration
	useEffect(() => {
		const initializeShoppingState = async () => {
			if (!isLogout) {
				shoppingState.setIsAuthenticated(!!user);
				
				if (user) {
					if (needsMigration && !migrationAttempted && migrationState === 'idle') {
						await migrateData();
						setMigrationAttempted(true);
						await shoppingState.syncWithBackend();
					} else if (!initialSyncDone.current) {
						await shoppingState.syncWithBackend();
						initialSyncDone.current = true;
					}
				}
			}
		};

		initializeShoppingState();
	}, [user, needsMigration, migrationAttempted, migrationState, isLogout]);

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
				<Header categories={categories} user={user} />
				<Breadcrumb />
				{children}
				<Footer />
				<Toaster />
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

