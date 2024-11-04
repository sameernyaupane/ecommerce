import { LoaderFunction } from "@remix-run/node";
import { googleAuth } from "@/controllers/auth";
import { redirect } from "@remix-run/node";

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return redirect("/login?error=Google authentication failed");
  }

  try {
    // Exchange code for tokens
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_CALLBACK_URL,
        grant_type: "authorization_code",
      }),
    });

    const { access_token } = await tokenResponse.json();

    // Get user info
    const userResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    const userData = await userResponse.json();

    // Process Google authentication
    return await googleAuth({
      email: userData.email,
      name: userData.name,
      googleId: userData.id,
      picture: userData.picture,
    });
  } catch (error) {
    console.error("Google authentication error:", error);
    return redirect("/login?error=Google authentication failed");
  }
}; 