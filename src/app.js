import dotenv from "dotenv"
dotenv.config()

import http from "http"
import express from "express"
import cookieParser from "cookie-parser"
import session from "express-session"
import passport from "passport"
import cors from "cors"

import "./config/passport.js"
import { initSocket } from "./socket/index.js"

// Routes
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

// Ev charging routes
import stationRoutes from "./routes/evStation.route.js"
import pointRoutes from "./routes/chargingPoint.route.js"
import sessionRoutes from "./routes/chargingSession.route.js"
import reservationRoutes from "./routes/evReservations.route.js"
import tariffRoutes from "./routes/evTariffs.route.js"
import ratingRoutes from "./routes/ratings.route.js"

const app = express()

app.use(cookieParser())

app.use(
  cors({
    origin: true,
    credentials: true,
  })
)

app.use(express.json())

app.use(
  session({
    secret: "secretkey",
    resave: false,
    saveUninitialized: false,
  }),
)

app.use(passport.initialize())
app.use(passport.session())

// routes
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
app.use("/api/vehicles", vehicleRoute)
app.use("/api/minibus-reservation", minibusReservationRoutes)
app.use("/api/minibus", minibusRoute)
app.use("/api/audit", auditRoute)

// Ev charging routes
app.use("/api/ev/station", stationRoutes);
app.use("/api/ev/point", pointRoutes);
app.use("/api/ev/session", sessionRoutes);
app.use("/api/ev/reservation", reservationRoutes);
app.use("/api/ev/tariff", tariffRoutes);

app.use("/api/rating", ratingRoutes);

const server = http.createServer(app)

initSocket(server)

const PORT = process.env.PORT || 5000

server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
})
