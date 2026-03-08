"use client"

import { useState, useEffect } from "react"
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

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <AuditLogsTable
          data={logs}
          isLoading={isLoading}
          onRefresh={handleRefresh}
          onExport={handleExport}
          onDelete={handleDelete}
        />

        {/* Stats Section */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
            <div className="text-2xl font-bold text-gray-900">
              {logs.length}
            </div>
            <div className="text-sm text-gray-600 mt-1">Total Logs</div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="text-xs text-gray-500">Last 30 days</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
            <div className="text-2xl font-bold text-green-600">
              {logs.filter((log) => log.action === "CREATE").length}
            </div>
            <div className="text-sm text-gray-600 mt-1">Create Actions</div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
            <div className="text-2xl font-bold text-blue-600">
              {logs.filter((log) => log.action === "UPDATE").length}
            </div>
            <div className="text-sm text-gray-600 mt-1">Update Actions</div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
            <div className="text-2xl font-bold text-amber-600">
              {logs.filter((log) => log.action === "VERIFY").length}
            </div>
            <div className="text-sm text-gray-600 mt-1">Verifications</div>
          </div>
        </div>
      </div>
    </div>
  )
}
