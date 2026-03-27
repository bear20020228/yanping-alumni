"use client";

import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';

export default function AddBusinessPage() {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  // 確保只有登入的會員才能進來
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) router.push('/login');
    };
    checkUser();
  }, [router]);

  // 強化版：座標轉換（具備自動退階機制）
  const getCoordinates = async (fullAddress: string) => {
    const searchTerms = [
      fullAddress, // 1. 先試完整地址
      fullAddress.split('號')[0], // 2. 失敗的話，去掉門牌號碼試試（只留到路段）
      fullAddress.substring(0, fullAddress.indexOf('區') + 1) // 3. 再失敗，至少定位到行政區
    ];

    for (const term of searchTerms) {
      if (!term) continue;
      try {
        // 加入 User-Agent 是 Nominatim 的要求，沒加可能會被封鎖
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(term)}&limit=1`,
          { headers: { 'User-Agent': 'YanpingAlumniApp/1.0' } }
        );
        const data = await res.json();
        if (data && data.length > 0) {
          console.log(`成功定位於：${term}`);
          return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
        }
      } catch (err) {
        console.error("搜尋發生錯誤", err);
      }
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. 先把地址拿去換算座標
      const coords = await getCoordinates(address);
      if (!coords) {
        throw new Error('無法辨識該地址，請嘗試輸入更完整的地址（包含縣市與區）。');
      }

      // 2. 寫入企業資料庫 (帶上轉換好的座標)
      const { error: insertError } = await supabase.from('alumni_businesses').insert([
        {
          name,
          address,
          description,
          lat: coords.lat,
          lng: coords.lng,
          status: 'pending' // 預設為待審核
        }
      ]);

      if (insertError) throw insertError;

      alert('企業資料已送出！請等待總會審核，核准後將會在地圖上發光顯示。');
      router.push('/map'); // 送出後導向地圖頁面
      
    } catch (err: any) {
      setError(err.message || '發生未知錯誤');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <div className="flex-grow flex items-center justify-center py-12 px-4">
        <div className="max-w-xl w-full bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black text-[#004d00]">登錄企業資訊</h2>
            <p className="text-sm text-slate-500 mt-2">將您的事業放上延平星海，提供專屬優惠串聯校友人脈</p>
          </div>

          {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 font-bold">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">企業/店鋪名稱</label>
              <input required type="text" value={name} onChange={(e) => setName(e.target.value)} 
                className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-400 outline-none" 
                placeholder="例如：延平牛肉麵" />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">完整實體地址 (將自動標記於地圖)</label>
              <input required type="text" value={address} onChange={(e) => setAddress(e.target.value)} 
                className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-400 outline-none" 
                placeholder="例如：台北市大安區建國南路一段275號" />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">校友專屬互惠方案 / 企業簡介</label>
              <textarea required value={description} onChange={(e) => setDescription(e.target.value)} rows={4}
                className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-400 outline-none" 
                placeholder="例如：出示數位校友卡享有九折優惠..." />
            </div>

            <button disabled={loading} type="submit" 
              className="w-full bg-orange-500 text-white font-bold py-3.5 rounded-xl hover:bg-orange-600 transition-colors shadow-lg mt-4 disabled:bg-slate-400">
              {loading ? '正在定位與送出資料...' : '送出審核'}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}