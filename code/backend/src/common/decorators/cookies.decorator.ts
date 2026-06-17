import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Custom decorator to extract cookies from the HTTP request.
 * If a specific cookie name is provided, returns that cookie's value.
 * Otherwise, returns the entire cookies object.
 */
export const Cookies = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return data ? request.cookies?.[data] : request.cookies;
  },
);
