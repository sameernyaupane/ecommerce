// src/sessions/redisSessionStorage.ts
import { 
  createSessionStorage, 
  json, 
  Session,
  SessionData,
  SessionStorage
} from "@remix-run/node";
import redisClient from "@/cache/redis";
import { UserModel } from "@/models/user";

const SESSION_SECRET = process.env.SESSION_SECRET!;
const SESSION_EXPIRATION = parseInt(process.env.SESSION_EXPIRATION!) || 86400; // 1 day in seconds

// Create the session storage
const sessionStorage: SessionStorage = createSessionStorage({
  cookie: {
    name: "__session",
    httpOnly: true,
    maxAge: SESSION_EXPIRATION,
    path: "/",
    sameSite: "lax",
    secrets: [SESSION_SECRET],
    secure: process.env.NODE_ENV === "production",
  },

  async createData(data, expires) {
    const id = crypto.randomUUID();
    const ttl = expires ? Math.round((expires.getTime() - Date.now()) / 1000) : SESSION_EXPIRATION;
    
    await redisClient.setex(`session:${id}`, ttl, JSON.stringify(data));
    return id;
  },

  async readData(id) {
    const data = await redisClient.get(`session:${id}`);
    if (!data) return null;
    return JSON.parse(data);
  },

  async updateData(id, data, expires) {
    const ttl = expires ? Math.round((expires.getTime() - Date.now()) / 1000) : SESSION_EXPIRATION;
    await redisClient.setex(`session:${id}`, ttl, JSON.stringify(data));
  },

  async deleteData(id) {
    await redisClient.del(`session:${id}`);
  },
});

// Export the session functions
export const { getSession, commitSession, destroySession } = sessionStorage;

// Helper functions for session management
export async function createUserSession(userId: string, redirectTo: string = "/") {
  const session = await getSession();
  session.set("userId", userId);
  
  return json(
    { redirectTo },
    {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    }
  );
}

export async function getUserFromSession(request: Request) {
  const session = await getSession(request.headers.get("Cookie"));
  const userId = session.get("userId");
  if (!userId) return null;
  
  return await UserModel.findById(userId);
}

export async function requireUserId(request: Request) {
  const session = await getSession(request.headers.get("Cookie"));
  const userId = session.get("userId");
  
  if (!userId) {
    throw json({ error: "Unauthorized" }, { status: 401 });
  }
  
  return userId;
}

// Type for session data (optional but recommended)
export interface AuthSession extends SessionData {
  userId: string;
}

// Export types for better TypeScript support
export type { Session };