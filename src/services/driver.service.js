import prisma from "../prisma/client.js";

export const createDriverService = async (dto) => {
  const user = await prisma.user.findUnique({ where: { id: dto.userId } });
  if (!user) throw new Error("User not found");

  const existingDriver = await prisma.driver.findUnique({
    where: { userId: dto.userId },
  });
  if (existingDriver) throw new Error("User is already a driver");

  return prisma.driver.create({
    data: {
      userId: dto.userId,
      licenseNo: dto.licenseNo,
      experience: dto.experience,
    },
  });
};

export const getAllDriversService = async () => {
  return prisma.driver.findMany({
    include: { user: true, assignedBus: true, assignedMinibus: true },
  });
};

export const getDriverService = async (id) => {
  const driver = await prisma.driver.findUnique({
    where: { id: Number(id) },
    include: { user: true, assignedBus: true, assignedMinibus: true },
  });
  if (!driver) throw new Error("Driver not found");
  return driver;
};

export const updateDriverService = async (id, dto) => {
  const driver = await prisma.driver.findUnique({ where: { id: Number(id) } });
  if (!driver) throw new Error("Driver not found");
  return prisma.driver.update({ where: { id: Number(id) }, data: dto });
};

export const deleteDriverService = async (id) => {
  const driver = await prisma.driver.findUnique({ where: { id: Number(id) } });
  if (!driver) throw new Error("Driver not found");
  return prisma.driver.delete({ where: { id: Number(id) } });
};
