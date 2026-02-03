import {
  getAuditLogsService,
  getAuditLogsByEntityService,
} from "../services/auditLog.service.js"

export const getAuditLogs = async (req, res) => {
  try {
    const { page, limit } = req.query
    const result = await getAuditLogsService({ page, limit })
    return res.status(result.statusCode).json(result)
  } catch (error) {
    console.error("Get audit logs controller error:", error)
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: "Failed to fetch audit logs",
      data: null,
    })
  }
}

export const getAuditLogsByEntity = async (req, res) => {
  try {
    const { entityType, entityId } = req.params
    const result = await getAuditLogsByEntityService(entityType, entityId)
    return res.status(result.statusCode).json(result)
  } catch (error) {
    console.error("Get audit logs by entity controller error:", error)
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: "Failed to fetch entity audit logs",
      data: null,
    })
  }
}
