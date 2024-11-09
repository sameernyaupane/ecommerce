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
import { syncUserSession } from "@/controllers/auth";

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

import { PageWrapper } from "@/components/PageWrapper";

// Add UserRole type if not already defined
export type UserRole = 'admin' | 'user' | 'vendor';

// Update loader return type
interface LoaderData {
	user: {
		id: string;
		email: string;
		role: UserRole;
		// ... other user properties
	} | null;
	categories: any[];
	needsMigration: boolean;
	ENV: {
		STRIPE_PUBLIC_KEY: string;
	};
	isLogout: boolean;
}

export async function loader({ request }: LoaderFunctionArgs) {
	// Sync session with database on each request
	const headers = await syncUserSession(request);
	
	const session = await getSession(request.headers.get("Cookie"));
	const user = await getUserFromSession(request);
	const categories = await CategoryModel.getAll();
	
	const needsMigration = session.get("needsMigration");
	if (needsMigration) {
		session.unset("needsMigration");
	}
	
	const isLogout = request.headers.get("X-Logout");
	
	return json(
		{
			user,
			categories,
			needsMigration,
			ENV: {
				STRIPE_PUBLIC_KEY: process.env.STRIPE_PUBLIC_KEY,
			},
			isLogout: !!isLogout
		},
		{
			headers: headers || undefined
		}
	);
}

function App({ children }: { children: React.ReactNode }) {
	const { user, categories, needsMigration, isLogout } = useLoaderData<typeof loader>();
	const [isClient, setIsClient] = useState(false);

	// Set isClient to true once component mounts
	useEffect(() => {
		setIsClient(true);
	}, []);

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
				<ThemeSwitcherScript />
				<Meta />
				<Links />
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
	const [isClient, setIsClient] = useState(false);
	let status = 500;
	let message = "An unexpected error occurred.";

	// Set isClient to true once component mounts
	useEffect(() => {
		setIsClient(true);
	}, []);

	console.log("Root Error Boundary:", error);

	if (isRouteErrorResponse(error)) {
		status = error.status;
		message = error.data?.message || getErrorMessage(status);
	} else if (error instanceof Error) {
		message = error.message;
	}

	return (
		<ThemeSwitcherSafeHTML lang="en">
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<ThemeSwitcherScript />
				<Meta />
				<Links />
			</head>
			<body>
				<GlobalPendingIndicator />
				<PageWrapper>
					<Header categories={[]} user={null} />
					<div className="container mx-auto px-4 py-8">
						<div className="bg-destructive/10 text-destructive p-8 rounded-lg max-w-md mx-auto text-center">
							<h1 className="text-2xl font-semibold mb-4">{status}</h1>
							<p className="mb-4">{message}</p>
							<a 
								href="/"
								className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
							>
								Return to Home
							</a>
						</div>
					</div>
					<Footer />
				</PageWrapper>
				<Toaster />
				<ScrollRestoration />
				<Scripts />
			</body>
		</ThemeSwitcherSafeHTML>
	);
}

function getErrorMessage(status: number): string {
	switch (status) {
		case 404:
			return "Page Not Found";
		case 403:
			return "Access Denied";
		case 401:
			return "Unauthorized";
		default:
			return "An unexpected error occurred.";
	}
}

