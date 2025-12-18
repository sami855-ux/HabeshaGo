import prisma from "../prisma/client.js";
import { NotFound } from "../utils/error.js"; 

export const createRoute = async (data) => {
  const route = await prisma.route.create({ data });
  return route;
};

export const findAllRoutes = async (query) => {
  const page = query.page ? Number(query.page) : 1;
  const limit = Math.min(query.limit ? Number(query.limit) : 20, 100);
  const skip = (page - 1) * limit;

  const where = {};
  if (query.isActive !== undefined) where.isActive = query.isActive === "true";

  const [data, total] = await prisma.$transaction([
    prisma.route.findMany({
      where,
      skip,
      take: limit,
      orderBy: { id: "desc" },
    }),
    prisma.route.count({ where }),
  ]);

  return { data, meta: { page, limit, total } };
};

export const findRouteById = async (id) => {
  const route = await prisma.route.findUnique({ where: { id: Number(id) } });
  if (!route) throw new NotFound("Route not found");
  return route;
};

export const updateRoute = async (id, data) => {
  await findRouteById(id); // ensure exists
  const updated = await prisma.route.update({
    where: { id: Number(id) },
    data,
  });
  return updated;
};

export const removeRoute = async (id) => {
  await findRouteById(id);
  const deleted = await prisma.route.update({
    where: { id: Number(id) },
    data: { isActive: false },
  });
  return { message: "Route removed", route: deleted };
};
