import express from 'express';

/**
 * Request payload of an authenticated admin user
 *
 * @interface IAuthenticatedRequest
 * @typedef {IAuthenticatedRequest}
 * @extends {express.Request}
 */
export interface IAuthenticatedRequest extends express.Request {
	adminId: string;
	cookies: Record<string, any>;
	signedCookies: Record<string, any>;
}
