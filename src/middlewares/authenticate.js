import jwt from "jsonwebtoken"
import prisma from "../prisma/client.js"

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authorization token missing" })
    }

    const token = authHeader.split(" ")[1]

    // Verify JWT
    let decoded
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET)
    } catch (err) {
      return res.status(401).json({ message: "Invalid or expired token" })
    }

    // Check if the session exists and is not revoked
    const session = await prisma.session.findUnique({
      where: { id: decoded.sessionId },
      include: { user: true },
    })

    if (!session || session.revoked) {
      return res.status(401).json({ message: "Session invalid or expired" })
    }

    if (session.user.isSuspended) {
      return res.status(403).json({ message: "Account suspended" })
    }

    // Attach user info to request
    req.user = {
      id: session.user.id,
      role: session.user.role,
      sessionId: session.id,
    }

    next()
  } catch (err) {
    console.error("Authentication error:", err)
    res.status(500).json({ message: "Internal server error" })
  }
}
