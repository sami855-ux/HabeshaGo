"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { Loader2Icon } from "lucide-react"

const defaultIcons = {
  success: (
    <div
      style={{
        width: 20,
        height: 20,
        borderRadius: "50%",
        background: "linear-gradient(135deg, #22c55e, #16a34a)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 0 8px rgba(34,197,94,0.4)",
        flexShrink: 0,
      }}
    >
      <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
        <path
          d="M2 6l3 3 5-5"
          stroke="white"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  ),
  error: (
    <div
      style={{
        width: 20,
        height: 20,
        borderRadius: "50%",
        background: "linear-gradient(135deg, #ef4444, #dc2626)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 0 8px rgba(239,68,68,0.4)",
        flexShrink: 0,
      }}
    >
      <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
        <path
          d="M3 3l6 6M9 3l-6 6"
          stroke="white"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    </div>
  ),
  warning: (
    <div
      style={{
        width: 20,
        height: 20,
        borderRadius: "50%",
        background: "linear-gradient(135deg, #f59e0b, #d97706)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 0 8px rgba(245,158,11,0.4)",
        flexShrink: 0,
      }}
    >
      <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
        <path
          d="M6 2v5M6 9v1"
          stroke="white"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    </div>
  ),
  info: (
    <div
      style={{
        width: 20,
        height: 20,
        borderRadius: "50%",
        background: "linear-gradient(135deg, #3b82f6, #2563eb)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 0 8px rgba(59,130,246,0.4)",
        flexShrink: 0,
      }}
    >
      <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
        <path
          d="M6 5v4M6 3v1"
          stroke="white"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    </div>
  ),
  loading: <Loader2Icon className="size-4 animate-spin text-orange-500" />,
}

const Toaster = ({
  theme: themeProp,
  className,
  toastOptions,
  icons,
  style,
  ...props
}: ToasterProps) => {
  const { theme = "system" } = useTheme()
  const activeTheme = themeProp ?? (theme as ToasterProps["theme"])

  return (
    <Sonner
      theme={activeTheme}
      className={`toaster group toaster-group ${className || ""}`}
      icons={{
        ...defaultIcons,
        ...icons,
      }}
      toastOptions={{
        ...toastOptions,
        classNames: {
          toast:
            "group toast font-jakarta border border-black/10 dark:border-white/15 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl backdrop-saturate-150 text-zinc-950 dark:text-zinc-50 shadow-[0_16px_40px_rgba(0,0,0,0.08),0_2px_6px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.8)] dark:shadow-[0_20px_48px_rgba(0,0,0,0.6),0_4px_12px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.1)] rounded-[18px] py-3.5 px-4 gap-3 text-sm font-medium data-[type=success]:border-emerald-500/40 data-[type=error]:border-red-500/40 data-[type=warning]:border-amber-500/40 data-[type=info]:border-blue-500/40",
          title:
            "!text-zinc-950 dark:!text-white font-semibold text-sm tracking-tight",
          description:
            "!text-zinc-600 dark:!text-zinc-300 text-xs leading-relaxed font-normal",
          actionButton:
            "bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 font-medium text-xs rounded-full px-3.5 py-1.5 shadow-xs hover:opacity-90 transition-all",
          cancelButton:
            "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium text-xs rounded-full px-3.5 py-1.5 hover:opacity-90 transition-all",
          closeButton:
            "bg-black/5 dark:bg-white/10 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-black/5 dark:border-white/10 rounded-full transition-colors",
          ...toastOptions?.classNames,
        },
      }}
      style={
        {
          "--normal-bg": "var(--background)",
          "--normal-text": "var(--foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "18px",
          fontFamily: "var(--font-jakarta), 'Plus Jakarta Sans', sans-serif",
          ...style,
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
