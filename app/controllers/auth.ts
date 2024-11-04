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

export const signup = async ({ name, email, password }: SignupArgs) => {
  try {
    // Check for existing user
    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      throw new AuthError("User with this email already exists", 409);
    }

    // Create new user
    const user = await UserModel.create({ name, email, password });
    
    // Create session and redirect to main page
    return createUserSession({
      userId: user.id,
      redirectTo: "/"
    });
  } catch (err) {
    if (err instanceof AuthError) {
      throw err;
    }
    console.error("Error during sign up:", err);
    throw new AuthError("Internal server error", 500);
  }
};

export async function login({ email, password }: LoginArgs) {
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

    // Create session and redirect to main page
    return createUserSession({
      userId: user.id,
      redirectTo: "/"
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
  const userId = await getUserId(request);
  
  if (!userId) {
    const searchParams = new URLSearchParams([
      ["redirectTo", redirectTo]
    ]);
    throw redirect(`/login?${searchParams}`);
  }
  
  return userId;
};

// Get authenticated user data
export const getAuthUser = async (request: Request) => {
  const userId = await getUserId(request);
  
  if (!userId) {
    return null;
  }
  
  try {
    const user = await UserModel.findById(userId);
    if (!user) {
      return null;
    }
    
    // Return safe user data (exclude password)
    return {
      id: user.id,
      name: user.name,
      email: user.email,
    };
  } catch (err) {
    console.error("Error fetching auth user:", err);
    return null;
  }
};

// Utility to check if user is authenticated
export const isAuthenticated = async (request: Request): Promise<boolean> => {
  const userId = await getUserId(request);
  return Boolean(userId);
};

export const googleAuth = async (googleData: GoogleAuthData) => {
  try {
    const validatedData = googleAuthSchema.parse(googleData);
    
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
          role: 'user'
        });
      }
    }

    // Create session and redirect
    return createUserSession({
      userId: user.id,
      redirectTo: "/"
    });
  } catch (error) {
    console.error('Error during Google authentication:', error);
    throw new AuthError("Google authentication failed", 500);
  }
}