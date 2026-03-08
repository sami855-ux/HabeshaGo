export const successResponse = (message, data = null, statusCode = 200) => ({
  success: true,
  statusCode,
  message,
  data,
})

export const errorResponse = (message, statusCode = 400, data = null) => ({
  success: false,
  statusCode,
  message,
  data,
})
