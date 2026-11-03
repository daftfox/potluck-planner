import {
  Body,
  Controller,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { SaveDishDto } from '../dto/save-dish.dto';
import { AuthenticatedUser } from '../models/authenticated-user';
import { AuthenticatedRequest } from '../services/authenticated-request';
import { DishesService } from '../services/dishes.service';
import { JwtAuthGuard } from '../services/jwt-auth.guard';
import { PotlucksService } from '../services/potlucks.service';

@Controller('potlucks/:potluckId/dishes')
@UseGuards(JwtAuthGuard)
export class DishesController {
  constructor(
    private readonly dishesService: DishesService,
    private readonly potlucksService: PotlucksService,
  ) {}

  @Post()
  async add(
    @Req() request: AuthenticatedRequest,
    @Param('potluckId', new ParseUUIDPipe()) potluckId: string,
    @Body() dto: SaveDishDto,
  ) {
    await this.dishesService.add(
      (request.user as AuthenticatedUser).id,
      potluckId,
      dto,
    );
    return this.potlucksService.get(potluckId, (request.user as AuthenticatedUser).id);
  }

  @Patch(':dishId')
  async update(
    @Req() request: AuthenticatedRequest,
    @Param('potluckId', new ParseUUIDPipe()) potluckId: string,
    @Param('dishId', new ParseUUIDPipe()) dishId: string,
    @Body() dto: SaveDishDto,
  ) {
    await this.dishesService.update(
      (request.user as AuthenticatedUser).id,
      potluckId,
      dishId,
      dto,
    );
    return this.potlucksService.get(potluckId, (request.user as AuthenticatedUser).id);
  }
}
