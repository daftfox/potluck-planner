import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CreatePotLuckDto } from '../dto/create-potluck.dto';
import { UpdateRsvpDto } from '../dto/update-rsvp.dto';
import { AuthenticatedUser } from '../models/authenticated-user';
import { AuthenticatedRequest } from '../services/authenticated-request';
import { DishesService } from '../services/dishes.service';
import {
  JwtAuthGuard,
  OptionalJwtAuthGuard,
} from '../services/jwt-auth.guard';
import { PotlucksService } from '../services/potlucks.service';

@Controller('potlucks')
export class PotlucksController {
  constructor(
    private readonly potlucksService: PotlucksService,
    private readonly dishesService: DishesService,
  ) {}

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  list(@Req() request: AuthenticatedRequest) {
    const user = request.user as AuthenticatedUser | undefined;
    return this.potlucksService.list(user?.id);
  }

  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard)
  get(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    const user = request.user as AuthenticatedUser | undefined;
    return this.potlucksService.get(id, user?.id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Req() request: AuthenticatedRequest, @Body() dto: CreatePotLuckDto) {
    return this.potlucksService.create(
      (request.user as AuthenticatedUser).id,
      dto,
    );
  }

  @Post(':id/rsvp')
  @UseGuards(JwtAuthGuard)
  saveRsvp(
    @Req() request: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateRsvpDto,
  ) {
    return this.potlucksService.saveRsvp(
      (request.user as AuthenticatedUser).id,
      id,
      dto,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  delete(
    @Req() request: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    const user = request.user as AuthenticatedUser;
    return this.potlucksService.delete(id, user.id, user.role);
  }
}
