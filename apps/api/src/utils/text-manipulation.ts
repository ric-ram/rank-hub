export const toSnakeUpper = (s: string) =>
	s
		.replaceAll(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
		.replaceAll(/([a-z0-9])([A-Z])/g, '$1_$2')
		.toUpperCase();
