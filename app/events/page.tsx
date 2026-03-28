"use client";

import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';

export default function EventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [registrations, setRegistrations] = useState<number[]>([]); 
  const [loading, setLoading] = useState(true);
  const router = useRouter(); // 引入 router

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    
    // 1. 抓取所有活動
    const { data: eventsData } = await supabase.from('events').select('*').order('date', { ascending: true });
    if (eventsData) setEvents(eventsData);

    // 2. 檢查目前登入的會員
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
      setUserProfile(profile);

      // 3. 抓取這個人已經報名了哪些活動
      const { data: regData } = await supabase
        .from('event_registrations')
        .select('event_id')
        .eq('user_id', session.user.id);
      
      if (regData) {
        setRegistrations(regData.map(reg => reg.event_id));
      }
    }
    setLoading(false);
  };

  // --- 新增：老照片募集卡片的專屬攔截器 ---
  const handleUploadClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      alert('請先登入校友帳號，才能上傳珍貴的老照片喔！');
      router.push('/login');
    } else {
      router.push('/history/upload');
    }
  };

  // --- 更新：活動報名攔截邏輯 ---
  const handleRegister = async (eventId: number) => {
    // 1. 檢查是否登入
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      alert("請先登入校友帳號才能報名活動喔！");
      router.push('/login');
      return;
    }

    // 2. 嚴格權限檢查：身分需核准且已繳費
    if (userProfile?.status !== 'approved' || !userProfile?.is_paid) {
      alert("您的帳號尚在審核中或尚未繳費，系統將為您導向至帳號中心查看狀態！");
      router.push('/profile'); // 直接引導他去查看狀態或上傳憑證
      return;
    }

    // 3. 執行報名
    try {
      const { error } = await supabase
        .from('event_registrations')
        .insert([{ event_id: eventId, user_id: userProfile.id }]);

      if (error) throw error;
      
      alert("🎉 報名成功！期待您的參與！");
      fetchData(); // 重新整理畫面，把按鈕變成「已報名」
    } catch (error: any) {
      alert("報名失敗：" + error.message);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      <div className="max-w-6xl mx-auto py-16 px-6">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-black text-[#003366] mb-4 tracking-tighter">校友活動中心</h1>
          <p className="text-slate-500 text-sm font-bold tracking-widest uppercase">掌握總會最新動態，與學長姐一起回憶青春、拓展人脈</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#003366]"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            
            {/* --- 固定位：老照片募集常駐卡片 --- */}
            <div className="bg-[#004d00] rounded-[2.5rem] shadow-xl overflow-hidden flex flex-col transform hover:-translate-y-2 transition-all border-4 border-orange-400 relative">
              <div className="h-48 bg-[url('/LINE_ALBUM_待選延平桌曆照片_260326_1.jpg')] bg-cover bg-center opacity-70" />
              <div className="p-8 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-4">
                  <span className="bg-orange-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">Ongoing Event</span>
                  <span className="text-orange-300 font-bold text-xs">#時光走廊</span>
                </div>
                <h2 className="text-2xl font-black text-white mb-3">老照片募集計畫</h2>
                <p className="text-green-100 text-sm mb-8 leading-relaxed flex-1">
                  翻開相簿，分享您在延平的珍貴瞬間。經管理員審核後將收錄於時光走廊，讓回憶永不褪色。
                </p>
                <button 
                  onClick={handleUploadClick} 
                  className="w-full bg-white text-[#004d00] py-4 rounded-2xl font-black text-center hover:bg-orange-50 transition-colors shadow-lg active:scale-95"
                >
                  立即投稿回憶
                </button>
              </div>
            </div>

            {/* --- 動態資料：活動列表 --- */}
            {events.length === 0 ? null : (
              events.map(event => (
                <div key={event.id} className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden flex flex-col hover:shadow-2xl transition-all group">
                  {event.image_url ? (
                    <div className="h-48 overflow-hidden">
                      <img src={event.image_url} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                      <span className="text-slate-600 font-black tracking-widest uppercase">Yanping Event</span>
                    </div>
                  )}
                  
                  <div className="p-8 flex-1 flex flex-col">
                    <h2 className="text-xl font-black text-slate-800 mb-3">{event.title}</h2>
                    <div className="text-xs text-slate-500 mb-5 space-y-1">
                      <p className="flex items-center gap-2">📅 <span className="font-medium text-slate-700">{event.date}</span></p>
                      <p className="flex items-center gap-2">📍 <span className="font-medium text-slate-700">{event.location}</span></p>
                    </div>
                    <p className="text-slate-600 text-sm mb-8 leading-relaxed flex-1 line-clamp-3">{event.description}</p>
                    
                    {/* 報名按鈕邏輯 */}
                    {registrations.includes(event.id) ? (
                      <button disabled className="w-full bg-slate-50 text-slate-400 py-4 rounded-2xl font-black cursor-not-allowed flex items-center justify-center gap-2 border border-slate-100">
                        <span className="text-green-500 text-lg">✓</span> 您已成功報名
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleRegister(event.id)}
                        className="w-full bg-[#003366] text-white py-4 rounded-2xl font-black hover:bg-blue-900 transition-all shadow-md active:scale-95"
                      >
                        立即線上報名
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </main>
  );
}