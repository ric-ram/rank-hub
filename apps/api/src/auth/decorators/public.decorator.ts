import { SetMetadata } from '@nestjs/common';

/**
 * Marks a route handler (or controller) as public, bypassing JWT authentication.
 *
 * @returns {void}
 * A Nest metadata decorator that sets `isPublic` to `true`.
 *
 * @remarks
 * - The `JwtGuard` must check for `isPublic` to honor this decorator.
 * - Apply at the controller level to mark all routes in that controller as public.
 */
export const Public = () => SetMetadata('isPublic', true);
