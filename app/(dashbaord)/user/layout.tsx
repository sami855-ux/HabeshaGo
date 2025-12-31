"use client"

import React, { useEffect, useState } from "react"
import Sidebar from "@/components/user-dashboard/Sidebar"
import Header from "@/components/user-dashboard/Header"
import { useDispatch, useSelector } from "react-redux"
import { AppDispatch } from "@/store"
import { fetchCurrentUser } from "@/store/slices/userSlice"

function UserLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const dispatch = useDispatch<AppDispatch>()

  useEffect(() => {
    dispatch(fetchCurrentUser())
  }, [dispatch])

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden bg-black/50"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
        w-64 transform transition-transform duration-300 ease-in-out
        lg:relative lg:translate-x-0 lg:flex-shrink-0
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          isSidebarOpen={sidebarOpen}
        />

        <main className="flex-1 overflow-auto p-2 md:p-4 bg-card">
          <div className="bg-card">{children}</div>
        </main>
      </div>
    </div>
  )
}

export default UserLayout
