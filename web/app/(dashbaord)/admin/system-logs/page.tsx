"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  ChevronLeft,
  FileText,
  PlusCircle,
  Edit,
  Shield,
  Calendar,
  RefreshCw,
  Download,
  Trash2,
  TrendingUp,
  Activity,
  Users,
  Database,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { AuditLogsTable } from "@/components/admin-dashboard/auditLogs/auditLogsTable"
import { generateMockAuditLogs } from "@/data/mock-audit-logs"
import { AuditLog } from "@/types/audit-log"

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate API call
    setIsLoading(true)
    setTimeout(() => {
      setLogs(generateMockAuditLogs(125))
      setIsLoading(false)
    }, 1000)
  }, [])

  const handleExport = (selectedIds: string[]) => {
    console.log("Exporting logs:", selectedIds)
    // Implement export logic here
    alert(`Exporting ${selectedIds.length} logs`)
  }

  const handleDelete = (selectedIds: string[]) => {
    console.log("Deleting logs:", selectedIds)
    // Implement delete logic here
    setLogs((prev) => prev.filter((log) => !selectedIds.includes(log.id)))
  }

  const handleRefresh = () => {
    setIsLoading(true)
    setTimeout(() => {
      setLogs(generateMockAuditLogs(125))
      setIsLoading(false)
    }, 800)
  }

  // Calculate stats
  const totalLogs = logs.length
  const createActions = logs.filter((log) => log.action === "CREATE").length
  const updateActions = logs.filter((log) => log.action === "UPDATE").length
  const verifyActions = logs.filter((log) => log.action === "VERIFY").length
  const deleteActions = logs.filter((log) => log.action === "DELETE").length

  const stats = [
    {
      title: "Total Logs",
      value: totalLogs,
      icon: Database,
      color: "from-gray-500 to-gray-600",
      trend: "+12% from last month",
    },
    {
      title: "Create Actions",
      value: createActions,
      icon: PlusCircle,
      color: "from-emerald-500 to-teal-600",
      trend: "+8% from last month",
    },
    {
      title: "Update Actions",
      value: updateActions,
      icon: Edit,
      color: "from-blue-500 to-indigo-600",
      trend: "+5% from last month",
    },
    {
      title: "Verifications",
      value: verifyActions,
      icon: Shield,
      color: "from-amber-500 to-orange-600",
      trend: "+15% from last month",
    },
    {
      title: "Delete Actions",
      value: deleteActions,
      icon: Trash2,
      color: "from-red-500 to-rose-600",
      trend: "-3% from last month",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
      <div className="mx-auto max-w-7xl p-6 md:p-8">
        {/* Header Section */}
        <header className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between mb-8">
          <div className="flex items-start gap-4">
            {/* Back Button */}
            <Button
              variant="ghost"
              size="icon"
              className="mt-1 h-9 w-9 rounded-full border border-gray-200 bg-white shadow-sm hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900/80 dark:hover:bg-gray-800"
              onClick={() => window.history.back()}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground">
                Security & Compliance
              </p>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white md:text-3xl">
                Audit Logs
              </h1>
              <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                <Activity className="h-4 w-4" />
                Track and monitor all system activities and user actions
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Quick Stats Badge */}
            <Badge
              variant="secondary"
              className="hidden items-center gap-2 rounded-full px-3 py-1.5 sm:flex"
            >
              <Calendar className="h-3 w-3" />
              <span className="text-xs font-medium">Last 30 days</span>
            </Badge>

            {/* Action Buttons */}
            <Button
              variant="outline"
              size="sm"
              className="h-9 gap-2 rounded-full border-gray-200 bg-white shadow-sm hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900/80"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCw
                className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
              />
              <span className="hidden sm:inline">Refresh</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="h-9 gap-2 rounded-full border-gray-200 bg-white shadow-sm hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900/80"
              onClick={() => handleExport([])}
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Export</span>
            </Button>
          </div>
        </header>

        {/* Stats Cards Grid */}
        <div className="grid grid-cols-1 gap-5 mb-8 sm:grid-cols-2 lg:grid-cols-5">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -4 }}
              className="h-full"
            >
              <Card className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:shadow-xl dark:border-gray-800 dark:bg-gray-900">
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/5 to-teal-400/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                <CardContent className="relative p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={`rounded-xl bg-gradient-to-br ${stat.color} p-3 shadow-lg transition-transform duration-300 group-hover:scale-110`}
                    >
                      <stat.icon className="h-5 w-5 text-white" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                      {stat.value.toLocaleString()}
                    </p>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {stat.title}
                    </p>
                  </div>

                  {/* Animated progress bar */}
                  <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${Math.min((stat.value / totalLogs) * 100, 100)}%`,
                      }}
                      transition={{ delay: index * 0.05 + 0.3, duration: 1 }}
                      className={`h-full rounded-full bg-gradient-to-r ${stat.color}`}
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Audit Logs Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <AuditLogsTable
            data={logs}
            isLoading={isLoading}
            onRefresh={handleRefresh}
            onExport={handleExport}
            onDelete={handleDelete}
          />
        </motion.div>

        {/* Footer Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 flex items-center justify-between text-xs text-gray-400 dark:text-gray-600"
        >
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span>Logs are retained for 90 days</span>
          </div>
          <div className="flex items-center gap-2">
            <FileText className="h-3 w-3" />
            <span>Last updated: {new Date().toLocaleString()}</span>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
