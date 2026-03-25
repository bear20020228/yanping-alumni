"use client";

import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { supabase } from '../../lib/supabase';
import Link from 'next/link';

export default function EventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [registrations, setRegistrations] = useState<number[]>([]); // 存放使用者已報名的活動 ID
  const [loading, setLoading] = useState(true);

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

  const handleRegister = async (eventId: number) => {
    if (!userProfile) {
      alert("請先登入會員才能報名喔！");
      window.location.href = '/login';
      return;
    }
    if (userProfile.status !== 'approved' || !userProfile.is_paid) {
      alert("您的帳號尚在審核中或尚未繳費，請待管理員開通權限後再進行報名！");
      return;
    }

    try {
      const { error } = await supabase
        .from('event_registrations')
        .insert([{ event_id: eventId, user_id: userProfile.id }]);

      if (error) throw error;
      
      alert("🎉 報名成功！期待您的參與！");
      fetchData(); // 重新整理畫面，讓按鈕變成「已報名」
    } catch (error: any) {
      alert("報名失敗：" + error.message);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-5xl mx-auto py-16 px-6">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black text-[#003366] mb-4">校友活動報名</h1>
          <p className="text-slate-500 text-lg">掌握總會最新動態，與學長姐一起回憶青春、拓展人脈。</p>
        </div>

        {loading ? <p className="text-center text-slate-500">活動載入中...</p> : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {events.length === 0 ? (
              <p className="col-span-2 text-center text-slate-500 bg-white p-10 rounded-2xl shadow-sm">目前尚無近期活動。</p>
            ) : (
              events.map(event => (
                <div key={event.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                  {event.image_url ? (
                    <img src={event.image_url} alt={event.title} className="w-full h-48 object-cover" />
                  ) : (
                    <div className="w-full h-32 bg-gradient-to-r from-blue-900 to-[#003366] flex items-center justify-center">
                      <span className="text-white font-bold text-xl tracking-widest">YANPING EVENT</span>
                    </div>
                  )}
                  
                  <div className="p-6 flex-1 flex flex-col">
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">{event.title}</h2>
                    <div className="text-sm text-slate-500 mb-4 space-y-1">
                      <p>📅 時間：{event.date}</p>
                      <p>📍 地點：{event.location}</p>
                    </div>
                    <p className="text-slate-600 mb-6 flex-1">{event.description}</p>
                    
                    {/* 報名按鈕邏輯：判斷是否已報名 */}
                    {registrations.includes(event.id) ? (
                      <button disabled className="w-full bg-slate-200 text-slate-500 py-3 rounded-xl font-bold cursor-not-allowed">
                        ✅ 您已報名此活動
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleRegister(event.id)}
                        className="w-full bg-orange-500 text-white py-3 rounded-xl font-bold hover:bg-orange-600 transition-colors shadow-sm"
                      >
                        立即報名
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