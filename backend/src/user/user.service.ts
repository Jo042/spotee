import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import type { AuthUser } from 'src/auth/types/auth-user.type';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  findBySupabaseId(supabaseId: string) {
    return this.prisma.user.findUnique({
      where: { supabaseId },
    });
  }

  async getOrCreateUser(authUser: AuthUser) {
    const existingUser = await this.findBySupabaseId(authUser.supabaseId);

    if (existingUser) {
      return existingUser;
    }

    const defaultName = authUser.email.split('@')[0];

    return this.prisma.user.create({
      data: {
        supabaseId: authUser.supabaseId,
        email: authUser.email,
        name: defaultName,
      },
    });
  }

  findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  updateUser(
    id: string,
    data: { name?: string; bio?: string; avatarUrl?: string },
  ) {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }
}
