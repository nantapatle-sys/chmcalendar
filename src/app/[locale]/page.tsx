'use client';

import * as React from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { supabase } from '@/lib/supabase';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Clock, 
  Users, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Upload, 
  X,
  FileCheck,
  GraduationCap,
  Pencil,
  Trash2
} from 'lucide-react';

interface Event {
  id: string;
  type: 'duty' | 'teaching';
  title: string;
  date: string; // YYYY-MM-DD
  endDate?: string;
  time: string;
  participants: string[];
  status: 'confirmed' | 'pending';
  attachment?: string;
  createdBy?: string; // Tracks which admin created this event
}

interface CalendarCell {
  dayNumber: number;
  dateString: string;
  isCurrentMonth: boolean;
  cellDate: Date;
}

// Fallback Mock Events across June - September 2026
const defaultMockEvents = (locale: string): Event[] => [
  // June 2026
  {
    id: 'e-j1',
    type: 'teaching',
    title: locale === 'th' ? 'ปฐมนิเทศหลักสูตรนวัตกรรมการจัดการการบริการ' : 'Orientation: Hospitality Management Innovation',
    date: '2026-06-22',
    time: '09:00 - 12:00',
    participants: ['รัชตะสรณ์ จันทรวรศิษฐ์'],
    status: 'confirmed',
    createdBy: 'รัชตะสรณ์ จันทรวรศิษฐ์'
  },
  // July 2026
  {
    id: 'e-j2',
    type: 'duty',
    title: locale === 'th' ? 'โครงการพัฒนาข้อเสนอแผนงานวิจัย เพื่อสนับสนุนงานมูลฐาน' : 'Research Proposal Development for Fundamental Fund',
    date: '2026-07-20',
    endDate: '2026-07-21',
    time: '09:00 - 16:30',
    participants: ['ชลลดา', 'อรพัฒน์', 'ชนิษฐา'],
    status: 'pending',
    createdBy: 'พิชชาภา โหลสกุล'
  },
  {
    id: 'e-j3',
    type: 'teaching',
    title: locale === 'th' ? 'วิชา CHM1201 การจัดการการบริการและการท่องเที่ยว' : 'Course CHM1201 Hospitality & Tourism Management',
    date: '2026-07-09',
    time: '13:00 - 16:00',
    participants: ['รัชตะสรณ์ จันทรวรศิษฐ์'],
    status: 'confirmed',
    createdBy: 'รัชตะสรณ์ จันทรวรศิษฐ์'
  },
  // August 2026 (Today is August 10, 2026)
  // August 10 has 3 events (1 duty, 2 teaching)
  {
    id: 'e-a1',
    type: 'duty',
    title: locale === 'th' ? 'ลงพื้นที่แนะแนวและประชาสัมพันธ์หลักสูตรการจัดการอุตสาหกรรมบริการ' : 'Public Relations & Student Recruitment Campaign',
    date: '2026-08-10',
    time: '09:00 - 15:30',
    participants: ['พิชชาภา โหลสกุล', 'อ.รัชตะสรณ์ จันทรวรศิษฐ์'],
    status: 'confirmed',
    attachment: 'pr-campaign.pdf',
    createdBy: 'พิชชาภา โหลสกุล'
  },
  {
    id: 'e-a2',
    type: 'teaching',
    title: locale === 'th' ? 'วิชา CHM3205 เทคโนโลยีและนวัตกรรมการบริการเชิงสร้างสรรค์ (กลุ่ม 1)' : 'Course CHM3205 Tech & Service Innovation (Sec 1)',
    date: '2026-08-10',
    time: '13:00 - 16:00',
    participants: ['รัชตะสรณ์ จันทรวรศิษฐ์'],
    status: 'confirmed',
    createdBy: 'รัชตะสรณ์ จันทรวรศิษฐ์'
  },
  {
    id: 'e-a3',
    type: 'teaching',
    title: locale === 'th' ? 'วิชา CHM3205 เทคโนโลยีและนวัตกรรมการบริการเชิงสร้างสรรค์ (กลุ่ม 2)' : 'Course CHM3205 Tech & Service Innovation (Sec 2)',
    date: '2026-08-10',
    time: '16:00 - 19:00',
    participants: ['รัชตะสรณ์ จันทรวรศิษฐ์'],
    status: 'confirmed',
    createdBy: 'รัชตะสรณ์ จันทรวรศิษฐ์'
  },
  // August 12 has 1 event
  {
    id: 'e-a4',
    type: 'teaching',
    title: locale === 'th' ? 'การสัมมนาเตรียมความพร้อมฝึกประสบการณ์วิชาชีพ' : 'Seminar: Professional Experience Internship Preparation',
    date: '2026-08-12',
    time: '13:00 - 16:00',
    participants: ['รัชตะสรณ์ จันทรวรศิษฐ์'],
    status: 'confirmed',
    createdBy: 'รัชตะสรณ์ จันทรวรศิษฐ์'
  },
  // August 15 has 5 events (2 duty, 3 teaching)
  {
    id: 'e-a5',
    type: 'duty',
    title: locale === 'th' ? 'ประชุมความร่วมมือทางวิชาการกับศิษย์เก่าวิทยาลัยการจัดการ' : 'Academic Collaboration Meeting with Alumni',
    date: '2026-08-15',
    time: '09:00 - 12:00',
    participants: ['พิชชาภา โหลสกุล', 'คณาจารย์ในสาขา'],
    status: 'confirmed',
    createdBy: 'พิชชาภา โหลสกุล'
  },
  {
    id: 'e-a6',
    type: 'duty',
    title: locale === 'th' ? 'ตรวจประกันคุณภาพการศึกษาภายในระดับหลักสูตร' : 'Internal Education Quality Assurance Assessment',
    date: '2026-08-15',
    time: '13:00 - 17:00',
    participants: ['พิชชาภา โหลสกุล', 'คณะกรรมการประเมิน'],
    status: 'confirmed',
    attachment: 'qa-assessment.pdf',
    createdBy: 'พิชชาภา โหลสกุล'
  },
  {
    id: 'e-a7',
    type: 'teaching',
    title: locale === 'th' ? 'ตรวจโครงงานวิจัยการศึกษาเอกเทศกลุ่มการโรงแรม' : 'Independent Hospitality Study Project Exam (Sec 1)',
    date: '2026-08-15',
    time: '09:00 - 11:30',
    participants: ['รัชตะสรณ์ จันทรวรศิษฐ์'],
    status: 'confirmed',
    createdBy: 'รัชตะสรณ์ จันทรวรศิษฐ์'
  },
  {
    id: 'e-a8',
    type: 'teaching',
    title: locale === 'th' ? 'ตรวจโครงงานวิจัยการศึกษาเอกเทศกลุ่มการโรงแรม' : 'Independent Hospitality Study Project Exam (Sec 2)',
    date: '2026-08-15',
    time: '11:30 - 14:00',
    participants: ['รัชตะสรณ์ จันทรวรศิษฐ์'],
    status: 'confirmed',
    createdBy: 'รัชตะสรณ์ จันทรวรศิษฐ์'
  },
  {
    id: 'e-a9',
    type: 'teaching',
    title: locale === 'th' ? 'ตรวจโครงงานวิจัยการศึกษาเอกเทศกลุ่มการโรงแรม' : 'Independent Hospitality Study Project Exam (Sec 3)',
    date: '2026-08-15',
    time: '14:30 - 17:00',
    participants: ['รัชตะสรณ์ จันทรวรศิษฐ์'],
    status: 'confirmed',
    createdBy: 'รัชตะสรณ์ จันทรวรศิษฐ์'
  },
  // August 20 has 3 events (1 duty, 2 teaching)
  {
    id: 'e-a10',
    type: 'duty',
    title: locale === 'th' ? 'เจรจาความร่วมมือสหกิจศึกษา ณ สำนักงานใหญ่โรงแรมเซนทารา' : 'MOU Discussion: Centara Hotels & Resorts Head Office',
    date: '2026-08-20',
    time: '10:00 - 14:30',
    participants: ['พิชชาภา โหลสกุล'],
    status: 'pending',
    createdBy: 'พิชชาภา โหลสกุล'
  },
  {
    id: 'e-a11',
    type: 'teaching',
    title: locale === 'th' ? 'วิชา CHM4109 สัมมนาประเด็นปัจจุบันในอุตสาหกรรมบริการ' : 'Course CHM4109 Seminar on Current Issues in Hospitality',
    date: '2026-08-20',
    time: '09:00 - 12:00',
    participants: ['รัชตะสรณ์ จันทรวรศิษฐ์'],
    status: 'confirmed',
    createdBy: 'รัชตะสรณ์ จันทรวรศิษฐ์'
  },
  {
    id: 'e-a12',
    type: 'teaching',
    title: locale === 'th' ? 'วิชา CHM3211 การจัดการอีเวนต์และการประชุมสัมมนา' : 'Course CHM3211 MICE & Event Management',
    date: '2026-08-20',
    time: '13:00 - 16:00',
    participants: ['รัชตะสรณ์ จันทรวรศิษฐ์'],
    status: 'confirmed',
    createdBy: 'รัชตะสรณ์ จันทรวรศิษฐ์'
  },
  // September 2026
  {
    id: 'e-s1',
    type: 'duty',
    title: locale === 'th' ? 'ประชุมสภาวิชาการวิทยาลัยการจัดการอุตสาหกรรมบริการ' : 'CHM Academic Council Council Assembly',
    date: '2026-09-03',
    time: '09:30 - 12:00',
    participants: ['พิชชาภา โหลสกุล'],
    status: 'confirmed',
    createdBy: 'พิชชาภา โหลสกุล'
  }
];

