import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';
import { AdminGuard } from './guards/admin.guard';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { User } from '../users/entities/user.entity';
import { RegisterDeliveryDto } from './dto/register-delivery.dto';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('deliverer/login')
  loginDeliverer(@Body() dto: LoginDto) {
    return this.authService.loginDeliverer(dto);
  }

  @Post('admin/login')
  loginAdmin(@Body() dto: LoginDto) {
    return this.authService.loginAdmin(dto);
  }

  @Post('deliverer/register')
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  registerDelivery(@Body() dto: RegisterDeliveryDto) {
    return this.authService.registerDelivery(dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('auth/me')
  me(@Req() req: Request & { user: User }) {
    const u = req.user;
    return {
      id: u.id,
      email: u.email,
      nombre: u.nombre,
      role: u.role,
    };
  }
}
