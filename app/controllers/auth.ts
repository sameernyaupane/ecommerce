import { json, redirect } from "@remix-run/node";
import { UserModel } from "@/models/UserModel";
import { 
  getSession, 
  commitSession, 
  destroySession, 
  createUserSession,
  getUserId 
} from "@/sessions";
import { googleAuthSchema, type GoogleAuthData } from '@/schemas/socialAuthSchema';

interface LoginArgs {
  email: string;
  password: string;
  redirectTo?: string | null;
}

interface SignupArgs {
  name: string;
  email: string;
  password: string;
}

class AuthError extends Error {
  constructor(
    message: string, 
    public status: number = 400
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

function isValidRedirectUrl(url: string | null) {
  if (!url) return false;
  try {
    return url.startsWith('/') && !url.startsWith('//');
  } catch {
    return false;
  }
}

export const signup = async ({ name, email, password }: SignupArgs) => {
  try {
    // Check for existing user
    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      throw new AuthError("User with this email already exists", 409);
    }

    // Create new user with default role 'user'
    const user = await UserModel.create({ 
      name, 
      email, 
      password,
      role: 'user' // Set default role
    });
    
    // Create session and redirect to main page
    return createUserSession({
      userId: user.id,
      redirectTo: "/",
      role: user.role // Include role in session
    });
  } catch (err) {
    if (err instanceof AuthError) {
      throw err;
    }
    console.error("Error during sign up:", err);
    throw new AuthError("Internal server error", 500);
  }
};

export async function login({ email, password, redirectTo }: LoginArgs) {
  try {
    // Find user
    const user = await UserModel.findByEmail(email);
    if (!user) {
      throw new AuthError("Invalid credentials", 401);
    }

    // Verify password
    const isValidPassword = await UserModel.comparePassword(password, user.password);
    if (!isValidPassword) {
      throw new AuthError("Invalid credentials", 401);
    }

    // Create session with role
    const session = await getSession();
    session.set("userId", user.id);
    session.set("role", user.role); // Explicitly set role

    return redirect(redirectTo || "/", {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  } catch (err) {
    if (err instanceof AuthError) {
      throw err;
    }
    console.error("Error during login:", err);
    throw new AuthError("Internal server error", 500);
  }
}

export const logout = async (request: Request) => {
  try {
    const session = await getSession(request.headers.get("Cookie"));
    
    return redirect("/login", {
      headers: {
        "Set-Cookie": await destroySession(session),
        "X-Logout": "true"
      },
    });
  } catch (err) {
    console.error("Error during logout:", err);
    throw new AuthError("Error logging out", 500);
  }
};

// Authentication middleware
export const requireAuth = async (
  request: Request,
  redirectTo: string = new URL(request.url).pathname
) => {
  const session = await getSession(request.headers.get("Cookie"));
  const userId = session.get("userId");
  
  if (!userId) {
    const searchParams = new URLSearchParams([
      ["redirectTo", redirectTo]
    ]);
    throw redirect(`/login?${searchParams}`);
  }
  
  try {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw redirect("/login", {
        headers: {
          "Set-Cookie": await destroySession(session)
        }
      });
    }

    return user;
  } catch (error) {
    if (error instanceof Response) throw error;
    throw json(
      { message: "Server error", status: 500 },
      { status: 500 }
    );
  }
};

// Utility to check if user is authenticated
export const isAuthenticated = async (request: Request): Promise<boolean> => {
  const userId = await getUserId(request);
  return Boolean(userId);
};

export const googleAuth = async (googleData: GoogleAuthData, redirectTo?: string | null) => {
  try {
    const validatedData = googleAuthSchema.parse(googleData);
    const safeRedirectTo = isValidRedirectUrl(redirectTo) ? redirectTo : "/";
    
    // First check if user exists with this Google ID
    let user = await UserModel.findByGoogleId(validatedData.googleId);
    
    if (!user) {
      // Check if user exists with this email
      user = await UserModel.findByEmail(validatedData.email);
      
      if (user) {
        // Update existing user with Google info
        user = await UserModel.update(user.id, {
          name: user.name, // Keep existing name
          email: user.email, // Keep existing email
          googleId: validatedData.googleId,
          profileImage: user.profile_image || validatedData.picture // Only update if no existing image
        });
      } else {
        // Create new user with Google info
        user = await UserModel.create({
          name: validatedData.name,
          email: validatedData.email,
          googleId: validatedData.googleId,
          profileImage: validatedData.picture,
          password: crypto.randomUUID(), // Generate random password for Google users
          role: 'user' // Set default role for Google auth users
        });
      }
    }

    return createUserSession({
      userId: user.id,
      redirectTo: safeRedirectTo,
      role: user.role,
      additionalData: {
        needsMigration: true
      }
    });
  } catch (error) {
    console.error('Error during Google authentication:', error);
    throw new AuthError("Google authentication failed", 500);
  }
}

// Add new function to update session role
export const updateSessionRole = async (request: Request, newRole: 'user' | 'vendor' | 'admin') => {
  const session = await getSession(request.headers.get("Cookie"));
  session.set("role", newRole);
  
  return {
    "Set-Cookie": await commitSession(session)
  };
};

// Add function to sync session with database
export const syncUserSession = async (request: Request) => {
  const userId = await getUserId(request);
  if (!userId) return null;

  const session = await getSession(request.headers.get("Cookie"));
  const currentSessionRole = session.get("role");
  
  try {
    const user = await UserModel.findById(userId);
    if (!user) {
      // User no longer exists, destroy session
      return {
        "Set-Cookie": await destroySession(session)
      };
    }

    // If role in database differs from session, update session
    if (user.role !== currentSessionRole) {
      session.set("role", user.role);
      return {
        "Set-Cookie": await commitSession(session)
      };
    }

    return null; // No update needed
  } catch (err) {
    console.error("Error syncing user session:", err);
    return null;
  }
};

// Add role-based authentication middleware
export const requireRole = (allowedRoles: ('user' | 'vendor' | 'admin')[]) => {
  return async (request: Request) => {
    const session = await getSession(request.headers.get("Cookie"));
    const userId = session.get("userId");
    const currentRole = session.get("role");
        
    if (!userId) {
      throw redirect("/login");
    }

    try {
      const user = await UserModel.findById(userId);
      
      if (!user) {
        throw redirect("/login", {
          headers: {
            "Set-Cookie": await destroySession(session)
          }
        });
      }

      // Check if role has changed in database
      if (user.role !== currentRole) {
        session.set("role", user.role);
        throw redirect(request.url, {
          headers: {
            "Set-Cookie": await commitSession(session)
          }
        });
      }

      // Check if current role is allowed
      if (!user.roles.some(role => allowedRoles.includes(role))) {
        throw json(
          { 
            message: "You do not have permission to access this area", 
            status: 403 
          },
          { status: 403 }
        );
      }

      return user;
    } catch (error) {
      if (error instanceof Response) throw error;
      console.error("Auth error:", error);
      throw json(
        { message: "Server error", status: 500 },
        { status: 500 }
      );
    }
  };
};

// Add utility to get user's role
export const getUserRole = async (request: Request): Promise<'user' | 'vendor' | 'admin' | null> => {
  const session = await getSession(request.headers.get("Cookie"));
  return session.get("role") || null;
};