export default function HomePage() {
  const t = useTranslations();
  const locale = useLocale();
  
  // Base date for state tracking (starts at current date)
  const [currentDate, setCurrentDate] = React.useState<Date>(new Date()); 
  
  // Active login status states
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [currentUser, setCurrentUser] = React.useState<{ name: string; email: string } | null>(null);

  // Event being edited (null if adding a new one)
  const [editingEvent, setEditingEvent] = React.useState<Event | null>(null);
  const [events, setEvents] = React.useState<Event[]>([]);
  const [userCount, setUserCount] = React.useState<number>(10);

  // 1. Fetch events & users count from Supabase on mount
  React.useEffect(() => {
    const fetchEvents = async () => {
      const fallbackEvents = defaultMockEvents(locale);
      try {
        // Fetch count of users from database
        const { count, error: countError } = await supabase
          .from('registered_users')
          .select('*', { count: 'exact', head: true });
        
        if (!countError && count !== null) {
          setUserCount(count);
        }

        const { data, error } = await supabase
          .from('events')
          .select('*')
          .order('date', { ascending: true });

        if (error) {
          console.warn('Supabase not fully configured or error, falling back to mock data:', error);
          setEvents(fallbackEvents);
          return;
        }

        if (data && data.length > 0) {
          // Map fields from snake_case database schema to camelCase typescript model
          const mappedEvents: Event[] = data.map((e: any) => ({
            id: e.id,
            type: e.type,
            title: e.title,
            date: e.date,
            endDate: e.end_date || undefined,
            time: e.time,
            participants: e.participants || [],
            status: e.status,
            attachment: e.attachment || undefined,
            createdBy: e.created_by
          }));
          setEvents(mappedEvents);
        } else {
          // Empty database: Seed it with mock events for demonstration
          console.log('Database empty, seeding with default mock events...');
          const seedData = fallbackEvents.map((e: Event) => ({
            id: e.id,
            type: e.type,
            title: e.title,
            date: e.date,
            end_date: e.endDate || null,
            time: e.time,
            participants: e.participants,
            status: e.status,
            attachment: e.attachment || null,
            created_by: e.createdBy || 'System'
          }));

          const { error: seedError } = await supabase.from('events').insert(seedData);
          if (!seedError) {
            setEvents(fallbackEvents);
          } else {
            console.error('Failed to seed events:', seedError);
            setEvents(fallbackEvents);
          }
        }
      } catch (err) {
        console.warn('Supabase connection failed, using fallback mock data:', err);
        setEvents(fallbackEvents);
      }
    };

    fetchEvents();
  }, [locale]);

  // 2. Local storage Auth Sync
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleAuthChange = () => {
        const userJson = localStorage.getItem('chm_current_user');
        if (userJson) {
          try {
            const user = JSON.parse(userJson);
            setCurrentUser(user);
            setIsLoggedIn(true);
          } catch (e) {
            setCurrentUser(null);
            setIsLoggedIn(false);
          }
        } else {
          setCurrentUser(null);
          setIsLoggedIn(false);
        }
      };
      handleAuthChange();
      window.addEventListener('auth-change', handleAuthChange);
      return () => window.removeEventListener('auth-change', handleAuthChange);
    }
  }, []);
  
  // Modals visibility states
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [isViewerOpen, setIsViewerOpen] = React.useState(false);
  const [selectedCell, setSelectedCell] = React.useState<CalendarCell | null>(null);
  
  // Form State
  const [selectedType, setSelectedType] = React.useState<'duty' | 'teaching'>('duty');
  const [selectedStatus, setSelectedStatus] = React.useState<'confirmed' | 'pending'>('confirmed');
  const [startDate, setStartDate] = React.useState('2026-08-10');
  const [endDate, setEndDate] = React.useState('');
  const [startTime, setStartTime] = React.useState('');
  const [endTime, setEndTime] = React.useState('');
  const [participants, setParticipants] = React.useState('');
  const [details, setDetails] = React.useState('');
  
  // File Upload State
  const [uploadedFileName, setUploadedFileName] = React.useState('');
  const [uploadedFileUrl, setUploadedFileUrl] = React.useState('');
  const [isUploading, setIsUploading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Hover Tooltip State
  const [hoveredCell, setHoveredCell] = React.useState<CalendarCell | null>(null);
  const [tooltipPosition, setTooltipPosition] = React.useState<{
    x: number;
    y: number;
    height: number;
    topRow: boolean;
    colIndex: number;
  } | null>(null);

  const handlePrevMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  };

  const handleGoToToday = () => {
    setCurrentDate(new Date()); 
  };

  // Helper for holidays lookup
  const getHoliday = (dateStr: string) => {
    const parts = dateStr.split('-');
    if (parts.length < 3) return null;
    const mmdd = `${parts[1]}-${parts[2]}`;
    
    const holidays: Record<string, { nameTh: string; nameEn: string; lunarTh?: string }> = {
      '01-01': { nameTh: 'วันขึ้นปีใหม่', nameEn: 'New Year\'s Day' },
      '04-06': { nameTh: 'วันจักรี', nameEn: 'Chakri Memorial Day' },
      '04-13': { nameTh: 'วันสงกรานต์', nameEn: 'Songkran Festival' },
      '04-14': { nameTh: 'วันสงกรานต์', nameEn: 'Songkran Festival' },
      '04-15': { nameTh: 'วันสงกรานต์', nameEn: 'Songkran Festival' },
      '05-01': { nameTh: 'วันแรงงานแห่งชาติ', nameEn: 'National Labour Day' },
      '05-04': { nameTh: 'วันฉัตรมงคล', nameEn: 'Coronation Day' },
      '06-03': { nameTh: 'วันเฉลิมพระชนมพรรษา สมเด็จพระนางเจ้าสุทิดาฯ พระบรมราชินี', nameEn: 'H.M. Queen Suthida\'s Birthday' },
      '07-28': { nameTh: 'วันเฉลิมพระชนมพรรษา พระบาทสมเด็จพระเจ้าอยู่หัว', nameEn: 'H.M. King Maha Vajiralongkorn\'s Birthday' },
      '08-12': { nameTh: 'วันเฉลิมพระชนมพรรษา สมเด็จพระบรมราชชนนีพันปีหลวง / วันแม่แห่งชาติ', nameEn: 'H.M. Queen Sirikit\'s Birthday / Mother\'s Day', lunarTh: 'วันแรม 14 ค่ำ เดือน 88' },
      '10-13': { nameTh: 'วันคล้ายวันสวรรคต รัชกาลที่ 9', nameEn: 'King Bhumibol Memorial Day' },
      '10-23': { nameTh: 'วันปิยมหาราช', nameEn: 'Chulalongkorn Day' },
      '12-05': { nameTh: 'วันคล้ายวันพระบรมราชสมภพ รัชกาลที่ 9 / วันพ่อแห่งชาติ', nameEn: 'King Bhumibol\'s Birthday / Father\'s Day' },
      '12-10': { nameTh: 'วันรัฐธรรมนูญ', nameEn: 'Constitution Day' },
      '12-31': { nameTh: 'วันสิ้นปี', nameEn: 'New Year\'s Eve' }
    };
    
    return holidays[mmdd] || null;
  };

  // Helper for Thai lunar date calculation (August 2026 spec)
  const getThaiLunarDate = (dateStr: string): string | null => {
    const parts = dateStr.split('-');
    if (parts.length < 3) return null;
    const yearNum = parseInt(parts[0]);
    const monthNum = parseInt(parts[1]) - 1; // 0-indexed
    const dayNum = parseInt(parts[2]);
    
    if (yearNum === 2026 && monthNum === 7) {
      if (dayNum <= 13) {
        return `วันแรม ${dayNum + 2} ค่ำ เดือน 88`;
      } else if (dayNum >= 14 && dayNum <= 27) {
        return `วันขึ้น ${dayNum - 13} ค่ำ เดือน 9`;
      } else if (dayNum === 28) {
        return `วันขึ้น 15 ค่ำ เดือน 9`;
      } else {
        return `วันแรม ${dayNum - 28} ค่ำ เดือน 9`;
      }
    }
    
    return null;
  };

  const getTooltipDateTitle = (dateStr: string) => {
    const parts = dateStr.split('-');
    if (parts.length < 3) return '';
    const day = parseInt(parts[2]);
    const monthIndex = parseInt(parts[1]) - 1;
    const yearBE = parseInt(parts[0]) + 543;
    const yearAD = parseInt(parts[0]);
    
    const monthsTh = [
      'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
      'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ];
    const monthsEn = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    if (locale === 'th') {
      return `${day} ${monthsTh[monthIndex]} ${yearBE}`;
    }
    return `${monthsEn[monthIndex]} ${day}, ${yearAD}`;
  };

  // Hover Tooltip Handlers
  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>, cell: CalendarCell, idx: number) => {
    const dayEvents = events.filter(ev => ev.date === cell.dateString);
    const holiday = getHoliday(cell.dateString);
    
    if (dayEvents.length === 0 && !holiday) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const rowIndex = Math.floor(idx / 7);
    const colIndex = idx % 7;
    
    setHoveredCell(cell);
    setTooltipPosition({
      x: rect.left + window.scrollX + rect.width / 2,
      y: rect.top + window.scrollY,
      height: rect.height,
      topRow: rowIndex < 3,
      colIndex
    });
  };

  const handleMouseLeave = () => {
    setHoveredCell(null);
    setTooltipPosition(null);
  };

  // Upload Area Trigger File Click
  const handleUploadAreaClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size (Max 8MB)
    if (file.size > 8 * 1024 * 1024) {
      alert(locale === 'th' ? 'ขนาดไฟล์เกิน 8MB' : 'File size exceeds 8MB');
      return;
    }

    setIsUploading(true);
    setUploadedFileName(file.name);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Upload failed');
      }

      const data = await res.json();
      setUploadedFileUrl(data.url); // Save Google Drive webViewLink
    } catch (error: any) {
      console.error('Upload failed:', error);
      alert(locale === 'th' 
        ? `อัปโหลดไฟล์ล้มเหลว: ${error.message || 'กรุณาตรวจสอบการตั้งค่าคีย์ Google Drive API'}` 
        : `File upload failed: ${error.message || 'Please verify Google Drive API keys configuration.'}`);
      setUploadedFileName('');
      setUploadedFileUrl('');
    } finally {
      setIsUploading(false);
    }
  };

  // Edit / Delete Click Handlers (Role-based Validation)
  const handleEditClick = (event: Event) => {
    setEditingEvent(event);
    setSelectedType(event.type);
    setStartDate(event.date);
    setEndDate(event.endDate || '');
    
    if (event.time && event.time.includes(' - ')) {
      const [start, end] = event.time.split(' - ');
      setStartTime(start || '');
      setEndTime(end || '');
    } else {
      setStartTime('');
      setEndTime('');
    }
    
    setParticipants(event.participants.join(', '));
    setDetails(event.title);
    setSelectedStatus(event.status);
    setUploadedFileName(event.attachment ? (event.attachment.startsWith('http') ? (locale === 'th' ? 'เอกสารบน Google Drive' : 'Google Drive Document') : event.attachment) : '');
    setUploadedFileUrl(event.attachment || '');
    
    setIsViewerOpen(false);
    setIsFormOpen(true);
  };

  const handleDeleteClick = async (eventId: string) => {
    const confirmDelete = window.confirm(
      locale === 'th'
        ? 'คุณแน่ใจหรือไม่ว่าต้องการลบกิจกรรมนี้?'
        : 'Are you sure you want to delete this event?'
    );
    if (confirmDelete) {
      try {
        const { error } = await supabase
          .from('events')
          .delete()
          .eq('id', eventId);

        if (error) {
          console.error('Failed to delete event from database:', error);
        }
      } catch (err) {
        console.warn('Database error, removing from local state only:', err);
      }
      setEvents(prev => prev.filter(e => e.id !== eventId));
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingEvent(null);
    setDetails('');
    setParticipants('');
    setEndDate('');
    setStartTime('');
    setEndTime('');
    setUploadedFileName('');
    setUploadedFileUrl('');
    setIsUploading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!details.trim()) return;

    if (editingEvent) {
      // Edit existing event
      const updatedEvent = {
        type: selectedType,
        title: details,
        date: startDate || '2026-08-10',
        endDate: endDate || undefined,
        time: (startTime && endTime) ? `${startTime} - ${endTime}` : '09:00 - 12:00',
        participants: participants ? participants.split(',').map(p => p.trim()) : [selectedType === 'duty' ? 'พิชชาภา โหลสกุล' : 'รัชตะสรณ์ จันทรวรศิษฐ์'],
        status: selectedStatus,
        attachment: uploadedFileUrl || undefined,
        createdBy: editingEvent.createdBy || 'System'
      };

      try {
        const { error } = await supabase
          .from('events')
          .update({
            type: updatedEvent.type,
            title: updatedEvent.title,
            date: updatedEvent.date,
            end_date: updatedEvent.endDate || null,
            time: updatedEvent.time,
            participants: updatedEvent.participants,
            status: updatedEvent.status,
            attachment: updatedEvent.attachment || null,
            created_by: updatedEvent.createdBy
          })
          .eq('id', editingEvent.id);

        if (error) {
          console.error('Failed to update event in database:', error);
        }
      } catch (err) {
        console.warn('Database connection failed on update:', err);
      }

      setEvents(prev => prev.map(e => {
        if (e.id === editingEvent.id) {
          return {
            ...e,
            ...updatedEvent
          };
        }
        return e;
      }));
      setEditingEvent(null);
    } else {
      // Create new event
      const newEvent: Event = {
        id: `e-user-${Date.now()}`,
        type: selectedType,
        title: details,
        date: startDate || '2026-08-10',
        endDate: endDate || undefined,
        time: (startTime && endTime) ? `${startTime} - ${endTime}` : '09:00 - 12:00',
        participants: participants ? participants.split(',').map(p => p.trim()) : [selectedType === 'duty' ? 'พิชชาภา โหลสกุล' : 'รัชตะสรณ์ จันทรวรศิษฐ์'],
        status: selectedStatus,
        attachment: uploadedFileUrl || undefined,
        createdBy: currentUser ? currentUser.name : (selectedType === 'duty' ? 'พิชชาภา โหลสกุล' : 'รัชตะสรณ์ จันทรวรศิษฐ์')
      };

      try {
        const { error } = await supabase
          .from('events')
          .insert([
            {
              id: newEvent.id,
              type: newEvent.type,
              title: newEvent.title,
              date: newEvent.date,
              end_date: newEvent.endDate || null,
              time: newEvent.time,
              participants: newEvent.participants,
              status: newEvent.status,
              attachment: newEvent.attachment || null,
              created_by: newEvent.createdBy
            }
          ]);

        if (error) {
          console.error('Failed to insert event into database:', error);
        }
      } catch (err) {
        console.warn('Database connection failed on insert:', err);
      }

      setEvents(prev => [...prev, newEvent]);
    }

    setIsFormOpen(false);
    
    // Clear form
    setDetails('');
    setParticipants('');
    setEndDate('');
    setStartTime('');
    setEndTime('');
    setUploadedFileName('');
    setUploadedFileUrl('');
  };

  // Grid calculation helpers
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const getCalendarCells = (): CalendarCell[] => {
    const cells: CalendarCell[] = [];
    const firstDayOfWeek = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    
    // Prev month leading cells
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      const prevDate = new Date(year, month - 1, day);
      const dateString = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      cells.push({
        dayNumber: day,
        dateString,
        isCurrentMonth: false,
        cellDate: prevDate
      });
    }
    
    // Current month cells
    for (let i = 1; i <= daysInMonth; i++) {
      const curDate = new Date(year, month, i);
      const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      cells.push({
        dayNumber: i,
        dateString,
        isCurrentMonth: true,
        cellDate: curDate
      });
    }
    
    // Next month trailing cells
    const remainingCells = 42 - cells.length;
    for (let i = 1; i <= remainingCells; i++) {
      const nextDate = new Date(year, month + 1, i);
      const dateString = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      cells.push({
        dayNumber: i,
        dateString,
        isCurrentMonth: false,
        cellDate: nextDate
      });
    }
    
    return cells;
  };

  const calendarCells = getCalendarCells();

  // Localized Headers
  const monthNamesTH = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
  const monthNamesEN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const currentMonthName = locale === 'th' ? monthNamesTH[month] : monthNamesEN[month];
  const currentYear = locale === 'th' ? String(year + 543) : String(year);

  const dayNamesTH = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
  const dayNamesEN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const currentDayNames = locale === 'th' ? dayNamesTH : dayNamesEN;

  const activeMonthPrefix = `${year}-${String(month + 1).padStart(2, '0')}`;
  const monthEvents = events.filter(e => e.date.startsWith(activeMonthPrefix));

  // Handle cell click -> Opens daily viewer modal
  const handleCellClick = (cell: CalendarCell) => {
    setSelectedCell(cell);
    setIsViewerOpen(true);
  };

  // Format cell date string for viewer header
  const getViewerTitle = (cell: CalendarCell | null) => {
    if (!cell) return '';
    const d = cell.cellDate;
    const cellDay = d.getDate();
    const cellMonth = locale === 'th' ? monthNamesTH[d.getMonth()] : monthNamesEN[d.getMonth()];
    const cellYear = locale === 'th' ? String(d.getFullYear() + 543) : String(d.getFullYear());
    return `${cellDay} ${cellMonth} ${cellYear}`;
  };

  // Get active day events for the viewer
  const selectedCellEvents = selectedCell ? events.filter(e => e.date === selectedCell.dateString) : [];
  const selectedCellDutyEvents = selectedCellEvents.filter(e => e.type === 'duty');
  const selectedCellTeachingEvents = selectedCellEvents.filter(e => e.type === 'teaching');

  return (
    <div className="flex flex-col gap-6 w-full animate-slide-up">
      {/* 4 Stats Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="p-5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
          <div className="p-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-primary">
            <CalendarIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">{locale === 'th' ? 'กิจกรรมในเดือนนี้' : 'Events This Month'}</p>
            <p className="text-xl font-bold mt-0.5 text-slate-900 dark:text-white">{monthEvents.length}</p>
          </div>
        </div>

        {/* Card 2 */}
        <div className="p-5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
          <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-405">
            <FileCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">{locale === 'th' ? 'งานไปราชการ (Duty Travel)' : 'Duty Travel Logs'}</p>
            <p className="text-xl font-bold mt-0.5 text-slate-900 dark:text-white">{monthEvents.filter(e => e.type === 'duty').length}</p>
          </div>
        </div>

        {/* Card 3 */}
        <div className="p-5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
          <div className="p-2.5 rounded-lg bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-455">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">{locale === 'th' ? 'ตารางเช็คชื่อสอน' : 'Teaching Attendances'}</p>
            <p className="text-xl font-bold mt-0.5 text-slate-900 dark:text-white">{monthEvents.filter(e => e.type === 'teaching').length}</p>
          </div>
        </div>

        {/* Card 4 - Dynamic Users Card */}
        <div className="p-5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
          <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
              {locale === 'th' ? 'ผู้ใช้งานระบบ' : 'System Users'}
            </p>
            <p className="text-xl font-bold mt-0.5 text-slate-900 dark:text-white">{userCount}</p>
          </div>
        </div>
      </div>

      {/* Main Calendar Card - Flat Clean Corporate Style */}
      <div className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        {/* Calendar Header */}
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50 dark:bg-slate-800/80">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>{currentMonthName}</span>
              <span className="text-primary font-bold">{currentYear}</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {locale === 'th' ? 'คลิกปุ่มลูกศรเพื่อเลื่อนเดือน หรือคลิกช่องวันเพื่อดูรายละเอียดงาน' : 'Click arrows to cycle months, or click cells to view schedule details'}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Nav Controls */}
            <div className="flex items-center gap-1 rounded-xl bg-white dark:bg-slate-900 p-1 border border-slate-200 dark:border-slate-700 shadow-sm">
              <button 
                onClick={handlePrevMonth}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-primary transition-colors cursor-pointer"
                title={locale === 'th' ? 'เดือนก่อนหน้า' : 'Previous Month'}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <button 
                onClick={handleGoToToday}
                className="px-3 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 hover:text-primary transition-colors cursor-pointer"
              >
                {t('Calendar.today')}
              </button>
              
              <button 
                onClick={handleNextMonth}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-primary transition-colors cursor-pointer"
                title={locale === 'th' ? 'เดือนถัดไป' : 'Next Month'}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Flat Solid Add Button (Only show if logged in) */}
            {isLoggedIn && (
              <button 
                onClick={() => {
                  const today = new Date();
                  const activeYear = currentDate.getFullYear();
                  const activeMonth = currentDate.getMonth();
                  const formDate = `${activeYear}-${String(activeMonth + 1).padStart(2, '0')}-${today.getFullYear() === activeYear && today.getMonth() === activeMonth ? String(today.getDate()).padStart(2, '0') : '10'}`;
                  setStartDate(formDate);
                  setIsFormOpen(true);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs sm:text-sm font-bold transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{t('Calendar.addActivity')}</span>
              </button>
            )}
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="p-4 sm:p-5">
          {/* Week Days Headers */}
          <div className="grid grid-cols-7 gap-2 mb-3 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase bg-slate-50/50 dark:bg-slate-900/20 py-2 rounded-xl border border-slate-100 dark:border-slate-700/50">
            {currentDayNames.map((day, idx) => (
              <div key={idx} className="truncate">
                {day}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-2 sm:gap-2.5">
            {calendarCells.map((cell, idx) => {
              const dayEvents = events.filter(e => e.date === cell.dateString);
              const today = new Date();
              const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
              const isToday = cell.dateString === todayString;

              return (
                <div 
                  key={`cell-${idx}`} 
                  onClick={() => handleCellClick(cell)}
                  onMouseEnter={(e) => handleMouseEnter(e, cell, idx)}
                  onMouseLeave={handleMouseLeave}
                  className={`min-h-[100px] p-2 rounded-xl border transition-all flex flex-col gap-1.5 cursor-pointer relative
                    ${isToday
                      ? 'bg-primary/5 dark:bg-primary/10 border-primary/50 dark:border-primary/60 shadow-sm ring-1 ring-primary/15'
                      : !cell.isCurrentMonth 
                        ? 'bg-slate-50/20 dark:bg-slate-900/5 border-slate-100/50 dark:border-slate-800/40 opacity-30' 
                        : 'bg-white dark:bg-slate-900/40 border-slate-200 dark:border-slate-700 hover:border-primary/50'
                    }
                  `}
                >
                  {/* Day Number */}
                  <div className="flex justify-between items-center">
                    <span className={`text-xs font-bold flex items-center justify-center w-6 h-6 rounded-lg
                      ${isToday 
                        ? 'bg-primary text-white font-bold' 
                        : cell.isCurrentMonth
                          ? 'text-slate-800 dark:text-slate-200'
                          : 'text-slate-450 dark:text-slate-600'
                      }
                    `}>
                      {cell.dayNumber}
                    </span>
                  </div>

                  {/* Day Events */}
                  <div className="flex-1 flex flex-col gap-1.5 overflow-y-auto max-h-[75px] scrollbar-none">
                    {dayEvents.slice(0, 1).map(event => (
                      <div 
                        key={event.id}
                        className={`text-[9px] sm:text-[10px] p-1.5 rounded-lg border text-white font-bold truncate flex flex-col gap-0.5
                          ${event.type === 'duty'
                            ? 'bg-emerald-600 border-emerald-700'
                            : 'bg-violet-600 border-violet-700'
                          }
                        `}
                      >
                        <span className="truncate text-left leading-tight">
                          {event.title}
                        </span>
                      </div>
                    ))}
                    {dayEvents.length > 1 && (
                      <div className="text-[9px] sm:text-[10px] p-1.5 rounded-lg border text-center font-bold bg-indigo-50/70 border-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:border-indigo-900/60 dark:text-indigo-350 hover:bg-indigo-100/55 dark:hover:bg-indigo-900/50">
                        + {dayEvents.length - 1} {locale === 'th' ? 'รายการเพิ่มเติม' : 'more'}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Hover Detail Tooltip */}
      {hoveredCell && tooltipPosition && (
        <div 
          style={{
            position: 'absolute',
            left: `${tooltipPosition.x}px`,
            top: tooltipPosition.topRow 
              ? `${tooltipPosition.y + tooltipPosition.height}px` 
              : `${tooltipPosition.y}px`,
            transform: tooltipPosition.topRow
              ? (tooltipPosition.colIndex === 0 
                  ? 'translate(0, 8px)' 
                  : tooltipPosition.colIndex === 6 
                    ? 'translate(-100%, 8px)' 
                    : 'translate(-50%, 8px)')
              : (tooltipPosition.colIndex === 0 
                  ? 'translate(0, -100%) translateY(-8px)' 
                  : tooltipPosition.colIndex === 6 
                    ? 'translate(-100%, -100%) translateY(-8px)' 
                    : 'translate(-50%, -100%) translateY(-8px)'),
            zIndex: 100,
          }}
          className="w-85 bg-white/98 dark:bg-slate-900/98 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-4 pointer-events-none text-left animate-fade-in space-y-3"
        >
          <div>
            <h3 className="text-xs font-black text-slate-800 dark:text-slate-100 flex justify-between items-center">
              <span>{getTooltipDateTitle(hoveredCell.dateString)}</span>
              {getThaiLunarDate(hoveredCell.dateString) && (
                <span className="text-[10px] text-slate-400 font-semibold">{getThaiLunarDate(hoveredCell.dateString)}</span>
              )}
            </h3>
            {getHoliday(hoveredCell.dateString) && (
              <div className="mt-1.5 px-2 py-1 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 rounded-lg border border-amber-200 dark:border-amber-900 text-[10px] font-extrabold flex items-center gap-1">
                <span className="animate-pulse">🎉</span>
                <span>{locale === 'th' ? getHoliday(hoveredCell.dateString)?.nameTh : getHoliday(hoveredCell.dateString)?.nameEn}</span>
              </div>
            )}
          </div>
          
          <div className="border-t border-slate-100 dark:border-slate-800 my-1" />

          {/* Duty Travel */}
          <div className="space-y-1.5">
            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>{locale === 'th' ? 'กิจกรรม/ไปราชการ' : 'Duty Travel'}</span>
            </div>
            {events.filter(e => e.date === hoveredCell.dateString && e.type === 'duty').length > 0 ? (
              <div className="space-y-1.5">
                {events.filter(e => e.date === hoveredCell.dateString && e.type === 'duty').map(event => (
                  <div key={event.id} className="p-2 rounded-xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/60">
                    <p className="text-[10px] font-black text-emerald-900 dark:text-emerald-300 leading-normal">{event.title}</p>
                    <div className="flex items-center gap-1.5 text-[8.5px] text-emerald-700/80 dark:text-emerald-400/80 mt-1 font-bold">
                      <span>🕒 {event.time}</span>
                      <span>•</span>
                      <span className="truncate">👥 {event.participants.join(', ')}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[9px] text-slate-400 font-semibold italic pl-2.5">
                {locale === 'th' ? 'ยังไม่มีกิจกรรมไปราชการในวันนี้' : 'No duty travel logs scheduled'}
              </p>
            )}
          </div>

          {/* Teaching */}
          <div className="space-y-1.5">
            <div className="text-[10px] text-violet-600 dark:text-violet-400 font-bold uppercase tracking-wider flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-violet-500" />
              <span>{locale === 'th' ? 'การเช็คชื่อสอน' : 'Teaching Schedule'}</span>
            </div>
            {events.filter(e => e.date === hoveredCell.dateString && e.type === 'teaching').length > 0 ? (
              <div className="space-y-1.5">
                {events.filter(e => e.date === hoveredCell.dateString && e.type === 'teaching').map(event => (
                  <div key={event.id} className="p-2 rounded-xl bg-violet-50/40 dark:bg-violet-950/20 border border-violet-100 dark:border-violet-900/60">
                    <p className="text-[10px] font-black text-violet-900 dark:text-violet-300 leading-normal">{event.title}</p>
                    <div className="flex items-center gap-1.5 text-[8.5px] text-violet-700/80 dark:text-violet-400/80 mt-1 font-bold">
                      <span>🕒 {event.time}</span>
                      <span>•</span>
                      <span className="truncate">👥 {event.participants.join(', ')}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[9px] text-slate-400 font-semibold italic pl-2.5">
                {locale === 'th' ? 'ยังไม่มีการเช็คชื่อสอนในวันนี้' : 'No teaching schedules logged'}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Daily Schedule Viewer Modal */}
      {isViewerOpen && selectedCell && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-sm animate-fade-in">
          <div 
            className="relative w-full max-w-xl rounded-2xl bg-white dark:bg-slate-800 border border-slate-350 dark:border-slate-700 shadow-xl overflow-hidden max-h-[90vh] flex flex-col animate-scale-in"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-slate-800/80">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  {getViewerTitle(selectedCell)}
                </h3>
                <p className="text-[9px] text-slate-500 dark:text-slate-400 tracking-wider font-bold uppercase mt-0.5">
                  {locale === 'th' ? 'กิจกรรมรายวัน' : 'DAILY SCHEDULE'}
                </p>
              </div>
              <button 
                onClick={() => setIsViewerOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer border border-transparent"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
              
              {/* SECTION 1: กิจกรรม / ไปราชการ */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-1.5 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{t('Form.dutyTravel')}</span>
                </h4>
                
                {selectedCellDutyEvents.length > 0 ? (
                  <div className="space-y-3.5">
                    {selectedCellDutyEvents.map(event => (
                      <div key={event.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30 space-y-2">
                        {/* Badges Row */}
                        <div className="flex items-center justify-between gap-1.5">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="px-2.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-350 border border-emerald-200/50">
                              {t('Form.dutyTravel')}
                            </span>
                            <span className={`px-2.5 py-0.5 rounded text-[9px] font-bold border
                              ${event.status === 'confirmed'
                                ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                                : 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-350 border-amber-200/40'
                              }
                            `}>
                              {event.status === 'confirmed' ? t('Form.confirmed') : t('Form.pending')}
                            </span>
                          </div>

                          {/* Edit / Delete action buttons for Admin (Role-based Validation / Superadmin bypass) */}
                          {isLoggedIn && currentUser && (currentUser.email?.toLowerCase() === 'prachkp@gmail.com' || currentUser.email?.toLowerCase() === 'nantapat.le@ssru.ac.th' || event.createdBy === currentUser.name) && (
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleEditClick(event)}
                                className="p-1 rounded-md border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-500 dark:text-slate-400 hover:text-primary transition-colors cursor-pointer"
                                title={locale === 'th' ? 'แก้ไข' : 'Edit'}
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteClick(event.id)}
                                className="p-1 rounded-md border border-red-200 dark:border-red-900/60 hover:bg-red-50 dark:hover:bg-red-950/30 text-red-500 hover:text-red-650 transition-colors cursor-pointer"
                                title={locale === 'th' ? 'ลบ' : 'Delete'}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                        
                        {/* Time & Dates */}
                        <div className="text-xs font-bold text-slate-700 dark:text-slate-350 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>
                            {event.endDate ? `${event.date} - ${event.endDate}` : event.date}
                            <span className="mx-2 text-slate-300">|</span>
                            {event.time}
                          </span>
                        </div>

                        {/* Participants */}
                        <div className="text-xs text-slate-700 dark:text-slate-300">
                          <span className="font-bold">{locale === 'th' ? 'ผู้ร่วมกิจกรรม: ' : 'Participants: '}</span>
                          <span>{event.participants.join(', ')}</span>
                        </div>

                        {/* Title / Description */}
                        <div className="text-xs text-emerald-900 dark:text-emerald-300 font-extrabold bg-emerald-50/30 dark:bg-emerald-950/20 p-3 rounded-xl border border-emerald-300 dark:border-emerald-500/70">
                          {event.title}
                        </div>

                        {/* Attachment Link if any */}
                        {event.attachment && (
                          <div className="text-[10px] text-primary font-bold flex items-center gap-1">
                            <Upload className="w-3 h-3 text-slate-400" />
                            <span>{locale === 'th' ? 'ไฟล์แนบ: ' : 'Attachment: '}</span>
                            <a 
                              href={event.attachment.startsWith('http') ? event.attachment : '#'} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="underline cursor-pointer hover:text-primary/80"
                            >
                              {event.attachment.startsWith('http') ? (locale === 'th' ? 'เปิดดูเอกสาร (Google Drive)' : 'Open Document') : event.attachment}
                            </a>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-6 text-center text-xs font-semibold text-slate-400 dark:text-slate-500">
                    {locale === 'th' ? 'ยังไม่มีกิจกรรมไปราชการในวันนี้' : 'No duty travel logs scheduled today'}
                  </div>
                )}
              </div>

              {/* SECTION 2: การเช็คชื่อสอน */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-1.5 flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-violet-600 shrink-0" />
                  <span>{t('Form.teachingCheck')}</span>
                </h4>
                
                {selectedCellTeachingEvents.length > 0 ? (
                  <div className="space-y-3.5">
                    {selectedCellTeachingEvents.map(event => (
                      <div key={event.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30 space-y-2">
                        {/* Badges Row */}
                        <div className="flex items-center justify-between gap-1.5">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="px-2.5 py-0.5 rounded text-[9px] font-bold bg-violet-100 dark:bg-violet-950/40 text-violet-850 dark:text-violet-300 border border-violet-200/50">
                              {t('Form.teachingCheck')}
                            </span>
                            <span className="px-2.5 py-0.5 rounded text-[9px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                              {t('Form.confirmed')}
                            </span>
                          </div>

                          {/* Edit / Delete action buttons for Admin (Role-based Validation / Superadmin bypass) */}
                          {isLoggedIn && currentUser && (currentUser.email?.toLowerCase() === 'prachkp@gmail.com' || currentUser.email?.toLowerCase() === 'nantapat.le@ssru.ac.th' || event.createdBy === currentUser.name) && (
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleEditClick(event)}
                                className="p-1 rounded-md border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-500 dark:text-slate-400 hover:text-primary transition-colors cursor-pointer"
                                title={locale === 'th' ? 'แก้ไข' : 'Edit'}
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteClick(event.id)}
                                className="p-1 rounded-md border border-red-200 dark:border-red-900/60 hover:bg-red-50 dark:hover:bg-red-950/30 text-red-500 hover:text-red-650 transition-colors cursor-pointer"
                                title={locale === 'th' ? 'ลบ' : 'Delete'}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                        
                        {/* Time & Dates */}
                        <div className="text-xs font-bold text-slate-700 dark:text-slate-350 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>
                            {event.date}
                            <span className="mx-2 text-slate-300">|</span>
                            {event.time}
                          </span>
                        </div>

                        {/* Participants */}
                        <div className="text-xs text-slate-700 dark:text-slate-300">
                          <span className="font-bold">{locale === 'th' ? 'ผู้ร่วมกิจกรรม: ' : 'Participants: '}</span>
                          <span>{event.participants.join(', ')}</span>
                        </div>

                        {/* Title / Description */}
                        <div className="text-xs text-violet-900 dark:text-violet-300 font-extrabold bg-violet-50/30 dark:bg-violet-950/20 p-3 rounded-xl border border-violet-300 dark:border-violet-500/70">
                          {event.title}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-6 text-center text-xs font-semibold text-slate-400 dark:text-slate-500">
                    {locale === 'th' ? 'ยังไม่มีการเช็คชื่อสอนในวันนี้' : 'No teaching attendance checks scheduled today'}
                  </div>
                )}
              </div>

            </div>

            {/* Modal Footer Actions */}
            <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-end gap-2 bg-slate-50 dark:bg-slate-800/80">
              <button
                type="button"
                onClick={() => setIsViewerOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-350 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-bold transition-colors cursor-pointer"
              >
                {locale === 'th' ? 'ปิด' : 'Close'}
              </button>
              
              {isLoggedIn && (
                <button
                  type="button"
                  onClick={() => {
                    setIsViewerOpen(false);
                    setStartDate(selectedCell.dateString);
                    setIsFormOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs sm:text-sm font-bold transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>{locale === 'th' ? 'เพิ่มกิจกรรมใหม่' : 'Add New Entry'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Admin Action Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div 
            className="relative w-full max-w-xl rounded-2xl bg-white dark:bg-slate-800 border border-slate-350 dark:border-slate-700 shadow-xl overflow-hidden max-h-[90vh] flex flex-col animate-scale-in"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-slate-800/80">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {editingEvent ? (locale === 'th' ? 'แก้ไขข้อมูล' : 'Edit Entry') : t('Form.title')}
                </h3>
                <p className="text-[9px] text-slate-500 dark:text-slate-400 tracking-wider font-bold uppercase mt-0.5">
                  {editingEvent ? (locale === 'th' ? 'EDIT ENTRY' : 'EDIT ENTRY') : t('Form.subtitle')}
                </p>
              </div>
              <button 
                onClick={handleCloseForm}
                className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer border border-transparent"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-5 no-scrollbar">
              {/* Category Picker */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">{t('Form.type')}</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedType('duty')}
                    className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border text-xs sm:text-sm font-bold transition-colors cursor-pointer
                      ${selectedType === 'duty'
                        ? 'bg-secondary border-secondary text-white shadow-sm font-bold'
                        : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200'
                      }
                    `}
                  >
                    <FileText className="w-4 h-4 shrink-0" />
                    <span>{t('Form.dutyTravel')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedType('teaching')}
                    className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border text-xs sm:text-sm font-bold transition-colors cursor-pointer
                      ${selectedType === 'teaching'
                        ? 'bg-accent border-accent text-white shadow-sm font-bold'
                        : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200'
                      }
                    `}
                  >
                    <GraduationCap className="w-4 h-4 shrink-0" />
                    <span>{t('Form.teachingCheck')}</span>
                  </button>
                </div>
              </div>

              {/* Date Pickers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="start-date" className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">{t('Form.startDate')}</label>
                  <input
                    id="start-date"
                    type="date"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-slate-900 dark:text-white cursor-text"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="end-date" className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">{t('Form.endDate')}</label>
                  <input
                    id="end-date"
                    type="date"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-slate-900 dark:text-white cursor-text"
                  />
                </div>
              </div>

              {/* Time Pickers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="start-time" className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">{t('Form.startTime')}</label>
                  <input
                    id="start-time"
                    type="time"
                    value={startTime}
                    onChange={e => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-slate-900 dark:text-white cursor-text"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="end-time" className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">{t('Form.endTime')}</label>
                  <input
                    id="end-time"
                    type="time"
                    value={endTime}
                    onChange={e => setEndTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-slate-900 dark:text-white cursor-text"
                  />
                </div>
              </div>

              {/* Participants */}
              <div className="space-y-1.5">
                <label htmlFor="participants-input" className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span>{t('Form.participants')}</span>
                </label>
                <input
                  id="participants-input"
                  type="text"
                  placeholder={t('Form.participantsPlaceholder')}
                  value={participants}
                  onChange={e => setParticipants(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 cursor-text"
                />
              </div>

              {/* Details */}
              <div className="space-y-1.5">
                <label htmlFor="details-input" className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">{t('Form.details')}</label>
                <textarea
                  id="details-input"
                  rows={3}
                  placeholder={t('Form.detailsPlaceholder')}
                  value={details}
                  onChange={e => setDetails(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-slate-900 dark:text-white resize-none placeholder-slate-400 dark:placeholder-slate-500 cursor-text"
                  required
                />
              </div>

              {/* Status Picker */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">{t('Form.status')}</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedStatus('confirmed')}
                    className={`flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl border text-xs sm:text-sm font-bold transition-colors cursor-pointer
                      ${selectedStatus === 'confirmed'
                        ? 'bg-secondary border-secondary text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200'
                      }
                    `}
                  >
                    <CheckCircle className="w-4 h-4 shrink-0" />
                    <span>{t('Form.confirmed')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedStatus('pending')}
                    className={`flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl border text-xs sm:text-sm font-bold transition-colors cursor-pointer
                      ${selectedStatus === 'pending'
                        ? 'bg-amber-600 border-amber-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200'
                      }
                    `}
                  >
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{t('Form.pending')}</span>
                  </button>
                </div>
              </div>

              {/* Attachment File Box */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">{t('Form.attachment')}</label>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  onChange={handleFileChange} 
                  accept=".pdf,.jpg,.jpeg,.png"
                />
                <div 
                  onClick={isUploading ? undefined : handleUploadAreaClick}
                  className={`border border-dashed rounded-xl p-5 transition-colors flex flex-col items-center justify-center text-center cursor-pointer bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-900
                    ${isUploading ? 'opacity-60 cursor-not-allowed border-slate-350 dark:border-slate-700' : 'hover:border-primary border-slate-300 dark:border-slate-700'}
                  `}
                >
                  {isUploading ? (
                    <div className="flex flex-col items-center justify-center py-2">
                      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mb-2"></div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {locale === 'th' ? 'กำลังอัปโหลดไฟล์ไปที่ Google Drive...' : 'Uploading to Google Drive...'}
                      </p>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-7 h-7 text-slate-400 mb-2" />
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1">
                        {uploadedFileName ? `${locale === 'th' ? 'เลือกไฟล์แล้ว: ' : 'Selected: '} ${uploadedFileName}` : t('Form.attachmentPlaceholder')}
                      </p>
                      <p className="text-[10px] text-slate-550 mt-0.5">
                        {locale === 'th' ? 'คลิกเพื่อระบุไฟล์ PDF, JPG, PNG (ไม่เกิน 8MB)' : 'Click to select PDF, JPG, PNG (Max 8MB)'}
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-bold transition-colors cursor-pointer"
                >
                  {t('Form.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className={`px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs sm:text-sm font-bold transition-colors cursor-pointer shadow-sm
                    ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  {isUploading ? (locale === 'th' ? 'กำลังอัปโหลด...' : 'Uploading...') : (editingEvent ? (locale === 'th' ? 'บันทึกการแก้ไข' : 'Save Changes') : t('Form.save'))}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
