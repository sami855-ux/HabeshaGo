import axios from "axios"

// Create Axios instance
export const axiosInstance = axios.create({
  baseURL: "http://localhost:3001/api",
  withCredentials: true,
})
