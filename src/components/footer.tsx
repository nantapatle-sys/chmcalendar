'use client';

import * as React from 'react';
import { useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';

export function Footer() {
  const locale = useLocale();

  return (
    <footer className="w-full bg-slate-50 dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-800 py-4 mt-auto transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
        <div>
          {locale === 'th' ? (
            <span>© 2026 ระบบปฏิทินกิจกรรมและการลงชื่อสอน (CHM Calendar). All rights reserved. | Designed by NANATAPAT.LE</span>
          ) : (
            <span>© 2026 CHM Calendar Log & Attendance Portal. All rights reserved. | Designed by NANATAPAT.LE</span>
          )}
        </div>
        <div className="flex items-center gap-6">
          <Link href="/privacy" className="hover:text-primary dark:hover:text-white transition-colors cursor-pointer">
            {locale === 'th' ? 'นโยบายความเป็นส่วนตัว' : 'Privacy Policy'}
          </Link>
          <Link href="/terms" className="hover:text-primary dark:hover:text-white transition-colors cursor-pointer">
            {locale === 'th' ? 'เงื่อนไขการให้บริการ' : 'Terms of Service'}
          </Link>
        </div>
      </div>
    </footer>
  );
}
