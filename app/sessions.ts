// app/sessions/fileSessionStorage.ts
import {
  createCookie,
  createFileSessionStorage,
} from "@remix-run/node";
import path from "path";
import {redirect} from "@remix-run/node";
import { UserModel } from "@/models/UserModel";


// Create a cookie with specific configuration
const sessionCookie = createCookie("__session", {
  secrets: [process.env.SESSION_SECRET || "r3m1xr0ck5"], // Use environment variable for security
  sameSite: "lax", // More permissive for better UX while still secure
  httpOnly: true, // Prevent JavaScript access to the cookie
  secure: process.env.NODE_ENV === "production", // Use secure cookies in production
  maxAge: 60 * 60 * 24 * 7, // 7 days
  path: "/", // Cookie is available for all paths
});

// Get the absolute path to the sessions directory
const sessionDir = path.join(process.cwd(), "sessions");

// Create the file session storage
const { getSession, commitSession, destroySession } = createFileSessionStorage({
  dir: sessionDir,
  cookie: sessionCookie,
});

// Export the session utilities
export { getSession, commitSession, destroySession };

// Helper function to create user session
export const createUserSession = async ({
  userId,
  redirectTo,
  additionalData = {},
  role
}: {
  userId: number | string;
  redirectTo: string;
  additionalData?: Record<string, any>;
  role: 'user' | 'vendor' | 'admin';
}) => {
  const session = await getSession();
  session.set("userId", userId.toString());
  session.set("role", role);
  
  // Set any additional data
  Object.entries(additionalData).forEach(([key, value]) => {
    session.set(key, value);
  });

  const safeRedirectTo = redirectTo || "/";

  return redirect(safeRedirectTo, {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
};

// Helper function to get user id from session
export const getUserId = async (request: Request) => {
  const session = await getSession(request.headers.get("Cookie"));
  return session.get("userId");
};

export async function getUserFromSession(request: Request) {
  try {
    const session = await getSession(request.headers.get("Cookie"));
    const userId = session.get("userId");
    const role = session.get("role");
    
    if (!userId) {
      return null;
    }

    // Get user from database, excluding sensitive information
    const user = await UserModel.findById(userId);
    
    if (!user) {
      return null;
    }

    // Return user without password and include role
    const { password, ...userWithoutPassword } = user;
    return { ...userWithoutPassword, role };

  } catch (error) {
    console.error("Error getting user from session:", error);
    // Destroy corrupted session
    if (error instanceof Error && error.message.includes("Unexpected token")) {
      await destroySession(session);
    }
    return null;
  }
}