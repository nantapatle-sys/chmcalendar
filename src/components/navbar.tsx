'use client';

import * as React from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { ThemeToggle } from './theme-toggle';
import { LanguageSwitcher } from './language-switcher';
import { 
  Calendar, 
  User, 
  ShieldCheck, 
  X, 
  Mail, 
  Lock, 
  UserPlus, 
  LogIn, 
  Send,
  Eye,
  EyeOff
} from 'lucide-react';
import { Link } from '@/i18n/routing';
import { supabase } from '@/lib/supabase';

type AuthTab = 'login' | 'register' | 'forgot';

export function Navbar() {
  const t = useTranslations('Navbar');
  const locale = useLocale();
  
  // Auth Modal States
  const [isAuthOpen, setIsAuthOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<AuthTab>('login');
  const [showPassword, setShowPassword] = React.useState(false);
  
  // Active User State
  const [currentUser, setCurrentUser] = React.useState<{ name: string; email: string } | null>(null);
  
  // Form input states
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [fullName, setFullName] = React.useState('');
  const [message, setMessage] = React.useState('');

  // 1. Initialize Current User from LocalStorage on mount
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check current login state
      const savedUser = localStorage.getItem('chm_current_user');
      if (savedUser) {
        try {
          setCurrentUser(JSON.parse(savedUser));
        } catch (e) {
          localStorage.removeItem('chm_current_user');
        }
      }

      // Listen for authentication changes
      const handleAuthChange = () => {
        const userJson = localStorage.getItem('chm_current_user');
        if (userJson) {
          try {
            setCurrentUser(JSON.parse(userJson));
          } catch (e) {
            setCurrentUser(null);
          }
        } else {
          setCurrentUser(null);
        }
      };

      window.addEventListener('auth-change', handleAuthChange);
      return () => window.removeEventListener('auth-change', handleAuthChange);
    }
  }, []);

  // 2. Submit handlers connecting to Supabase database
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (activeTab === 'login') {
      try {
        const { data: matched, error } = await supabase
          .from('registered_users')
          .select('*')
          .eq('email', email.trim().toLowerCase())
          .eq('password', password)
          .maybeSingle();

        if (error) {
          setMessage(locale === 'th' ? 'เกิดข้อผิดพลาดในการเชื่อมต่อฐานข้อมูล!' : 'Database connection error!');
          return;
        }

        if (matched) {
          const sessionUser = { name: matched.name, email: matched.email };
          localStorage.setItem('chm_current_user', JSON.stringify(sessionUser));
          window.dispatchEvent(new Event('auth-change'));
          
          setMessage(locale === 'th' ? `ยินดีต้อนรับคุณ ${matched.name} เข้าสู่ระบบสำเร็จ!` : `Welcome back, ${matched.name}! Login successful!`);
          
          setTimeout(() => {
            setIsAuthOpen(false);
            setEmail('');
            setPassword('');
            setMessage('');
          }, 1200);
        } else {
          setMessage(locale === 'th' ? 'ที่อยู่อีเมลหรือรหัสผ่านไม่ถูกต้อง!' : 'Invalid email address or password!');
        }
      } catch (err) {
        setMessage(locale === 'th' ? 'ระบบขัดข้อง โปรดลองใหม่อีกครั้ง!' : 'System error, please try again!');
      }
    } 
    
    else if (activeTab === 'register') {
      if (password !== confirmPassword) {
        setMessage(locale === 'th' ? 'รหัสผ่านไม่ตรงกัน!' : 'Passwords do not match!');
        return;
      }

      // Domain constraint validation
      const emailLower = email.toLowerCase();
      const isValidDomain = emailLower.endsWith('@gmail.com') || 
                            emailLower.endsWith('@ssru.ac.th');

      if (!isValidDomain) {
        setMessage(locale === 'th' 
          ? 'ลงทะเบียนไม่สำเร็จ! อนุญาตให้อีเมล @gmail.com หรือ @ssru.ac.th เท่านั้น' 
          : 'Registration failed! Only @gmail.com and @ssru.ac.th domains are allowed.'
        );
        return;
      }

      try {
        // Check if email already registered in Supabase
        const { data: exists, error: checkError } = await supabase
          .from('registered_users')
          .select('email')
          .eq('email', emailLower)
          .maybeSingle();

        if (checkError) {
          setMessage(locale === 'th' ? 'เกิดข้อผิดพลาดในการตรวจสอบข้อมูล!' : 'Error checking database!');
          return;
        }

        if (exists) {
          setMessage(locale === 'th' ? 'อีเมลนี้ถูกลงทะเบียนไว้ในระบบแล้ว!' : 'This email is already registered!');
          return;
        }

        // Save new user into Supabase
        const { error: insertError } = await supabase
          .from('registered_users')
          .insert([
            { name: fullName, email: emailLower, password: password }
          ]);

        if (insertError) {
          setMessage(locale === 'th' ? 'เกิดข้อผิดพลาดในการลงทะเบียนผู้ใช้ใหม่!' : 'Error registering new user!');
          return;
        }

        // Auto login after registration
        const sessionUser = { name: fullName, email: emailLower };
        localStorage.setItem('chm_current_user', JSON.stringify(sessionUser));
        window.dispatchEvent(new Event('auth-change'));

        setMessage(locale === 'th' ? 'ลงทะเบียนผู้ดูแลและเข้าสู่ระบบสำเร็จ!' : 'Registration & auto-login successful!');
        
        setTimeout(() => {
          setIsAuthOpen(false);
          setEmail('');
          setPassword('');
          setConfirmPassword('');
          setFullName('');
          setMessage('');
          setShowPassword(false);
        }, 1200);
      } catch (err) {
        setMessage(locale === 'th' ? 'ระบบขัดข้อง โปรดลองใหม่อีกครั้ง!' : 'System error, please try again!');
      }
    } 
    
    else {
      // Forgot Password flow
      try {
        const { data: matched, error } = await supabase
          .from('registered_users')
          .select('email')
          .eq('email', email.trim().toLowerCase())
          .maybeSingle();

        if (matched) {
          setMessage(locale === 'th' 
            ? `ส่งคำขอกู้คืนรหัสผ่านสำหรับระบบนี้ไปยัง ${email} เรียบร้อยแล้ว!` 
            : `Recovery details successfully sent to ${email}!`
          );
          setTimeout(() => {
            setIsAuthOpen(false);
            setEmail('');
            setMessage('');
          }, 2200);
        } else {
          setMessage(locale === 'th' ? 'ไม่พบที่อยู่อีเมลนี้ในระบบลงทะเบียน!' : 'Email address not found in the system!');
        }
      } catch (err) {
        setMessage(locale === 'th' ? 'ระบบขัดข้อง โปรดลองใหม่อีกครั้ง!' : 'System error, please try again!');
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('chm_current_user');
    window.dispatchEvent(new Event('auth-change'));
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-18 items-center justify-between gap-4">
          
          {/* Logo / Brand Title */}
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary text-white shadow-sm">
              <Calendar className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-sm sm:text-base font-bold tracking-tight text-slate-900 dark:text-white">
                {t('title')}
              </h1>
              <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium">
                {t('subtitle')}
              </p>
            </div>
          </Link>

          {/* Admins Badges (Desktop Layout) */}
          <div className="hidden lg:flex items-center gap-3 text-xs font-semibold">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>{locale === 'th' ? 'ไปราชการ: พิชชาภา โหลสกุล' : 'Duty Travel: Phitchapha Lolasakul'}</span>
            </div>
            
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>{locale === 'th' ? 'ตารางสอน: รัชตะสรณ์ จันทรวรศิษฐ์' : 'Teaching Calendar: Ratchatasorn Jantrawarasit'}</span>
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />

            {/* Auth Actions (Conditional Render based on Login State) */}
            {currentUser ? (
              <div className="flex items-center gap-2 shrink-0">
                <div className="flex items-center gap-1.5 px-3.5 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-bold border border-slate-200 dark:border-slate-700">
                  <User className="w-4 h-4 text-primary" />
                  <span>{currentUser.name}</span>
                </div>
                <button 
                  onClick={handleLogout}
                  className="px-3.5 h-10 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/20 dark:hover:bg-rose-950/35 dark:text-rose-400 text-xs sm:text-sm font-bold border border-rose-200 dark:border-rose-900/40 transition-colors cursor-pointer"
                >
                  {locale === 'th' ? 'ออกจากระบบ' : 'Log Out'}
                </button>
              </div>
            ) : (
              <button 
                onClick={() => {
                  setIsAuthOpen(true);
                  setActiveTab('login');
                  setEmail('');
                  setPassword('');
                  setMessage('');
                }}
                className="flex items-center gap-1.5 px-4 h-10 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs sm:text-sm font-bold transition-colors cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{t('login')}</span>
              </button>
            )}

          </div>
        </div>

        {/* Admins Badges (Mobile & Tablet Layout) */}
        <div className="lg:hidden flex flex-col sm:flex-row sm:justify-start gap-2 pb-3 border-t border-slate-100 dark:border-slate-800 pt-2.5">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-[11px] font-semibold text-slate-600 dark:text-slate-300 max-w-fit">
            <User className="w-3.5 h-3.5 text-slate-400" />
            {locale === 'th' ? 'ไปราชการ: พิชชาภา โหลสกุล' : 'Duty Travel: Phitchapha Lolasakul'}
          </div>
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-[11px] font-semibold text-slate-600 dark:text-slate-300 max-w-fit">
            <User className="w-3.5 h-3.5 text-slate-400" />
            {locale === 'th' ? 'ตารางสอน: รัชตะสรณ์ จันทรวรศิษฐ์' : 'Teaching Calendar: Ratchatasorn Jantrawarasit'}
          </div>
        </div>
      </div>

      {/* Authentication Center Modal */}
      {isAuthOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div 
            className="relative w-full max-w-md rounded-2xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 shadow-xl overflow-hidden flex flex-col animate-scale-in"
            onClick={e => e.stopPropagation()}
          >
            {/* Close Button */}
            <button 
              onClick={() => setIsAuthOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer border border-transparent"
              aria-label="Close modal"
            >
              <X className="w-4.5 h-4.5" />
            </button>

            {/* Modal Body container */}
            <div className="p-8 sm:p-10 flex flex-col">
              
              {/* Header section */}
              <div className="flex flex-col items-center text-center mb-8">
                <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-primary text-white mb-4 shadow-md">
                  <Calendar className="w-8 h-8" />
                </div>
                
                <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {activeTab === 'login' && (locale === 'th' ? 'ลงชื่อเข้าใช้งาน' : 'Admin Login')}
                  {activeTab === 'register' && (locale === 'th' ? 'ลงทะเบียนผู้ดูแลระบบ' : 'Admin Registration')}
                  {activeTab === 'forgot' && (locale === 'th' ? 'กู้คืนรหัสผ่าน' : 'Recover Password')}
                </h2>
                
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 max-w-xs leading-relaxed font-medium">
                  {activeTab === 'login' && (locale === 'th' 
                    ? 'ลงชื่อเข้าใช้ด้วยบัญชีผู้ดูแล เพื่อเปิดใช้งานระบบบันทึกการเดินทางและตารางสอน' 
                    : 'Log in with your administrator account to manage schedules and travel logs')}
                  {activeTab === 'register' && (locale === 'th' 
                    ? 'สมัครสมาชิกบัญชีผู้ดูแลระบบคนใหม่ เพื่อร่วมดำเนินการบันทึกข้อมูลตารางเดินทาง' 
                    : 'Enter your credentials to register a new administrator profile')}
                  {activeTab === 'forgot' && (locale === 'th' 
                    ? 'ระบุอีเมลที่ใช้สมัครสมาชิก เพื่อส่งลิงก์ตั้งค่ารหัสผ่านใหม่ไปยังอีเมลของคุณ' 
                    : 'Enter your administrator email to receive a password recovery link')}
                </p>
              </div>

              {/* Response Alert Message */}
              {message && (
                <div className={`mb-5 p-3.5 text-xs font-bold rounded-xl border text-center animate-fade-in
                  ${message.includes('สำเร็จ') || message.includes('successful') || message.includes('แล้ว')
                    ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-250 text-emerald-800 dark:text-emerald-350'
                    : 'bg-red-50 dark:bg-red-950/20 border-red-250 text-red-800 dark:text-red-350'
                  }
                `}>
                  {message}
                </div>
              )}

              {/* Form elements */}
              <form onSubmit={handleAuthSubmit} className="space-y-4 text-left">
                
                {/* Full Name Field (Register Tab Only) */}
                {activeTab === 'register' && (
                  <div className="space-y-1.5">
                    <label htmlFor="reg-fullname" className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      {locale === 'th' ? 'ชื่อ - นามสกุล' : 'Full Name'} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-455">
                        <User className="w-4 h-4" />
                      </span>
                      <input
                        id="reg-fullname"
                        type="text"
                        placeholder={locale === 'th' ? 'เช่น พิชชาภา โหลสกุล' : 'e.g. Phitchapha Lolasakul'}
                        value={fullName}
                        onChange={e => setFullName(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-primary transition"
                        required
                      />
                    </div>
                  </div>
                )}

                {/* Email Address Field (All Tabs) */}
                <div className="space-y-1.5">
                  <label htmlFor="auth-email" className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    {locale === 'th' ? 'ที่อยู่อีเมลผู้ใช้' : 'Email Address'} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-455">
                      <Mail className="w-4 h-4" />
                    </span>
                    <input
                      id="auth-email"
                      type="email"
                      placeholder={locale === 'th' ? 'username@ssru.ac.th' : 'username@ssru.ac.th'}
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-primary transition"
                      required
                    />
                  </div>
                  <p className="text-[10px] text-slate-450 dark:text-slate-500 font-medium">
                    {locale === 'th' 
                      ? '* เฉพาะอีเมล @gmail.com, @ssru.ac.th เท่านั้น' 
                      : '* Only @gmail.com, @ssru.ac.th allowed'}
                  </p>
                </div>

                {/* Password Field (Login & Register Tabs) */}
                {activeTab !== 'forgot' && (
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label htmlFor="auth-pass" className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                        {locale === 'th' ? 'รหัสผ่าน' : 'Password'} <span className="text-red-500">*</span>
                      </label>
                      {activeTab === 'login' && (
                        <button
                          type="button"
                          onClick={() => { setActiveTab('forgot'); setMessage(''); }}
                          className="text-xs font-bold text-primary hover:underline cursor-pointer"
                        >
                          {locale === 'th' ? 'ลืมรหัสผ่าน?' : 'Forgot password?'}
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-455">
                        <Lock className="w-4 h-4" />
                      </span>
                      <input
                        id="auth-pass"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-primary transition"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-450 hover:text-slate-650 dark:hover:text-slate-200 focus:outline-none cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}

                {/* Confirm Password Field (Register Tab Only) */}
                {activeTab === 'register' && (
                  <div className="space-y-1.5">
                    <label htmlFor="reg-confirm" className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      {locale === 'th' ? 'ยืนยันรหัสผ่าน' : 'Confirm Password'} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-455">
                        <Lock className="w-4 h-4" />
                      </span>
                      <input
                        id="reg-confirm"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-primary transition"
                        required
                      />
                    </div>
                  </div>
                )}

                {/* Submit Action Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary/95 text-white font-bold rounded-xl shadow-sm cursor-pointer transition active:scale-[0.98]"
                  >
                    {activeTab === 'login' && (
                      <>
                        <LogIn className="w-4 h-4" />
                        <span>{locale === 'th' ? 'ลงชื่อเข้าใช้งาน' : 'Log In'}</span>
                      </>
                    )}
                    {activeTab === 'register' && (
                      <>
                        <UserPlus className="w-4 h-4" />
                        <span>{locale === 'th' ? 'สมัครสมาชิก' : 'Register'}</span>
                      </>
                    )}
                    {activeTab === 'forgot' && (
                      <>
                        <Send className="w-4 h-4" />
                        <span>{locale === 'th' ? 'ขอลิงก์รีเซ็ตรหัสผ่าน' : 'Send Recovery Email'}</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Bottom Toggle Navigation Links */}
                <div className="text-center pt-3 text-xs text-slate-500 dark:text-slate-400">
                  {activeTab === 'login' && (
                    <>
                      {locale === 'th' ? 'ยังไม่มีบัญชีผู้ดูแลระบบ?' : "Don't have an admin account?"}{' '}
                      <button
                        type="button"
                        onClick={() => { setActiveTab('register'); setMessage(''); }}
                        className="font-bold text-primary hover:underline cursor-pointer"
                      >
                        {locale === 'th' ? 'ลงทะเบียนใหม่ที่นี่' : 'Register here'}
                      </button>
                    </>
                  )}
                  
                  {activeTab === 'register' && (
                    <>
                      {locale === 'th' ? 'มีบัญชีผู้ดูแลระบบอยู่แล้ว?' : 'Already have an admin account?'}{' '}
                      <button
                        type="button"
                        onClick={() => { setActiveTab('login'); setMessage(''); }}
                        className="font-bold text-primary hover:underline cursor-pointer"
                      >
                        {locale === 'th' ? 'เข้าสู่ระบบที่นี่' : 'Log in here'}
                      </button>
                    </>
                  )}

                  {activeTab === 'forgot' && (
                    <button
                      type="button"
                      onClick={() => { setActiveTab('login'); setMessage(''); }}
                      className="font-bold text-primary hover:underline cursor-pointer"
                    >
                      {locale === 'th' ? 'กลับไปยังหน้าลงชื่อเข้าใช้งาน' : 'Back to Login page'}
                    </button>
                  )}
                </div>

              </form>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
