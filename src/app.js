import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import driverRoutes from "./routes/driver.routes.js"
import busRoutes from "./routes/bus.routes.js"
import routeRoutes from "./routes/route.routes.js"
import bookingRoutes from "./routes/booking.routes.js"
import paymentRoutes from "./routes/payment.routes.js"
import walletRoutes from "./routes/wallet.routes.js"
import minibusReservationRoutes from "./routes/minibusReservation.routes.js"
import minibusRoute from "./routes/minibus.route.js"


const app = express();

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes)
app.use("/drivers", driverRoutes);
app.use("/bus", busRoutes)
app.use("/route", routeRoutes)
app.use("/booking", bookingRoutes)
app.use("/payment", paymentRoutes)
app.use("/wallet", walletRoutes)
app.use("/minibus-reservation", minibusReservationRoutes)
app.use("/minibus", minibusRoute)

export default app;
