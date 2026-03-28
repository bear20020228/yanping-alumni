"use client";

import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { supabase } from '../../lib/supabase';
import Link from 'next/link';

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [pendingBusinesses, setPendingBusinesses] = useState<any[]>([]);
  const [pendingPhotos, setPendingPhotos] = useState<any[]>([]); 
  const [approvedPhotos, setApprovedPhotos] = useState<any[]>([]); 
  const [eventsData, setEventsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null); 

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();
    
    if (profile?.role !== 'admin') {
      setIsAdmin(false);
      setLoading(false);
      return;
    }
    
    setIsAdmin(true);

    // 1. 抓取待審核會員 (排除管理員本人)
    const { data: allUsers } = await supabase.from('profiles').select('*').neq('role', 'admin');
    if (allUsers) {
      setPendingUsers(allUsers.filter(u => u.status !== 'approved' || !u.is_paid));
    }

    // 2. 抓取待審企業
    const { data: biz } = await supabase.from('alumni_businesses').select('*').neq('status', 'approved');
    if (biz) setPendingBusinesses(biz);

    // 3. 抓取待審老照片 (關聯上傳者姓名與屆次)
    const { data: pPhotos } = await supabase
      .from('old_photos')
      .select('*, profiles:uploader_id(full_name, class_year)')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });
    if (pPhotos) setPendingPhotos(pPhotos);

    // 4. 抓取已核准老照片 (供誤按救援，取最近15張)
    const { data: aPhotos } = await supabase
      .from('old_photos')
      .select('*, profiles:uploader_id(full_name, class_year)')
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(15);
    if (aPhotos) setApprovedPhotos(aPhotos);

    // 5. 抓取活動報名統計 (抓取活動名稱並關聯報名者資訊)
    const { data: events } = await supabase
      .from('events')
      .select(`
        *,
        event_registrations (
          profiles ( full_name, class_year )
        )
      `);
    if (events) setEventsData(events);

    setLoading(false);
  };

  // --- 操作函數 ---
  const handleApproveUser = async (id: string) => {
    await supabase.from('profiles').update({ status: 'approved' }).eq('id', id);
    fetchAdminData();
  };

  const handleApprovePayment = async (id: string) => {
    await supabase.from('profiles').update({ is_paid: true }).eq('id', id);
    fetchAdminData();
  };

  const handleApprovePhoto = async (id: number) => {
  try {
    const { error } = await supabase
      .from('old_photos')
      .update({ status: 'approved' })
      .eq('id', id);

    if (error) throw error;
    
    // 成功後立即刷新列表
    alert('審核通過！');
    fetchAdminData(); 
  } catch (err: any) {
    console.error('Approve failed:', err);
    alert('核准失敗：' + (err.message || '權限不足'));
  }
};

  const handleApproveBiz = async (id: number) => {
    await supabase.from('alumni_businesses').update({ status: 'approved' }).eq('id', id);
    fetchAdminData();
  };

  const handleDeletePhoto = async (id: number, storagePath: string) => {
    if (!confirm('確定要永久刪除這張照片嗎？此操作將同時移除資料庫與雲端檔案。')) return;
    try {
      await supabase.storage.from('old_photos').remove([storagePath]);
      await supabase.from('old_photos').delete().eq('id', id);
      fetchAdminData();
    } catch (err: any) {
      alert('刪除失敗：' + err.message);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#003366] mb-4"></div>
      <p className="font-bold text-slate-400">正在進入總會管理後台...</p>
    </div>
  );

  if (isAdmin === false) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-white shadow-2xl rounded-3xl p-10 border border-red-100">
          <span className="text-5xl">🚫</span>
          <h2 className="text-2xl font-black text-red-600 mt-4 mb-2">存取被拒</h2>
          <p className="text-slate-500 mb-6">您不具備管理員權限。</p>
          <Link href="/profile" className="inline-block bg-[#003366] text-white px-8 py-3 rounded-xl font-bold">返回校友卡</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 relative pb-20">
      <Navbar />
      <div className="max-w-[1800px] mx-auto py-10 px-6">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-black text-[#003366] border-l-8 border-[#003366] pl-4 tracking-tighter uppercase">Admin Dashboard</h1>
            <span className="bg-orange-500 text-white text-[10px] px-2 py-0.5 rounded font-black tracking-widest uppercase">V1.0 System</span>
          </div>
          <button onClick={fetchAdminData} className="bg-white border-2 border-slate-200 px-6 py-2 rounded-xl text-sm font-black hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95">整理即時數據</button>
        </div>

        {/* 主要網格排版 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* 左側：核心審核 (佔 8 欄) */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* 1. 活動報名統計 */}
            <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-black text-slate-800">📋 活動報名名單</h2>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Live Status</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {eventsData.map(event => (
                  <div key={event.id} className="bg-slate-50 rounded-2xl p-6 border border-slate-100 flex flex-col">
                    <div className="flex justify-between items-start mb-6">
                      <h3 className="text-lg font-black text-[#003366]">{event.title}</h3>
                      <div className="bg-[#003366] text-white text-xs px-3 py-1 rounded-full font-bold">
                        {event.event_registrations?.length || 0} 人已報名
                      </div>
                    </div>
                    <div className="flex-1 max-h-48 overflow-y-auto space-y-2 pr-2 scrollbar-thin scrollbar-thumb-slate-300">
                      {event.event_registrations?.map((reg: any, i: number) => (
                        <div key={i} className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-200/50 shadow-sm">
                          <span className="font-bold text-slate-700 text-sm">{reg.profiles?.full_name}</span>
                          <span className="text-xs text-slate-400">第 {reg.profiles?.class_year} 屆</span>
                        </div>
                      ))}
                      {event.event_registrations?.length === 0 && (
                        <p className="text-center py-4 text-xs text-slate-400 italic">目前尚未有報名資料</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 2. 老照片待審區 */}
            <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-black text-orange-600 uppercase tracking-tighter">待審老照片 ({pendingPhotos.length})</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {pendingPhotos.map(ph => (
                  <div key={ph.id} className="border-2 border-slate-100 rounded-3xl p-5 bg-slate-50/50 space-y-4">
                    <div className="aspect-video overflow-hidden rounded-2xl relative">
                      <img src={ph.url} className="w-full h-full object-cover cursor-pointer" onClick={() => setPreviewUrl(ph.url)} />
                      <div className="absolute top-3 left-3 bg-orange-500 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg">
                        民國 {ph.year_taken - 1911} 年
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-[10px] text-slate-400 mb-2 font-bold uppercase tracking-widest">
                        <span>由 {ph.profiles?.full_name} 提供</span>
                        <span>{ph.profiles?.class_year} 屆</span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed bg-white p-4 rounded-2xl border border-slate-100 min-h-[60px]">
                        {ph.description}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleApprovePhoto(ph.id)} className="flex-[2] bg-orange-500 text-white py-3 rounded-xl text-xs font-black hover:bg-orange-600 shadow-md active:scale-95 transition-all">核准發布</button>
                      <button onClick={() => handleDeletePhoto(ph.id, ph.storage_path)} className="flex-1 bg-white border-2 border-red-100 text-red-500 py-3 rounded-xl text-xs font-bold hover:bg-red-50 transition-all">拒絕</button>
                    </div>
                  </div>
                ))}
                {pendingPhotos.length === 0 && <p className="text-center py-10 text-slate-400 italic col-span-2 bg-slate-50 rounded-2xl border-2 border-dashed">暫無待審照片</p>}
              </div>
            </section>
          </div>

          {/* 右側：管理與名單 (佔 4 欄) */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* 3. 會籍與繳費審核 */}
            <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200">
              <h2 className="text-lg font-black text-slate-800 mb-6 border-b pb-4 flex justify-between items-center">
                會員核定
                <span className="text-xs bg-slate-100 text-slate-400 px-2 py-1 rounded-full">{pendingUsers.length}</span>
              </h2>
              <div className="space-y-4">
                {pendingUsers.map(u => (
                  <div key={u.id} className="p-5 border rounded-2xl bg-slate-50 space-y-4 shadow-sm">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-black text-slate-900">{u.full_name || '未填'}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">{u.class_year}屆 | {u.identity_type}</p>
                      </div>
                      {u.payment_proof_url && (
                        <button onClick={() => setPreviewUrl(u.payment_proof_url)} className="text-[9px] bg-blue-100 text-blue-600 px-2.5 py-1.5 rounded-lg font-black uppercase tracking-widest hover:bg-blue-200">Proof</button>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {u.status !== 'approved' && <button onClick={() => handleApproveUser(u.id)} className="flex-1 bg-slate-800 text-white py-2 rounded-lg text-[10px] font-black hover:bg-black transition-colors">核准身分</button>}
                      {!u.is_paid && <button onClick={() => handleApprovePayment(u.id)} className="flex-1 bg-green-600 text-white py-2 rounded-lg text-[10px] font-black hover:bg-green-700 transition-colors">確認繳費</button>}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 4. 已核准照片管理 (誤按救回) */}
            <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200">
              <h2 className="text-lg font-black text-green-700 mb-6 italic border-b pb-4 flex justify-between items-center">
                已發布 (管理)
                <span className="text-[10px] bg-green-50 text-green-600 px-2 py-1 rounded-full">Recent</span>
              </h2>
              <div className="space-y-4">
                {approvedPhotos.map(ph => (
                  <div key={ph.id} className="flex gap-4 p-4 border rounded-2xl bg-white hover:bg-slate-50 transition-colors group relative">
                    <img src={ph.url} className="w-14 h-14 object-cover rounded-xl shadow-sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-black text-slate-800 truncate uppercase tracking-widest">{ph.profiles?.full_name}</p>
                      <p className="text-[9px] text-slate-400 mt-1 line-clamp-1">{ph.description}</p>
                      <button 
                        onClick={() => handleDeletePhoto(ph.id, ph.storage_path)}
                        className="mt-2 text-[9px] text-red-500 font-black hover:underline underline-offset-4"
                      >
                        ⚠️ 強制下架並刪除
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 5. 待審企業地圖 */}
            <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200">
              <h2 className="text-lg font-black text-blue-800 mb-6 border-b pb-4">地圖上架 ({pendingBusinesses.length})</h2>
              <div className="space-y-4">
                {pendingBusinesses.map(biz => (
                  <div key={biz.id} className="p-5 border rounded-2xl bg-slate-50 shadow-sm">
                    <p className="font-black text-sm text-[#003366] mb-1">{biz.name}</p>
                    <p className="text-[10px] text-slate-400 mb-4">{biz.address}</p>
                    <button onClick={() => handleApproveBiz(biz.id)} className="w-full bg-blue-600 text-white py-3 rounded-xl text-xs font-black hover:bg-blue-700 active:scale-95 transition-all shadow-md">核准上架</button>
                  </div>
                ))}
              </div>
            </section>

          </div>
        </div>
      </div>

      {/* 燈箱元件 */}
      {previewUrl && (
        <div className="fixed inset-0 bg-black/95 z-[5000] flex items-center justify-center p-6 cursor-zoom-out" onClick={() => setPreviewUrl(null)}>
          <div className="relative max-w-5xl w-full bg-white rounded-[2rem] p-2 animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <button onClick={() => setPreviewUrl(null)} className="absolute -top-12 right-0 text-white font-black hover:text-orange-500 text-xl transition-colors">CLOSE ✕</button>
            <img src={previewUrl} className="w-full h-auto rounded-[1.5rem] shadow-2xl" alt="Preview" />
          </div>
        </div>
      )}
    </main>
  );
}