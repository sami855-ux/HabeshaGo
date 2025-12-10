import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRouteDto } from './dto/create-route.dto';
import { UpdateRouteDto } from './dto/update-route.dto';

@Injectable()
export class RouteService {
  constructor(private readonly prisma: PrismaService) {}

  // Create route
  async create(createRouteDto: CreateRouteDto) {
    const route = await this.prisma.route.create({
      data: createRouteDto,
    });
    return route;
  }

  // Get all routes with optional filters
  async findAll(query?: { page?: number; limit?: number; isActive?: boolean }) {
    const page = query?.page ?? 1;
    const limit = Math.min(query?.limit ?? 20, 100);
    const skip = (page - 1) * limit;

    const where: any = {};
    if (typeof query?.isActive !== 'undefined') where.isActive = query.isActive;

    const [data, total] = await this.prisma.$transaction([
      this.prisma.route.findMany({
        where,
        skip,
        take: limit,
        orderBy: { id: 'desc' },
      }),
      this.prisma.route.count({ where }),
    ]);

    return { data, meta: { page, limit, total } };
  }

  // Get single route
  async findOne(id: number) {
    const route = await this.prisma.route.findUnique({ where: { id } });
    if (!route) throw new NotFoundException('Route not found');
    return route;
  }

  // Update route
  async update(id: number, dto: UpdateRouteDto) {
    await this.ensureExists(id);
    return this.prisma.route.update({ where: { id }, data: dto });
  }

  // Soft delete route
  async remove(id: number) {
    await this.ensureExists(id);
    return this.prisma.route.update({
      where: { id },
      data: { isActive: false },
    });
  }

  private async ensureExists(id: number) {
    const route = await this.prisma.route.findUnique({ where: { id } });
    if (!route) throw new NotFoundException('Route not found');
  }
}
