import axios from "axios";

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
): Promise<{ data: Route[]; meta: any }> => {
  const res = await axios.get(
    `http://localhost:5000/api/routes?page=${page}&limit=${limit}`
  );
  return res.data;
};

export const getRouteById = async (id: number): Promise<Route> => {
  const res = await axios.get(`http://localhost:5000/api/routes/${id}`);
  return res.data;
};

export const createRoute = async (route: Omit<Route, "id">): Promise<Route> => {
  const res = await axios.post("http://localhost:5000/api/routes", route);
  return res.data.data;
};

export const updateRoute = async (
  id: number,
  route: Partial<Route>
): Promise<Route> => {
  const res = await axios.patch(
    `http://localhost:5000/api/routes/${id}`,
    route
  );
  return res.data;
};

export const deleteRoute = async (id: number) => {
  const res = await axios.delete(`http://localhost:5000/api/routes/${id}`);
  return res.data;
};
