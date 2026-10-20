import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { PotluckService } from './potluck.service';
import { CreatePotluckDto } from './potluck.dto';

@Controller('potlucks')
export class PotluckController {
  constructor(private readonly potluckService: PotluckService) {}

  @Post()
  create(@Body() createPotluckDto: CreatePotluckDto) {
    return this.potluckService.create(createPotluckDto);
  }

  @Get()
  findAll() {
    return this.potluckService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.potluckService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePotluckDto: Partial<CreatePotluckDto>) {
    return this.potluckService.update(id, updatePotluckDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.potluckService.remove(id);
  }
}
