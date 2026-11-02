import React, { useState, useEffect, useMemo } from 'react';
import {
  fetchAnalyticsOverview,
  fetchAdminInquiries,
  createManualInquiry,
  updateInquiryStatus,
  verifyAdminInquiryRef,
  fetchAdminCars,
  createAdminCar,
  updateAdminCar,
  deleteAdminCar,
  toggleCarPublish,
  toggleCarFeature,
  fetchAuditLogs,
  postAuditLog,
  fetchStaffUsers,
  createStaffUser as createStaffUserApi,
  toggleStaffUserStatus,
} from '../../services/adminApi';
import { SHOWROOM_CONTACT, FALLBACK_CARS } from '../../services/api';

// Helper to parse structured CRM metadata stored inside staff_notes
function parseStaffMeta(staffNotes = '') {
  const raw = String(staffNotes || '');
  let priority = 'normal';
  let financeInfo = '';
  let repliedVia = 'whatsapp';
  let archived = false;
  let verified = false;
  let cleanNotes = raw;

  if (raw.includes('[VIP]')) {
    priority = 'vip';
    cleanNotes = cleanNotes.replace('[VIP]', '').trim();
  } else if (raw.includes('[URGENT]')) {
    priority = 'urgent';
    cleanNotes = cleanNotes.replace('[URGENT]', '').trim();
  }

  if (raw.includes('[ARCHIVED]')) {
    archived = true;
    cleanNotes = cleanNotes.replace('[ARCHIVED]', '').trim();
  }

  if (raw.includes('تم التحقق وتأكيد حضور')) {
    verified = true;
  }

  const finMatch = cleanNotes.match(/\[ملف التمويل\/الاستبدال:\s*([^\]]+)\]/);
  if (finMatch) {
    financeInfo = finMatch[1].trim();
    cleanNotes = cleanNotes.replace(finMatch[0], '').trim();
  }

  const viaMatch = cleanNotes.match(/\[الرد عبر:\s*([^\]]+)\]/);
  if (viaMatch) {
    repliedVia = viaMatch[1].trim();
    cleanNotes = cleanNotes.replace(viaMatch[0], '').trim();
  }

  cleanNotes = cleanNotes.replace(/^\|\s*|\s*\|$/g, '').trim();
  return { priority, financeInfo, repliedVia, archived, verified, cleanNotes };
}

function buildStaffMeta({ priority, financeInfo, repliedVia, archived, cleanNotes }) {
  const parts = [];
  if (priority === 'vip') parts.push('[VIP]');
  if (priority === 'urgent') parts.push('[URGENT]');
  if (archived) parts.push('[ARCHIVED]');
  if (financeInfo && financeInfo.trim()) {
    parts.push(`[ملف التمويل/الاستبدال: ${financeInfo.trim()}]`);
  }
  if (repliedVia) {
    parts.push(`[الرد عبر: ${repliedVia}]`);
  }
  if (cleanNotes && cleanNotes.trim()) {
    parts.push(cleanNotes.trim());
  }
  return parts.join(' ').trim();
}

const DEFAULT_SEO_PAGES = [
  {
    id: 1,
    lang: 'ar',
    path: '/',
    seo_title: 'سوق أوتو محمد نبيل للسيارات | منذ 2007 | سيارات فاخرة وكسر زيرو معتمدة',
    seo_description: 'المعرض الأول لتجارة واستبدال السيارات الفاخرة والكسر زيرو بميت غمر والدقهلية. فحص فني معتمد 100 نقطة وتقسيط بنكي ميسر.',
    custom_h1: 'السيارات الفاخرة، كما ينبغي أن تكون.',
  },
  {
    id: 2,
    lang: 'ar',
    path: '/inventory',
    seo_title: 'أسطول السيارات المتاحة | سوق أوتو محمد نبيل للسيارات',
    seo_description: 'تصفح أحدث السيارات الفاخرة والألمانية المتاحة للتسليم الفوري في صالة عرض أوتو محمد نبيل بحالة الزيرو وفحص 100 نقطة.',
    custom_h1: 'أسطول استثنائي منتقى بعناية.',
  },
  {
    id: 3,
    lang: 'ar',
    path: '/viewing',
    seo_title: 'حجز معاينة خاصة وتجربة قيادة VIP | أوتو محمد نبيل',
    seo_description: 'احجز موعداً خاصاً لمعاينة سيارتك المفضلة وتجربة قيادتها في صالة عرض أوتو محمد نبيل مع مستشار مبيعات مختص.',
    custom_h1: 'بعض التفاصيل تستحق أن تراها بنفسك.',
  },
  {
    id: 4,
    lang: 'ar',
    path: '/finance',
    seo_title: 'حاسبة التقسيط والتمويل البنكي | سوق أوتو محمد نبيل',
    seo_description: 'احسب قسط سيارتك الشهري بكل شفافية مع برامج التمويل البنكي المباشر بمقدم يبدأ من 20% وفترات سداد حتى 5 سنوات.',
    custom_h1: 'احسب قسط سيارتك بكل شفافية.',
  },
  {
    id: 5,
    lang: 'ar',
    path: '/services',
    seo_title: 'خدمات المعرض والاستبدال الفوري | أوتو محمد نبيل',
    seo_description: 'خدمات متكاملة تشمل الاستبدال الفوري (Trade-in)، الفحص المعتمد، التمويل البنكي، وإنهاء إجراءات الترخيص والتأمين.',
    custom_h1: 'خدمات متكاملة تليق بأصحاب الذوق الرفيع.',
  },
  {
    id: 6,
    lang: 'ar',
    path: '/inspection',
    seo_title: 'معايير الفحص الفني المعتمد 100 نقطة | أوتو محمد نبيل',
    seo_description: 'تعرف على بروتوكول الفحص الفني الصارم 100 نقطة لقياس الدهان الفابريكا وفحص الشاسيه والمحرك والكمبيوتر.',
    custom_h1: 'فحص فني معتمد 100 نقطة لكل سيارة.',
  },
  {
    id: 7,
    lang: 'ar',
    path: '/about',
    seo_title: 'عن معرض أوتو محمد نبيل | خبرة وثقة منذ عام 2007',
    seo_description: 'قصة نجاح تمتد لأكثر من 18 عاماً في سوق السيارات المصري، وأكثر من 3,800 عميل يثقون في أوتو محمد نبيل.',
    custom_h1: 'سوق أوتو محمد نبيل. حيث تلتقي الفخامة بالثقة.',
  },
  {
    id: 8,
    lang: 'ar',
    path: '/contact',
    seo_title: 'موقع المعرض وتواصل معنا | سوق أوتو محمد نبيل للسيارات',
    seo_description: 'تفضل بزيارتنا: طريق ميت غمر الزقازيق - بجوار بنك قناة السويس، ميت غمر، الدقهلية. يومياً من 11 صباحاً حتى 11 مساءً.',
    custom_h1: 'تفضل بزيارة صالة العرض.',
  },
];

