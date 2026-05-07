import axios from "axios"

export const axiosInstance = axios.create({
  baseURL: "https://habeshago-v2.onrender.com/api",
  withCredentials: true,
});
