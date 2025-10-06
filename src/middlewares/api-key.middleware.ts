import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { Reflector } from '@nestjs/core';
import {Permissions} from "src/middlewares/decorators/permissions.decorator";
import axios from "axios";

@Injectable()
export class ApiKeyGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        try {
            const request = context.switchToHttp().getRequest();
            const rawApiKey = extractApiKey(request);

            const requiredPermissions = this.reflector.get<string[]>(Permissions, context.getHandler());

            const baseUrl = process.env.AUTH_BASE_URL;

            const requestAuth = requiredPermissions.map((permission: string) =>
                axios.get(`${baseUrl}/permissions/${permission}`, {
                    headers: {
                        'x-api-key': rawApiKey,
                        'Content-Type': 'application/json',
                    },
                }),
            );

            const result = await Promise.allSettled(requestAuth);

            const atLeastOneAllowed = result.some(
                (result) => result.status === 'fulfilled' && result.value.data,
            );

            if (!atLeastOneAllowed) {
                throw new ForbiddenException('You do not have permission to access this resource');
            }
            return true;

        } catch (error) {
            if (error instanceof UnauthorizedException || error instanceof ForbiddenException) {
                throw error;
            }

            if (error.isAxiosError && error.response) {
                const status = error.response.status;
                const message = error.response.data?.message || error.message;

                if (status === 401) {
                    throw new UnauthorizedException(message);
                } else if (status === 403) {
                    throw new ForbiddenException(message);
                }
            }

            throw new UnauthorizedException('An unexpected error occurred');
        }
    }
}

export function extractApiKey(request: Request): string {
    const headerValue = request.headers['x-api-key'];

    if (Array.isArray(headerValue)) {
        throw new UnauthorizedException('API key header must be a single value');
    }

    if (typeof headerValue !== 'string' || headerValue.trim().length === 0) {
        throw new UnauthorizedException('API key header missing');
    }

    return headerValue.trim();
}