import React, { useState, useEffect } from 'react';
import {
  Car, Users, BarChart3, LogOut, ExternalLink, RefreshCw, Plus, Search,
  Phone, MessageCircle, ShieldCheck, CheckCircle2, Clock, AlertCircle,
  Eye, EyeOff, Star, Trash2, Edit, Save, X, Calendar, DollarSign
} from 'lucide-react';
import {
  fetchAnalyticsOverview, fetchAdminInquiries, updateInquiryStatus,
  fetchAdminCars, createAdminCar, updateAdminCar, deleteAdminCar,
  toggleCarPublish, toggleCarFeature, logoutAdmin
} from '../../services/adminApi';

export default function AdminDashboard({ adminUser, onLogout, onSwitchToSite }) {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'inquiries' | 'cars'
  const [loading, setLoading] = useState(true);

  // Overview Data
  const [overview, setOverview] = useState(null);

  // Inquiries Data
  const [inquiries, setInquiries] = useState([]);
  const [inquiryStatusFilter, setInquiryStatusFilter] = useState('');
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [updatingInquiry, setUpdatingInquiry] = useState(false);

  // Cars Data
  const [cars, setCars] = useState([]);
  const [carModalOpen, setCarModalOpen] = useState(false);
  const [editingCar, setEditingCar] = useState(null);
  const [carForm, setCarForm] = useState({
    make: '', model: '', year: 2023, variant: '', body_type: 'SUV',
    price: '', mileage: '', fuel_type: 'petrol', transmission: 'automatic',
    color: '', engine_cc: 2000, description: '', is_featured: false, is_published: true
  });

  // Load initial data based on active tab
  useEffect(() => {
    loadData();
  }, [activeTab, inquiryStatusFilter]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'overview') {
        const data = await fetchAnalyticsOverview();
        setOverview(data);
      } else if (activeTab === 'inquiries') {
        const res = await fetchAdminInquiries({ status: inquiryStatusFilter || undefined });
        setInquiries(res.data || []);
      } else if (activeTab === 'cars') {
        const res = await fetchAdminCars();
        setCars(res.data || []);
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Format currency
  const formatEGP = (val) => {
    if (!val) return '—';
    return new Intl.NumberFormat('ar-EG').format(val) + ' ج.م';
  };

  // Inquiry Status Mapping
  const statusLabels = {
    new: { label: 'جديد', color: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
    contacted: { label: 'تم التواصل', color: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30' },
    negotiating: { label: 'جاري التفاوض', color: 'bg-purple-500/15 text-purple-400 border-purple-500/30' },
    won: { label: 'تم البيع بنجاح 🎉', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
    lost: { label: 'ملغي / لم يتم', color: 'bg-red-500/15 text-red-400 border-red-500/30' },
    cancelled: { label: 'مرفوض', color: 'bg-gray-500/15 text-gray-400 border-gray-500/30' },
  };

  // Handle Inquiry Status Update
  const handleSaveInquiryStatus = async (e) => {
    e.preventDefault();
    if (!selectedInquiry) return;
    setUpdatingInquiry(true);
    try {
      await updateInquiryStatus(selectedInquiry.id, {
        status: selectedInquiry.status,
        staff_notes: selectedInquiry.staff_notes,
      });
      setSelectedInquiry(null);
      loadData();
    } catch (err) {
      alert(err.message || 'فشل التحديث');
    } finally {
      setUpdatingInquiry(false);
    }
  };

  // Handle Save Car (Create or Edit)
  const handleSaveCar = async (e) => {
    e.preventDefault();
    try {
      if (editingCar) {
        await updateAdminCar(editingCar.id, carForm);
      } else {
        await createAdminCar({
          ...carForm,
          price: Number(carForm.price),
          mileage: Number(carForm.mileage) || 0,
          year: Number(carForm.year)
        });
      }
      setCarModalOpen(false);
      setEditingCar(null);
      loadData();
    } catch (err) {
      alert(err.message || 'فشل حفظ السيارة');
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 text-gray-100 flex flex-col font-cairo">
      {/* Admin Top Header */}
      <header className="glass-nav py-3 px-4 border-b border-white/10 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/images/logo.jpg"
              alt="M. Nabil"
              className="w-10 h-10 rounded-full object-cover border-2 border-brand-orange"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-base">لوحة إدارة المعرض والـ CRM</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-orange/20 text-brand-orange font-bold border border-brand-orange/30">
                  {adminUser?.username || 'Performax Admin'}
                </span>
              </div>
              <span className="text-[10px] text-gray-400">سوق أوتو محمد نبيل للسيارات</span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <button
              onClick={onSwitchToSite}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>موقع المعرض</span>
            </button>
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-red-300 font-bold border border-red-500/30 transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>خروج</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 py-6 w-full flex-1">
        {/* Navigation Tabs */}
        <div className="flex items-center justify-between gap-4 mb-6 border-b border-white/10 pb-4 overflow-x-auto">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'overview'
                  ? 'bg-brand-orange text-white shadow-brand'
                  : 'bg-dark-900 text-gray-400 hover:text-white border border-white/5'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>لوحة التحليلات والإحصائيات</span>
            </button>

            <button
              onClick={() => setActiveTab('inquiries')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'inquiries'
                  ? 'bg-brand-orange text-white shadow-brand'
                  : 'bg-dark-900 text-gray-400 hover:text-white border border-white/5'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>طلبات واستفسارات العملاء (CRM)</span>
            </button>

            <button
              onClick={() => setActiveTab('cars')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'cars'
                  ? 'bg-brand-orange text-white shadow-brand'
                  : 'bg-dark-900 text-gray-400 hover:text-white border border-white/5'
              }`}
            >
              <Car className="w-4 h-4" />
              <span>إدارة أسطول السيارات</span>
            </button>
          </div>

          <button
            onClick={loadData}
            className="p-2 rounded-xl bg-dark-900 border border-white/10 text-gray-400 hover:text-white"
            title="تحديث البيانات"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-brand-orange' : ''}`} />
          </button>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* 6 Key Performance Metric Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
              <div className="glass-panel p-4 rounded-2xl border border-white/5">
                <span className="text-[11px] text-gray-400 block mb-1">إجمالي السيارات</span>
                <div className="text-2xl font-black text-white font-mono">
                  {overview?.stats?.totalCars || 0}
                </div>
              </div>
              <div className="glass-panel p-4 rounded-2xl border border-white/5">
                <span className="text-[11px] text-gray-400 block mb-1">سيارات متاحة</span>
                <div className="text-2xl font-black text-emerald-400 font-mono">
                  {overview?.stats?.availableCars || 0}
                </div>
              </div>
              <div className="glass-panel p-4 rounded-2xl border border-white/5">
                <span className="text-[11px] text-gray-400 block mb-1">سيارات تم بيعها</span>
                <div className="text-2xl font-black text-purple-400 font-mono">
                  {overview?.stats?.soldCars || 0}
                </div>
              </div>
              <div className="glass-panel p-4 rounded-2xl border border-white/5">
                <span className="text-[11px] text-gray-400 block mb-1">إجمالي طلبات العملاء</span>
                <div className="text-2xl font-black text-brand-orange font-mono">
                  {overview?.stats?.totalInquiries || 0}
                </div>
              </div>
              <div className="glass-panel p-4 rounded-2xl border border-white/5">
                <span className="text-[11px] text-gray-400 block mb-1">طلبات جديدة</span>
                <div className="text-2xl font-black text-blue-400 font-mono">
                  {overview?.stats?.newInquiries || 0}
                </div>
              </div>
              <div className="glass-panel p-4 rounded-2xl border border-white/5">
                <span className="text-[11px] text-gray-400 block mb-1">معدل التحويل (Won)</span>
                <div className="text-2xl font-black text-emerald-400 font-mono">
                  {overview?.stats?.conversionRate || '0%'}
                </div>
              </div>
            </div>

            {/* Top Cars & Recent Inquiries Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Viewed Cars */}
              <div className="glass-panel p-5 rounded-2xl border border-white/5">
                <h3 className="text-sm font-extrabold text-white mb-4 flex items-center gap-2">
                  <Star className="w-4 h-4 text-brand-orange" />
                  <span>السيارات الأكثر طلباً ومشاهدة في المعرض</span>
                </h3>

                <div className="space-y-3">
                  {overview?.topViewed?.map((car) => (
                    <div key={car.id} className="flex items-center justify-between p-3 rounded-xl bg-dark-950 border border-white/5 text-xs">
                      <div className="flex items-center gap-3">
                        <img
                          src={car.images?.[0]?.url || '/images/logo.jpg'}
                          alt=""
                          className="w-10 h-10 rounded-lg object-cover bg-dark-900"
                        />
                        <div>
                          <div className="font-bold text-white">{car.make} {car.model}</div>
                          <div className="text-[10px] text-gray-400">{car.year}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-left">
                        <div>
                          <span className="text-[10px] text-gray-500 block">المشاهدات:</span>
                          <span className="font-bold text-white font-mono">{car.views_count || 0}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-gray-500 block">الاستفسارات:</span>
                          <span className="font-bold text-brand-orange font-mono">{car.inquiries_count || 0}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Inquiries */}
              <div className="glass-panel p-5 rounded-2xl border border-white/5">
                <h3 className="text-sm font-extrabold text-white mb-4 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-brand-orange" />
                  <span>أحدث استفسارات العملاء الواردة</span>
                </h3>

                <div className="space-y-3">
                  {overview?.recentInquiries?.map((inq) => {
                    const st = statusLabels[inq.status] || statusLabels.new;
                    return (
                      <div key={inq.id} className="flex items-center justify-between p-3 rounded-xl bg-dark-950 border border-white/5 text-xs">
                        <div>
                          <div className="font-bold text-white">{inq.customer_name}</div>
                          <div className="text-[10px] text-gray-400 font-mono" dir="ltr">{inq.customer_phone}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${st.color}`}>
                            {st.label}
                          </span>
                          <a
                            href={`https://wa.me/20${inq.customer_phone.replace(/^0+/, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30"
                            title="تواصل واتساب"
                          >
                            <MessageCircle className="w-3.5 h-3.5 fill-current" />
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: INQUIRIES & CRM PIPELINE */}
        {activeTab === 'inquiries' && (
          <div className="space-y-4">
            {/* Filter Pills */}
            <div className="flex gap-2 overflow-x-auto pb-1 text-xs font-bold">
              {[
                { id: '', label: 'الكل' },
                { id: 'new', label: 'طلبات جديدة' },
                { id: 'contacted', label: 'تم التواصل' },
                { id: 'negotiating', label: 'جاري التفاوض' },
                { id: 'won', label: 'تمت الصفقة (Won)' },
                { id: 'lost', label: 'ملغي / لم يتم' }
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setInquiryStatusFilter(f.id)}
                  className={`py-1.5 px-3.5 rounded-xl border transition-all ${
                    inquiryStatusFilter === f.id
                      ? 'bg-brand-orange text-white border-brand-orange shadow-brand'
                      : 'bg-dark-900 text-gray-400 border-white/10 hover:text-white'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Inquiries Table */}
            <div className="glass-panel rounded-2xl overflow-hidden border border-white/5">
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-dark-900 border-b border-white/10 text-gray-400">
                    <tr>
                      <th className="p-3.5">المرجع</th>
                      <th className="p-3.5">العميل</th>
                      <th className="p-3.5">الهاتف</th>
                      <th className="p-3.5">السيارة المطلوبة</th>
                      <th className="p-3.5">نوع الاستفسار</th>
                      <th className="p-3.5">الحالة</th>
                      <th className="p-3.5">التاريخ</th>
                      <th className="p-3.5 text-center">إجراءات المتابعة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {inquiries.length > 0 ? (
                      inquiries.map((inq) => {
                        const st = statusLabels[inq.status] || statusLabels.new;
                        const carName = inq.car_snapshot
                          ? `${inq.car_snapshot.make} ${inq.car_snapshot.model}`
                          : inq.cars
                          ? `${inq.cars.make} ${inq.cars.model}`
                          : 'استفسار عام';

                        return (
                          <tr key={inq.id} className="hover:bg-white/5 transition-colors">
                            <td className="p-3.5 font-mono text-gray-400">{inq.inquiry_ref}</td>
                            <td className="p-3.5 font-bold text-white">{inq.customer_name}</td>
                            <td className="p-3.5 font-mono" dir="ltr">{inq.customer_phone}</td>
                            <td className="p-3.5 text-brand-orange font-semibold">{carName}</td>
                            <td className="p-3.5 text-gray-300">
                              {inq.inquiry_type === 'finance' ? 'طلب تقسيط' :
                               inq.inquiry_type === 'test_drive' ? 'حجز معاينة' :
                               inq.inquiry_type === 'trade_in' ? 'استبدال' :
                               inq.inquiry_type === 'price' ? 'شراء كاش' : 'استفسار'}
                            </td>
                            <td className="p-3.5">
                              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${st.color}`}>
                                {st.label}
                              </span>
                            </td>
                            <td className="p-3.5 text-gray-500 text-[11px]">
                              {new Date(inq.created_at).toLocaleDateString('ar-EG')}
                            </td>
                            <td className="p-3.5 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <a
                                  href={`tel:${inq.customer_phone}`}
                                  className="p-1.5 rounded-lg bg-blue-500/15 text-blue-400 hover:bg-blue-500/25"
                                  title="اتصال هاتفي"
                                >
                                  <Phone className="w-3.5 h-3.5" />
                                </a>
                                <a
                                  href={`https://wa.me/20${inq.customer_phone.replace(/^0+/, '')}?text=${encodeURIComponent(`مرحباً أستاذ ${inq.customer_name}، بخصوص طلبك من سوق أوتو محمد نبيل للسيارات (مرجع ${inq.inquiry_ref})`)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25"
                                  title="مراسلة واتساب"
                                >
                                  <MessageCircle className="w-3.5 h-3.5 fill-current" />
                                </a>
                                <button
                                  onClick={() => setSelectedInquiry({ ...inq })}
                                  className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-white font-bold text-[10px]"
                                >
                                  تحديث الحالة
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="8" className="p-8 text-center text-gray-500">
                          لا توجد طلبات في هذا التصنيف حالياً
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: CARS INVENTORY MANAGEMENT */}
        {activeTab === 'cars' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-white">إدارة مخزون وأسطول المعرض</h3>
              <button
                onClick={() => {
                  setEditingCar(null);
                  setCarForm({
                    make: '', model: '', year: 2023, variant: '', body_type: 'SUV',
                    price: '', mileage: '', fuel_type: 'petrol', transmission: 'automatic',
                    color: '', engine_cc: 2000, description: '', is_featured: false, is_published: true
                  });
                  setCarModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-orange hover:bg-brand-hover text-white text-xs font-bold shadow-brand transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة سيارة جديدة</span>
              </button>
            </div>

            {/* Cars Table */}
            <div className="glass-panel rounded-2xl overflow-hidden border border-white/5">
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-dark-900 border-b border-white/10 text-gray-400">
                    <tr>
                      <th className="p-3.5">السيارة</th>
                      <th className="p-3.5">السنة</th>
                      <th className="p-3.5">السعر</th>
                      <th className="p-3.5">الكيلومتر</th>
                      <th className="p-3.5">الحالة في المعرض</th>
                      <th className="p-3.5">النشر بالموقع</th>
                      <th className="p-3.5">مميزة</th>
                      <th className="p-3.5 text-center">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {cars.map((car) => (
                      <tr key={car.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-3.5">
                          <div className="flex items-center gap-3">
                            <img
                              src={car.images?.[0]?.url || '/images/logo.jpg'}
                              alt=""
                              className="w-10 h-10 rounded-lg object-cover bg-dark-900 shrink-0"
                            />
                            <div>
                              <div className="font-bold text-white">{car.make} {car.model}</div>
                              <div className="text-[10px] text-gray-400">{car.variant}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-3.5 font-mono">{car.year}</td>
                        <td className="p-3.5 font-bold text-white">{formatEGP(car.price)}</td>
                        <td className="p-3.5 font-mono">{car.mileage ? `${car.mileage.toLocaleString()} كم` : 'كسر زيرو'}</td>
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            car.status === 'available' ? 'bg-emerald-500/15 text-emerald-400' :
                            car.status === 'sold' ? 'bg-purple-500/15 text-purple-400' : 'bg-gray-500/15 text-gray-400'
                          }`}>
                            {car.status === 'available' ? 'متاحة' : car.status === 'sold' ? 'تم البيع' : car.status}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <button
                            onClick={async () => {
                              await toggleCarPublish(car.id);
                              loadData();
                            }}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                              car.is_published
                                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                                : 'bg-gray-500/15 text-gray-400 border-gray-500/30'
                            }`}
                          >
                            {car.is_published ? 'منشورة' : 'مخفية'}
                          </button>
                        </td>
                        <td className="p-3.5">
                          <button
                            onClick={async () => {
                              await toggleCarFeature(car.id);
                              loadData();
                            }}
                            className={`p-1.5 rounded-lg border transition-all ${
                              car.is_featured
                                ? 'bg-brand-orange/20 text-brand-orange border-brand-orange/40'
                                : 'bg-white/5 text-gray-500 border-white/5'
                            }`}
                          >
                            <Star className={`w-3.5 h-3.5 ${car.is_featured ? 'fill-current' : ''}`} />
                          </button>
                        </td>
                        <td className="p-3.5 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => {
                                setEditingCar(car);
                                setCarForm({
                                  make: car.make, model: car.model, year: car.year,
                                  variant: car.variant || '', body_type: car.body_type || 'SUV',
                                  price: car.price, mileage: car.mileage || '',
                                  fuel_type: car.fuel_type || 'petrol', transmission: car.transmission || 'automatic',
                                  color: car.color || '', engine_cc: car.engine_cc || 2000,
                                  description: car.description || '', is_featured: car.is_featured,
                                  is_published: car.is_published
                                });
                                setCarModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg bg-blue-500/15 text-blue-400 hover:bg-blue-500/25"
                              title="تعديل"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={async () => {
                                if (confirm(`هل أنت متأكد من حذف وأرشفة ${car.make} ${car.model}؟`)) {
                                  await deleteAdminCar(car.id);
                                  loadData();
                                }
                              }}
                              className="p-1.5 rounded-lg bg-red-500/15 text-red-400 hover:bg-red-500/25"
                              title="حذف"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
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

      {/* MODAL 1: Update Inquiry Status & Notes */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-dark-900 border border-white/10 rounded-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="font-extrabold text-white text-sm">
                متابعة طلب العميل ({selectedInquiry.inquiry_ref})
              </h3>
              <button onClick={() => setSelectedInquiry(null)} className="text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveInquiryStatus} className="space-y-4 text-xs">
              <div>
                <span className="text-gray-400 block mb-1">العميل:</span>
                <span className="font-bold text-white text-sm">{selectedInquiry.customer_name}</span>
                <span className="text-gray-400 font-mono mr-2" dir="ltr">({selectedInquiry.customer_phone})</span>
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">حالة الطلب في الـ CRM</label>
                <select
                  value={selectedInquiry.status}
                  onChange={(e) => setSelectedInquiry({ ...selectedInquiry, status: e.target.value })}
                  className="w-full bg-dark-950 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand-orange"
                >
                  <option value="new">جديد (New)</option>
                  <option value="contacted">تم التواصل (Contacted)</option>
                  <option value="negotiating">جاري التفاوض (Negotiating)</option>
                  <option value="won">تمت الصفقة بنجاح 🎉 (Won)</option>
                  <option value="lost">لم يتم الاتفاق / ملغي (Lost)</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">ملاحظات فريق المبيعات (Staff Notes)</label>
                <textarea
                  rows="3"
                  placeholder="سجل تفاصيل المكالمة والاتفاق مع العميل..."
                  value={selectedInquiry.staff_notes || ''}
                  onChange={(e) => setSelectedInquiry({ ...selectedInquiry, staff_notes: e.target.value })}
                  className="w-full bg-dark-950 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-brand-orange"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedInquiry(null)}
                  className="px-4 py-2 rounded-xl bg-white/5 text-gray-300"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={updatingInquiry}
                  className="px-5 py-2 rounded-xl bg-brand-orange text-white font-bold"
                >
                  {updatingInquiry ? 'جاري الحفظ...' : 'حفظ التحديث'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Add / Edit Car */}
      {carModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-dark-900 border border-white/10 rounded-2xl w-full max-w-lg p-6 space-y-4 my-auto">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="font-extrabold text-white text-sm">
                {editingCar ? 'تعديل بيانات السيارة' : 'إضافة سيارة جديدة للمخزون'}
              </h3>
              <button onClick={() => setCarModalOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCar} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">الماركة (Make) *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: Mercedes-Benz"
                    value={carForm.make}
                    onChange={(e) => setCarForm({ ...carForm, make: e.target.value })}
                    className="w-full bg-dark-950 border border-white/10 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">الموديل (Model) *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: C200 AMG"
                    value={carForm.model}
                    onChange={(e) => setCarForm({ ...carForm, model: e.target.value })}
                    className="w-full bg-dark-950 border border-white/10 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">السنة *</label>
                  <input
                    type="number"
                    required
                    value={carForm.year}
                    onChange={(e) => setCarForm({ ...carForm, year: e.target.value })}
                    className="w-full bg-dark-950 border border-white/10 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">السعر (ج.م) *</label>
                  <input
                    type="number"
                    required
                    placeholder="2500000"
                    value={carForm.price}
                    onChange={(e) => setCarForm({ ...carForm, price: e.target.value })}
                    className="w-full bg-dark-950 border border-white/10 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">الكيلومتر</label>
                  <input
                    type="number"
                    placeholder="25000"
                    value={carForm.mileage}
                    onChange={(e) => setCarForm({ ...carForm, mileage: e.target.value })}
                    className="w-full bg-dark-950 border border-white/10 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">نوع الهيكل</label>
                  <select
                    value={carForm.body_type}
                    onChange={(e) => setCarForm({ ...carForm, body_type: e.target.value })}
                    className="w-full bg-dark-950 border border-white/10 rounded-xl p-2 text-white"
                  >
                    <option value="SUV">دفع رباعي SUV</option>
                    <option value="سيدان">سيدان فارهة</option>
                    <option value="هاتشباك">هاتشباك</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">اللون</label>
                  <input
                    type="text"
                    placeholder="أبيض لؤلؤي"
                    value={carForm.color}
                    onChange={(e) => setCarForm({ ...carForm, color: e.target.value })}
                    className="w-full bg-dark-950 border border-white/10 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">وصف السيارة</label>
                <textarea
                  rows="2"
                  placeholder="وصف حالة الفحص والتجهيزات..."
                  value={carForm.description}
                  onChange={(e) => setCarForm({ ...carForm, description: e.target.value })}
                  className="w-full bg-dark-950 border border-white/10 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={carForm.is_published}
                    onChange={(e) => setCarForm({ ...carForm, is_published: e.target.checked })}
                    className="accent-brand-orange"
                  />
                  <span>نشر السيارة بالموقع فوراً</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={carForm.is_featured}
                    onChange={(e) => setCarForm({ ...carForm, is_featured: e.target.checked })}
                    className="accent-brand-orange"
                  />
                  <span>تمييز كسيارة مميزة في الصفحة الرئيسية</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setCarModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 text-gray-300"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-orange text-white font-bold"
                >
                  {editingCar ? 'حفظ التعديلات' : 'إضافة السيارة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
