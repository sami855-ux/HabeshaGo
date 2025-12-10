import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { Driver } from '@prisma/client';

@Injectable()
export class DriverService {
  constructor(private readonly prisma: PrismaService) {}

  // Create a new driver
  async create(dto: CreateDriverDto): Promise<Driver> {
    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id: dto.userId },
    });
    if (!user) throw new NotFoundException('User not found');

    // Check if user is already a driver
    const existingDriver = await this.prisma.driver.findUnique({
      where: { userId: dto.userId },
    });
    if (existingDriver) throw new ConflictException('User is already a driver');

    return this.prisma.driver.create({
      data: {
        userId: dto.userId,
        licenseNo: dto.licenseNo,
        experience: dto.experience,
      },
    });
  }

  // Get all drivers
  async findAll(): Promise<Driver[]> {
    return this.prisma.driver.findMany({
      include: { user: true, assignedBus: true, assignedMinibus: true },
    });
  }

  // Get one driver
  async findOne(id: number): Promise<Driver> {
    const driver = await this.prisma.driver.findUnique({
      where: { id },
      include: { user: true, assignedBus: true, assignedMinibus: true },
    });
    if (!driver) throw new NotFoundException('Driver not found');
    return driver;
  }

  // Update driver
  async update(id: number, dto: UpdateDriverDto): Promise<Driver> {
    await this.ensureExists(id);
    return this.prisma.driver.update({ where: { id }, data: dto });
  }

  // Delete driver
  async remove(id: number): Promise<Driver> {
    await this.ensureExists(id);
    return this.prisma.driver.delete({ where: { id } });
  }

  private async ensureExists(id: number) {
    const driver = await this.prisma.driver.findUnique({ where: { id } });
    if (!driver) throw new NotFoundException('Driver not found');
  }
}
