/** Public site URL without a trailing slash. See `site-url.ts` for resolution rules. */
export { SITE_URL } from '@/lib/site-url';

export const IS_PROD = process.env.NODE_ENV === 'production';
