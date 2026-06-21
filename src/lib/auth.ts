import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET!

export interface AuthUser {
  userId: string
  email: string
  role: string
  permissions: string[]
  establishmentId: string
}

export function verifyAuth(request: Request): AuthUser | null {
  const authHeader = request.headers.get("authorization")
  if (!authHeader?.startsWith("Bearer ")) return null

  const token = authHeader.slice(7)
  try {
    const payload = jwt.verify(token, JWT_SECRET) as any
    
    // Check if token type is not access token
    if (payload.type === "refresh") return null
    
    return {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
      permissions: payload.permissions || [],
      establishmentId: payload.establishmentId,
    }
  } catch (e) {
    const error = e as any
    // Log different error types
    if (error.name === "TokenExpiredError") {
      console.error("[verifyAuth] token expired")
    } else {
      console.error("[verifyAuth] failed:", error.message)
    }
    return null
  }
}

export function jsonError(message: string, status: number = 401) {
  return Response.json({ error: message }, { status })
}
