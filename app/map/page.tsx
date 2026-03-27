"use client";

import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { supabase } from '../../lib/supabase';
import dynamic from 'next/dynamic';

// 動態載入地圖，並確保類型匹配
const MapComponent = dynamic(() => import('./MapComponent'), { ssr: false });

export default function MapPage() {
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [isPaidUser, setIsPaidUser] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // 1. 抓取已核准企業
      const { data: bizData } = await supabase.from('alumni_businesses').select('*').eq('status', 'approved');
      if (bizData) setBusinesses(bizData);

      // 2. 檢查使用者登入狀態與繳費權限
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_paid')
          .eq('id', session.user.id)
          .single();
        
        setIsPaidUser(profile?.is_paid || false);
      }
    } catch (err) {
      console.error("資料抓取失敗", err);
    } finally {
      setLoading(false);
    }
  };

  // 搜尋過濾邏輯
  const filteredBusinesses = businesses.filter(biz => 
    biz.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    biz.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-slate-900">
      <Navbar />
      <div className="max-w-6xl mx-auto py-8 px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-black text-white tracking-widest mb-2 italic">延平星海</h1>
            <p className="text-green-200 text-sm">搜尋校友的光芒（僅限正式會員解鎖詳情）</p>
          </div>
          
          <input 
            type="text" 
            placeholder="搜尋名稱或地址..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full md:w-80 bg-slate-800 text-white border border-green-900 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500 outline-none transition-all"
          />
        </div>

        {loading ? (
          <div className="h-[600px] flex items-center justify-center text-white italic animate-pulse bg-slate-800 rounded-2xl">
            正在開啟星圖儀...
          </div>
        ) : (
          /* 關鍵點：這裡必須傳入 isPaidUser，紅字就會消失 */
          <MapComponent businesses={filteredBusinesses} isPaidUser={isPaidUser} />
        )}

        <div className="mt-6 flex justify-center gap-4 text-[10px] text-slate-500">
          <span>● 點擊螢光點查看詳情</span>
          <span>● 搜尋可自動定位</span>
          <span>● 需正式會員權限解鎖內容</span>
        </div>
      </div>
    </main>
  );
}