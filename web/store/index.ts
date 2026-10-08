import { configureStore } from "@reduxjs/toolkit"
import userReducer from "./slices/userSlice"
import walletReducer from "./slices/walletSlice"
import busReducer from "./slices/bus.Slice"
import bookingReducer from "./slices/booking.Slice"
import paymentReducer from "./slices/paymentSlice"
import routeReducer from "./slices/routeslice"
import { configureAuthSession } from "@/services/authSession"
import {
  clearUser,
  establishSession,
  setAccessToken,
  setLoading,
} from "./slices/userSlice"
import supportAgentReducer from "./slices/supportAgentSlice"
import supportCustomerReducer from "./slices/supportCustomerSlice"
import userparkingReducer from "./slices/parkingUserSlice"
import AdminparkingReducer from "./slices/parkingAdminSlice"

export const store = configureStore({
  reducer: {
    user: userReducer,
    wallet: walletReducer,
    bus: busReducer,
    booking: bookingReducer,
    payment: paymentReducer,
    route: routeReducer,
    supportChat: supportAgentReducer,
    supportCustomer: supportCustomerReducer,
    parkingUser: userparkingReducer,
    parking: AdminparkingReducer,
  },
})

configureAuthSession({
  onSessionEstablished: (accessToken, user) => {
    store.dispatch(establishSession({ accessToken, user }))
  },
  onAccessTokenChanged: (accessToken) => {
    store.dispatch(setAccessToken(accessToken))
  },
  onSessionCleared: () => {
    store.dispatch(clearUser())
  },
  onRestoreStarted: () => {
    store.dispatch(setLoading(true))
  },
  onRestoreFinished: () => {
    store.dispatch(setLoading(false))
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

// Use these instead of plain useDispatch and useSelector
// export const useAppDispatch = () => useDispatch<AppDispatch>();
// export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
