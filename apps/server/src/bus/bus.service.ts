import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBusDto } from './dto/create-bus.dto';
import { UpdateBusDto } from './dto/update-bus.dto';
import { AssignDriverDto } from './dto/assign-driver.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { RecordPositionDto } from './dto/record-position.dto';
import { SeatAvailabilityDto } from './dto/seat-availability.dto';
import { BusStatus, BookingStatus } from '@prisma/client';

@Injectable()
export class BusService {
  constructor(private readonly prisma: PrismaService) {}

  // Create Bus
  async create(createBusDto: CreateBusDto) {
    // Check driver existence if provided
    if (createBusDto.driverId) {
      const driver = await this.prisma.driver.findUnique({
        where: { id: createBusDto.driverId },
      });
      if (!driver) throw new NotFoundException('Driver not found');

      // Ensure driver not assigned to another bus
      const assignedBus = await this.prisma.bus.findFirst({
        where: { driverId: createBusDto.driverId },
      });
      if (assignedBus) {
        throw new ConflictException('Driver already assigned to another bus');
      }
    }

    // Check route existence if provided
    if (createBusDto.routeId) {
      const route = await this.prisma.route.findUnique({
        where: { id: createBusDto.routeId },
      });
      if (!route) throw new NotFoundException('Route not found');
    }

    const bus = await this.prisma.bus.create({
      data: {
        busNumber: createBusDto.busNumber,
        capacity: createBusDto.capacity,
        status: BusStatus.ACTIVE,
        isActive: true,
        driverId: createBusDto.driverId ?? null,
        routeId: createBusDto.routeId ?? null,
      },
    });

    return bus;
  }

  // Get all buses with filters
  async findAll(query: {
    page?: number;
    limit?: number;
    routeId?: number;
    status?: BusStatus;
    isActive?: boolean;
  }) {
    const page = query.page ?? 1;
    const limit = Math.min(query.limit ?? 20, 100);
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.routeId) where.routeId = query.routeId;
    if (query.status) where.status = query.status;
    if (typeof query.isActive !== 'undefined') where.isActive = query.isActive;

    const [data, total] = await this.prisma.$transaction([
      this.prisma.bus.findMany({
        where,
        skip,
        take: limit,
        orderBy: { id: 'desc' },
        include: { driver: true, route: true },
      }),
      this.prisma.bus.count({ where }),
    ]);

    return { data, meta: { page, limit, total } };
  }

  // Get one bus
  async findOne(id: number) {
    const bus = await this.prisma.bus.findUnique({
      where: { id },
      include: { driver: true, route: true },
    });
    if (!bus) throw new NotFoundException('Bus not found');
    return bus;
  }

  // Update bus
  async update(id: number, dto: UpdateBusDto) {
    await this.ensureExists(id);

    // Validate driverId if provided
    if (dto.driverId !== undefined && dto.driverId !== null) {
      const driver = await this.prisma.driver.findUnique({
        where: { id: dto.driverId },
      });
      if (!driver) throw new NotFoundException('Driver not found');

      const otherBus = await this.prisma.bus.findFirst({
        where: { driverId: dto.driverId },
      });
      if (otherBus && otherBus.id !== id) {
        throw new ConflictException('Driver already assigned to another bus');
      }
    }

    // Validate routeId if provided
    if (dto.routeId !== undefined && dto.routeId !== null) {
      const route = await this.prisma.route.findUnique({
        where: { id: dto.routeId },
      });
      if (!route) throw new NotFoundException('Route not found');
    }

    return this.prisma.bus.update({
      where: { id },
      data: {
        ...dto,
        driverId: dto.driverId ?? undefined,
        routeId: dto.routeId ?? undefined,
      },
    });
  }

  // Assign or unassign driver
  async assignDriver(id: number, dto: AssignDriverDto) {
    await this.ensureExists(id);

    if (!dto.driverId) {
      // Unassign driver
      return this.prisma.bus.update({
        where: { id },
        data: { driverId: null },
      });
    }

    const driver = await this.prisma.driver.findUnique({
      where: { id: dto.driverId },
    });
    if (!driver) throw new NotFoundException('Driver not found');

    const otherBus = await this.prisma.bus.findFirst({
      where: { driverId: dto.driverId },
    });
    if (otherBus && otherBus.id !== id) {
      throw new ConflictException('Driver already assigned to another bus');
    }

    return this.prisma.bus.update({
      where: { id },
      data: { driverId: dto.driverId },
    });
  }

  // Update status
  async updateStatus(id: number, dto: UpdateStatusDto) {
    await this.ensureExists(id);
    return this.prisma.bus.update({
      where: { id },
      data: { status: dto.status },
    });
  }

  // Soft delete
  async remove(id: number) {
    await this.ensureExists(id);
    return this.prisma.bus.update({
      where: { id },
      data: { isActive: false },
    });
  }

  // Seat availability
  async getSeatAvailability(
    busId: number,
    dateIso: string,
  ): Promise<SeatAvailabilityDto> {
    const bus = await this.prisma.bus.findUnique({ where: { id: busId } });
    if (!bus) throw new NotFoundException('Bus not found');

    const date = new Date(dateIso);
    const start = new Date(date);
    start.setUTCHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setUTCDate(end.getUTCDate() + 1);

    const bookings = await this.prisma.booking.findMany({
      where: {
        busId,
        date: { gte: start, lt: end },
        status: { not: BookingStatus.CANCELLED },
      },
      select: { seatNumber: true },
    });

    const occupiedSeats = bookings.map((b) => b.seatNumber);
    const freeSeats: number[] = [];
    for (let i = 1; i <= bus.capacity; i++)
      if (!occupiedSeats.includes(i)) freeSeats.push(i);

    return {
      busId,
      date: date.toISOString(),
      capacity: bus.capacity,
      occupiedSeats,
      freeSeats,
    };
  }

  // Record bus position
  async recordPosition(busId: number, dto: RecordPositionDto) {
    await this.ensureExists(busId);
    const timestamp = dto.timestamp ? new Date(dto.timestamp) : new Date();
    return this.prisma.busPosition.create({
      data: {
        busId,
        latitude: dto.latitude,
        longitude: dto.longitude,
        timestamp,
      },
    });
  }

  // Helper to ensure bus exists
  private async ensureExists(id: number) {
    const bus = await this.prisma.bus.findUnique({ where: { id } });
    if (!bus) throw new NotFoundException('Bus not found');
  }
}
