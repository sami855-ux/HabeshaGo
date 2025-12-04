import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma, Bus } from '@prisma/client';
import { mapPrismaError } from 'src/utils/prismaErrorMapper';

@Injectable()
export class BusService {
  constructor(private readonly prisma: PrismaService) {}

  // Get all buses
  async getAll(): Promise<Bus[]> {
    try {
      return await this.prisma.bus.findMany({
        include: {
          bookings: true,
          positions: {
            orderBy: { timestamp: 'desc' },
            take: 1,
          },
          route: true,
        },
      });
    } catch (error) {
      throw mapPrismaError(error);
    }
  }

  // Get a single bus by ID
  async findOne(id: number): Promise<Bus> {
    const bus = await this.prisma.bus.findUnique({
      where: { id },
      include: {
        bookings: true,
        route: true,
        positions: true,
      },
    });
    if (!bus) throw new NotFoundException(`Bus with ID ${id} not found`);
    return bus;
  }

  // Create a new bus
  async create(data: Prisma.BusCreateInput): Promise<Bus> {
    try {
      return await this.prisma.bus.create({
        data,
        include: {
          route: true,
          positions: {
            orderBy: { timestamp: 'desc' },
            take: 1,
          },
        },
      });
    } catch (error) {
      // This single line handles ALL Prisma errors beautifully
      throw mapPrismaError(error);
    }
  }

  // Update a bus
  async update(id: number, data: Prisma.BusUpdateInput): Promise<Bus> {
    return this.prisma.bus.update({
      where: { id },
      data,
    });
  }

  // Delete a bus
  async remove(id: number): Promise<Bus> {
    return this.prisma.bus.delete({ where: { id } });
  }
}
