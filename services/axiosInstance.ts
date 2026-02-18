import axios from "axios"

export const axiosInstance = axios.create({
  baseURL: "https://habeshago-v1.onrender.com/api",
  withCredentials: true,
})
