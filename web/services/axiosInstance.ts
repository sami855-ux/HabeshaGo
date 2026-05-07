import axios from "axios"

export const axiosInstance = axios.create({
  baseURL: "https://habeshago-pro-v1.onrender.com/api",
  withCredentials: true,
});
