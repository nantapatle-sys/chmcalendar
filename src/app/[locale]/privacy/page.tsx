'use client';

import * as React from 'react';
import { useLocale } from 'next-intl';
import { Shield, Eye, Lock, FileText, Mail, ArrowLeft } from 'lucide-react';
import { Link } from '@/i18n/routing';

export default function PrivacyPage() {
  const locale = useLocale();

  const isTh = locale === 'th';

  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8 animate-slide-up">
      {/* Back Button */}
      <Link 
        href="/" 
        className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-500 hover:text-primary dark:text-slate-400 dark:hover:text-white transition-colors mb-6 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{isTh ? 'กลับสู่หน้าหลัก' : 'Back to Home'}</span>
      </Link>

      {/* Main Container */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden p-6 sm:p-10 space-y-8">
        
        {/* Header Section */}
        <div className="border-b border-slate-200 dark:border-slate-700 pb-6 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-primary/10 text-primary">
            <Shield className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {isTh ? 'นโยบายความเป็นส่วนตัว' : 'Privacy Policy'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5 font-bold uppercase tracking-wider">
              {isTh ? 'แก้ไขล่าสุด: 11 สิงหาคม 2026' : 'Last Updated: August 11, 2026'}
            </p>
          </div>
        </div>

        {/* Content Section */}
        <div className="space-y-6 text-sm text-slate-700 dark:text-slate-350 leading-relaxed font-semibold">
          <p>
            {isTh 
              ? 'ระบบปฏิทินกิจกรรมและการลงชื่อสอน (CHM Calendar) ตระหนักถึงความสำคัญของการคุ้มครองข้อมูลส่วนบุคคลของท่าน นโยบายนี้ระบุหลักเกณฑ์ในการเก็บรวบรวม ใช้ และป้องกันข้อมูลส่วนบุคคลของท่านเมื่อท่านเข้าใช้บริการของเรา'
              : 'The Activity Calendar & Teaching Attendance Portal (CHM Calendar) recognizes the importance of protecting your personal data. This policy details our rules for collecting, using, and safeguarding your personal information when utilizing our service.'
            }
          </p>

          {/* Section 1 */}
          <div className="space-y-2">
            <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Eye className="w-4 h-4 text-primary shrink-0" />
              <span>{isTh ? '1. ข้อมูลส่วนบุคคลที่เราเก็บรวบรวม' : '1. Personal Information We Collect'}</span>
            </h2>
            <p>
              {isTh
                ? 'เราเก็บรวบรวมข้อมูลส่วนบุคคลที่ท่านให้ไว้เมื่อลงทะเบียนหรือลงชื่อเข้าใช้งานระบบ ได้แก่ ชื่อ-นามสกุล, อีเมลสถาบัน (@ssru.ac.th) หรืออีเมลส่วนตัว (@gmail.com) และข้อมูลรหัสผ่านที่ถูกเข้ารหัสปลอดภัย'
                : 'We collect personal information that you provide when registering or signing in to the system, including your full name, institutional email address (@ssru.ac.th) or Gmail address (@gmail.com), and encrypted password credentials.'
              }
            </p>
          </div>

          {/* Section 2 */}
          <div className="space-y-2">
            <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary shrink-0" />
              <span>{isTh ? '2. วัตถุประสงค์ในการเก็บรวบรวมและใช้งานข้อมูล' : '2. Purpose of Collection & Usage'}</span>
            </h2>
            <p className="mb-2">
              {isTh
                ? 'เรานำข้อมูลของท่านไปใช้งานในวัตถุประสงค์ดังต่อไปนี้:'
                : 'We process and use your information for the following specific business purposes:'
              }
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>{isTh ? 'เพื่อยืนยันตัวตนและการเข้าถึงสิทธิ์ของผู้ดูแลระบบ (Admin/Superadmin)' : 'To authenticate users and verify access privileges for Admin and Superadmin accounts.'}</li>
              <li>{isTh ? 'เพื่อระบุผู้บันทึกข้อมูลตารางการไปราชการและวิชาเช็คชื่อสอน' : 'To record and log details of event creators for duty travel and teaching attendance records.'}</li>
              <li>{isTh ? 'เพื่อพัฒนาคุณภาพ ความปลอดภัย และการตอบสนองที่ดียิ่งขึ้นของแอปพลิเคชัน' : 'To maintain overall application performance, reliability, security, and responsive UI behaviors.'}</li>
            </ul>
          </div>

          {/* Section 3 */}
          <div className="space-y-2">
            <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-primary shrink-0" />
              <span>{isTh ? '3. การรักษาความปลอดภัยและความปลอดภัยของข้อมูล' : '3. Data Security and Access Controls'}</span>
            </h2>
            <p>
              {isTh
                ? 'ข้อมูลการเข้าสู่ระบบและรหัสผ่านทั้งหมดจะได้รับรักษาความปลอดภัยระดับมาตรฐานคลาวด์ ผ่านฐานข้อมูล Supabase และจัดเก็บแยกอย่างปลอดภัยจากบุคคลภายนอก เราจำกัดการเข้าถึงการทำธุรกรรมแก้ไขเฉพาะแอดมินที่มีประวัติและสิทธิ์ที่ถูกต้องเท่านั้น'
                : 'All account credentials and transaction histories are secured utilizing standard cloud database architectures hosted on Supabase. Only authenticated administrators with authorized roles are permitted database mutation queries.'
              }
            </p>
          </div>

          {/* Section 4 */}
          <div className="space-y-2">
            <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Mail className="w-4 h-4 text-primary shrink-0" />
              <span>{isTh ? '4. การติดต่อติดต่อประสานงาน' : '4. Inquiries & Contact Info'}</span>
            </h2>
            <p>
              {isTh
                ? 'หากท่านมีข้อสงสัยเกี่ยวกับนโยบายความเป็นส่วนตัวฉบับนี้ หรือประสงค์จะใช้สิทธิ์ในการปรับปรุงแก้ไขข้อมูล สามารถติดต่อผู้ดูแลระบบผ่านอีเมลที่แจ้งไว้ในหน้าแรกได้ทันที'
                : 'If you have any questions regarding this Privacy Policy or wish to query modifications of your personal data record, please do not hesitate to contact our portal support via the contact email listed on the homepage.'
              }
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
