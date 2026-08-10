'use client';

import * as React from 'react';
import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/routing';
import { Globe } from 'lucide-react';

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const toggleLocale = () => {
    const nextLocale = locale === 'th' ? 'en' : 'th';
    router.replace(pathname, { locale: nextLocale });
  };

  return (
    <button
      onClick={toggleLocale}
      className="flex items-center gap-2 px-3 h-10 rounded-xl border border-border/50 text-sm font-semibold transition-all duration-300 hover:bg-muted/85 focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground cursor-pointer shadow-sm hover:shadow-md active:scale-95"
      title={locale === 'th' ? 'Switch to English' : 'เปลี่ยนเป็นภาษาไทย'}
      aria-label="Toggle language"
    >
      <Globe className="w-4 h-4 text-muted-foreground animate-pulse" />
      <span className="uppercase tracking-wider text-xs font-bold min-w-[20px] text-center">
        {locale === 'th' ? 'EN' : 'TH'}
      </span>
    </button>
  );
}
