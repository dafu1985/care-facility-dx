import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import type { AuthenticatedUser } from './jwt.strategy';
import {
  ROLES_KEY,
} from './roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean {
    const requiredRoles =
      this.reflector.getAllAndOverride<UserRole[]>(
        ROLES_KEY,
        [
          context.getHandler(),
          context.getClass(),
        ],
      );

    // @Roles() が付いていないAPIは通す
    if (
      !requiredRoles ||
      requiredRoles.length === 0
    ) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<{
        user?: AuthenticatedUser;
      }>();

    const user = request.user;

    if (!user) {
      return false;
    }

    const hasRole =
      requiredRoles.includes(
        user.role as UserRole,
      );

    if (!hasRole) {
      throw new ForbiddenException(
        'You do not have the required role',
      );
    }

    return true;
  }
}