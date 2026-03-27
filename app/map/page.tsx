"use client";

import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { supabase } from '../../lib/supabase';
import dynamic from 'next/dynamic';

// 動態載入地圖元件，關閉 SSR 避免 Window is not defined 錯誤
const MapComponent = dynamic(() => import('./MapComponent'), { ssr: false });

export default function MapPage() {
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const fetchBusinesses = async () => {
    // 只抓取已核准上架的企業
    const { data } = await supabase
      .from('alumni_businesses')
      .select('*')
      .eq('status', 'approved');
      
    if (data) setBusinesses(data);
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-slate-900">
      <Navbar />
      <div className="max-w-6xl mx-auto py-12 px-6">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-white tracking-widest mb-3">延平星海 <span className="text-orange-400">企業地圖</span></h1>
          <p className="text-green-200">串聯校友資源，讓延平人的光芒在地圖上閃耀</p>
        </div>

        {loading ? (
          <div className="text-center text-white py-20">讀取座標中...</div>
        ) : (
          <MapComponent businesses={businesses} />
        )}
      </div>
    </main>
  );
}