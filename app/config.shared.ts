export const APP_NAME = "INDIBE";

export function title(pageTitle?: string) {
	if (!pageTitle) return APP_NAME;

	return `${pageTitle} | ${APP_NAME}`;
}

export function description(pageDescription?: string) {
	if (!pageDescription) return 'Welcome to INDIBE!';

	return `${pageDescription}`;
}
