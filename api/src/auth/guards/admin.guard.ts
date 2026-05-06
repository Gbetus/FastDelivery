import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import type { Request } from 'express';
import { UserRole } from '../../users/entities/user.entity';

type JwtUser = {
  id: string;
  email: string;
  nombre: string;
  role: UserRole;
};

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request & { user?: JwtUser }>();
    const user = request.user;
    if (!user) {
      throw new ForbiddenException('Usuario no autenticado');
    }

    if (user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Solo un administrador puede realizar esta accion');
    }

    return true;
  }
}
