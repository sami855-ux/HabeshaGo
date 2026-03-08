"use client"

import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux"
import type { RootState, AppDispatch, store } from "./index"

export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
export type AppStore = typeof store
