import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { AuthenticatedUser } from '../models/authenticated-user';
import { JwtAuthGuard } from '../services/jwt-auth.guard';
import { AuthenticatedRequest } from '../services/authenticated-request';
import { UsersService } from '../services/users.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getCurrentUser(@Req() request: AuthenticatedRequest) {
    const user = request.user as AuthenticatedUser;
    return this.usersService.getProfile(user.id);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Req() request: AuthenticatedRequest): Promise<void> {
    await this.authService.logout((request.user as AuthenticatedUser).jwtId);
  }
}
