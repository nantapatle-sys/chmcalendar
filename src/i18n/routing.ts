import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ['th', 'en'],

  // Used when no locale matches
  defaultLocale: 'th',
  
  // Custom prefixing behavior (can be configured to hide default locale prefix)
  localePrefix: 'always'
});

// Lightweight wrappers around Next.js' navigation APIs
// that will automatically consider the routing configuration
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
