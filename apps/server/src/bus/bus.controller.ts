import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import { BusService } from './bus.service';
import { Prisma, Bus } from '@prisma/client';
import { ListResponseDto, SingleResponseDto } from 'src/utils/api-response.dto';
import { CreateBusDto } from './dto/create-bus.dto';

@Controller('buses')
export class BusController {
  constructor(private readonly busService: BusService) {}

  @Get()
  async getAllBuses(): Promise<ListResponseDto<Bus>> {
    const buses = await this.busService.getAll();

    const formatted = buses.map((bus) => ({
      ...bus,
      positions: undefined,
    }));

    return new ListResponseDto(formatted);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Bus> {
    return this.busService.findOne(id);
  }

  @Post()
  async createBus(
    @Body() createBusDto: CreateBusDto,
  ): Promise<SingleResponseDto<Bus>> {
    const bus = await this.busService.create(createBusDto);

    const formatted = {
      ...bus,
      positions: undefined,
    };

    return new SingleResponseDto(formatted, 'Bus created successfully');
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: Prisma.BusUpdateInput,
  ): Promise<Bus> {
    return this.busService.update(id, data);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<Bus> {
    return this.busService.remove(id);
  }
}
