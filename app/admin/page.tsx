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
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
    if (profile?.role !== 'admin') {
      setIsAdmin(false);
      setLoading(false);
      return;
    }
    
    setIsAdmin(true);

    // 抓取所有會員，前端過濾出待審核或未繳費的資料
    const { data: allUsers } = await supabase.from('profiles').select('*');
    if (allUsers) {
      // 這裡列出：不是管理員，且 (狀態不是 approved 或 還沒繳費) 的人
      const toReview = allUsers.filter(u => u.role !== 'admin' && (u.status !== 'approved' || !u.is_paid));
      setPendingUsers(toReview);
    }

    const { data: businesses } = await supabase.from('alumni_businesses').select('*').neq('status', 'approved');
    if (businesses) setPendingBusinesses(businesses);

    setLoading(false);
  };

  // 獨立功能：核准會員身分
  const approveUserStatus = async (id: string) => {
    await supabase.from('profiles').update({ status: 'approved' }).eq('id', id);
    fetchAdminData();
  };

  // 獨立功能：確認會員繳費
  const toggleUserPayment = async (id: string, currentStatus: boolean) => {
    await supabase.from('profiles').update({ is_paid: !currentStatus }).eq('id', id);
    fetchAdminData();
  };

  const approveBusiness = async (id: number) => {
    await supabase.from('alumni_businesses').update({ status: 'approved' }).eq('id', id);
    fetchAdminData();
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
          {/* 會員管理區 */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold text-slate-800 mb-4">會籍與繳費管理 ({pendingUsers.length})</h2>
            {pendingUsers.length === 0 ? <p className="text-slate-500 text-sm">目前無待處理項目。</p> : (
              <div className="space-y-4">
                {pendingUsers.map(user => (
                  <div key={user.id} className="p-4 border rounded-xl flex flex-col gap-3 bg-slate-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold">{user.full_name || '未填寫姓名'} <span className="text-xs text-slate-500">({user.class_year} 屆)</span></p>
                        <p className="text-xs mt-1">
                          狀態：{user.status === 'approved' ? <span className="text-green-600 font-bold">已核准</span> : <span className="text-orange-500 font-bold">待審核</span>} | 
                          繳費：{user.is_paid ? <span className="text-green-600 font-bold">已繳費</span> : <span className="text-red-600 font-bold">未繳費</span>}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {user.status !== 'approved' && (
                        <button onClick={() => approveUserStatus(user.id)} className="flex-1 bg-[#003366] text-white px-3 py-2 rounded-lg text-sm font-bold hover:bg-blue-900">
                          核准身分
                        </button>
                      )}
                      {!user.is_paid && (
                        <button onClick={() => toggleUserPayment(user.id, user.is_paid)} className="flex-1 bg-green-600 text-white px-3 py-2 rounded-lg text-sm font-bold hover:bg-green-700">
                          確認已繳費
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 企業審核區 */}
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