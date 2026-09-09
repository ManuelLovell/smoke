import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL = 'https://vrwtdtmnbyhaehtitrlb.supabase.co';
export const SUPABASE_ANON_KEY = 'sb_publishable_xE5IYBsNg0HgRbPsmyhF6w_k7O-wj7B';

let activeAccessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
	activeAccessToken = token && token.trim().length > 0 ? token.trim() : null;
};

export const getAccessToken = (): string | null => activeAccessToken;

const authHeaderFetch: typeof fetch = async (input, init) => {
	const mergedHeaders = new Headers(input instanceof Request ? input.headers : undefined);

	if (init?.headers) {
		const providedHeaders = new Headers(init.headers);
		providedHeaders.forEach((value, key) => {
			mergedHeaders.set(key, value);
		});
	}

	if (!mergedHeaders.has('apikey')) {
		mergedHeaders.set('apikey', SUPABASE_ANON_KEY);
	}

	if (activeAccessToken) {
		mergedHeaders.set('authorization', `Bearer ${activeAccessToken}`);
	}

	return window.fetch(input, {
		...init,
		headers: mergedHeaders,
	});
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
	auth: {
		persistSession: false,
		autoRefreshToken: false,
		detectSessionInUrl: false,
	},
	global: {
		fetch: authHeaderFetch,
	},
});

