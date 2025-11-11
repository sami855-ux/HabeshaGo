import { Injectable, Inject } from '@nestjs/common';
import { PrismaClient, User } from '@prisma/client';
import { hashString } from '../utils/crypto.util';

@Injectable()
export class UsersService {
  constructor( private prisma: PrismaClient) {}

  async createUser(data: {
    name?: string;
    email?: string;
    password?: string;
    phone?: string;
  }): Promise<User> {
    const pwd = data.password ? await hashString(data.password) : null;
    return this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: pwd,
        phone: data.phone,
      },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findById(id: number) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async markEmailVerified(userId: number) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { emailVerified: true },
    });
  }
}
