import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { BusService } from './bus.service';
import { CreateBusDto } from './dto/create-bus.dto';
import { UpdateBusDto } from './dto/update-bus.dto';
import { AssignDriverDto } from './dto/assign-driver.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { RecordPositionDto } from './dto/record-position.dto';

@Controller('buses')
export class BusController {
  constructor(private readonly busService: BusService) {}

  @Post()
  async create(@Body() dto: CreateBusDto) {
    return this.busService.create(dto);
  }

  @Get()
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('routeId') routeId?: number,
    @Query('status') status?: string,
    @Query('isActive') isActive?: string,
  ) {
    const parsedIsActive =
      typeof isActive === 'string' ? isActive === 'true' : undefined;
    return this.busService.findAll({
      page,
      limit,
      routeId,
      status: status as any,
      isActive: parsedIsActive,
    });
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.busService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateBusDto,
  ) {
    return this.busService.update(id, dto);
  }

  @Patch(':id/assign-driver')
  async assignDriver(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AssignDriverDto,
  ) {
    return this.busService.assignDriver(id, dto);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStatusDto,
  ) {
    return this.busService.updateStatus(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.busService.remove(id);
  }

  @Get(':id/availability')
  async availability(
    @Param('id', ParseIntPipe) id: number,
    @Query('date') date: string,
  ) {
    return this.busService.getSeatAvailability(id, date);
  }

  @Post(':id/position')
  async recordPosition(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RecordPositionDto,
  ) {
    return this.busService.recordPosition(id, dto);
  }
}
