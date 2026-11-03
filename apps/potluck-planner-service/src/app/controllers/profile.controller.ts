import { Body, Controller, Patch, Req, UseGuards } from '@nestjs/common';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { AuthenticatedUser } from '../models/authenticated-user';
import { AuthenticatedRequest } from '../services/authenticated-request';
import { JwtAuthGuard } from '../services/jwt-auth.guard';
import { UsersService } from '../services/users.service';

@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(private readonly usersService: UsersService) {}

  @Patch()
  updateProfile(@Req() request: AuthenticatedRequest, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(
      (request.user as AuthenticatedUser).id,
      dto,
    );
  }
}
