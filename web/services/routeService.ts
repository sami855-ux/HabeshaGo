import { axiosInstance } from "./axiosInstance"

export interface MidPoint {
  name: string;
  lat: number;
  lng: number;
}

export interface Route {
  id: number;
  name: string;
  origin: string;
  destination: string;
  distanceKm: number;
  estimatedTimeMin: number;
  isActive: boolean;
  midPoints: MidPoint[];
}

export const getAllRoutes = async (
  page = 1,
  limit = 20
): Promise<{ data: Route[]; meta: Record<string, unknown> }> => {
  const res = await axiosInstance.get(`/route?page=${page}&limit=${limit}`)
  return res.data;
};

export const getRouteById = async (id: number): Promise<Route> => {
  const res = await axiosInstance.get(`/route/${id}`)
  return res.data;
};

export const createRoute = async (route: Omit<Route, "id">): Promise<Route> => {
  const res = await axiosInstance.post("/route", route)
  return res.data.data;
};

export const updateRoute = async (
  id: number,
  route: Partial<Route>
): Promise<Route> => {
  const res = await axiosInstance.patch(`/route/${id}`, route)
  return res.data;
};

export const deleteRoute = async (id: number) => {
  const res = await axiosInstance.delete(`/route/${id}`)
  return res.data;
};
