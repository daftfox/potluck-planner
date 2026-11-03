import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UpdateUserRoleDto } from '../dto/update-user-role.dto';
import { AuthenticatedUser } from '../models/authenticated-user';
import { AuthenticatedRequest } from '../services/authenticated-request';
import { AdminGuard } from '../services/admin.guard';
import { JwtAuthGuard } from '../services/jwt-auth.guard';
import { UsersService } from '../services/users.service';

@Controller('admin/users')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  listUsers() {
    return this.usersService.listUsers();
  }

  @Patch(':id/role')
  updateRole(
    @Req() request: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateUserRoleDto,
  ) {
    return this.usersService.updateRole((request.user as AuthenticatedUser).id, id, dto.role);
  }

  @Delete(':id')
  deleteUser(
    @Req() request: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.usersService.deleteUser((request.user as AuthenticatedUser).id, id);
  }
}
