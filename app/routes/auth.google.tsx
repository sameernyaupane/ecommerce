import { redirect } from "@remix-run/node";
import type { LoaderFunctionArgs } from "@remix-run/node";

function isValidRedirectUrl(url: string | null) {
  if (!url) return false;
  try {
    return url.startsWith('/') && !url.startsWith('//');
  } catch {
    return false;
  }
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  let redirectTo = url.searchParams.get("redirectTo");
  console.log("auth.google initial redirectTo:", redirectTo);
  
  // If no redirectTo is provided, check the referrer
  if (!redirectTo && request.headers.get("Referer")) {
    try {
      const refererUrl = new URL(request.headers.get("Referer")!);
      redirectTo = refererUrl.searchParams.get("redirectTo");
      console.log("Found redirectTo in referer:", redirectTo);
    } catch (error) {
      console.error("Error parsing referer URL:", error);
    }
  }

  const safeRedirectTo = isValidRedirectUrl(redirectTo) ? redirectTo : "/";
  console.log("Final safeRedirectTo:", safeRedirectTo);
  
  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: process.env.GOOGLE_CALLBACK_URL!,
    response_type: 'code',
    scope: 'email profile',
    prompt: 'select_account',
    state: safeRedirectTo // Pass the redirectTo as state
  })}`;
  
  return redirect(googleAuthUrl);
}; 