"use client";

import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { supabase } from '../../lib/supabase';
import dynamic from 'next/dynamic';

// 動態載入地圖，並確保類型匹配
const MapComponent = dynamic(() => import('./MapComponent'), { ssr: false });

export default function MapPage() {
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // 抓取所有已核准的企業，不再檢查使用者的繳費狀態，直接全開！
      const { data: bizData } = await supabase
        .from('alumni_businesses')
        .select('*')
        .eq('status', 'approved');
      
      if (bizData) setBusinesses(bizData);
    } catch (err) {
      console.error("資料抓取失敗", err);
    } finally {
      setLoading(false);
    }
  };

  // 搜尋過濾邏輯
  const filteredBusinesses = businesses.filter(biz => 
    biz.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    biz.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
    biz.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-slate-900">
      <Navbar />
      <div className="max-w-6xl mx-auto py-12 px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-6">
          <div>
            <h1 className="text-4xl font-black text-white tracking-widest mb-3 italic uppercase">螢光點點地圖</h1>
            <p className="text-green-400 text-sm font-bold flex items-center gap-2">
              <span className="animate-pulse">●</span> 
              點擊探索校友企業，結帳出示「數位校友卡」享專屬優惠
            </p>
          </div>
          
          <div className="relative w-full md:w-96 group">
            <input 
              type="text" 
              placeholder="搜尋校友名稱、地址或產業..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-800/50 text-white border border-green-900/50 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-orange-500 focus:bg-slate-800 outline-none transition-all placeholder:text-slate-600 shadow-2xl"
            />
            <span className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-orange-500">🔍</span>
          </div>
        </div>

        {loading ? (
          <div className="h-[650px] flex flex-col items-center justify-center text-white italic bg-slate-800/50 border border-white/5 rounded-[2.5rem] shadow-inner">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mb-4"></div>
            <p className="text-slate-400 font-bold tracking-widest">正在掃描星系座標...</p>
          </div>
        ) : (
          <div className="rounded-[2.5rem] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] border-4 border-slate-800 bg-slate-800">
            {/* 強制將 isPaidUser 設為 true，讓 MapComponent 顯示所有詳情 */}
            <MapComponent businesses={filteredBusinesses} isPaidUser={true} />
          </div>
        )}

        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
            <h3 className="text-orange-500 font-black text-xs uppercase mb-2 tracking-widest">How to use</h3>
            <p className="text-slate-400 text-xs leading-relaxed">點擊地圖上的閃爍星點，即可查看該校友企業的詳細地址與專屬優惠內容。</p>
          </div>
          <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
            <h3 className="text-green-500 font-black text-xs uppercase mb-2 tracking-widest">Exclusive Offer</h3>
            <p className="text-slate-400 text-xs leading-relaxed">請於結帳前主動出示本站「數位校友卡」，即可享有該店家提供的校友福利。</p>
          </div>
          <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
            <h3 className="text-blue-500 font-black text-xs uppercase mb-2 tracking-widest">Join Map</h3>
            <p className="text-slate-400 text-xs leading-relaxed">如果您也是創業校友，歡迎登入後點擊右上角「加入企業地圖」登錄您的據點。</p>
          </div>
        </div>
      </div>
    </main>
  );
}