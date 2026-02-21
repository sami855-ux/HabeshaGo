import { configureStore } from "@reduxjs/toolkit"
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux"
import busReducer from "./slices/busSlice"
import userReducer from "./slices/userSlice"
import walletReducer from "./slices/walletSlice"

export const store = configureStore({
  reducer: {
    user: userReducer,
    bus: busReducer,
    wallet: walletReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

// Use these instead of plain useDispatch and useSelector
export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
