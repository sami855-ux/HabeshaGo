import prisma  from "../prisma/client.js";

class MinibusService {
  async create(data) {
    return prisma.minibus.create({ data });
  }

  async getAll() {
    return prisma.minibus.findMany({
      include: { driver: true, route: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async getById(id) {
    const minibus = await prisma.minibus.findUnique({
      where: { id: Number(id) },
      include: { driver: true, route: true },
    });
    if (!minibus) throw new Error("Minibus not found");
    return minibus;
  }

  async update(id, data) {
    return prisma.minibus.update({
      where: { id: Number(id) },
      data,
    });
  }

  async delete(id) {
    return prisma.minibus.delete({
      where: { id: Number(id) },
    });
  }
}

export default new MinibusService();
