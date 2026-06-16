export const appParams = {
	appUrl: typeof window !== 'undefined' ? window.location.origin : '',
	isDevelopment: typeof import.meta !== 'undefined' && import.meta.env.DEV,
}
