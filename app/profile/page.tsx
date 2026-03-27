"use client";

import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      router.push('/login'); // 沒登入就踢回登入頁
      return;
    }

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (data) {
      setProfile({ ...data, email: session.user.email });
    }
    setLoading(false);
  };

  // 轉換身分標籤的文字
  const getIdentityText = (type: string) => {
    switch (type) {
      case 'student': return '在校生';
      case 'teacher': return '教職員';
      default: return '延平校友';
    }
  };

  if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center">載入中...</div>;
  if (!profile) return <div className="min-h-screen bg-slate-50 flex items-center justify-center">找不到資料</div>;

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-3xl mx-auto py-12 px-6">
        <h1 className="text-3xl font-black text-[#003366] mb-8">我的帳號</h1>

        {/* 狀態提示區塊 */}
        {profile.status !== 'approved' && (
          <div className="bg-orange-50 border-l-4 border-orange-500 p-4 mb-8 rounded-r-lg">
            <p className="text-orange-700 font-bold">審核中</p>
            <p className="text-orange-600 text-sm mt-1">您的校友身分正在等待總會人工審核，核准後即可解鎖完整功能（如查看企業地圖）。</p>
          </div>
        )}

        {/* 數位校友卡設計 */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#004d00] to-[#002200] rounded-2xl shadow-2xl p-8 text-white mb-10">
          {/* 背景裝飾 (螢火蟲/點點意象) */}
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-orange-500 opacity-20 rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-24 h-24 bg-green-400 opacity-10 rounded-full blur-xl"></div>
          
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex justify-between items-start mb-12">
              <div>
                <h2 className="text-2xl font-black tracking-widest text-orange-400">延平中學校友總會</h2>
                <p className="text-sm text-green-100 mt-1 opacity-80">Yanping Alumni Association</p>
              </div>
              <div className="text-right">
                <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-bold tracking-wider backdrop-blur-sm">
                  {getIdentityText(profile.identity_type)}
                </span>
              </div>
            </div>

            <div>
              <p className="text-sm text-green-200 mb-1">姓名 Name</p>
              <h3 className="text-3xl font-bold mb-4">{profile.full_name || '未填寫'}</h3>
              
              <div className="grid grid-cols-2 gap-4 border-t border-white/20 pt-4 mt-4">
                <div>
                  <p className="text-xs text-green-200">屆次 Class</p>
                  <p className="font-bold text-lg">第 {profile.class_year} 屆</p>
                </div>
                <div>
                  <p className="text-xs text-green-200">產業 Industry</p>
                  <p className="font-bold text-lg">{profile.industry || '未提供'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 系統資訊 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <h3 className="font-bold text-slate-800 mb-4 border-b pb-2">帳號資訊</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">登入信箱</span>
              <span className="font-medium">{profile.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">會費狀態</span>
              {profile.is_paid ? (
                <span className="text-green-600 font-bold">已繳清</span>
              ) : (
                <span className="text-red-600 font-bold">未繳費</span>
              )}
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}