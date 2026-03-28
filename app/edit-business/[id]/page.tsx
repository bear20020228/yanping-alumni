"use client";

import { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import { supabase } from '../../../lib/supabase';
import { useRouter, useParams } from 'next/navigation';

export default function EditBusinessPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    address: '',
    description: ''
  });

  useEffect(() => {
    const fetchBusinessData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert('請先登入');
        router.push('/login');
        return;
      }

      const { data, error } = await supabase
        .from('alumni_businesses')
        .select('*')
        .eq('id', params.id)
        .single();

      if (error || !data) {
        alert('找不到該筆企業資料或已被刪除');
        router.push('/profile');
        return;
      }

      if (data.user_id !== session.user.id) {
        alert('權限錯誤：您只能修改自己登錄的企業資料');
        router.push('/profile');
        return;
      }

      setFormData({
        name: data.name || '',
        category: data.category || '',
        address: data.address || '',
        description: data.description || ''
      });
      setLoading(false);
    };

    fetchBusinessData();
  }, [params.id, router]);

  // 加入與新增企業相同的座標轉換邏輯，確保修改地址後地圖圖釘會跟著動
  const getCoordinates = async (fullAddress: string) => {
    const searchTerms = [
      fullAddress, 
      fullAddress.split('號')[0], 
      fullAddress.substring(0, fullAddress.indexOf('區') + 1) 
    ];

    for (const term of searchTerms) {
      if (!term) continue;
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(term)}&limit=1`,
          { headers: { 'User-Agent': 'YanpingAlumniApp/1.0' } }
        );
        const data = await res.json();
        if (data && data.length > 0) {
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
    setSaving(true);
    try {
      // 1. 重新計算新地址的座標
      const coords = await getCoordinates(formData.address);
      if (!coords) {
        throw new Error('無法辨識該地址，請嘗試輸入更完整的地址（包含縣市與區）。');
      }

      // 2. 執行更新，並強制將狀態改回 pending
      const { error } = await supabase
        .from('alumni_businesses')
        .update({
          name: formData.name,
          category: formData.category,
          address: formData.address,
          description: formData.description,
          lat: coords.lat,       // 更新緯度
          lng: coords.lng,       // 更新經度
          status: 'pending'      // 核心防護：強制重新進入審核狀態
        })
        .eq('id', params.id);

      if (error) throw error;
      
      alert('資料修改成功！已重新送出審核，期間將暫時從公開地圖隱藏。');
      router.push('/profile');
    } catch (err: any) {
      alert('修改失敗：' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-bold text-slate-400">讀取資料中...</div>;

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-2xl mx-auto py-16 px-6">
        <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl border border-slate-100">
          <div className="mb-8">
            <h1 className="text-3xl font-black text-[#003366] mb-2 tracking-tighter">修改企業資料</h1>
            {/* 明確警告使用者修改的後果 */}
            <div className="bg-orange-50 border-l-4 border-orange-500 p-4 mt-4 rounded-r-lg">
              <p className="text-orange-700 text-sm font-bold">⚠️ 審核機制提醒</p>
              <p className="text-orange-600 text-xs mt-1">為維護地圖資訊品質，送出修改後，您的企業將短暫從地圖上隱藏並「重新進入審核流程」，待總會管理員確認無誤後即刻恢復上架。</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">企業/店家名稱</label>
              <input required type="text" className="w-full px-4 py-4 rounded-2xl border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all font-bold text-slate-800 bg-white"
                value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">產業類別</label>
              <input required type="text" className="w-full px-4 py-4 rounded-2xl border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all font-bold text-slate-800 bg-white"
                value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">營業地址</label>
              <input required type="text" className="w-full px-4 py-4 rounded-2xl border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all font-bold text-slate-800 bg-white"
                value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">校友專屬優惠或服務介紹</label>
              <textarea required rows={4} className="w-full px-4 py-4 rounded-2xl border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all font-bold text-slate-800 bg-white resize-none"
                value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
            </div>

            <div className="flex gap-4 pt-4">
              <button type="button" onClick={() => router.push('/profile')} className="w-1/3 bg-slate-100 text-slate-500 py-4 rounded-2xl font-black hover:bg-slate-200 transition-all">
                取消
              </button>
              <button disabled={saving} type="submit" className="w-2/3 bg-orange-500 text-white py-4 rounded-2xl font-black hover:bg-orange-600 transition-all shadow-lg active:scale-95">
                {saving ? '重新定位與送審...' : '確認修改並重新送審'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}