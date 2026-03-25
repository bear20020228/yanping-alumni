"use client";

import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { supabase } from '../../lib/supabase';
import Link from 'next/link';

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [pendingBusinesses, setPendingBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    // 1. 檢查權限
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
    if (profile?.role !== 'admin') {
      setIsAdmin(false);
      setLoading(false);
      return;
    }
    
    setIsAdmin(true);

    // 2. 抓取待審核的會員 (status = 'pending')
    const { data: users } = await supabase.from('profiles').select('*').eq('status', 'pending');
    if (users) setPendingUsers(users);

    // 3. 抓取待審核的企業 (status = 'pending')
    const { data: businesses } = await supabase.from('alumni_businesses').select('*').eq('status', 'pending');
    if (businesses) setPendingBusinesses(businesses);

    setLoading(false);
  };

  // 核准會員並標記已繳費
  const approveUser = async (id: string) => {
    await supabase.from('profiles').update({ status: 'approved', is_paid: true }).eq('id', id);
    alert('會員已核准！');
    fetchAdminData(); // 重新整理列表
  };

  // 核准企業上架
  const approveBusiness = async (id: number) => {
    await supabase.from('alumni_businesses').update({ status: 'approved' }).eq('id', id);
    alert('企業已核准上架！');
    fetchAdminData(); // 重新整理列表
  };

  if (loading) return <div className="p-10 text-center">載入中...</div>;

  if (!isAdmin) {
    return (
      <main className="min-h-screen bg-slate-50 text-center py-20">
        <h1 className="text-3xl font-bold text-red-600 mb-4">存取被拒</h1>
        <p>您沒有管理員權限。</p>
        <Link href="/" className="text-blue-600 mt-4 inline-block hover:underline">回首頁</Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-5xl mx-auto py-10 px-6">
        <h1 className="text-3xl font-black text-[#003366] mb-8">🛠️ 總會管理後台</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* 左側：會員審核區 */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold text-slate-800 mb-4">待核准會員 ({pendingUsers.length})</h2>
            {pendingUsers.length === 0 ? <p className="text-slate-500 text-sm">目前沒有待審核的會員。</p> : (
              <div className="space-y-4">
                {pendingUsers.map(user => (
                  <div key={user.id} className="p-4 border rounded-xl flex justify-between items-center bg-slate-50">
                    <div>
                      <p className="font-bold">{user.full_name} <span className="text-xs text-slate-500">({user.class_year} 屆)</span></p>
                    </div>
                    <button onClick={() => approveUser(user.id)} className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-700">
                      核准並確認繳費
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 右側：企業審核區 */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold text-slate-800 mb-4">待核准企業 ({pendingBusinesses.length})</h2>
            {pendingBusinesses.length === 0 ? <p className="text-slate-500 text-sm">目前沒有待上架的企業。</p> : (
              <div className="space-y-4">
                {pendingBusinesses.map(biz => (
                  <div key={biz.id} className="p-4 border rounded-xl bg-slate-50">
                    <p className="font-bold text-[#003366]">{biz.name}</p>
                    <p className="text-xs text-slate-600 mb-3">{biz.address}</p>
                    <button onClick={() => approveBusiness(biz.id)} className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700">
                      核准顯示於地圖
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}