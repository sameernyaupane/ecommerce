export type Theme = "light" | "dark" | "system";

/**
 * This component is used to set the theme based on the value at hydration time.
 * If no value is found, it will default to the user's system preference and
 * coordinates with the ThemeSwitcherScript to prevent a flash of unstyled content
 * and a React hydration mismatch.
 */
export function ThemeSwitcherSafeHTML({
	children,
	lang,
	...props
}: React.HTMLProps<HTMLHtmlElement> & { lang: string }) {
	const dataTheme =
		typeof document === "undefined"
			? undefined
			: document.documentElement.getAttribute("data-theme") || undefined;

	return (
		<html {...props} lang={lang} data-theme={dataTheme}>
			{children}
		</html>
	);
}

/**
 * This script will run on the client to set the theme based on the value in
 * localStorage. If no value is found, it will default to the user's system
 * preference.
 *
 * IMPORTANT: This script should be placed at the end of the <head> tag to
 * prevent a flash of unstyled content.
 */
export function ThemeSwitcherScript() {
	return (
		<script
			id="theme-switcher"
			dangerouslySetInnerHTML={{
				__html: `
					(function() {
						function setThemeClass() {
							const theme = localStorage.getItem('theme') || 'system';
							const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
							
							const isDark = theme === 'dark' || (theme === 'system' && prefersDark);
							
							if (isDark) {
								document.documentElement.classList.add('dark');
								document.documentElement.setAttribute('data-theme', 'dark');
							} else {
								document.documentElement.classList.remove('dark');
								document.documentElement.setAttribute('data-theme', 'light');
							}
						}

						// Run immediately
						setThemeClass();

						// Listen for system preference changes
						window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', setThemeClass);
					})();
				`,
			}}
		/>
	);
}

export function getTheme() {
	return validateTheme(
		typeof document === "undefined" ? "system" : localStorage.getItem("theme"),
	);
}

/**
 * This function will toggle the theme between light and dark and store the
 * value in localStorage.
 */
export function toggleTheme() {
	let currentTheme = validateTheme(localStorage.getItem("theme"));
	if (currentTheme === "system") {
		currentTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
			? "dark"
			: "light";
	}
	const newTheme = currentTheme === "light" ? "dark" : "light";
	setTheme(newTheme);
}

export function setTheme(theme: Theme | string) {
	let themeToSet: Theme | null = validateTheme(theme);
	if (themeToSet === "system") {
		themeToSet = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
	}
	
	localStorage.setItem("theme", themeToSet);
	document.documentElement.setAttribute("data-theme", themeToSet);
	
	if (themeToSet === "dark") {
		document.documentElement.classList.add("dark");
	} else {
		document.documentElement.classList.remove("dark");
	}
}

function validateTheme(theme: string | null): Theme {
	return theme === "light" || theme === "dark" || theme === "system"
		? theme
		: "system";
}
