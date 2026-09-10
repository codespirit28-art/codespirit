import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

// ✅ Get current user ID from token
export async function getCurrentUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.userId;
  } catch {
    return null;
  }
}

// ✅ Require admin role
export async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    throw new Error("No token provided");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "admin") {
      throw new Error("Not authorized");
    }

    return decoded.userId;
  } catch {
    throw new Error("Invalid token");
  }
}
