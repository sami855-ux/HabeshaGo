import { configureStore } from "@reduxjs/toolkit"
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux"
import userReducer, {
  clearUser,
  establishSession,
  setAccessToken,
  setLoading,
} from "./user-slice"
import { configureAuthSession } from "@/services/auth-session"

export const store = configureStore({
  reducer: {
    user: userReducer,
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
export type AppStore = typeof store

export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

export * from "./user-slice"
