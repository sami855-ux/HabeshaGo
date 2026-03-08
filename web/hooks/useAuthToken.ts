export function useAuthToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("accessToken");
}
