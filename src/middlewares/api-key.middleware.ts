import {CanActivate, ExecutionContext, ForbiddenException, Injectable} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {Permissions} from "src/middlewares/decorators/permissions.decorator";
import axios, {isAxiosError} from "axios";
import {extractApiKey} from "../common/tools/extract-api-key";
import {propagateAxiosError} from "../common/tools/propagate-axios-error";

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
            if (requiredPermissions.length === 0) return true;

            const baseUrl = process.env.AUTH_SERVICE_URL;

            const requestAuth = requiredPermissions.map((permission: string) =>
                axios.get(`${baseUrl}/api-keys/can-do/${permission}`, {
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

            if (atLeastOneAllowed) return true;

            const rejected = result.filter((r): r is PromiseRejectedResult => r.status === 'rejected');
            const axiosReject = rejected.find(r => isAxiosError(r.reason));
            if (axiosReject) propagateAxiosError(axiosReject.reason);

            return false;

        } catch (error) {
            throw error;
        }
    }
}