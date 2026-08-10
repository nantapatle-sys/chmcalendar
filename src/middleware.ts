import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Match all pathnames except for
  // - API routes (/api)
  // - Static assets (/static, /_next, etc.)
  // - Images/icons (favicon.ico, etc.)
  // - Files in public/ (like .xlsx files, images)
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
