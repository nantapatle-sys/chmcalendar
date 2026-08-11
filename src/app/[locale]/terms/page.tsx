'use client';

import * as React from 'react';
import { useLocale } from 'next-intl';
import { Scale, Edit3, ShieldAlert, CheckCircle, ArrowLeft } from 'lucide-react';
import { Link } from '@/i18n/routing';

export default function TermsPage() {
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
            <Scale className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {isTh ? 'เงื่อนไขการให้บริการ' : 'Terms of Service'}
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
              ? 'ยินดีต้อนรับสู่ระบบปฏิทินกิจกรรมและการลงชื่อสอน (CHM Calendar) เมื่อเข้าใช้งาน ถือว่าท่านยอมรับเงื่อนไขและข้อตกลงการให้บริการนี้ กรุณาอ่านเงื่อนไขด้านล่างโดยละเอียดเพื่อผลประโยชน์ของท่าน'
              : 'Welcome to the Activity Calendar & Teaching Attendance Portal (CHM Calendar). By accessing this site, you agree to comply with and be bound by the following Terms of Service. Please read these terms carefully before proceeding.'
            }
          </p>

          {/* Section 1 */}
          <div className="space-y-2">
            <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-primary shrink-0" />
              <span>{isTh ? '1. การตกลงยอมรับข้อกำหนดการใช้งาน' : '1. Acceptance of Terms'}</span>
            </h2>
            <p>
              {isTh
                ? 'ระบบนี้สร้างขึ้นเพื่ออำนวยความสะดวกในการจัดตารางกิจกรรมและการสอนภายในวิทยาลัยการจัดการอุตสาหกรรมบริการ ผู้เข้าใช้งานทั่วไปสามารถรับชมข้อมูลปฏิทินได้ และผู้ที่มีบัญชีผู้ดูแลระบบ (Admin) เท่านั้นที่มีสิทธิ์เข้าบันทึก แก้ไข หรือลบข้อมูล'
                : 'This platform is provided exclusively to facilitate the mapping of academic schedules and administrative logs within the College of Hospitality Management. General visitors can query the public calendar, while only registered Admin accounts are permitted to write or edit entries.'
              }
            </p>
          </div>

          {/* Section 2 */}
          <div className="space-y-2">
            <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-primary shrink-0" />
              <span>{isTh ? '2. สิทธิ์และความรับผิดชอบของแอดมิน' : '2. Admin Conduct & Responsibilities'}</span>
            </h2>
            <p className="mb-2">
              {isTh
                ? 'ผู้ดูแลระบบที่ได้รับอนุญาตตกลงที่จะรักษากฎความรับผิดชอบร่วมกันดังนี้:'
                : 'As an authorized administrator on the platform, you agree to abide by the following conduct codes:'
              }
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>{isTh ? 'ลงชื่อเข้าใช้งานด้วยข้อมูลจริงของตนเองเท่านั้น' : 'Authenticate using only your own, genuine credentials.'}</li>
              <li>{isTh ? 'ไม่กระทำการแก้ไข ปรับปรุง หรือลบกิจกรรมของแอดมินท่านอื่นโดยไม่ได้รับอนุญาต (เว้นแต่จะดำเนินการโดยสิทธิ์พิเศษ Superadmin)' : 'Refrain from unauthorized updates or deletions of other administrators’ logs, unless authorized as a Superadmin.'}</li>
              <li>{isTh ? 'รับผิดชอบข้อมูลและไฟล์เอกสารแนบทุกชิ้นที่อัปโหลดเข้าสู่ระบบให้ถูกต้องและเหมาะสม' : 'Ensure all documents and file attachments uploaded comply with organizational guidelines and file size limits.'}</li>
            </ul>
          </div>

          {/* Section 3 */}
          <div className="space-y-2">
            <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-primary shrink-0" />
              <span>{isTh ? '3. การปฏิเสธความรับผิดชอบและการคุ้มครองข้อมูล' : '3. Disclaimer of Liability'}</span>
            </h2>
            <p>
              {isTh
                ? 'ทางผู้พัฒนาจัดระบบนี้ขึ้นเพื่อให้ข้อมูลตามสภาพความเป็นจริง ข้อมูลใด ๆ ที่แอดมินนำเข้าเป็นความรับผิดชอบส่วนบุคคลของผู้นำเข้านั้น ๆ ทางระบบขอสงวนสิทธิ์ในการแก้ไขหรือปิดกั้นการเข้าถึงระบบชั่วคราวเพื่อวัตถุประสงค์ในการซ่อมบำรุงหรือพัฒนาซอฟต์แวร์ตามสมควร'
                : 'The application is provided "as is" and "as available". The content posted by administrators is their sole responsibility. The portal management reserves the right to modify schedules or temporarily suspend services for maintenance and software updates.'
              }
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
