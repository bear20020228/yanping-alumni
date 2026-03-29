"use client";

import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { supabase } from '../../lib/supabase';
import Link from 'next/link';
import * as XLSX from 'xlsx';

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

    // 3. 抓取待審老照片
    const { data: pPhotos } = await supabase
      .from('old_photos')
      .select('*, profiles:uploader_id(full_name, class_year)')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });
    if (pPhotos) setPendingPhotos(pPhotos);

    // 4. 抓取已核准老照片
    const { data: aPhotos } = await supabase
      .from('old_photos')
      .select('*, profiles:uploader_id(full_name, class_year)')
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(15);
    if (aPhotos) setApprovedPhotos(aPhotos);

    // 5. 抓取活動報名統計
    const { data: events } = await supabase
      .from('events')
      .select(`
        *,
        event_registrations (
          profiles ( full_name, class_year, industry, phone, address )
        )
      `);
    if (events) setEventsData(events);

    setLoading(false);
  };

  const handleExportExcel = (event: any) => {
    if (!event.event_registrations || event.event_registrations.length === 0) {
      alert("目前尚無人報名，無法匯出。");
      return;
    }

    const excelData = event.event_registrations.map((reg: any, index: number) => ({
      '序號': index + 1,
      '活動名稱': event.title,
      '姓名': reg.profiles?.full_name || '未填寫',
      '屆次': reg.profiles?.class_year ? `${reg.profiles.class_year}屆` : '未知',
      '產業/公司': reg.profiles?.industry || '未提供',
      '電話': reg.profiles?.phone || '未提供',
      '收信地址': reg.profiles?.address || '未提供',
      '報名時間': new Date(reg.created_at || '').toLocaleString()
    }));

    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "報名名單");
    
    ws['!cols'] = [
      { wch: 6 }, { wch: 25 }, { wch: 15 }, { wch: 10 }, 
      { wch: 20 }, { wch: 15 }, { wch: 35 }, { wch: 20 }
    ];

    XLSX.writeFile(wb, `延平校友會_${event.title}_報名表.xlsx`);
  };

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
      const { error } = await supabase.from('old_photos').update({ status: 'approved' }).eq('id', id);
      if (error) throw error;
      alert('審核通過！');
      fetchAdminData(); 
    } catch (err: any) {
      alert('核准失敗：' + err.message);
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
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center italic">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#003366] mb-4"></div>
      <p className="font-bold text-slate-400">正在進入管理後台...</p>
    </div>
  );

  if (isAdmin === false) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-white shadow-2xl rounded-3xl p-10 border border-red-100">
          <h2 className="text-2xl font-black text-red-600 mb-6">🚫 權限不足</h2>
          <Link href="/profile" className="inline-block bg-[#003366] text-white px-8 py-3 rounded-xl font-bold">返回校友卡</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 relative pb-20">
      <Navbar />
      <div className="max-w-[1800px] mx-auto py-10 px-6">
        
        <div className="flex justify-between items-center mb-10">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-black text-[#003366] border-l-8 border-[#003366] pl-4 tracking-tighter uppercase">Admin Dashboard</h1>
            <span className="bg-orange-500 text-white text-[10px] px-2 py-0.5 rounded font-black tracking-widest">FULL ACCESS</span>
          </div>
          <button onClick={fetchAdminData} className="bg-white border-2 border-slate-200 px-6 py-2 rounded-xl text-sm font-black hover:border-slate-400 transition-all">整理即時數據</button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ========================================== */}
          {/* 左側主要工作區：活動報名與老照片審核 (佔 8 欄) */}
          {/* ========================================== */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* 1. 活動報名名單 */}
            <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200">
              <h2 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-2">📋 活動報名名單</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {eventsData.map(event => (
                  <div key={event.id} className="bg-slate-50 rounded-2xl p-6 border border-slate-100 flex flex-col h-full">
                    <div className="flex justify-between items-start mb-6">
                      <h3 className="text-lg font-black text-[#003366]">{event.title}</h3>
                      <div className="bg-[#003366] text-white text-xs px-3 py-1 rounded-full font-bold">
                        {event.event_registrations?.length || 0} 人報名
                      </div>
                    </div>
                    <div className="flex-1 max-h-48 overflow-y-auto space-y-2 mb-6 pr-2 scrollbar-thin scrollbar-thumb-slate-300">
                      {event.event_registrations?.map((reg: any, i: number) => (
                        <div key={i} className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-200/50 shadow-sm text-sm">
                          <span className="font-bold text-slate-700">{reg.profiles?.full_name}</span>
                          <span className="text-xs text-slate-400">第 {reg.profiles?.class_year} 屆</span>
                        </div>
                      ))}
                    </div>
                    <button 
                      onClick={() => handleExportExcel(event)}
                      className="w-full bg-green-600 text-white py-3 rounded-xl text-xs font-black hover:bg-green-700 transition-all shadow-lg shadow-green-900/10"
                    >
                      📥 匯出 Excel 名單
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* 2. 老照片待審區 */}
            <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200">
              <h2 className="text-xl font-black text-orange-600 mb-8">待審老照片 ({pendingPhotos.length})</h2>
              {pendingPhotos.length === 0 ? (
                <p className="text-slate-400 text-sm italic">目前無待審核的照片。</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {pendingPhotos.map(ph => (
                    <div key={ph.id} className="border-2 border-slate-100 rounded-3xl p-5 bg-slate-50/50 flex flex-col justify-between h-full">
                      <div>
                        <img src={ph.url} className="w-full aspect-video object-cover rounded-2xl cursor-pointer mb-4 hover:opacity-80 transition-opacity" onClick={() => setPreviewUrl(ph.url)} alt="待審照片" />
                        <div className="flex justify-between text-[10px] text-slate-400 font-bold mb-2">
                          <span>上傳者：{ph.profiles?.full_name} ({ph.profiles?.class_year}屆)</span>
                          <span>{ph.year_taken}年</span>
                        </div>
                        <p className="text-xs text-slate-600 line-clamp-2 mb-4">{ph.description}</p>
                      </div>
                      <div className="flex gap-2 mt-auto">
                        <button onClick={() => handleApprovePhoto(ph.id)} className="flex-[2] bg-orange-500 text-white py-3 rounded-xl text-xs font-black hover:bg-orange-600 transition-colors">核准發布</button>
                        <button onClick={() => handleDeletePhoto(ph.id, ph.storage_path)} className="flex-1 bg-white border border-red-200 text-red-500 py-3 rounded-xl text-xs font-bold hover:bg-red-50 transition-colors">刪除</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* ========================================== */}
          {/* 右側側邊欄：會籍審核與企業上架 (佔 4 欄) */}
          {/* ========================================== */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* 3. 會籍與繳費審核 */}
            <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200">
              <h2 className="text-lg font-black text-slate-800 mb-6 border-b border-slate-100 pb-4 flex justify-between items-center">
                會員核定區
                <span className="text-xs bg-slate-100 text-slate-500 px-3 py-1 rounded-full font-bold">{pendingUsers.length} 人待處理</span>
              </h2>
              {pendingUsers.length === 0 ? (
                <p className="text-slate-400 text-sm italic">所有會員皆已審核完畢。</p>
              ) : (
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-200">
                  {pendingUsers.map(u => (
                    <div key={u.id} className="p-5 border border-slate-200 rounded-2xl bg-slate-50 flex flex-col gap-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-black text-slate-900 text-base">{u.full_name || '未填'}</p>
                          <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">
                            {u.identity_type} {u.class_year ? `| ${u.class_year}屆` : ''}
                          </p>
                        </div>
                        {u.payment_proof_url && (
                          <button onClick={() => setPreviewUrl(u.payment_proof_url)} className="text-[10px] bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg font-black hover:bg-blue-200 transition-colors">
                            查看繳費證明
                          </button>
                        )}
                      </div>
                      <div className="flex gap-2 mt-auto">
                        {u.status !== 'approved' && (
                          <button onClick={() => handleApproveUser(u.id)} className="flex-1 bg-slate-800 text-white py-2.5 rounded-xl text-xs font-black hover:bg-black transition-colors shadow-sm">
                            核准身分
                          </button>
                        )}
                        {!u.is_paid && (
                          <button onClick={() => handleApprovePayment(u.id)} className="flex-1 bg-green-600 text-white py-2.5 rounded-xl text-xs font-black hover:bg-green-700 transition-colors shadow-sm">
                            確認繳費
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* 4. 企業地圖上架審核 */}
            <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200">
              <h2 className="text-lg font-black text-blue-800 mb-6 border-b border-blue-50 pb-4 flex justify-between items-center">
                地圖上架審核
                <span className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-full font-bold">{pendingBusinesses.length} 家待審</span>
              </h2>
              {pendingBusinesses.length === 0 ? (
                <p className="text-slate-400 text-sm italic">目前無待審核的企業。</p>
              ) : (
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-blue-200">
                  {pendingBusinesses.map(biz => (
                    <div key={biz.id} className="p-5 border border-blue-100 rounded-2xl bg-blue-50/30 flex flex-col gap-3">
                      <div>
                        <p className="font-black text-sm text-[#003366]">{biz.name}</p>
                        <span className="inline-block mt-1 text-[10px] bg-white border border-slate-200 text-slate-500 px-2 py-0.5 rounded-md font-bold">
                          {biz.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 bg-white p-2 rounded-lg border border-slate-100">{biz.address}</p>
                      <button onClick={() => handleApproveBiz(biz.id)} className="w-full mt-2 bg-blue-600 text-white py-3 rounded-xl text-xs font-black hover:bg-blue-700 active:scale-95 transition-all shadow-md">
                        核准上架地圖
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* 5. 已核准照片管理 (防止誤按或反悔) */}
            <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200">
              <h2 className="text-lg font-black text-green-700 mb-6 border-b border-green-50 pb-4">已發布照片管理</h2>
              {approvedPhotos.length === 0 ? (
                <p className="text-slate-400 text-sm italic">尚無已發布的照片。</p>
              ) : (
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-green-200">
                  {approvedPhotos.map(ph => (
                    <div key={ph.id} className="flex gap-4 p-3 border border-slate-100 rounded-2xl bg-white hover:bg-slate-50 transition-colors items-center">
                      <img src={ph.url} className="w-16 h-16 object-cover rounded-xl shadow-sm cursor-pointer hover:opacity-80" onClick={() => setPreviewUrl(ph.url)} alt="已核准照片" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-black text-slate-800 truncate uppercase tracking-widest mb-1">{ph.profiles?.full_name}</p>
                        <p className="text-[10px] text-slate-400 truncate">{ph.year_taken} 年</p>
                      </div>
                      <button onClick={() => handleDeletePhoto(ph.id, ph.storage_path)} className="text-[10px] text-red-500 bg-red-50 px-3 py-2 rounded-lg font-black hover:bg-red-100 transition-colors whitespace-nowrap">
                        強制下架
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>

          </div>
        </div>
      </div>

      {/* 燈箱元件 (Lightbox) */}
      {previewUrl && (
        <div className="fixed inset-0 bg-black/95 z-[5000] flex items-center justify-center p-6 cursor-zoom-out" onClick={() => setPreviewUrl(null)}>
          <div className="relative max-w-5xl w-full flex justify-center items-center rounded-[2rem] p-2 animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <button onClick={() => setPreviewUrl(null)} className="absolute -top-12 right-0 text-white/70 font-black hover:text-white text-xl transition-colors tracking-widest">CLOSE ✕</button>
            <img src={previewUrl} className="max-w-full max-h-[85vh] object-contain rounded-[1.5rem] shadow-2xl" alt="Preview" />
          </div>
        </div>
      )}
    </main>
  );
}