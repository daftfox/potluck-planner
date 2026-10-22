import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { PotluckService } from './potluck.service';
import { CreatePotluckDto, UpdatePotluckDto, PaginationDto } from './potluck.dto';

@Controller('potlucks')
export class PotluckController {
  constructor(private readonly potluckService: PotluckService) {}

  @Post()
  create(@Body() createPotluckDto: CreatePotluckDto) {
    return this.potluckService.create(createPotluckDto);
  }

  @Get()
  findAll(@Query() pagination: PaginationDto) {
    return this.potluckService.findAll(pagination);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.potluckService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePotluckDto: UpdatePotluckDto) {
    return this.potluckService.update(id, updatePotluckDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.potluckService.remove(id);
  }
}
