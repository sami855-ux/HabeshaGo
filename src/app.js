import express from "express"
import cors from "cors"

import authRoutes from "./routes/auth.routes.js"
import driverRoutes from "./routes/driver.routes.js"
import busRoutes from "./routes/bus.routes.js"
import routeRoutes from "./routes/route.routes.js"
import bookingRoutes from "./routes/booking.routes.js"
import paymentRoutes from "./routes/payment.routes.js"
import walletRoutes from "./routes/wallet.routes.js"
import minibusReservationRoutes from "./routes/minibusReservation.routes.js"
import minibusRoute from "./routes/minibus.route.js"

import "dotenv/config"

const PORT = process.env.PORT || 5000

const app = express()

app.use(cors())
app.use(express.json())

app.use("/api/auth", authRoutes)
app.use("/api/drivers", driverRoutes)
app.use("/api/bus", busRoutes)
app.use("/api/route", routeRoutes)
app.use("/api/booking", bookingRoutes)
app.use("/api/payment", paymentRoutes)
app.use("/api/wallet", walletRoutes)
app.use("/api/minibus-reservation", minibusReservationRoutes)
app.use("/api/minibus", minibusRoute)

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
})
