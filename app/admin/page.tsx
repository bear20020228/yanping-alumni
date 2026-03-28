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

    // 檢查資料庫裡的 role 欄位
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

    // 抓取資料
    const { data: allUsers } = await supabase.from('profiles').select('*');
    if (allUsers) {
      setPendingUsers(allUsers.filter(u => u.role !== 'admin' && (u.status !== 'approved' || !u.is_paid)));
    }

    const { data: biz } = await supabase.from('alumni_businesses').select('*').neq('status', 'approved');
    if (biz) setPendingBusinesses(biz);

    const { data: ph } = await supabase.from('old_photos').select('*, profiles:uploader_id(full_name, class_year)').eq('status', 'pending');
    if (ph) setPendingPhotos(ph);

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
    await supabase.from('old_photos').update({ status: 'approved' }).eq('id', id);
    fetchAdminData();
  };

  const handleApproveBiz = async (id: number) => {
    await supabase.from('alumni_businesses').update({ status: 'approved' }).eq('id', id);
    fetchAdminData();
  };

  // 1. 載入中狀態
  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#003366] mb-4"></div>
      <p className="font-bold text-slate-400">正在驗證管理員權限...</p>
    </div>
  );

  // 2. 權限錯誤狀態 (原地顯示，不跳轉)
  if (isAdmin === false) {
    return (
      <main className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="max-w-md mx-auto mt-20 p-10 bg-white shadow-2xl rounded-3xl text-center border border-red-100">
          <span className="text-6xl">🚫</span>
          <h2 className="text-2xl font-black text-red-600 mt-4 mb-2">權限不足</h2>
          <p className="text-slate-500 mb-6">您的帳號並不具備管理員 (admin) 權限。</p>
          <Link href="/profile" className="inline-block bg-[#003366] text-white px-8 py-3 rounded-xl font-bold">返回我的帳號</Link>
        </div>
      </main>
    );
  }

  // 3. 正常管理介面
  return (
    <main className="min-h-screen bg-slate-50 relative">
      <Navbar />
      <div className="max-w-[1400px] mx-auto py-10 px-6">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-black text-[#003366] border-l-4 border-[#003366] pl-3">🛠️ 總會管理系統</h1>
          <button onClick={() => fetchAdminData()} className="text-sm bg-white px-4 py-2 rounded-lg border hover:bg-slate-50 font-bold text-slate-600">整理資料</button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
          
          {/* 會員審核 */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold text-slate-800 mb-5">會籍與繳費 ({pendingUsers.length})</h2>
            <div className="space-y-4">
              {pendingUsers.map(u => (
                <div key={u.id} className="p-4 border rounded-xl bg-slate-50 flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold">{u.full_name} <span className="text-xs text-slate-500">({u.class_year}屆)</span></p>
                      <p className="text-[10px] text-slate-400 mt-1">{u.email}</p>
                    </div>
                    {u.payment_proof_url && (
                      <button onClick={() => setPreviewUrl(u.payment_proof_url)} className="text-[10px] bg-orange-100 text-orange-600 px-2 py-1 rounded font-bold">👁️ 憑證</button>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {u.status !== 'approved' && <button onClick={() => handleApproveUser(u.id)} className="flex-1 bg-slate-800 text-white py-1.5 rounded-lg text-xs font-bold">核准身分</button>}
                    {!u.is_paid && <button onClick={() => handleApprovePayment(u.id)} className="flex-1 bg-green-600 text-white py-1.5 rounded-lg text-xs font-bold">確認繳費</button>}
                  </div>
                </div>
              ))}
              {pendingUsers.length === 0 && <p className="text-sm text-slate-400 italic">暫無待處理會員</p>}
            </div>
          </div>

          {/* 照片募集 */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold text-slate-800 mb-5">老照片募集 ({pendingPhotos.length})</h2>
            <div className="grid grid-cols-2 gap-4">
              {pendingPhotos.map(ph => (
                <div key={ph.id} className="border rounded-xl bg-slate-50 p-3 space-y-3">
                  <img src={ph.url} className="w-full h-24 object-cover rounded-lg cursor-pointer" onClick={() => setPreviewUrl(ph.url)} />
                  <p className="text-[10px] text-slate-500 line-clamp-2">{ph.description}</p>
                  <button onClick={() => handleApprovePhoto(ph.id)} className="w-full bg-orange-500 text-white py-2 rounded-lg text-xs font-bold">核准發布</button>
                </div>
              ))}
            </div>
            {pendingPhotos.length === 0 && <p className="text-sm text-slate-400 italic mt-4">暫無待審照片</p>}
          </div>

          {/* 企業審核 */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold text-slate-800 mb-5">待審企業 ({pendingBusinesses.length})</h2>
            <div className="space-y-4">
              {pendingBusinesses.map(biz => (
                <div key={biz.id} className="p-4 border rounded-xl bg-slate-50">
                  <p className="font-bold text-[#003366]">{biz.name}</p>
                  <p className="text-[10px] text-slate-500 mb-3">{biz.address}</p>
                  <button onClick={() => handleApproveBiz(biz.id)} className="w-full bg-blue-600 text-white py-2 rounded-lg text-xs font-bold">核准上架</button>
                </div>
              ))}
              {pendingBusinesses.length === 0 && <p className="text-sm text-slate-400 italic">暫無待審企業</p>}
            </div>
          </div>

        </div>
      </div>

      {/* 圖片預覽彈窗 */}
      {previewUrl && (
        <div className="fixed inset-0 bg-black/80 z-[2000] flex items-center justify-center p-4" onClick={() => setPreviewUrl(null)}>
          <div className="relative max-w-lg w-full bg-white rounded-2xl p-2 animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <img src={previewUrl} alt="Preview" className="w-full h-auto rounded-xl shadow-2xl" />
          </div>
        </div>
      )}
    </main>
  );
}