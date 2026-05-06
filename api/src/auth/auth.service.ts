import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { User, UserRole } from '../users/entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDeliveryDto } from './dto/register-delivery.dto';

@Injectable()
export class AuthService {
  private static readonly BCRYPT_ROUNDS = 10;

  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, plainPassword: string): Promise<User | null> {
    const user = await this.usersRepo.findOne({
      where: { email: email.trim().toLowerCase() },
      select: ['id', 'email', 'passwordHash', 'nombre', 'role', 'createdAt', 'updatedAt'],
    });
    if (!user) {
      return null;
    }
    const ok = await bcrypt.compare(plainPassword, user.passwordHash);
    if (!ok) {
      return null;
    }
    return user;
  }

  async loginDeliverer(dto: LoginDto) {
    const user = await this.validateUser(dto.email, dto.password);
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }
    if (user.role !== UserRole.DELIVERER) {
      throw new UnauthorizedException('Este usuario no es repartidor');
    }
    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        nombre: user.nombre,
        role: user.role,
      },
    };
  }

  async loginAdmin(dto: LoginDto) {
    const user = await this.validateUser(dto.email, dto.password);
    if (!user) {
      throw new UnauthorizedException('Credenciales invalidas');
    }

    if (user.role !== UserRole.ADMIN) {
      throw new UnauthorizedException('Este usuario no es administrador');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        nombre: user.nombre,
        role: user.role,
      },
    };
  }

  async registerDelivery(dto: RegisterDeliveryDto) {
    const normalizedEmail = dto.email.trim().toLowerCase();
    const existing = await this.usersRepo.findOne({ where: { email: normalizedEmail } });
    if (existing) {
      throw new ConflictException('Ya existe un usuario con ese email');
    }

    const user = this.usersRepo.create({
      email: normalizedEmail,
      nombre: dto.nombre.trim(),
      role: UserRole.DELIVERER,
      passwordHash: await bcrypt.hash(dto.password, AuthService.BCRYPT_ROUNDS),
    });
    const saved = await this.usersRepo.save(user);

    return {
      id: saved.id,
      email: saved.email,
      nombre: saved.nombre,
      role: saved.role,
      createdAt: saved.createdAt,
    };
  }
}
