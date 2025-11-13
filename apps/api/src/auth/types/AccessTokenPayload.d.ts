export type AccessTokenPayload = {
	sub: string;
	role?: 'ADMIN';
	iss?: string;
	aud?: string;
	jti?: string;
};
