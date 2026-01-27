import { configureStore } from "@reduxjs/toolkit"
import userReducer from "./slices/userSlice"
import walletReducer from "./slices/walletSlice"
import busReducer from "./slices/bus.Slice"
import bookingReducer from "./slices/booking.Slice"
import paymentReducer from "./slices/paymentSlice"
import routeReducer from "./slices/routeslice"
import { setupAxiosInterceptors } from "@/services/setupAxiosInterceptors"

export const store = configureStore({
  reducer: {
    user: userReducer,
    wallet: walletReducer,
    bus: busReducer,
    booking: bookingReducer,
    payment: paymentReducer,
    route: routeReducer,
  },
})

// ✅ SAFE: store is fully initialized now
setupAxiosInterceptors(store)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

// Use these instead of plain useDispatch and useSelector
// export const useAppDispatch = () => useDispatch<AppDispatch>();
// export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
