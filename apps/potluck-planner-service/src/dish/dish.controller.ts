import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ValidationPipe,
} from '@nestjs/common';
import { DishService } from './dish.service';
import { CreateDishDto } from './dish.dto';

@Controller('dishes')
export class DishController {
  constructor(
    private readonly dishService: DishService,
    private readonly validationPipe: ValidationPipe,
  ) {}

  @Post()
  create(@Body(this.validationPipe!) createDishDto: CreateDishDto) {
    return this.dishService.create(createDishDto);
  }

  @Get()
  findAll() {
    return this.dishService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.dishService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body(this.validationPipe!) updateDishDto: CreateDishDto) {
    return this.dishService.update(id, updateDishDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.dishService.remove(id);
  }
}
