import dotenv from "dotenv"
dotenv.config()

import http from "http"
import express from "express"
import cookieParser from "cookie-parser"
import passport from "passport"
import cors from "cors"
import helmet from "helmet"
import rateLimit from "express-rate-limit"
import compression from "compression"
import session from "express-session"
import morgan from "morgan"

import "./config/passport.js"
import { initSocket } from "./socket/index.js"
import { REQUIRED_ENV } from "./utils/constants.js"
import "./cron/cron.js"

//  Routes
import minibusReservationRoutes from "./routes/minibusReservation.routes.js"
import notificationRoute from "./routes/notification.route.js"
import transactionRoutes from "./routes/transaction.routes.js"
import bookingRoutes from "./routes/booking.routes.js"
import paymentRoutes from "./routes/payment.routes.js"
import vehicleRoute from "./routes/vehicles.route.js"
import walletRoutes from "./routes/wallet.routes.js"
import driverRoutes from "./routes/driver.routes.js"
import minibusRoute from "./routes/minibus.route.js"
import routeRoutes from "./routes/route.routes.js"
import authRoutes from "./routes/auth.routes.js"
import userRoutes from "./routes/user.route.js"
import busRoutes from "./routes/bus.routes.js"
import auditRoute from "./routes/audit.route.js"
import midPointRoute from "./routes/midpoint.routes.js"
import promoCodeRoute from "./routes/promoCode.route.js"
import statRoute from "./routes/stat.route.js"
// EV charging
import stationRoutes from "./routes/evStation.route.js"
import pointRoutes from "./routes/chargingPoint.route.js"
import sessionRoutes from "./routes/chargingSession.route.js"
import reservationRoutes from "./routes/evReservations.route.js"
import tariffRoutes from "./routes/evTariffs.route.js"
import ratingRoutes from "./routes/ratings.route.js"
import parkingRoute from "./routes/parking.routes.js"
import analyticsRoute from "./routes/analaytics.route.js"

// Validate required env vars on startup
const missingEnv = REQUIRED_ENV.filter((key) => !process.env[key])
if (missingEnv.length > 0) {
  console.error(
    `❌ Missing required environment variables: ${missingEnv.join(", ")}`,
  )
  process.exit(1)
}

const app = express()
const isProduction = process.env.NODE_ENV === "production"

//  Security
app.use(helmet())
app.set("trust proxy", 1)

const allowedOrigins = [
  // Web
  "https://habesha-go-v2.vercel.app",
  // Mobile / Expo
  "https://auth.expo.io",                   // Expo Go OAuth redirect
  `https://auth.expo.io/@samiux855/mobile`, // Your specific app
  ...(!isProduction ? [
    // Web dev
    "http://localhost:3000",
    "http://localhost:3001",
    // Mobile dev
    "exp://localhost:8081",                 // Expo dev client
    "exp://192.168.1.1:8081",              // Local network (optional)
  ] : []),
]

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (mobile apps, curl, Postman)
      if (!origin || allowedOrigins.includes(origin))
        return callback(null, true)
      callback(new Error(`CORS blocked: ${origin}`))
    },
    credentials: true,
  }),
)

// Rate limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests, please try again later." },
})

// tighter limit for GPS pings — high frequency but controlled
const locationLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 120, // 2 pings/sec per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Location update rate limit exceeded." },
})

// tighter limit for auth endpoints
// const authLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 20,
//   standardHeaders: true,
//   legacyHeaders: false,
//   message: { message: "Too many auth attempts, please try again later." },
// })

app.use(globalLimiter)

//  General middleware
app.use(cookieParser("some-key-for-the-secrete"))
app.use(express.json({ limit: "10kb" })) // reject oversized payloads
app.use(express.urlencoded({ extended: true, limit: "10kb" }))
app.use(compression()) // gzip responses
app.use(morgan(isProduction ? "combined" : "dev"))

app.use(
  session({
    secret: "some-key-for-the-secrete",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: isProduction,
      httpOnly: true,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    },
  }),
)

app.use(passport.initialize())
app.use(passport.session())

//  Health check (no auth, no rate limit)
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    env: process.env.NODE_ENV,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  })
})

// API Routes
app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/wallet", walletRoutes)
app.use("/api/notification", notificationRoute)
app.use("/api/transactions", transactionRoutes)
app.use("/api/promo-code", promoCodeRoute)
app.use("/api/drivers", driverRoutes)
app.use("/api/buses", busRoutes)
app.use("/api/route", routeRoutes)
app.use("/api/midpoint", midPointRoute)
app.use("/api/payment", paymentRoutes)
app.use("/api/booking", bookingRoutes)
app.use("/api/vehicles/location", locationLimiter, vehicleRoute) // GPS ping route gets its own limiter
app.use("/api/vehicles", vehicleRoute)
app.use("/api/minibus-reservation", minibusReservationRoutes)
app.use("/api/minibus", minibusRoute)
app.use("/api/audit", auditRoute)
app.use("/api/stat", statRoute)
// EV charging
app.use("/api/ev/station", stationRoutes)
app.use("/api/ev/point", pointRoutes)
app.use("/api/ev/session", sessionRoutes)
app.use("/api/ev/reservation", reservationRoutes)
app.use("/api/ev/tariff", tariffRoutes)
app.use("/api/rating", ratingRoutes)
app.use("/api/parking", parkingRoute)
app.use("/api/analytics", analyticsRoute)

// Server
const server = http.createServer(app)
initSocket(server)

const PORT = process.env.PORT || 5000

server.listen(PORT, () => {
  console.log(
    `🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`,
  )
})

// Graceful shutdown
const shutdown = (signal) => {
  console.log(`\n${signal} received — shutting down gracefully`)
  server.close(() => {
    console.log("✅ HTTP server closed")
    process.exit(0)
  })

  // force exit if server hasn't closed in 10s
  setTimeout(() => {
    console.error("❌ Forcing shutdown after timeout")
    process.exit(1)
  }, 10_000)
}

process.on("SIGTERM", () => shutdown("SIGTERM"))
process.on("SIGINT", () => shutdown("SIGINT"))

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled rejection:", reason)
})

process.on("uncaughtException", (err) => {
  console.error("Uncaught exception:", err)
  process.exit(1)
})
