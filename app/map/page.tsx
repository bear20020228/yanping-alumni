"use client";

import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { supabase } from '../../lib/supabase';
import dynamic from 'next/dynamic';

const MapComponent = dynamic(() => import('./MapComponent'), { ssr: false });

export default function MapPage() {
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const fetchBusinesses = async () => {
    const { data } = await supabase.from('alumni_businesses').select('*').eq('status', 'approved');
    if (data) setBusinesses(data);
    setLoading(false);
  };

  // 搜尋過濾後的企業清單 (雖然地圖上全顯示，但側邊欄或列表可以連動)
  const filteredBusinesses = businesses.filter(biz => 
    biz.name.includes(searchQuery) || biz.address.includes(searchQuery)
  );

  return (
    <main className="min-h-screen bg-slate-900">
      <Navbar />
      <div className="max-w-6xl mx-auto py-8 px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-black text-white tracking-widest mb-2">延平星海</h1>
            <p className="text-green-200">找尋附近的校友光芒</p>
          </div>
          
          {/* 搜尋欄位 */}
          <div className="w-full md:w-72 relative">
            <input 
              type="text" 
              placeholder="搜尋校友企業或地址..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-800 text-white border border-green-900 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center text-white py-20 animate-pulse italic">正在讀取星圖...</div>
        ) : (
          <MapComponent businesses={filteredBusinesses} />
        )}
        
        {/* 搜尋結果的小統計 */}
        <p className="text-slate-500 text-xs mt-4 text-center">
          目前地圖上共有 {filteredBusinesses.length} 個螢光點點
        </p>
      </div>
    </main>
  );
}