import prisma from "../prisma/client.js"
import { successResponse, errorResponse } from "../utils/apiResponse.js"

export const createAuditLogService = async (data) => {
  try {
    // Validate required fields
    const requiredFields = ["action", "entityType", "entityId"]
    for (const field of requiredFields) {
      if (!data[field]) {
        return errorResponse(`Missing required field: ${field}`, 400)
      }
    }

    const log = await prisma.auditLog.create({ data })
    return successResponse("Audit log created successfully", log, 201)
  } catch (error) {
    console.error("Create audit log error:", error)

    if (error.code === "P2002") {
      return errorResponse(
        `Duplicate audit log entry detected: ${error.meta?.target}`,
        409,
      )
    }

    return errorResponse("Failed to create audit log", 500)
  }
}

/**
 * Get all audit logs (paginated)
 * @param {Object} query
 */
export const getAuditLogsService = async ({ limit = 50, page = 1 }) => {
  try {
    // Ensure numeric values
    const safeLimit = Math.max(Number(limit) || 50, 1)
    const safePage = Math.max(Number(page) || 1, 1)

    const logs = await prisma.auditLog.findMany({
      take: safeLimit,
      skip: (safePage - 1) * safeLimit,
      orderBy: { createdAt: "desc" },
    })

    return successResponse("Audit logs retrieved successfully", logs, 200)
  } catch (error) {
    console.error("Get audit logs error:", error)
    return errorResponse("Failed to fetch audit logs", 500)
  }
}

/**
 * Get audit logs for a specific entity (e.g., driver, vehicle)
 * @param {string} entityType
 * @param {string} entityId
 */
export const getAuditLogsByEntityService = async (entityType, entityId) => {
  try {
    if (!entityType || !entityId) {
      return errorResponse("entityType and entityId are required", 400)
    }

    const logs = await prisma.auditLog.findMany({
      where: { entityType, entityId },
      orderBy: { createdAt: "desc" },
    })

    return successResponse(
      `Audit logs for ${entityType} ${entityId} retrieved successfully`,
      logs,
      200,
    )
  } catch (error) {
    console.error("Get audit logs by entity error:", error)
    return errorResponse("Failed to fetch entity audit logs", 500)
  }
}