export default function AdminDashboard({ user, adminUser, onLogout, onClose, onSwitchToSite }) {
  const currentAdmin = user || adminUser || {
    username: 'performax',
    full_name: 'الإدارة العليا للمعرض',
    role: 'admin',
  };

  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [cloudConnected, setCloudConnected] = useState(true);
  const [lastSyncTime, setLastSyncTime] = useState('');

  // Core Data State
  const [inquiries, setInquiries] = useState([]);
  const [cars, setCars] = useState([]);
  const [overviewStats, setOverviewStats] = useState(null);

  // Local drafts for inline CRM editing
  const [rowDrafts, setRowDrafts] = useState({});
  const [blockedPhones, setBlockedPhones] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('mnabil_blocked_phones') || '[]');
    } catch {
      return [];
    }
  });

  // Reference Code Verification State
  const [verifyCodeInput, setVerifyCodeInput] = useState('');
  const [verifyResult, setVerifyResult] = useState(null);

  // CRM Filters
  const [leadSearch, setLeadSearch] = useState('');
  const [leadStatusFilter, setLeadStatusFilter] = useState('');
  const [leadPriorityFilter, setLeadPriorityFilter] = useState('');
  const [leadTypeFilter, setLeadTypeFilter] = useState('');

  // Messages Filters
  const [msgSearch, setMsgSearch] = useState('');
  const [msgStatusFilter, setMsgStatusFilter] = useState('');

  // Fleet Filters & Modal
  const [carSearch, setCarSearch] = useState('');
  const [carStatusFilter, setCarStatusFilter] = useState('');
  const [carModalOpen, setCarModalOpen] = useState(false);
  const [editingCar, setEditingCar] = useState(null);
  const [carForm, setCarForm] = useState({
    make: '',
    model: '',
    year: 2024,
    variant: '',
    body_type: 'سيدان فاخرة',
    price: '',
    mileage: 0,
    transmission: 'automatic',
    fuel_type: 'petrol',
    engine_cc: 1600,
    horsepower: 180,
    color: '',
    status: 'available',
    condition: 'certified',
    inspection_score: '98%',
    is_featured: true,
    is_published: true,
    description: '',
    featuresText: '',
    imageUrl: '',
  });

  // Manual Lead Modal
  const [leadModalOpen, setLeadModalOpen] = useState(false);
  const [newLeadForm, setNewLeadForm] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    customer_city: 'ميت غمر',
    car_id: '',
    inquiry_type: 'test_drive',
    priority: 'normal',
    finance_info: '',
    preferred_date: '',
    status: 'new',
    message: '',
  });

  // Pages & SEO State
  const [seoPages, setSeoPages] = useState(() => {
    try {
      const saved = localStorage.getItem('mnabil_seo_pages');
      return saved ? JSON.parse(saved) : DEFAULT_SEO_PAGES;
    } catch {
      return DEFAULT_SEO_PAGES;
    }
  });
  const [pageSearch, setPageSearch] = useState('');

  // Media Library State
  const [customMedia, setCustomMedia] = useState(() => {
    try {
      const saved = localStorage.getItem('mnabil_custom_media');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [newMediaUrl, setNewMediaUrl] = useState('');
  const [newMediaTitle, setNewMediaTitle] = useState('');

  // Showroom Settings State
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('mnabil_showroom_settings');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return {
      showroom_name_ar: SHOWROOM_CONTACT.name,
      showroom_name_en: 'Auto Mohamed Nabil Showroom',
      phone_primary: SHOWROOM_CONTACT.phone,
      whatsapp_number: SHOWROOM_CONTACT.whatsapp,
      email: SHOWROOM_CONTACT.email || 'info@autonabil.com',
      working_hours: SHOWROOM_CONTACT.workingHours,
      address: SHOWROOM_CONTACT.address,
      announcement_bar: ' عروض خاصة لفترة محدودة: استلم سيارتك الفاخرة اليوم بمقدم يبدأ من 20% وفحص معتمد 100 نقطة!',
      announcement_start: '',
      announcement_end: '',
      google_sheets_webhook_url: '',
      maintenance_mode: false,
    };
  });

  // Staff & Security Audit Log State
  const [staffUsers, setStaffUsers] = useState([]);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [newUserForm, setNewUserForm] = useState({
    display_name: '',
    username: '',
    password: '',
    role: 'مستشار مبيعات واستقبال (CRM)',
    email: '',
  });

  // Audit logs — start empty, real data loads from Supabase in loadAllData()
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditSearch, setAuditSearch] = useState('');
  const [auditFilter, setAuditFilter] = useState('');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg('');
    }, 3200);
  };

  const appendAuditLog = (action, event_type = 'admin_action') => {
    // Write to Supabase via backend API (real persistent log)
    postAuditLog(action, event_type);

    // Also update local state immediately so UI reflects the action without a refresh
    const entry = {
      id: Date.now(),
      created_at: new Date().toISOString(),
      action,
      user_email: currentAdmin.username || 'performax',
      client_ip: 'Supabase Cloud',
      entity_type: event_type,
    };
    setAuditLogs((prev) => [entry, ...prev].slice(0, 200));
  };

  // Load All Data from Supabase Backend
  const loadAllData = async () => {
    setLoading(true);
    try {
      const [overviewRes, inqRes, carsRes, logsRes, staffRes] = await Promise.allSettled([
        fetchAnalyticsOverview(),
        fetchAdminInquiries({ limit: 100 }),
        fetchAdminCars({ limit: 100 }),
        fetchAuditLogs(200),
        fetchStaffUsers(),
      ]);

      if (overviewRes.status === 'fulfilled' && overviewRes.value) {
        setOverviewStats(overviewRes.value);
        setCloudConnected(true);
      }

      if (inqRes.status === 'fulfilled' && inqRes.value?.data) {
        const list = inqRes.value.data;
        setInquiries(list);
        // Initialize inline drafts
        const drafts = {};
        list.forEach((item) => {
          const parsed = parseStaffMeta(item.staff_notes);
          drafts[item.id] = {
            status: item.status || 'new',
            priority: parsed.priority,
            financeInfo: parsed.financeInfo,
            repliedVia: parsed.repliedVia,
            archived: parsed.archived,
            verified: parsed.verified,
            cleanNotes: parsed.cleanNotes,
          };
        });
        setRowDrafts(drafts);
      }

      if (carsRes.status === 'fulfilled' && carsRes.value?.data?.length > 0) {
        setCars(carsRes.value.data);
      } else {
        setCars(FALLBACK_CARS);
      }

      // Load real audit logs from Supabase
      if (logsRes.status === 'fulfilled' && Array.isArray(logsRes.value) && logsRes.value.length > 0) {
        // Normalize Supabase format to match local state shape
        setAuditLogs(logsRes.value.map((l) => ({
          id: l.id,
          created_at: l.created_at,
          action: l.action,
          user_email: l.user_email || 'admin',
          client_ip: l.client_ip || 'Supabase Cloud',
          entity_type: l.entity_type || 'admin_action',
        })));
      }

      // Load real staff users from Supabase
      if (staffRes.status === 'fulfilled' && Array.isArray(staffRes.value) && staffRes.value.length > 0) {
        setStaffUsers(staffRes.value.map((u) => ({
          id: u.id,
          display_name: u.full_name || u.username,
          username: u.username,
          role: u.role === 'admin' ? 'مدير المعرض (Full Admin)' : 'مستشار مبيعات واستقبال (CRM)',
          role_key: u.role,
          account_status: u.is_active ? 'active' : 'inactive',
          email: u.email,
          last_login: u.last_login,
        })));
      }

      setLastSyncTime(new Date().toLocaleTimeString('ar-EG'));
    } catch (err) {
      console.error('Admin load error:', err);
      setCloudConnected(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Split inquiries into CRM Bookings vs General Website Messages
  const isMessageRecord = (item) => {
    return item.inquiry_type === 'general' && !item.car_id;
  };

  const activeCrmLeads = useMemo(() => {
    return inquiries.filter((l) => {
      const d = rowDrafts[l.id] || parseStaffMeta(l.staff_notes);
      return !d.archived;
    });
  }, [inquiries, rowDrafts]);

  const archivedCrmLeads = useMemo(() => {
    return inquiries.filter((l) => {
      const d = rowDrafts[l.id] || parseStaffMeta(l.staff_notes);
      return d.archived;
    });
  }, [inquiries, rowDrafts]);

  const activeMessages = useMemo(() => {
    return inquiries.filter((l) => {
      const d = rowDrafts[l.id] || parseStaffMeta(l.staff_notes);
      return !d.archived && (isMessageRecord(l) || l.message);
    });
  }, [inquiries, rowDrafts]);

  // Filtered CRM Leads
  const filteredLeads = useMemo(() => {
    return inquiries.filter((l) => {
      const d = rowDrafts[l.id] || parseStaffMeta(l.staff_notes);
      if (leadStatusFilter === 'archived') {
        if (!d.archived) return false;
      } else {
        if (d.archived) return false;
        if (leadStatusFilter && l.status !== leadStatusFilter) return false;
      }

      if (leadPriorityFilter && d.priority !== leadPriorityFilter) return false;
      if (leadTypeFilter && l.inquiry_type !== leadTypeFilter) return false;

      if (leadSearch.trim()) {
        const q = leadSearch.toLowerCase();
        const matchName = String(l.customer_name || '').toLowerCase().includes(q);
        const matchPhone = String(l.customer_phone || '').includes(q);
        const matchRef = String(l.inquiry_ref || '').toLowerCase().includes(q);
        const matchCar = String(l.car_snapshot?.make || l.cars?.make || '').toLowerCase().includes(q) ||
          String(l.car_snapshot?.model || l.cars?.model || '').toLowerCase().includes(q);
        if (!matchName && !matchPhone && !matchRef && !matchCar) return false;
      }
      return true;
    });
  }, [inquiries, rowDrafts, leadStatusFilter, leadPriorityFilter, leadTypeFilter, leadSearch]);

  // Filtered Messages
  const filteredMessages = useMemo(() => {
    return inquiries.filter((l) => {
      const d = rowDrafts[l.id] || parseStaffMeta(l.staff_notes);
      if (msgStatusFilter === 'archived') {
        if (!d.archived) return false;
      } else {
        if (d.archived) return false;
        if (msgStatusFilter && l.status !== msgStatusFilter) return false;
      }
      if (msgSearch.trim()) {
        const q = msgSearch.toLowerCase();
        const matchName = String(l.customer_name || '').toLowerCase().includes(q);
        const matchPhone = String(l.customer_phone || '').includes(q);
        const matchMsg = String(l.message || '').toLowerCase().includes(q);
        if (!matchName && !matchPhone && !matchMsg) return false;
      }
      return true;
    });
  }, [inquiries, rowDrafts, msgStatusFilter, msgSearch]);

  // Filtered Cars
  const filteredCars = useMemo(() => {
    return cars.filter((c) => {
      if (carStatusFilter && c.status !== carStatusFilter) return false;
      if (carSearch.trim()) {
        const q = carSearch.toLowerCase();
        const text = `${c.make} ${c.model} ${c.variant || ''} ${c.year} ${c.color || ''}`.toLowerCase();
        if (!text.includes(q)) return false;
      }
      return true;
    });
  }, [cars, carStatusFilter, carSearch]);

  // Combined Media Library (Car Photos + Custom Media)
  const allMediaItems = useMemo(() => {
    const items = [...customMedia];
    cars.forEach((car) => {
      (car.images || []).forEach((img, idx) => {
        if (img?.url) {
          items.push({
            id: `${car.id}-${idx}`,
            url: img.url,
            title: `${car.make} ${car.model} (${car.year})`,
          });
        }
      });
    });
    return items;
  }, [cars, customMedia]);

  // Formatters
  const formatStatusBadge = (st) => {
    const map = {
      new: { label: 'جديد (New)', cls: 'status-new' },
      contacted: { label: 'تم التواصل', cls: 'status-contacted' },
      negotiating: { label: 'معاينة مؤكدة', cls: 'status-confirmed' },
      won: { label: 'تم البيع والتعاقد ', cls: 'status-confirmed' },
      lost: { label: 'لم يتم التعاقد', cls: 'status-cancelled' },
      cancelled: { label: 'ملغي', cls: 'status-cancelled' },
    };
    const item = map[st] || { label: st || 'جديد', cls: 'status-new' };
    return <span className={`status-badge ${item.cls}`}>{item.label}</span>;
  };

  const formatInquiryTypeLabel = (type) => {
    const map = {
      test_drive: 'حجز معاينة وتجربة قيادة VIP',
      finance: 'طلب تقسيط وتمويل بنكي',
      trade_in: 'استبدال سيارة قديمة (Trade-In)',
      price: 'شراء نقدي (كاش)',
      general: 'استفسار عام / تواصل',
    };
    return map[type] || 'معاينة واستفسار';
  };

  const formatWhatsAppLink = (phone, name, carTitle, refCode) => {
    if (!phone) return '#';
    let clean = String(phone).replace(/[^0-9]/g, '');
    if (clean.startsWith('01')) clean = '2' + clean;
    const codePart = refCode ? ` | كود الحجز: [${refCode}]` : '';
    const text = encodeURIComponent(
      `أهلاً بك أستاذ ${name || ''}، معك إدارة مبيعات معرض أوتو محمد نبيل للسيارات بخصوص (${carTitle || 'حجز المعاينة والسيارة'})${codePart}.`
    );
    return `https://wa.me/${clean}?text=${text}`;
  };

  const getCarLabelForLead = (l) => {
    if (l.cars && l.cars.make) {
      return `${l.cars.make} ${l.cars.model} (${l.cars.year || ''})`;
    }
    if (l.car_snapshot && l.car_snapshot.make) {
      return `${l.car_snapshot.make} ${l.car_snapshot.model} (${l.car_snapshot.year || ''})`;
    }
    return 'معاينة عامة لأسطول المعرض';
  };

  // CRM Actions
  const handleDraftChange = (id, field, value) => {
    setRowDrafts((prev) => ({
      ...prev,
      [id]: {
        ...(prev[id] || {
          status: 'new',
          priority: 'normal',
          financeInfo: '',
          repliedVia: 'whatsapp',
          archived: false,
          cleanNotes: '',
        }),
        [field]: value,
      },
    }));
  };

  const handleSaveLeadRow = async (lead) => {
    const draft = rowDrafts[lead.id] || parseStaffMeta(lead.staff_notes);
    const compiledNotes = buildStaffMeta(draft);
    try {
      await updateInquiryStatus(lead.id, {
        status: draft.status,
        staff_notes: compiledNotes,
      });
      setInquiries((prev) =>
        prev.map((item) =>
          item.id === lead.id
            ? { ...item, status: draft.status, staff_notes: compiledNotes }
            : item
        )
      );
      appendAuditLog(
        `تحديث ملف وحالة العميل (${lead.customer_name}) [${lead.inquiry_ref || lead.id}] إلى (${draft.status})`,
        'lead_updated'
      );
      showToast(' تم تحديث ملف وحالة الحجز في قاعدة البيانات السحابية بنجاح!');
    } catch (err) {
      alert(err.message || 'حدث خطأ أثناء حفظ التعديلات');
    }
  };

  const handleArchiveOrRestoreLead = async (lead, archiveFlag) => {
    if (
      archiveFlag &&
      !window.confirm(
        'سيتم إخفاء هذا العميل من جدول الـ CRM النشط مع الاحتفاظ بملفه في الأرشيف وسجل التدقيق الأمني (Zero Data Loss). هل تريد المتابعة؟'
      )
    ) {
      return;
    }
    const draft = rowDrafts[lead.id] || parseStaffMeta(lead.staff_notes);
    const updatedDraft = { ...draft, archived: archiveFlag };
    const compiledNotes = buildStaffMeta(updatedDraft);
    try {
      await updateInquiryStatus(lead.id, {
        status: lead.status,
        staff_notes: compiledNotes,
      });
      handleDraftChange(lead.id, 'archived', archiveFlag);
      appendAuditLog(
        archiveFlag
          ? `حذف/أرشفة سجل العميل (${lead.customer_name}) [${lead.inquiry_ref || lead.id}] إلى الأرشيف الأمني`
          : ` استعادة سجل العميل (${lead.customer_name}) [${lead.inquiry_ref || lead.id}] إلى جدول الـ CRM`,
        archiveFlag ? 'lead_archived' : 'lead_restored'
      );
      showToast(
        archiveFlag
          ? ' تم نقل الحجز إلى الأرشيف وحفظه في السجل الأمني'
          : ' تمت استعادة العميل إلى جدول الـ CRM بنجاح!'
      );
    } catch (err) {
      alert(err.message || 'تعذر تنفيذ الإجراء');
    }
  };

  const handleReplyAndArchiveMessage = async (lead, archiveAfter = true) => {
    const draft = rowDrafts[lead.id] || parseStaffMeta(lead.staff_notes);
    const updatedDraft = {
      ...draft,
      status: 'contacted',
      archived: archiveAfter,
    };
    const compiledNotes = buildStaffMeta(updatedDraft);
    try {
      await updateInquiryStatus(lead.id, {
        status: 'contacted',
        staff_notes: compiledNotes,
      });
      setRowDrafts((prev) => ({ ...prev, [lead.id]: updatedDraft }));
      setInquiries((prev) =>
        prev.map((item) =>
          item.id === lead.id
            ? { ...item, status: 'contacted', staff_notes: compiledNotes }
            : item
        )
      );
      appendAuditLog(
        `توثيق الرد على رسالة العميل (${lead.customer_name}) عبر (${updatedDraft.repliedVia})`,
        'lead_updated'
      );
      showToast(
        archiveAfter
          ? ' تم توثيق الرد وأرشفة الرسالة في قاعدة البيانات!'
          : ' تم حفظ حالة الرد بنجاح!'
      );
    } catch (err) {
      alert(err.message || 'تعذر تحديث الرسالة');
    }
  };

  const handleToggleBlockPhone = (phone) => {
    const norm = String(phone || '').replace(/[^0-9]/g, '');
    if (!norm) return;
    setBlockedPhones((prev) => {
      const exists = prev.includes(norm);
      const next = exists ? prev.filter((p) => p !== norm) : [...prev, norm];
      try {
        localStorage.setItem('mnabil_blocked_phones', JSON.stringify(next));
      } catch {
        // ignore
      }
      appendAuditLog(
        exists ? `إلغاء حظر الرقم (${norm})` : `حظر الرقم (${norm}) من إرسال طلبات مزعجة`,
        'security'
      );
      showToast(exists ? ' تم إلغاء حظر الرقم' : ' تم حظر الرقم بنجاح');
      return next;
    });
  };

  const handleVerifyBookingKey = async () => {
    const code = verifyCodeInput.trim();
    if (!code) return;
    try {
      const updated = await verifyAdminInquiryRef(code);
      if (updated) {
        setVerifyResult({
          ok: true,
          msg: ` تم التحقق بنجاح وتأكيد حضور العميل للمعرض: ${updated.customer_name} (كود الحجز: ${updated.inquiry_ref} — ${getCarLabelForLead(updated)})`,
        });
        setVerifyCodeInput('');
        appendAuditLog(
          `التحقق من كود الحجز وتأكيد حضور العميل (${updated.customer_name}) [${updated.inquiry_ref}]`,
          'lead_updated'
        );
        loadAllData();
      }
    } catch (err) {
      setVerifyResult({
        ok: false,
        msg: ` ${err.response?.data?.message || 'كود الحجز أو رقم الهاتف غير موجود بقاعدة البيانات'}`,
      });
    }
  };

  const handleCreateManualLead = async (e) => {
    e.preventDefault();
    if (!newLeadForm.customer_name.trim() || !newLeadForm.customer_phone.trim()) {
      alert('يرجى إدخال اسم العميل ورقم الهاتف');
      return;
    }
    try {
      const staff_notes = buildStaffMeta({
        priority: newLeadForm.priority,
        financeInfo: newLeadForm.finance_info,
        repliedVia: 'phone',
        archived: false,
        cleanNotes: newLeadForm.preferred_date
          ? `موعد المعاينة: ${newLeadForm.preferred_date}`
          : 'حجز مسجل يدوياً بواسطة الإدارة',
      });

      const selectedCarObj = cars.find((c) => c.id === newLeadForm.car_id);

      await createManualInquiry({
        customer_name: newLeadForm.customer_name.trim(),
        customer_phone: newLeadForm.customer_phone.trim(),
        customer_email: newLeadForm.customer_email.trim() || undefined,
        customer_city: newLeadForm.customer_city.trim() || 'ميت غمر',
        car_id: newLeadForm.car_id || null,
        car_snapshot: selectedCarObj
          ? {
              make: selectedCarObj.make,
              model: selectedCarObj.model,
              year: selectedCarObj.year,
              price: selectedCarObj.price,
              slug: selectedCarObj.slug,
            }
          : null,
        inquiry_type: newLeadForm.inquiry_type,
        status: newLeadForm.status,
        source: 'walk_in',
        message:
          newLeadForm.message ||
          `حجز معاينة بالمعرض — الموعد: ${newLeadForm.preferred_date || 'فوري'}`,
        staff_notes,
      });

      setLeadModalOpen(false);
      setNewLeadForm({
        customer_name: '',
        customer_phone: '',
        customer_email: '',
        customer_city: 'ميت غمر',
        car_id: '',
        inquiry_type: 'test_drive',
        priority: 'normal',
        finance_info: '',
        preferred_date: '',
        status: 'new',
        message: '',
      });
      appendAuditLog(
        `إضافة حجز عميل يدوي جديد (${newLeadForm.customer_name}) وتوليد كود الحجز`,
        'lead_created'
      );
      showToast(' تمت إضافة الحجز وتوليد الكود المرجعي بنجاح!');
      loadAllData();
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'تعذر إضافة الحجز');
    }
  };

  // Export CRM to CSV
  const handleExportCsv = () => {
    const headers = [
      'كود الحجز',
      'اسم العميل',
      'رقم الهاتف',
      'المدينة',
      'السيارة المطلوبة',
      'نوع الطلب',
      'الحالة',
      'الأولوية',
      'ملف التمويل/الاستبدال',
      'ملاحظات المبيعات',
      'تاريخ التسجيل',
    ];
    const rows = filteredLeads.map((l) => {
      const d = rowDrafts[l.id] || parseStaffMeta(l.staff_notes);
      return [
        l.inquiry_ref || l.id,
        l.customer_name || '',
        l.customer_phone || '',
        l.customer_city || '',
        getCarLabelForLead(l),
        formatInquiryTypeLabel(l.inquiry_type),
        d.status || l.status,
        d.priority,
        d.financeInfo,
        d.cleanNotes,
        new Date(l.created_at).toLocaleString('ar-EG'),
      ].map((cell) => `"${String(cell || '').replace(/"/g, '""')}"`);
    });

    const csvContent =
      '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Auto-Mohamed-Nabil-CRM-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(' تم تصدير قاعدة بيانات العملاء إلى ملف Excel (CSV) بنجاح!');
  };

  // Fleet Inventory Actions
  const openAddCarModal = () => {
    setEditingCar(null);
    setCarForm({
      make: '',
      model: '',
      year: 2024,
      variant: '',
      body_type: 'سيدان فاخرة',
      price: '',
      mileage: 0,
      transmission: 'automatic',
      fuel_type: 'petrol',
      engine_cc: 1600,
      horsepower: 180,
      color: '',
      status: 'available',
      condition: 'certified',
      inspection_score: '98%',
      is_featured: true,
      is_published: true,
      description: '',
      featuresText: 'فابريكا بالكامل من الإكصدام للإكصدام\nفحص معتمد 100 نقطة\nصيانات توكيل منتظمة',
      imageUrl: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=1200&q=85&auto=format&fit=crop',
    });
    setCarModalOpen(true);
  };

  const openEditCarModal = (car) => {
    setEditingCar(car);
    setCarForm({
      make: car.make || '',
      model: car.model || '',
      year: car.year || 2023,
      variant: car.variant || `${car.make} ${car.model}`,
      body_type: car.body_type || 'سيدان فاخرة',
      price: car.price || '',
      mileage: car.mileage || 0,
      transmission: car.transmission || 'automatic',
      fuel_type: car.fuel_type || 'petrol',
      engine_cc: car.engine_cc || 1600,
      horsepower: car.horsepower || 180,
      color: car.color || '',
      status: car.status || 'available',
      condition: car.condition || 'certified',
      inspection_score: car.inspection_score || '97%',
      is_featured: Boolean(car.is_featured),
      is_published: car.is_published !== false,
      description: car.description || '',
      featuresText: Array.isArray(car.features) ? car.features.join('\n') : '',
      imageUrl: (car.images && car.images[0]?.url) || '',
    });
    setCarModalOpen(true);
  };

  const handleSaveCar = async (e) => {
    e.preventDefault();
    const payload = {
      make: carForm.make.trim(),
      model: carForm.model.trim(),
      year: Number(carForm.year) || 2023,
      variant: carForm.variant.trim() || `${carForm.make} ${carForm.model}`,
      body_type: carForm.body_type,
      price: Number(carForm.price) || 0,
      mileage: Number(carForm.mileage) || 0,
      transmission: carForm.transmission,
      fuel_type: carForm.fuel_type,
      engine_cc: Number(carForm.engine_cc) || 1600,
      horsepower: Number(carForm.horsepower) || 180,
      color: carForm.color.trim(),
      status: carForm.status,
      condition: carForm.condition,
      inspection_score: carForm.inspection_score || '98%',
      is_featured: Boolean(carForm.is_featured),
      is_published: Boolean(carForm.is_published),
      description: carForm.description.trim(),
      features: carForm.featuresText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
      images: carForm.imageUrl.trim()
        ? [{ url: carForm.imageUrl.trim(), alt: `${carForm.make} ${carForm.model}` }]
        : [],
    };

    try {
      if (editingCar && editingCar.id && !String(editingCar.id).includes('-202')) {
        await updateAdminCar(editingCar.id, payload);
        appendAuditLog(`تعديل بيانات السيارة (${payload.make} ${payload.model})`, 'car');
      } else if (!editingCar) {
        await createAdminCar(payload);
        appendAuditLog(`إضافة سيارة جديدة للأسطول (${payload.make} ${payload.model})`, 'car');
      } else {
        // Fallback local update if editing a static fallback car
        setCars((prev) =>
          prev.map((c) => (c.id === editingCar.id ? { ...c, ...payload } : c))
        );
      }
      setCarModalOpen(false);
      showToast(' تم حفظ بيانات السيارة ونشرها في صالة العرض بنجاح!');
      loadAllData();
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'تعذر حفظ السيارة');
    }
  };

  const handleDeleteCar = async (car) => {
    if (!window.confirm(`هل أنت متأكد من حذف السيارة (${car.make} ${car.model})؟`)) return;
    try {
      await deleteAdminCar(car.id);
      appendAuditLog(`حذف السيارة (${car.make} ${car.model}) من أسطول المعرض`, 'car');
      showToast(' تم حذف السيارة من المعرض');
      loadAllData();
    } catch {
      setCars((prev) => prev.filter((c) => c.id !== car.id));
      showToast(' تم إخفاء السيارة من العرض');
    }
  };

  const handleGoToSite = (path = '/') => {
    if (onSwitchToSite && path === '/') {
      onSwitchToSite();
    } else if (onClose && path === '/') {
      onClose();
    } else {
      window.history.pushState({}, '', path);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  const tabTitles = {
    overview: ' نظرة عامة وإحصائيات المعرض',
    leads: ' إدارة حجوزات المعاينة والعملاء (CRM)',
    messages: ' رسائل واستفسارات الموقع',
    cars: ' إدارة أسطول السيارات (Showroom CMS)',
    pages: ' إدارة صفحات الموقع ومحركات البحث (SEO)',
    media: ' مكتبة صور السيارات والوسائط',
    settings: ' إعدادات المعرض والربط البرمجي',
    logs: ' فريق العمل والسجل الأمني (Audit Log)',
  };

  return (
    <div className="drm-admin-root" dir="rtl">
      <style>{`
        .drm-admin-root {
          --primary: #1e2530;
          --primary-dark: #141a22;
          --accent: #e8935f;
          --orange: #c2602b;
          --bg: #f3f6f5;
          --card: #ffffff;
          --text: #1e293b;
          --muted: #64748b;
          --border: #e2e8f0;
          --success: #c2602b;
          --warning: #d97706;
          --danger: #dc2626;
          font-family: 'Alexandria', 'Cairo', sans-serif;
          background: var(--bg);
          color: var(--text);
          display: flex;
          min-height: 100vh;
          overflow-x: clip;
          direction: rtl;
        }
        .drm-admin-root * {
          box-sizing: border-box;
        }
        .drm-sidebar {
          width: 270px;
          background: var(--primary);
          color: #fff;
          display: flex;
          flex-direction: column;
          flex-shrink: 0;
          position: sticky;
          top: 0;
          align-self: flex-start;
          height: 100vh;
          overflow-y: auto;
          box-shadow: -4px 0 20px rgba(0,0,0,0.08);
          z-index: 50;
        }
        .drm-brand {
          padding: 24px 20px;
          border-bottom: 1px solid rgba(255,255,255,0.1);
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .drm-brand .badge {
          background: rgba(212, 163, 115, 0.2);
          color: var(--accent);
          padding: 3px 10px;
          border-radius: 50px;
          font-size: 11px;
          font-weight: 700;
          width: fit-content;
        }
        .drm-brand h2 {
          font-size: 15.5px;
          font-weight: 800;
          color: #fff;
          margin: 0;
        }
        .drm-brand p {
          font-size: 12px;
          color: #cbd5e1;
          margin: 0;
        }
        .drm-nav {
          padding: 16px 12px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          flex: 1;
        }
        .drm-nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 14px;
          border-radius: 10px;
          color: #e2e8f0;
          text-decoration: none;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: 0.2s;
          border: none;
          background: transparent;
          width: 100%;
          text-align: right;
          font-family: inherit;
        }
        .drm-nav-item:hover {
          background: rgba(255,255,255,0.07);
          color: #e2e8f0;
        }
        .drm-nav-item.active {
          background: rgba(255,255,255,0.13);
          color: #ffffff;
          font-weight: 700;
        }
        .drm-nav-item span.count {
          margin-right: auto;
          background: rgba(0,0,0,0.25);
          padding: 2px 7px;
          border-radius: 20px;
          font-size: 11px;
        }
        .drm-sidebar-footer {
          padding: 16px 20px;
          border-top: 1px solid rgba(255,255,255,0.1);
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .drm-sidebar-footer a, .drm-sidebar-footer button {
          color: #cbd5e1;
          text-decoration: none;
          font-size: 12px;
          display: flex;
          align-items: center;
          gap: 8px;
          background: none;
          border: none;
          cursor: pointer;
          font-family: inherit;
          padding: 4px 0;
          text-align: right;
        }
        .drm-sidebar-footer a:hover, .drm-sidebar-footer button:hover {
          color: #fff;
        }
        .drm-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;
        }
        .drm-topbar {
          background: #fff;
          padding: 16px 28px;
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: sticky;
          top: 0;
          z-index: 40;
          flex-wrap: wrap;
          gap: 12px;
        }
        .drm-topbar h1 {
          font-size: 17px;
          font-weight: 800;
          color: var(--primary);
          margin: 0;
        }
        .drm-topbar-actions {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }
        .drm-btn {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 7px 14px;
          border-radius: 8px;
          font-family: inherit;
          font-size: 12.5px;
          font-weight: 700;
          cursor: pointer;
          border: none;
          text-decoration: none;
          transition: 0.2s;
        }
        .drm-btn-primary { background: var(--primary); color: #fff; }
        .drm-btn-primary:hover { background: var(--primary-dark); }
        .drm-btn-accent { background: var(--accent); color: #1e293b; }
        .drm-btn-outline { background: #fff; color: var(--primary); border: 1.5px solid var(--border); }
        .drm-btn-outline:hover { border-color: var(--primary); background: #f8fafc; }
        .drm-btn-danger { background: #fee2e2; color: var(--danger); }
        .drm-btn-sm { padding: 5px 10px; font-size: 11.5px; border-radius: 6px; }
        .drm-btn-whatsapp { background: #374151; color: #fff; padding: 4px 9px; border-radius: 6px; font-size: 11.5px; text-decoration: none; font-weight: 700; display: inline-flex; align-items: center; gap: 4px; border: none; cursor: pointer; }
        .drm-content {
          padding: 28px;
          max-width: 1440px;
          width: 100%;
          margin: 0 auto;
        }
        .drm-kpi-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 18px;
          margin-bottom: 26px;
        }
        .drm-kpi-card {
          background: var(--card);
          border-radius: 14px;
          padding: 22px;
          border: 1px solid var(--border);
          box-shadow: 0 2px 10px rgba(0,0,0,0.02);
        }
        .drm-kpi-card .label { font-size: 12.5px; color: var(--muted); font-weight: 600; margin-bottom: 6px; }
        .drm-kpi-card .value { font-size: 26px; font-weight: 800; color: var(--primary); }
        .drm-kpi-card .sub { font-size: 11px; color: var(--success); margin-top: 6px; font-weight: 600; }
        .drm-card {
          background: var(--card);
          border-radius: 14px;
          border: 1px solid var(--border);
          box-shadow: 0 2px 10px rgba(0,0,0,0.02);
          margin-bottom: 24px;
          overflow: hidden;
        }
        .drm-card-header {
          padding: 18px 22px;
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
        }
        .drm-card-header h3 { font-size: 14.5px; font-weight: 800; color: var(--primary); margin: 0; }
        .drm-card-body { padding: 22px; }
        .drm-table-responsive { overflow-x: auto; }
        .drm-table { width: 100%; border-collapse: collapse; text-align: right; }
        .drm-table th {
          background: #f8fafc;
          color: #475569;
          font-size: 11.5px;
          font-weight: 700;
          padding: 10px 12px;
          border-bottom: 1px solid var(--border);
          white-space: nowrap;
        }
        .drm-table td {
          padding: 11px 12px;
          border-bottom: 1px solid var(--border);
          font-size: 12.5px;
          vertical-align: middle;
          color: #1e293b;
        }
        .drm-table tr:hover td { background: #fcfdfd; }
        .status-badge {
          display: inline-block;
          padding: 3px 9px;
          border-radius: 50px;
          font-size: 11px;
          font-weight: 700;
        }
        .status-new { background: #e5e7eb; color: #374151; }
        .status-contacted { background: #fdebe0; color: #a24d1f; }
        .status-confirmed { background: #e6eaf0; color: #141a22; }
        .status-cancelled { background: #fee2e2; color: #b91c1c; }
        .drm-input, .drm-select, .drm-textarea {
          padding: 8px 11px;
          border: 1.5px solid var(--border);
          border-radius: 8px;
          font-family: inherit;
          font-size: 12.5px;
          color: var(--text);
          background: #fff;
          outline: none;
        }
        .drm-input:focus, .drm-select:focus, .drm-textarea:focus {
          border-color: var(--primary);
        }
        .drm-form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 18px;
        }
        .drm-form-group { margin-bottom: 14px; }
        .drm-form-group label { display: block; font-size: 12px; font-weight: 700; color: #334155; margin-bottom: 5px; }
        .drm-form-group input, .drm-form-group select, .drm-form-group textarea { width: 100%; }
        .drm-media-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 16px;
        }
        .drm-media-item {
          border: 1px solid var(--border);
          border-radius: 10px;
          overflow: hidden;
          background: #fff;
          display: flex;
          flex-direction: column;
        }
        .drm-media-item img {
          width: 100%;
          height: 135px;
          object-fit: cover;
          background: #f1f5f9;
        }
        .drm-media-item .meta {
          padding: 8px 10px;
          font-size: 11px;
          color: var(--muted);
        }
        .drm-modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.6);
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .drm-modal {
          background: #fff;
          border-radius: 16px;
          max-width: 720px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          padding: 26px;
          box-shadow: 0 25px 50px rgba(0,0,0,0.25);
        }
        .drm-toast {
          position: fixed;
          bottom: 24px;
          left: 24px;
          background: var(--primary);
          color: #fff;
          padding: 12px 20px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 700;
          box-shadow: 0 10px 30px rgba(0,0,0,0.25);
          z-index: 200;
        }
        @media (max-width: 992px) {
          .drm-sidebar {
            position: fixed;
            right: -285px;
            top: 0;
            bottom: 0;
            width: 270px;
            transition: right 0.28s cubic-bezier(0.4, 0, 0.2, 1);
          }
          .drm-sidebar.open { right: 0; }
        }
      `}</style>

      {/* Right Sticky Sidebar (Exact Dr Mahmoud Architecture) */}
      <aside className={`drm-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="drm-brand">
          <span className="badge">v2.5 Automotive CRM</span>
          <h2>معرض أوتو محمد نبيل</h2>
          <p>نظام إدارة الأسطول والـ CRM</p>
        </div>

        <nav className="drm-nav">
          <button
            className={`drm-nav-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => { setActiveTab('overview'); setSidebarOpen(false); }}
          >
             نظرة عامة وإحصائيات
          </button>

          <button
            className={`drm-nav-item ${activeTab === 'leads' ? 'active' : ''}`}
            onClick={() => { setActiveTab('leads'); setSidebarOpen(false); }}
          >
             الحجوزات والعملاء (CRM)
            <span className="count">{activeCrmLeads.length}</span>
          </button>

          <button
            className={`drm-nav-item ${activeTab === 'messages' ? 'active' : ''}`}
            onClick={() => { setActiveTab('messages'); setSidebarOpen(false); }}
          >
             رسائل واستفسارات الموقع
            <span className="count">{activeMessages.length}</span>
          </button>

          <button
            className={`drm-nav-item ${activeTab === 'cars' ? 'active' : ''}`}
            onClick={() => { setActiveTab('cars'); setSidebarOpen(false); }}
          >
             إدارة أسطول السيارات
            <span className="count">{cars.length}</span>
          </button>

          <button
            className={`drm-nav-item ${activeTab === 'pages' ? 'active' : ''}`}
            onClick={() => { setActiveTab('pages'); setSidebarOpen(false); }}
          >
             الصفحات والـ SEO
            <span className="count">{seoPages.length}</span>
          </button>

          <button
            className={`drm-nav-item ${activeTab === 'media' ? 'active' : ''}`}
            onClick={() => { setActiveTab('media'); setSidebarOpen(false); }}
          >
             مكتبة صور السيارات
            <span className="count">{allMediaItems.length}</span>
          </button>

          <button
            className={`drm-nav-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => { setActiveTab('settings'); setSidebarOpen(false); }}
          >
             إعدادات المعرض والربط
          </button>

          <button
            className={`drm-nav-item ${activeTab === 'logs' ? 'active' : ''}`}
            onClick={() => { setActiveTab('logs'); setSidebarOpen(false); }}
          >
             فريق العمل والسجل الأمني
            <span className="count">{auditLogs.length}</span>
          </button>
        </nav>

        <div className="drm-sidebar-footer">
          <div style={{ fontSize: '13.4px', color: '#f3c9ad', marginBottom: '6px' }}>
             متصل كـ: <strong>{currentAdmin.full_name || currentAdmin.username}</strong>
          </div>
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              handleGoToSite('/');
            }}
          >
             فتح الموقع الرئيسي (معاينة حية)
          </a>
          <button
            onClick={onLogout}
            style={{ color: '#f3c9ad', marginTop: '4px' }}
          >
             تسجيل الخروج الآمن
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="drm-main">
        {/* Topbar */}
        <header className="drm-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              className="drm-btn drm-btn-outline drm-btn-sm"
              style={{ display: window.innerWidth <= 992 ? 'inline-flex' : 'none' }}
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              القائمة
            </button>
            <h1>{tabTitles[activeTab]}</h1>
          </div>

          <div className="drm-topbar-actions">
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '50px',
                fontSize: '13.4px',
                fontWeight: 700,
                background: cloudConnected ? '#e6eaf0' : '#fee2e2',
                color: cloudConnected ? '#a24d1f' : '#991b1b',
              }}
            >
              {cloudConnected
                ? ` متصل بالسحابة (Zero Data Loss)${lastSyncTime ? ` • ${lastSyncTime}` : ''}`
                : ' جاري إعادة الاتصال بالسحابة...'}
            </span>

            <button
              className="drm-btn drm-btn-outline"
              onClick={openAddCarModal}
            >
              + إضافة سيارة جديدة
            </button>

            <button
              className="drm-btn drm-btn-primary"
              onClick={() => setLeadModalOpen(true)}
            >
              + تسجيل حجز عميل يدوياً
            </button>

            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                handleGoToSite('/');
              }}
              className="drm-btn drm-btn-accent"
            >
              معاينة الموقع الحي ↗
            </a>
          </div>
        </header>

        <div className="drm-content">
          {/* ==========================================
              TAB 1: OVERVIEW (نظرة عامة وإحصائيات)
             ========================================== */}
          {activeTab === 'overview' && (
            <div>
              <div className="drm-kpi-grid">
                <div className="drm-kpi-card">
                  <div className="label">إجمالي حجوزات وطلبات العملاء</div>
                  <div className="value">{activeCrmLeads.length}</div>
                  <div className="sub">
                    {activeCrmLeads.filter((l) => l.status === 'new').length} طلبات جديدة بانتظار التأكيد
                  </div>
                </div>

                <div className="drm-kpi-card">
                  <div className="label">المعاينات المؤكدة والمبيعات</div>
                  <div className="value">
                    {
                      activeCrmLeads.filter(
                        (l) => l.status === 'negotiating' || l.status === 'won'
                      ).length
                    }
                  </div>
                  <div className="sub">عملاء تم تأكيد موعدهم أو التعاقد معهم</div>
                </div>

                <div className="drm-kpi-card">
                  <div className="label">إجمالي أسطول السيارات بالمعرض</div>
                  <div className="value">{cars.length}</div>
                  <div className="sub">
                    {cars.filter((c) => c.status === 'available').length} سيارة متاحة للتسليم الفوري
                  </div>
                </div>

                <div className="drm-kpi-card">
                  <div className="label">تقييم الفحص المعتمد والثقة</div>
                  <div className="value">100 نقطة </div>
                  <div className="sub">مفعل في محركات البحث وبيانات Schema</div>
                </div>
              </div>

              <div className="drm-card">
                <div className="drm-card-header">
                  <h3> أحدث حجوزات المعاينة وطلبات التمويل والاستبدال</h3>
                  <button
                    className="drm-btn drm-btn-outline drm-btn-sm"
                    onClick={() => setActiveTab('leads')}
                  >
                    عرض كل الحجوزات والـ CRM ←
                  </button>
                </div>
                <div className="drm-table-responsive">
                  <table className="drm-table">
                    <thead>
                      <tr>
                        <th>كود الحجز</th>
                        <th>اسم العميل</th>
                        <th>رقم الهاتف</th>
                        <th>السيارة المطلوبة</th>
                        <th>نوع الطلب</th>
                        <th>الحالة</th>
                        <th>تواصل سريع</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeCrmLeads.slice(0, 6).map((l) => (
                        <tr key={l.id}>
                          <td>
                            <code
                              style={{
                                background: '#f1f5f9',
                                padding: '3px 8px',
                                borderRadius: '6px',
                                fontWeight: 700,
                                color: '#1e2530',
                              }}
                            >
                               {l.inquiry_ref || `#${String(l.id).slice(0, 6)}`}
                            </code>
                          </td>
                          <td>
                            <strong>{l.customer_name}</strong>
                          </td>
                          <td dir="ltr">
                            <a
                              href={`tel:${l.customer_phone}`}
                              style={{
                                color: 'inherit',
                                textDecoration: 'none',
                                fontWeight: 600,
                              }}
                            >
                               {l.customer_phone}
                            </a>
                          </td>
                          <td>
                            <strong>{getCarLabelForLead(l)}</strong>
                          </td>
                          <td>{formatInquiryTypeLabel(l.inquiry_type)}</td>
                          <td>{formatStatusBadge(l.status)}</td>
                          <td>
                            <a
                              className="drm-btn-whatsapp"
                              target="_blank"
                              rel="noopener noreferrer"
                              href={formatWhatsAppLink(
                                l.customer_phone,
                                l.customer_name,
                                getCarLabelForLead(l),
                                l.inquiry_ref
                              )}
                            >
                               واتساب
                            </a>
                          </td>
                        </tr>
                      ))}
                      {activeCrmLeads.length === 0 && (
                        <tr>
                          <td colSpan="7" style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                            لا توجد حجوزات مسجلة حالياً — يمكنك إضافة حجز جديد أو انتظار طلبات الموقع
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="drm-card">
                <div className="drm-card-header">
                  <h3> السيارات الأكثر طلباً ومشاهدة في صالة العرض</h3>
                  <button
                    className="drm-btn drm-btn-outline drm-btn-sm"
                    onClick={() => setActiveTab('cars')}
                  >
                    إدارة أسطول السيارات ←
                  </button>
                </div>
                <div className="drm-table-responsive">
                  <table className="drm-table">
                    <thead>
                      <tr>
                        <th>السيارة</th>
                        <th>الموديل</th>
                        <th>السعر النقدي</th>
                        <th>فحص المعرض</th>
                        <th>الحالة</th>
                        <th>معاينة الصفحة</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cars.slice(0, 6).map((c) => (
                        <tr key={c.id}>
                          <td>
                            <strong>
                              {c.make} {c.model}
                            </strong>
                          </td>
                          <td>{c.year}</td>
                          <td>
                            <strong>{Number(c.price).toLocaleString('ar-EG')} ج.م</strong>
                          </td>
                          <td>
                            <span className="status-badge status-confirmed">
                               {c.inspection_score || '98%'}
                            </span>
                          </td>
                          <td>
                            <span
                              className={`status-badge ${
                                c.status === 'available'
                                  ? 'status-confirmed'
                                  : c.status === 'reserved'
                                  ? 'status-contacted'
                                  : 'status-cancelled'
                              }`}
                            >
                              {c.status === 'available'
                                ? 'متاحة بالمعرض'
                                : c.status === 'reserved'
                                ? 'محجوزة'
                                : 'مباعة'}
                            </span>
                          </td>
                          <td>
                            <a
                              href={`/vehicles/${c.slug || c.id}`}
                              onClick={(e) => {
                                e.preventDefault();
                                handleGoToSite(`/vehicles/${c.slug || c.id}`);
                              }}
                              className="drm-btn drm-btn-outline drm-btn-sm"
                            >
                               معاينة السيارة
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ==========================================
              TAB 2: CRM LEADS (حجوزات المعاينة والعملاء)
             ========================================== */}
          {activeTab === 'leads' && (
            <div>
              {/* Reference Code Verification Banner (Exact Dr Mahmoud Feature) */}
              <div
                className="drm-card"
                style={{
                  background: 'linear-gradient(135deg, #1e2530, #141a22)',
                  color: '#fff',
                  border: 'none',
                  marginBottom: '20px',
                }}
              >
                <div
                  className="drm-card-body"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '16px',
                    padding: '18px 22px',
                  }}
                >
                  <div>
                    <h3 style={{ color: '#e8935f', fontSize: '17.9px', marginBottom: '4px' }}>
                       بوابة التحقق السريع من كود حجز العميل (Reference Code Verification)
                    </h3>
                    <p style={{ fontSize: '14.0px', color: '#cbd5e1', margin: 0 }}>
                      أدخل الكود المرجعي الذي حصل عليه العميل عند الحجز (مثال: INQ-2026-XXXXXX) أو رقم هاتفه لتأكيد حضوره لصالة العرض فوراً.
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <input
                      type="text"
                      placeholder="INQ-2026-XXXXXX"
                      dir="ltr"
                      value={verifyCodeInput}
                      onChange={(e) => setVerifyCodeInput(e.target.value)}
                      className="drm-input"
                      style={{
                        width: '210px',
                        textAlign: 'center',
                        fontWeight: 800,
                        letterSpacing: '1px',
                      }}
                    />
                    <button
                      className="drm-btn drm-btn-accent"
                      onClick={handleVerifyBookingKey}
                    >
                      تحقق وتأكيد حضور العميل 
                    </button>
                  </div>
                </div>
                {verifyResult && (
                  <div
                    style={{
                      padding: '12px 22px',
                      background: verifyResult.ok
                        ? 'rgba(22, 163, 74, 0.28)'
                        : 'rgba(220, 38, 38, 0.35)',
                      fontSize: '14.6px',
                      borderTop: '1px solid rgba(255,255,255,0.1)',
                      fontWeight: 600,
                    }}
                  >
                    {verifyResult.msg}
                  </div>
                )}
              </div>

              {/* Main CRM Table Card */}
              <div className="drm-card">
                <div className="drm-card-header">
                  <h3> سجل حجوزات المعاينة، طلبات التقسيط، واستبدال السيارات (CRM)</h3>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <input
                      type="text"
                      placeholder="بحث بالاسم، الهاتف، السيارة، أو الكود..."
                      value={leadSearch}
                      onChange={(e) => setLeadSearch(e.target.value)}
                      className="drm-input"
                      style={{ width: '240px' }}
                    />
                    <select
                      value={leadStatusFilter}
                      onChange={(e) => setLeadStatusFilter(e.target.value)}
                      className="drm-select"
                    >
                      <option value="">جميع الحالات النشطة</option>
                      <option value="new">جديد (New)</option>
                      <option value="contacted">تم التواصل (Contacted)</option>
                      <option value="negotiating">معاينة مؤكدة (Confirmed)</option>
                      <option value="won">تم البيع والتعاقد (Closed Won)</option>
                      <option value="cancelled">ملغي (Cancelled)</option>
                      <option value="archived"> السجلات المحذوفة / الأرشيف</option>
                    </select>
                    <select
                      value={leadPriorityFilter}
                      onChange={(e) => setLeadPriorityFilter(e.target.value)}
                      className="drm-select"
                    >
                      <option value="">جميع الأولويات</option>
                      <option value="vip">عميل VIP / جاد جداً</option>
                      <option value="urgent"> عاجل (شراء فوري)</option>
                      <option value="normal">عادي</option>
                    </select>
                    <select
                      value={leadTypeFilter}
                      onChange={(e) => setLeadTypeFilter(e.target.value)}
                      className="drm-select"
                    >
                      <option value="">جميع أنواع الطلبات</option>
                      <option value="test_drive">حجز معاينة وتجربة قيادة VIP</option>
                      <option value="finance">طلب تقسيط وتمويل بنكي</option>
                      <option value="trade_in">استبدال سيارة قديمة (Trade-In)</option>
                      <option value="price">شراء نقدي (كاش)</option>
                    </select>
                    <button
                      className="drm-btn drm-btn-primary drm-btn-sm"
                      onClick={() => setLeadModalOpen(true)}
                    >
                      + إضافة حجز عميل
                    </button>
                    <button
                      className="drm-btn drm-btn-outline drm-btn-sm"
                      onClick={handleExportCsv}
                    >
                       تصدير لملف Excel (CSV)
                    </button>
                  </div>
                </div>

                <div className="drm-table-responsive">
                  <table className="drm-table">
                    <thead>
                      <tr>
                        <th>رقم وكود الحجز</th>
                        <th>اسم العميل</th>
                        <th>بيانات الاتصال</th>
                        <th>السيارة ونوع الطلب</th>
                        <th>التفاصيل / الرسالة</th>
                        <th>الحالة وتقييم المبيعات (CRM)</th>
                        <th>إجراءات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLeads.map((l) => {
                        const d = rowDrafts[l.id] || parseStaffMeta(l.staff_notes);
                        const normPh = String(l.customer_phone || '').replace(/[^0-9]/g, '');
                        const isBlocked = normPh && blockedPhones.includes(normPh);
                        const isArchived = Boolean(d.archived);
                        const carTitle = getCarLabelForLead(l);

                        return (
                          <tr
                            key={l.id}
                            style={{
                              background: isArchived
                                ? '#fff5f5'
                                : isBlocked
                                ? '#fff1f2'
                                : undefined,
                              opacity: isBlocked ? 0.7 : 1,
                            }}
                          >
                            {/* 1. Booking Ref & Date */}
                            <td>
                              <strong>#{String(l.id).slice(0, 6)}</strong>
                              <div style={{ marginTop: '4px' }}>
                                <code
                                  style={{
                                    background: '#f1f5f9',
                                    padding: '2px 6px',
                                    borderRadius: '6px',
                                    fontWeight: 700,
                                    color: '#1e2530',
                                  }}
                                >
                                   {l.inquiry_ref || 'INQ-2026'}
                                </code>
                              </div>
                              {d.verified && (
                                <div
                                  style={{
                                    marginTop: '3px',
                                    fontSize: '12.3px',
                                    color: '#c2602b',
                                    fontWeight: 700,
                                  }}
                                >
                                   تم تأكيد الحضور للمعرض
                                </div>
                              )}
                              <span
                                style={{
                                  display: 'block',
                                  marginTop: '3px',
                                  fontSize: '12.3px',
                                  color: '#64748b',
                                }}
                              >
                                 {new Date(l.created_at).toLocaleDateString('ar-EG')}
                              </span>
                            </td>

                            {/* 2. Customer Name & Badges */}
                            <td>
                              <strong style={{ fontSize: '16.2px', color: 'var(--primary)' }}>
                                {l.customer_name}
                              </strong>
                              {l.customer_city && (
                                <small style={{ display: 'block', color: '#64748b', fontSize: '12.3px' }}>
                                   {l.customer_city}
                                </small>
                              )}
                              <div style={{ marginTop: '4px', display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                {d.priority === 'vip' && (
                                  <span
                                    className="status-badge"
                                    style={{ background: '#fdebe0', color: '#a24d1f' }}
                                  >
                                    VIP
                                  </span>
                                )}
                                {d.priority === 'urgent' && (
                                  <span
                                    className="status-badge"
                                    style={{ background: '#fee2e2', color: '#991b1b' }}
                                  >
                                     عاجل
                                  </span>
                                )}
                                {isBlocked && (
                                  <span className="status-badge status-cancelled"> رقم محظور</span>
                                )}
                                {isArchived && (
                                  <span className="status-badge status-cancelled"> مؤرشف</span>
                                )}
                              </div>
                            </td>

                            {/* 3. Contact Info */}
                            <td dir="ltr">
                              <div style={{ marginBottom: '3px' }}>
                                <a
                                  href={`tel:${l.customer_phone}`}
                                  style={{
                                    color: 'inherit',
                                    textDecoration: 'none',
                                    fontWeight: 700,
                                  }}
                                >
                                   {l.customer_phone}
                                </a>
                              </div>
                              {l.customer_email && (
                                <div style={{ fontSize: '12.9px', color: '#64748b' }}>
                                  <a
                                    href={`mailto:${l.customer_email}`}
                                    style={{ color: 'inherit', textDecoration: 'none' }}
                                  >
                                     {l.customer_email}
                                  </a>
                                </div>
                              )}
                            </td>

                            {/* 4. Car & Automotive Dossier */}
                            <td>
                              <div style={{ fontWeight: 700, color: 'var(--primary)' }}>
                                 {carTitle}
                              </div>
                              <div
                                style={{
                                  marginTop: '4px',
                                  fontSize: '12.9px',
                                  color: '#334155',
                                }}
                              >
                                 نوع الطلب:{' '}
                                <strong>{formatInquiryTypeLabel(l.inquiry_type)}</strong>
                              </div>
                              {d.financeInfo && (
                                <div
                                  style={{
                                    marginTop: '3px',
                                    fontSize: '12.3px',
                                    color: '#a24d1f',
                                    fontWeight: 600,
                                  }}
                                >
                                   تمويل/استبدال: {d.financeInfo}
                                </div>
                              )}
                            </td>

                            {/* 5. Message */}
                            <td style={{ maxWidth: '230px', wordBreak: 'break-word', fontSize: '14.0px' }}>
                              {l.message || 'طلب معاينة وتواصل مباشر'}
                            </td>

                            {/* 6. Inline CRM Controls (Exact Dr Mahmoud Style) */}
                            <td style={{ minWidth: '250px' }}>
                              <div style={{ display: 'flex', gap: '4px', marginBottom: '5px' }}>
                                <select
                                  className="drm-select"
                                  style={{ flex: 1, fontSize: '13.4px', padding: '6px 8px' }}
                                  value={d.status}
                                  onChange={(e) =>
                                    handleDraftChange(l.id, 'status', e.target.value)
                                  }
                                >
                                  <option value="new">جديد (New)</option>
                                  <option value="contacted">تم التواصل</option>
                                  <option value="negotiating">معاينة مؤكدة</option>
                                  <option value="won">تم البيع والتعاقد </option>
                                  <option value="cancelled">ملغي</option>
                                </select>
                                <select
                                  className="drm-select"
                                  style={{ width: '95px', fontSize: '13.4px', padding: '6px 8px' }}
                                  value={d.priority}
                                  onChange={(e) =>
                                    handleDraftChange(l.id, 'priority', e.target.value)
                                  }
                                >
                                  <option value="normal">عادي</option>
                                  <option value="vip">VIP</option>
                                  <option value="urgent"> عاجل</option>
                                </select>
                              </div>
                              <input
                                type="text"
                                className="drm-input"
                                value={d.financeInfo}
                                onChange={(e) =>
                                  handleDraftChange(l.id, 'financeInfo', e.target.value)
                                }
                                placeholder="تفاصيل التمويل / المقدم / السيارة البديلة..."
                                style={{
                                  width: '100%',
                                  marginBottom: '5px',
                                  fontSize: '13.4px',
                                  padding: '6px 9px',
                                }}
                              />
                              <input
                                type="text"
                                className="drm-input"
                                value={d.cleanNotes}
                                onChange={(e) =>
                                  handleDraftChange(l.id, 'cleanNotes', e.target.value)
                                }
                                placeholder="ملاحظات مستشار المبيعات / الاستقبال..."
                                style={{ width: '100%', fontSize: '13.4px', padding: '6px 9px' }}
                              />
                            </td>

                            {/* 7. Actions */}
                            <td>
                              <div
                                style={{
                                  display: 'flex',
                                  flexDirection: 'row',
                                  flexWrap: 'wrap',
                                  gap: '6px',
                                }}
                              >
                                {isArchived ? (
                                  <button
                                    className="drm-btn drm-btn-outline drm-btn-sm"
                                    onClick={() => handleArchiveOrRestoreLead(l, false)}
                                  >
                                     استعادة للـ CRM
                                  </button>
                                ) : (
                                  <>
                                    <button
                                      className="drm-btn drm-btn-primary drm-btn-sm"
                                      onClick={() => handleSaveLeadRow(l)}
                                    >
                                       حفظ
                                    </button>
                                    {l.customer_phone && (
                                      <a
                                        className="drm-btn-whatsapp"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        href={formatWhatsAppLink(
                                          l.customer_phone,
                                          l.customer_name,
                                          carTitle,
                                          l.inquiry_ref
                                        )}
                                      >
                                         واتساب
                                      </a>
                                    )}
                                    {normPh && (
                                      <button
                                        className="drm-btn drm-btn-outline drm-btn-sm"
                                        onClick={() => handleToggleBlockPhone(normPh)}
                                      >
                                        {isBlocked ? ' فك الحظر' : ' حظر الرقم'}
                                      </button>
                                    )}
                                    <button
                                      className="drm-btn drm-btn-danger drm-btn-sm"
                                      onClick={() => handleArchiveOrRestoreLead(l, true)}
                                    >
                                      حذف
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      {filteredLeads.length === 0 && (
                        <tr>
                          <td colSpan="7" style={{ textAlign: 'center', padding: '28px', color: '#64748b' }}>
                            لا توجد حجوزات مطابقة للبحث حالياً
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ==========================================
              TAB 3: WEBSITE MESSAGES (رسائل واستفسارات الموقع)
             ========================================== */}
          {activeTab === 'messages' && (
            <div className="drm-card">
              <div className="drm-card-header">
                <div>
                  <h3> صندوق رسائل واستفسارات زوار المعرض</h3>
                  <p style={{ fontSize: '14.0px', color: '#64748b', marginTop: '4px' }}>
                    قسم مخصص للرد على رسائل واستفسارات العملاء مع إمكانية التواصل المباشر وتوثيق الرد وأرشفة الرسالة تلقائياً.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <input
                    type="text"
                    placeholder="بحث في الرسائل بالاسم، الهاتف، أو النص..."
                    value={msgSearch}
                    onChange={(e) => setMsgSearch(e.target.value)}
                    className="drm-input"
                    style={{ width: '240px' }}
                  />
                  <select
                    value={msgStatusFilter}
                    onChange={(e) => setMsgStatusFilter(e.target.value)}
                    className="drm-select"
                  >
                    <option value="">صندوق الوارد النشط (Inbox)</option>
                    <option value="new">رسائل جديدة غير مقروءة (New)</option>
                    <option value="contacted">تم الرد عليها (Replied)</option>
                    <option value="archived"> الرسائل المؤرشفة بعد الرد</option>
                  </select>
                </div>
              </div>

              <div className="drm-table-responsive">
                <table className="drm-table">
                  <thead>
                    <tr>
                      <th># / التاريخ والمصدر</th>
                      <th>المرسل والحالة</th>
                      <th>الرد المباشر (1-Click Reply)</th>
                      <th>نص الرسالة / الاستفسار</th>
                      <th>توثيق الرد والأرشفة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMessages.map((l) => {
                      const d = rowDrafts[l.id] || parseStaffMeta(l.staff_notes);
                      const isArchived = Boolean(d.archived);
                      const waHref = formatWhatsAppLink(
                        l.customer_phone,
                        l.customer_name,
                        getCarLabelForLead(l),
                        l.inquiry_ref
                      );

                      return (
                        <tr key={l.id} style={{ background: isArchived ? '#f8fafc' : undefined }}>
                          <td>
                            <strong>{l.inquiry_ref || `#${String(l.id).slice(0, 6)}`}</strong>
                            <span
                              style={{
                                display: 'block',
                                marginTop: '4px',
                                fontSize: '12.9px',
                                color: '#475569',
                                fontWeight: 600,
                              }}
                            >
                              {formatInquiryTypeLabel(l.inquiry_type)}
                            </span>
                            <span
                              style={{
                                display: 'block',
                                marginTop: '3px',
                                fontSize: '12.3px',
                                color: '#64748b',
                              }}
                            >
                               {new Date(l.created_at).toLocaleString('ar-EG')}
                            </span>
                          </td>

                          <td>
                            <strong style={{ fontSize: '16.2px', color: 'var(--primary)' }}>
                              {l.customer_name}
                            </strong>
                            <div style={{ marginTop: '6px' }}>
                              {isArchived ? (
                                <span
                                  className="status-badge"
                                  style={{ background: '#e6eaf0', color: '#a24d1f' }}
                                >
                                   مؤرشفة بعد الرد
                                </span>
                              ) : l.status === 'contacted' || l.status === 'negotiating' ? (
                                <span className="status-badge status-contacted">
                                   تمت القراءة والرد
                                </span>
                              ) : (
                                <span className="status-badge status-new"> رسالة جديدة</span>
                              )}
                            </div>
                          </td>

                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              {l.customer_phone && (
                                <a
                                  className="drm-btn drm-btn-outline drm-btn-sm"
                                  href={`tel:${l.customer_phone}`}
                                  dir="ltr"
                                  style={{ justifyContent: 'center' }}
                                >
                                   اتصال: {l.customer_phone}
                                </a>
                              )}
                              {l.customer_phone && (
                                <a
                                  className="drm-btn-whatsapp"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  href={waHref}
                                  style={{ justifyContent: 'center' }}
                                >
                                   رد عبر واتساب
                                </a>
                              )}
                            </div>
                          </td>

                          <td style={{ minWidth: '250px', maxWidth: '340px' }}>
                            <div
                              style={{
                                background: '#f8fafc',
                                border: '1px solid #e2e8f0',
                                borderRadius: '10px',
                                padding: '10px 12px',
                                fontSize: '14.6px',
                                lineHeight: 1.65,
                                color: '#1e293b',
                              }}
                            >
                              <strong>السيارة: {getCarLabelForLead(l)}</strong>
                              <div style={{ marginTop: '4px' }}>
                                {l.message || 'طلب تواصل واستفسار عن الأسعار وأنظمة التقسيط'}
                              </div>
                            </div>
                          </td>

                          <td style={{ minWidth: '250px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              <select
                                className="drm-select"
                                style={{ width: '100%', fontSize: '13.4px' }}
                                value={d.repliedVia}
                                onChange={(e) =>
                                  handleDraftChange(l.id, 'repliedVia', e.target.value)
                                }
                              >
                                <option value="whatsapp"> تم الرد عبر واتساب</option>
                                <option value="phone"> تم الرد هاتفياً</option>
                                <option value="email"> تم الرد عبر البريد الإلكتروني</option>
                              </select>
                              <input
                                type="text"
                                className="drm-input"
                                value={d.cleanNotes}
                                onChange={(e) =>
                                  handleDraftChange(l.id, 'cleanNotes', e.target.value)
                                }
                                placeholder="ملاحظة الرد (مثال: تم إرسال تفاصيل القسط)..."
                                style={{ width: '100%', fontSize: '13.4px' }}
                              />
                              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                {isArchived ? (
                                  <button
                                    className="drm-btn drm-btn-outline drm-btn-sm"
                                    onClick={() => handleArchiveOrRestoreLead(l, false)}
                                  >
                                     استعادة لصندوق الوارد
                                  </button>
                                ) : (
                                  <>
                                    <button
                                      className="drm-btn drm-btn-primary drm-btn-sm"
                                      style={{ flex: 1, justifyContent: 'center', background: '#141a22' }}
                                      onClick={() => handleReplyAndArchiveMessage(l, true)}
                                    >
                                       تم الرد وأرشفة الرسالة
                                    </button>
                                    <button
                                      className="drm-btn drm-btn-outline drm-btn-sm"
                                      onClick={() => handleReplyAndArchiveMessage(l, false)}
                                    >
                                       حفظ فقط
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {filteredMessages.length === 0 && (
                      <tr>
                        <td colSpan="5" style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                          لا توجد رسائل في هذا التصنيف حالياً
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ==========================================
              TAB 4: FLEET INVENTORY CMS (إدارة أسطول السيارات)
             ========================================== */}
          {activeTab === 'cars' && (
            <div className="drm-card">
              <div className="drm-card-header">
                <div>
                  <h3> إدارة أسطول السيارات المعروضة (Showroom CMS)</h3>
                  <p style={{ fontSize: '14.0px', color: '#64748b', marginTop: '4px' }}>
                    إضافة وتعديل السيارات، الأسعار، تقارير الفحص 100 نقطة، وحالة التوفر بالمعرض مع تحديث فوري على الموقع.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <input
                    type="text"
                    placeholder="ابحث بالماركة، الموديل، أو السنة..."
                    value={carSearch}
                    onChange={(e) => setCarSearch(e.target.value)}
                    className="drm-input"
                    style={{ width: '230px' }}
                  />
                  <select
                    value={carStatusFilter}
                    onChange={(e) => setCarStatusFilter(e.target.value)}
                    className="drm-select"
                  >
                    <option value="">جميع حالات السيارات</option>
                    <option value="available">متاحة بالمعرض (Available)</option>
                    <option value="reserved">محجوزة (Reserved)</option>
                    <option value="sold">مباعة (Sold)</option>
                  </select>
                  <button className="drm-btn drm-btn-primary" onClick={openAddCarModal}>
                    + إضافة سيارة جديدة للأسطول
                  </button>
                </div>
              </div>

              <div className="drm-table-responsive">
                <table className="drm-table">
                  <thead>
                    <tr>
                      <th>الصورة</th>
                      <th>السيارة والفئة</th>
                      <th>الرابط النظيف (Slug)</th>
                      <th>السعر النقدي</th>
                      <th>الممشى والمحرك</th>
                      <th>تقرير الفحص</th>
                      <th>الحالة والتميز</th>
                      <th>إجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCars.map((car) => {
                      const thumb =
                        (car.images && car.images[0]?.url) ||
                        'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=400&q=80';
                      const carPath = `/vehicles/${car.slug || car.id}`;
                      return (
                        <tr key={car.id}>
                          <td>
                            <img
                              src={thumb}
                              alt={car.model}
                              style={{
                                width: '76px',
                                height: '52px',
                                objectFit: 'cover',
                                borderRadius: '8px',
                                border: '1px solid #e2e8f0',
                              }}
                            />
                          </td>
                          <td>
                            <strong style={{ fontSize: '15.7px', color: 'var(--primary)' }}>
                              {car.variant || `${car.make} ${car.model}`}
                            </strong>
                            <div style={{ fontSize: '12.9px', color: '#64748b', marginTop: '2px' }}>
                              موديل {car.year} • {car.body_type || 'سيدان فاخرة'} • {car.color || 'ميتاليك'}
                            </div>
                          </td>
                          <td dir="ltr">
                            <code
                              style={{
                                background: '#f8fafc',
                                padding: '3px 7px',
                                borderRadius: '6px',
                                fontSize: '12.9px',
                                color: '#334155',
                              }}
                            >
                              {carPath}
                            </code>
                          </td>
                          <td>
                            <strong style={{ color: '#0f172a', fontSize: '15.7px' }}>
                              {Number(car.price).toLocaleString('ar-EG')} ج.م
                            </strong>
                          </td>
                          <td>
                            <div>{Number(car.mileage || 0).toLocaleString('ar-EG')} كم</div>
                            <small style={{ color: '#64748b' }}>
                              {car.engine_cc ? `${car.engine_cc} سي سي` : 'تيربو'} •{' '}
                              {car.transmission === 'automatic' ? 'أوتوماتيك' : 'يدوي'}
                            </small>
                          </td>
                          <td>
                            <span className="status-badge status-confirmed">
                               فحص {car.inspection_score || '98%'}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                              <span
                                className={`status-badge ${
                                  car.status === 'available'
                                    ? 'status-confirmed'
                                    : car.status === 'reserved'
                                    ? 'status-contacted'
                                    : 'status-cancelled'
                                }`}
                              >
                                {car.status === 'available'
                                  ? 'متاحة'
                                  : car.status === 'reserved'
                                  ? 'محجوزة'
                                  : 'مباعة'}
                              </span>
                              {car.is_featured && (
                                <span
                                  className="status-badge"
                                  style={{ background: '#fdebe0', color: '#a24d1f' }}
                                >
                                  مميزة
                                </span>
                              )}
                            </div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                              <button
                                className="drm-btn drm-btn-primary drm-btn-sm"
                                onClick={() => openEditCarModal(car)}
                              >
                                 تعديل
                              </button>
                              <a
                                href={carPath}
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleGoToSite(carPath);
                                }}
                                className="drm-btn drm-btn-outline drm-btn-sm"
                              >
                                 معاينة
                              </a>
                              <button
                                className="drm-btn drm-btn-danger drm-btn-sm"
                                onClick={() => handleDeleteCar(car)}
                              >
                                حذف
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ==========================================
              TAB 5: PAGES & LIVE SEO (الصفحات والـ SEO)
             ========================================== */}
          {activeTab === 'pages' && (
            <div className="drm-card">
              <div className="drm-card-header">
                <h3> إدارة صفحات الموقع وعناوين SEO الحية (بدون أي # في الروابط)</h3>
                <input
                  type="text"
                  placeholder="ابحث بالرابط أو العنوان..."
                  value={pageSearch}
                  onChange={(e) => setPageSearch(e.target.value)}
                  className="drm-input"
                  style={{ width: '250px' }}
                />
              </div>
              <div className="drm-table-responsive">
                <table className="drm-table">
                  <thead>
                    <tr>
                      <th>اللغة</th>
                      <th>مسار الصفحة النظيف (Clean URL)</th>
                      <th>عنوان الصفحة (SEO Title)</th>
                      <th>الوصف التعريفي (Meta Description)</th>
                      <th>تعديل العنوان الرئيسي (H1)</th>
                      <th>حفظ ومعاينة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {seoPages
                      .filter(
                        (p) =>
                          !pageSearch ||
                          p.path.toLowerCase().includes(pageSearch.toLowerCase()) ||
                          p.seo_title.toLowerCase().includes(pageSearch.toLowerCase())
                      )
                      .map((p) => (
                        <tr key={p.id}>
                          <td>
                            <span className="status-badge status-confirmed">
                              {p.lang.toUpperCase()}
                            </span>
                          </td>
                          <td dir="ltr">
                            <code
                              style={{
                                background: '#f1f5f9',
                                padding: '3px 8px',
                                borderRadius: '6px',
                                fontWeight: 700,
                                color: '#1e2530',
                              }}
                            >
                              {p.path}
                            </code>
                          </td>
                          <td>
                            <input
                              type="text"
                              className="drm-input"
                              style={{ width: '100%' }}
                              value={p.seo_title}
                              onChange={(e) => {
                                const val = e.target.value;
                                setSeoPages((prev) =>
                                  prev.map((item) =>
                                    item.id === p.id ? { ...item, seo_title: val } : item
                                  )
                                );
                              }}
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              className="drm-input"
                              style={{ width: '100%' }}
                              value={p.seo_description}
                              onChange={(e) => {
                                const val = e.target.value;
                                setSeoPages((prev) =>
                                  prev.map((item) =>
                                    item.id === p.id ? { ...item, seo_description: val } : item
                                  )
                                );
                              }}
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              className="drm-input"
                              style={{ width: '100%' }}
                              value={p.custom_h1}
                              onChange={(e) => {
                                const val = e.target.value;
                                setSeoPages((prev) =>
                                  prev.map((item) =>
                                    item.id === p.id ? { ...item, custom_h1: val } : item
                                  )
                                );
                              }}
                            />
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '5px' }}>
                              <button
                                className="drm-btn drm-btn-primary drm-btn-sm"
                                onClick={() => {
                                  try {
                                    localStorage.setItem(
                                      'mnabil_seo_pages',
                                      JSON.stringify(seoPages)
                                    );
                                  } catch {
                                    // ignore
                                  }
                                  appendAuditLog(
                                    `تحديث إعدادات SEO للصفحة (${p.path})`,
                                    'seo'
                                  );
                                  showToast(' تم تحديث بيانات الـ SEO للصفحة وتطبيقها حياً!');
                                }}
                              >
                                 حفظ
                              </button>
                              <a
                                href={p.path}
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleGoToSite(p.path);
                                }}
                                className="drm-btn drm-btn-outline drm-btn-sm"
                              >
                                معاينة
                              </a>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ==========================================
              TAB 6: MEDIA LIBRARY (مكتبة صور السيارات)
             ========================================== */}
          {activeTab === 'media' && (
            <div className="drm-card">
              <div className="drm-card-header">
                <h3> مكتبة صور السيارات والوسائط</h3>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <input
                    type="text"
                    placeholder="عنوان الصورة (مثال: مرسيدس C200)"
                    value={newMediaTitle}
                    onChange={(e) => setNewMediaTitle(e.target.value)}
                    className="drm-input"
                    style={{ width: '190px' }}
                  />
                  <input
                    type="url"
                    placeholder="رابط الصورة المباشر (https://...)"
                    dir="ltr"
                    value={newMediaUrl}
                    onChange={(e) => setNewMediaUrl(e.target.value)}
                    className="drm-input"
                    style={{ width: '260px' }}
                  />
                  <button
                    className="drm-btn drm-btn-primary drm-btn-sm"
                    onClick={() => {
                      if (!newMediaUrl.trim()) return;
                      const item = {
                        id: Date.now(),
                        url: newMediaUrl.trim(),
                        title: newMediaTitle.trim() || 'صورة سيارة بالمعرض',
                      };
                      const next = [item, ...customMedia];
                      setCustomMedia(next);
                      try {
                        localStorage.setItem('mnabil_custom_media', JSON.stringify(next));
                      } catch {
                        // ignore
                      }
                      setNewMediaUrl('');
                      setNewMediaTitle('');
                      showToast(' تمت إضافة الصورة إلى مكتبة وسائط المعرض!');
                    }}
                  >
                     إضافة للمكتبة
                  </button>
                </div>
              </div>
              <div className="drm-card-body">
                <div className="drm-media-grid">
                  {allMediaItems.map((m) => (
                    <div key={m.id} className="drm-media-item">
                      <img
                        src={m.url}
                        alt={m.title}
                        loading="lazy"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/favicon.png';
                        }}
                      />
                      <div className="meta">
                        <div
                          style={{
                            fontWeight: 700,
                            color: '#1e293b',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {m.title}
                        </div>
                        <button
                          className="drm-btn drm-btn-outline drm-btn-sm"
                          style={{ width: '100%', marginTop: '6px', justifyContent: 'center' }}
                          onClick={() => {
                            navigator.clipboard.writeText(m.url);
                            showToast(' تم نسخ رابط الصورة بنجاح!');
                          }}
                        >
                           نسخ الرابط
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ==========================================
              TAB 7: SETTINGS (إعدادات المعرض والربط)
             ========================================== */}
          {activeTab === 'settings' && (
            <div className="drm-card">
              <div className="drm-card-header">
                <h3> إعدادات المعرض، بيانات التواصل، وشريط العروض الترويجية</h3>
                <button
                  className="drm-btn drm-btn-primary"
                  onClick={() => {
                    try {
                      localStorage.setItem(
                        'mnabil_showroom_settings',
                        JSON.stringify(settings)
                      );
                    } catch {
                      // ignore
                    }
                    appendAuditLog('تحديث إعدادات المعرض وشريط الإعلانات العلوي', 'settings');
                    showToast(' تم حفظ إعدادات المعرض وتطبيقها حياً على الموقع!');
                  }}
                >
                   حفظ كافة الإعدادات وتطبيقها حياً
                </button>
              </div>
              <div className="drm-card-body">
                <div className="drm-form-grid">
                  <div className="drm-form-group">
                    <label>اسم المعرض (بالعربية)</label>
                    <input
                      type="text"
                      className="drm-input"
                      value={settings.showroom_name_ar}
                      onChange={(e) =>
                        setSettings({ ...settings, showroom_name_ar: e.target.value })
                      }
                    />
                  </div>
                  <div className="drm-form-group">
                    <label>اسم المعرض (بالإنجليزية)</label>
                    <input
                      type="text"
                      className="drm-input"
                      dir="ltr"
                      value={settings.showroom_name_en}
                      onChange={(e) =>
                        setSettings({ ...settings, showroom_name_en: e.target.value })
                      }
                    />
                  </div>
                  <div className="drm-form-group">
                    <label>رقم الهاتف الرئيسي (يظهر في الموقع)</label>
                    <input
                      type="text"
                      className="drm-input"
                      dir="ltr"
                      value={settings.phone_primary}
                      onChange={(e) =>
                        setSettings({ ...settings, phone_primary: e.target.value })
                      }
                    />
                  </div>
                  <div className="drm-form-group">
                    <label>رقم الواتساب الرسمي للمبيعات</label>
                    <input
                      type="text"
                      className="drm-input"
                      dir="ltr"
                      value={settings.whatsapp_number}
                      onChange={(e) =>
                        setSettings({ ...settings, whatsapp_number: e.target.value })
                      }
                    />
                  </div>
                  <div className="drm-form-group">
                    <label>البريد الإلكتروني الرسمي</label>
                    <input
                      type="email"
                      className="drm-input"
                      dir="ltr"
                      value={settings.email}
                      onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                    />
                  </div>
                  <div className="drm-form-group">
                    <label>مواعيد العمل الرسمية</label>
                    <input
                      type="text"
                      className="drm-input"
                      value={settings.working_hours}
                      onChange={(e) =>
                        setSettings({ ...settings, working_hours: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="drm-form-group">
                  <label>عنوان صالة العرض الرئيسي</label>
                  <input
                    type="text"
                    className="drm-input"
                    value={settings.address}
                    onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                  />
                </div>

                {/* Announcement Bar with Timer (Exact Dr Mahmoud Feature) */}
                <div
                  style={{
                    background: '#f8fafc',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    padding: '18px',
                    margin: '18px 0',
                  }}
                >
                  <div className="drm-form-group" style={{ marginBottom: '12px' }}>
                    <label>
                       نص شريط الإعلانات والعروض العلوية (Announcement Bar - اتركه فارغاً لإخفائه)
                    </label>
                    <input
                      type="text"
                      className="drm-input"
                      placeholder="مثال: عروض خاصة على سيارات مرسيدس وبي إم دبليو كسر الزيرو..."
                      value={settings.announcement_bar}
                      onChange={(e) =>
                        setSettings({ ...settings, announcement_bar: e.target.value })
                      }
                    />
                  </div>
                  <div className="drm-form-grid" style={{ marginBottom: '10px' }}>
                    <div className="drm-form-group" style={{ marginBottom: 0 }}>
                      <label> تاريخ ووقت بدء ظهور العرض (اختياري)</label>
                      <input
                        type="datetime-local"
                        className="drm-input"
                        dir="ltr"
                        value={settings.announcement_start}
                        onChange={(e) =>
                          setSettings({ ...settings, announcement_start: e.target.value })
                        }
                      />
                    </div>
                    <div className="drm-form-group" style={{ marginBottom: 0 }}>
                      <label>⏳ تاريخ ووقت انتهاء العرض (يختفي تلقائياً)</label>
                      <input
                        type="datetime-local"
                        className="drm-input"
                        dir="ltr"
                        value={settings.announcement_end}
                        onChange={(e) =>
                          setSettings({ ...settings, announcement_end: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '13.4px', color: 'var(--muted)', fontWeight: 600 }}>
                       ضبط مدة سريعة من الآن:
                    </span>
                    {[
                      { label: '⏱ يوم واحد (24 ساعة)', hours: 24 },
                      { label: '⏱ 3 أيام', hours: 72 },
                      { label: '⏱ أسبوع (7 أيام)', hours: 168 },
                      { label: '⏱ شهر (30 يوم)', hours: 720 },
                    ].map((preset) => (
                      <button
                        key={preset.hours}
                        type="button"
                        className="drm-btn drm-btn-outline drm-btn-sm"
                        onClick={() => {
                          const now = new Date();
                          const end = new Date(now.getTime() + preset.hours * 3600 * 1000);
                          setSettings({
                            ...settings,
                            announcement_start: now.toISOString().slice(0, 16),
                            announcement_end: end.toISOString().slice(0, 16),
                          });
                          showToast('⏱ تم ضبط مؤقت العرض — اضغط حفظ الإعدادات للتطبيق');
                        }}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==========================================
              TAB 8: STAFF & SECURITY AUDIT LOG (فريق العمل والسجل الأمني)
             ========================================== */}
          {activeTab === 'logs' && (
            <div>
              {/* Staff RBAC Card */}
              <div className="drm-card" style={{ marginBottom: '24px' }}>
                <div className="drm-card-header">
                  <div>
                    <h3> إدارة حسابات وصلاحيات فريق عمل المعرض (RBAC)</h3>
                    <p style={{ fontSize: '13.4px', color: 'var(--muted)', marginTop: '4px' }}>
                      نظام الصلاحيات المتقدم: الإدارة العليا، مدير المبيعات، ومستشاري المبيعات والاستقبال.
                    </p>
                  </div>
                  <button
                    className="drm-btn drm-btn-primary drm-btn-sm"
                    onClick={() => setUserModalOpen(true)}
                  >
                    + إضافة حساب موظف جديد
                  </button>
                </div>
                <div className="drm-table-responsive">
                  <table className="drm-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>الاسم</th>
                        <th>اسم المستخدم</th>
                        <th>الدور الوظيفي (Role)</th>
                        <th>حالة الحساب</th>
                        <th>البريد الإلكتروني</th>
                        <th>إجراءات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {staffUsers.map((u) => (
                        <tr key={u.id}>
                          <td>#{u.id}</td>
                          <td>
                            <strong>{u.display_name}</strong>
                          </td>
                          <td>
                            <code>{u.username}</code>
                          </td>
                          <td>{u.role}</td>
                          <td>
                            <span className={`status-badge ${u.account_status === 'active' ? 'status-confirmed' : 'status-cancelled'}`}>
                              {u.account_status === 'active' ? 'نشط (Active)' : 'معطّل (Inactive)'}
                            </span>
                          </td>
                          <td>{u.email}</td>
                          <td>
                            {u.username === 'performax' ? (
                              <small style={{ color: '#64748b' }}>
                                 حساب المطور الأساسي (محمي)
                              </small>
                            ) : (
                              <button
                                className={`drm-btn drm-btn-sm ${u.account_status === 'active' ? 'drm-btn-danger' : 'drm-btn-outline'}`}
                                onClick={async () => {
                                  const newStatus = u.account_status !== 'active';
                                  try {
                                    await toggleStaffUserStatus(u.id, newStatus);
                                    setStaffUsers((prev) =>
                                      prev.map((item) =>
                                        item.id === u.id
                                          ? { ...item, account_status: newStatus ? 'active' : 'inactive' }
                                          : item
                                      )
                                    );
                                    appendAuditLog(
                                      `${newStatus ? 'تفعيل' : 'تعطيل'} حساب الموظف (${u.username})`,
                                      'security'
                                    );
                                    showToast(newStatus ? 'تم تفعيل الحساب' : 'تم تعطيل الحساب');
                                  } catch (err) {
                                    showToast(err.response?.data?.message || 'تعذّر تغيير حالة الحساب');
                                  }
                                }}
                              >
                                {u.account_status === 'active' ? ' تعطيل' : ' تفعيل'}
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Archived Leads Recovery Card */}
              <div
                className="drm-card"
                style={{ marginBottom: '24px', border: '1.5px solid #fecaca' }}
              >
                <div className="drm-card-header" style={{ background: '#fef2f2' }}>
                  <div>
                    <h3 style={{ color: '#991b1b' }}>
                       أرشيف السجلات المحذوفة (سلة المحذوفات الأمنية - للاسترجاع)
                    </h3>
                    <p style={{ fontSize: '13.4px', color: '#7f1d1d', marginTop: '4px' }}>
                      جميع الحجوزات التي تم حذفها من الـ CRM تُحفظ هنا تلقائياً لمنع ضياع أي بيانات، ويمكن استعادتها بضغطة زر.
                    </p>
                  </div>
                </div>
                <div className="drm-table-responsive">
                  <table className="drm-table">
                    <thead>
                      <tr>
                        <th>رقم وكود الحجز</th>
                        <th>اسم العميل</th>
                        <th>رقم الهاتف</th>
                        <th>السيارة المطلوبة</th>
                        <th>تاريخ التسجيل</th>
                        <th>استرجاع للـ CRM</th>
                      </tr>
                    </thead>
                    <tbody>
                      {archivedCrmLeads.map((l) => (
                        <tr key={l.id} style={{ background: '#fffafa' }}>
                          <td>
                            <strong>#{String(l.id).slice(0, 6)}</strong>{' '}
                            <code style={{ fontSize: '12.3px' }}>[{l.inquiry_ref}]</code>
                          </td>
                          <td>
                            <strong>{l.customer_name}</strong>
                          </td>
                          <td dir="ltr">{l.customer_phone}</td>
                          <td>{getCarLabelForLead(l)}</td>
                          <td>{new Date(l.created_at).toLocaleString('ar-EG')}</td>
                          <td>
                            <button
                              className="drm-btn drm-btn-primary drm-btn-sm"
                              onClick={() => handleArchiveOrRestoreLead(l, false)}
                            >
                               استعادة للـ CRM
                            </button>
                          </td>
                        </tr>
                      ))}
                      {archivedCrmLeads.length === 0 && (
                        <tr>
                          <td colSpan="6" style={{ textAlign: 'center', color: '#64748b', padding: '20px' }}>
                            لا توجد سجلات محذوفة حالياً — جميع العملاء نشطون في الـ CRM
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Security Audit Log Card */}
              <div className="drm-card">
                <div className="drm-card-header">
                  <div>
                    <h3> سجل التدقيق الأمني والعمليات (Security & Activity Audit Log)</h3>
                    <p style={{ fontSize: '13.4px', color: 'var(--muted)', marginTop: '4px' }}>
                      سجل غير قابل للمسح يوثق عمليات الدخول، إضافة وتعديل السيارات، وتحديث ملفات العملاء.
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <input
                      type="text"
                      placeholder="بحث في السجل الأمني..."
                      value={auditSearch}
                      onChange={(e) => setAuditSearch(e.target.value)}
                      className="drm-input"
                      style={{ width: '210px' }}
                    />
                    <select
                      value={auditFilter}
                      onChange={(e) => setAuditFilter(e.target.value)}
                      className="drm-select"
                    >
                      <option value="">كل العمليات ({auditLogs.length})</option>
                      <option value="lead_created"> إضافة حجز جديد</option>
                      <option value="lead_updated"> تحديث ملف عميل</option>
                      <option value="lead_archived"> حذف / أرشفة سجل</option>
                      <option value="car"> تعديل أسطول السيارات</option>
                    </select>
                  </div>
                </div>
                <div className="drm-table-responsive">
                  <table className="drm-table">
                    <thead>
                      <tr>
                        <th>التوقيت</th>
                        <th>الحدث / العملية</th>
                        <th>المستخدم</th>
                        <th>المصدر</th>
                      </tr>
                    </thead>
                    <tbody>
                      {auditLogs
                        .filter((log) => {
                          if (auditFilter && (log.entity_type || log.event_type) !== auditFilter) return false;
                          if (
                            auditSearch &&
                            !String(log.action).toLowerCase().includes(auditSearch.toLowerCase())
                          )
                            return false;
                          return true;
                        })
                        .map((log) => (
                          <tr key={log.id}>
                            <td style={{ whiteSpace: 'nowrap' }}>
                              {new Date(log.created_at || log.timestamp).toLocaleString('ar-EG')}
                            </td>
                            <td style={{ fontWeight: 600 }}>{log.action}</td>
                            <td>
                              <strong>{log.user_email || log.actor || 'admin'}</strong>
                            </td>
                            <td dir="ltr">
                              <code>{log.client_ip || log.ip || 'Supabase Cloud'}</code>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ==========================================
          MODAL 1: ADD / EDIT CAR (إضافة / تعديل سيارة)
         ========================================== */}
      {carModalOpen && (
        <div className="drm-modal-backdrop" onClick={() => setCarModalOpen(false)}>
          <div className="drm-modal" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: '16px', color: 'var(--primary)', fontWeight: 800 }}>
              {editingCar
                ? `تعديل بيانات السيارة: ${editingCar.make} ${editingCar.model}`
                : ' إضافة سيارة جديدة لأسطول المعرض'}
            </h3>
            <form onSubmit={handleSaveCar}>
              <div className="drm-form-grid">
                <div className="drm-form-group">
                  <label>الماركة (Make) *</label>
                  <input
                    type="text"
                    required
                    className="drm-input"
                    placeholder="مثال: Mercedes-Benz"
                    value={carForm.make}
                    onChange={(e) => setCarForm({ ...carForm, make: e.target.value })}
                  />
                </div>
                <div className="drm-form-group">
                  <label>الموديل والطراز (Model) *</label>
                  <input
                    type="text"
                    required
                    className="drm-input"
                    placeholder="مثال: C200 AMG"
                    value={carForm.model}
                    onChange={(e) => setCarForm({ ...carForm, model: e.target.value })}
                  />
                </div>
                <div className="drm-form-group">
                  <label>الاسم المعروض بالعربية (Variant)</label>
                  <input
                    type="text"
                    className="drm-input"
                    placeholder="مثال: مرسيدس بنز C200 AMG"
                    value={carForm.variant}
                    onChange={(e) => setCarForm({ ...carForm, variant: e.target.value })}
                  />
                </div>
                <div className="drm-form-group">
                  <label>سنة الصنع *</label>
                  <input
                    type="number"
                    required
                    className="drm-input"
                    value={carForm.year}
                    onChange={(e) => setCarForm({ ...carForm, year: e.target.value })}
                  />
                </div>
                <div className="drm-form-group">
                  <label>السعر النقدي (ج.م) *</label>
                  <input
                    type="number"
                    required
                    className="drm-input"
                    placeholder="2850000"
                    value={carForm.price}
                    onChange={(e) => setCarForm({ ...carForm, price: e.target.value })}
                  />
                </div>
                <div className="drm-form-group">
                  <label>المسافة المقطوعة (كم)</label>
                  <input
                    type="number"
                    className="drm-input"
                    value={carForm.mileage}
                    onChange={(e) => setCarForm({ ...carForm, mileage: e.target.value })}
                  />
                </div>
                <div className="drm-form-group">
                  <label>اللون الخارجي</label>
                  <input
                    type="text"
                    className="drm-input"
                    placeholder="رمادي ميتاليك"
                    value={carForm.color}
                    onChange={(e) => setCarForm({ ...carForm, color: e.target.value })}
                  />
                </div>
                <div className="drm-form-group">
                  <label>الحالة بالمعرض</label>
                  <select
                    className="drm-select"
                    value={carForm.status}
                    onChange={(e) => setCarForm({ ...carForm, status: e.target.value })}
                  >
                    <option value="available">متاحة للبيع الفوري (Available)</option>
                    <option value="reserved">محجوزة بعربون (Reserved)</option>
                    <option value="sold">تم البيع (Sold)</option>
                  </select>
                </div>
              </div>

              <div className="drm-form-group">
                <label>رابط الصورة الرئيسية للسيارة (URL)</label>
                <input
                  type="url"
                  dir="ltr"
                  className="drm-input"
                  placeholder="https://images.unsplash.com/..."
                  value={carForm.imageUrl}
                  onChange={(e) => setCarForm({ ...carForm, imageUrl: e.target.value })}
                />
              </div>

              <div className="drm-form-group">
                <label>وصف السيارة وتقرير الفحص الفني</label>
                <textarea
                  rows="3"
                  className="drm-textarea"
                  value={carForm.description}
                  onChange={(e) => setCarForm({ ...carForm, description: e.target.value })}
                />
              </div>

              <div className="drm-form-group">
                <label>أبرز التجهيزات والمواصفات (كل ميزة في سطر مستقل)</label>
                <textarea
                  rows="3"
                  className="drm-textarea"
                  value={carForm.featuresText}
                  onChange={(e) => setCarForm({ ...carForm, featuresText: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '16px' }}>
                <button
                  type="button"
                  className="drm-btn drm-btn-outline"
                  onClick={() => setCarModalOpen(false)}
                >
                  إلغاء
                </button>
                <button type="submit" className="drm-btn drm-btn-primary">
                   حفظ ونشر السيارة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==========================================
          MODAL 2: MANUAL CRM LEAD (تسجيل حجز عميل يدوياً)
         ========================================== */}
      {leadModalOpen && (
        <div className="drm-modal-backdrop" onClick={() => setLeadModalOpen(false)}>
          <div className="drm-modal" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: '16px', color: 'var(--primary)', fontWeight: 800 }}>
               تسجيل حجز معاينة أو طلب عميل جديد (CRM)
            </h3>
            <form onSubmit={handleCreateManualLead}>
              <div className="drm-form-grid">
                <div className="drm-form-group">
                  <label>اسم العميل الثلاثي *</label>
                  <input
                    type="text"
                    required
                    className="drm-input"
                    value={newLeadForm.customer_name}
                    onChange={(e) =>
                      setNewLeadForm({ ...newLeadForm, customer_name: e.target.value })
                    }
                  />
                </div>
                <div className="drm-form-group">
                  <label>رقم الهاتف / الواتساب *</label>
                  <input
                    type="text"
                    required
                    dir="ltr"
                    className="drm-input"
                    placeholder="01012345678"
                    value={newLeadForm.customer_phone}
                    onChange={(e) =>
                      setNewLeadForm({ ...newLeadForm, customer_phone: e.target.value })
                    }
                  />
                </div>
                <div className="drm-form-group">
                  <label>السيارة المطلوب معاينتها</label>
                  <select
                    className="drm-select"
                    value={newLeadForm.car_id}
                    onChange={(e) =>
                      setNewLeadForm({ ...newLeadForm, car_id: e.target.value })
                    }
                  >
                    <option value="">-- معاينة عامة لأسطول المعرض --</option>
                    {cars.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.make} {c.model} ({c.year}) - {Number(c.price).toLocaleString('ar-EG')} ج.م
                      </option>
                    ))}
                  </select>
                </div>
                <div className="drm-form-group">
                  <label>نوع الطلب / نظام الشراء</label>
                  <select
                    className="drm-select"
                    value={newLeadForm.inquiry_type}
                    onChange={(e) =>
                      setNewLeadForm({ ...newLeadForm, inquiry_type: e.target.value })
                    }
                  >
                    <option value="test_drive">حجز معاينة وتجربة قيادة VIP</option>
                    <option value="finance">طلب تقسيط وتمويل بنكي</option>
                    <option value="trade_in">استبدال سيارة قديمة (Trade-In)</option>
                    <option value="price">شراء نقدي (كاش)</option>
                  </select>
                </div>
                <div className="drm-form-group">
                  <label>أولوية العميل</label>
                  <select
                    className="drm-select"
                    value={newLeadForm.priority}
                    onChange={(e) =>
                      setNewLeadForm({ ...newLeadForm, priority: e.target.value })
                    }
                  >
                    <option value="normal">عادي (Normal)</option>
                    <option value="vip">عميل VIP / جاد جداً</option>
                    <option value="urgent"> عاجل (شراء فوري)</option>
                  </select>
                </div>
                <div className="drm-form-group">
                  <label>تفاصيل المقدم / البنك / السيارة البديلة</label>
                  <input
                    type="text"
                    className="drm-input"
                    placeholder="مثال: مقدم 40% بنك CIB أو استبدال كيا سيراتو"
                    value={newLeadForm.finance_info}
                    onChange={(e) =>
                      setNewLeadForm({ ...newLeadForm, finance_info: e.target.value })
                    }
                  />
                </div>
                <div className="drm-form-group">
                  <label>موعد المعاينة المطلوب</label>
                  <input
                    type="date"
                    className="drm-input"
                    value={newLeadForm.preferred_date}
                    onChange={(e) =>
                      setNewLeadForm({ ...newLeadForm, preferred_date: e.target.value })
                    }
                  />
                </div>
                <div className="drm-form-group">
                  <label>حالة الحجز</label>
                  <select
                    className="drm-select"
                    value={newLeadForm.status}
                    onChange={(e) =>
                      setNewLeadForm({ ...newLeadForm, status: e.target.value })
                    }
                  >
                    <option value="negotiating">معاينة مؤكدة</option>
                    <option value="new">جديد</option>
                    <option value="contacted">تم التواصل</option>
                  </select>
                </div>
              </div>
              <div className="drm-form-group">
                <label>ملاحظات إضافية</label>
                <textarea
                  rows="2"
                  className="drm-textarea"
                  value={newLeadForm.message}
                  onChange={(e) =>
                    setNewLeadForm({ ...newLeadForm, message: e.target.value })
                  }
                />
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '14px' }}>
                <button
                  type="button"
                  className="drm-btn drm-btn-outline"
                  onClick={() => setLeadModalOpen(false)}
                >
                  إلغاء
                </button>
                <button type="submit" className="drm-btn drm-btn-primary">
                   حفظ الحجز وتوليد الكود
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==========================================
          MODAL 3: ADD STAFF USER (إضافة موظف جديد)
         ========================================== */}
      {userModalOpen && (
        <div className="drm-modal-backdrop" onClick={() => setUserModalOpen(false)}>
          <div className="drm-modal" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: '16px', color: 'var(--primary)', fontWeight: 800 }}>
               إضافة حساب موظف جديد لفريق المعرض
            </h3>
            <div className="drm-form-grid">
              <div className="drm-form-group">
                <label>الاسم الكامل للموظف</label>
                <input
                  type="text"
                  className="drm-input"
                  value={newUserForm.display_name}
                  onChange={(e) =>
                    setNewUserForm({ ...newUserForm, display_name: e.target.value })
                  }
                />
              </div>
              <div className="drm-form-group">
                <label>اسم المستخدم للدخول (Username)</label>
                <input
                  type="text"
                  dir="ltr"
                  className="drm-input"
                  value={newUserForm.username}
                  onChange={(e) =>
                    setNewUserForm({ ...newUserForm, username: e.target.value })
                  }
                />
              </div>
              <div className="drm-form-group">
                <label>كلمة المرور <span style={{ color: 'var(--danger)', fontSize: '11px' }}>*</span></label>
                <input
                  type="password"
                  dir="ltr"
                  className="drm-input"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  value={newUserForm.password}
                  onChange={(e) =>
                    setNewUserForm({ ...newUserForm, password: e.target.value })
                  }
                />
              </div>
              <div className="drm-form-group">
                <label>الصلاحية والدور الوظيفي (Role)</label>
                <select
                  className="drm-select"
                  value={newUserForm.role}
                  onChange={(e) =>
                    setNewUserForm({ ...newUserForm, role: e.target.value })
                  }
                >
                  <option value="مستشار مبيعات واستقبال (CRM)">
                     مستشار مبيعات واستقبال (CRM)
                  </option>
                  <option value="مدير أسطول السيارات والمحتوى">
                     مدير أسطول السيارات والمحتوى
                  </option>
                  <option value="مدير المعرض (Full Admin)">
                     مدير المعرض (Full Admin)
                  </option>
                </select>
              </div>
              <div className="drm-form-group">
                <label>البريد الإلكتروني</label>
                <input
                  type="email"
                  dir="ltr"
                  className="drm-input"
                  value={newUserForm.email}
                  onChange={(e) =>
                    setNewUserForm({ ...newUserForm, email: e.target.value })
                  }
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '14px' }}>
              <button
                type="button"
                className="drm-btn drm-btn-outline"
                onClick={() => setUserModalOpen(false)}
              >
                إلغاء
              </button>
              <button
                type="button"
                className="drm-btn drm-btn-primary"
                onClick={async () => {
                  if (!newUserForm.display_name || !newUserForm.username) {
                    showToast(' الاسم الكامل واسم المستخدم مطلوبان');
                    return;
                  }
                  if (!newUserForm.password || newUserForm.password.length < 8) {
                    showToast(' كلمة المرور يجب أن تكون 8 أحرف على الأقل');
                    return;
                  }
                  try {
                    await createStaffUserApi({
                      display_name: newUserForm.display_name,
                      username: newUserForm.username,
                      password: newUserForm.password,
                      role: newUserForm.role === 'مدير المعرض (Full Admin)' ? 'admin' : 'staff',
                      email: newUserForm.email,
                    });
                    setUserModalOpen(false);
                    setNewUserForm({ display_name: '', username: '', password: '', role: 'مستشار مبيعات واستقبال (CRM)', email: '' });
                    appendAuditLog(`إضافة حساب موظف جديد (${newUserForm.username})`, 'security');
                    showToast(' تم إنشاء حساب الموظف بنجاح!');
                    loadAllData();
                  } catch (err) {
                    showToast(err.response?.data?.message || 'تعذّر إنشاء الحساب');
                  }
                }}
              >
                 إنشاء الحساب
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMsg && <div className="drm-toast">{toastMsg}</div>}
    </div>
  );
}
