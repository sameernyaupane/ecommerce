import { json } from "@remix-run/node";
import { UserModel } from "@/models/user";
import redisClient from "@/cache/redis";
import { generateAccessToken, generateRefreshToken, verifyToken, getRemainingTime } from "@/utils/jwt";

const REFRESH_EXPIRATION_SECONDS = parseInt(process.env.REFRESH_EXPIRATION!) || 604800; // 7 days in seconds

// Sign-up controller
export const signup = async ({ name, email, password }: { name: string; email: string; password: string }) => {
  try {
    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    const user = await UserModel.create({ name, email, password });
    
    return json({ message: "User created successfully", user }, { status: 201 });
  } catch (err) {
    console.error("Error during sign up:", err);
    throw new Error("Internal server error");
  }
};

// Login controller
export const login = async ({ email, password }: { email: string; password: string }) => {
  if (!email || !password) {
    return json({ error: "Email and password are required" }, { status: 400 });
  }

  try {
    const user = await UserModel.findByEmail(email);
    if (!user || !(await UserModel.comparePassword(password, user))) {
      return json({ error: "Invalid email or password" }, { status: 400 });
    }

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);
    const remainingTime = getRemainingTime(accessToken);

    await redisClient.set(`refreshToken:${user.id}`, refreshToken, "EX", REFRESH_EXPIRATION_SECONDS);

    return json({ accessToken, refreshToken, expiresIn: remainingTime }, { status: 200 });
  } catch (err) {
    console.error("Error during login:", err);
    throw new Error("Internal server error");
  }
};

// Refresh token controller
export const refreshToken = async ({ token }: { token: string }) => {
  if (!token) {
    return json({ error: "Refresh token is required" }, { status: 401 });
  }

  try {
    const { valid, expired, decoded, error } = verifyToken(token);

    if (!valid) {
      return json({ error: expired ? "Refresh token expired" : "Invalid refresh token", details: error }, { status: 401 });
    }

    const userId = (decoded as any).id;
    const storedRefreshToken = await redisClient.get(`refreshToken:${userId}`);

    if (token !== storedRefreshToken) {
      return json({ error: "Refresh token does not match stored token" }, { status: 403 });
    }

    const newAccessToken = generateAccessToken(userId);
    return json({ accessToken: newAccessToken }, { status: 200 });
  } catch (err) {
    console.error("Error during token refresh:", err);
    throw new Error("Internal server error");
  }
};
