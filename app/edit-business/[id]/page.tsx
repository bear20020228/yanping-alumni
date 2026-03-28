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
      // 1. 檢查登入
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert('請先登入');
        router.push('/login');
        return;
      }

      // 2. 抓取該筆企業資料
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

      // 3. 權限防禦：確認這家店真的是他的
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      // 執行更新
      const { error } = await supabase
        .from('alumni_businesses')
        .update({
          name: formData.name,
          category: formData.category,
          address: formData.address,
          description: formData.description
        })
        .eq('id', params.id);

      if (error) throw error;
      
      alert('資料修改成功！');
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
            <p className="text-slate-500 text-sm font-bold">資料更新後，將同步顯示於企業地圖上</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">企業/店家名稱</label>
              <input required type="text" className="w-full px-4 py-4 rounded-2xl border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all font-bold text-slate-800"
                value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">產業類別</label>
              <input required type="text" className="w-full px-4 py-4 rounded-2xl border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all font-bold text-slate-800"
                value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">營業地址</label>
              <input required type="text" className="w-full px-4 py-4 rounded-2xl border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all font-bold text-slate-800"
                value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">校友專屬優惠或服務介紹</label>
              <textarea required rows={4} className="w-full px-4 py-4 rounded-2xl border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all font-bold text-slate-800 resize-none"
                value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
            </div>

            <div className="flex gap-4 pt-4">
              <button type="button" onClick={() => router.push('/profile')} className="w-1/3 bg-slate-100 text-slate-500 py-4 rounded-2xl font-black hover:bg-slate-200 transition-all">
                取消
              </button>
              <button disabled={saving} type="submit" className="w-2/3 bg-orange-500 text-white py-4 rounded-2xl font-black hover:bg-orange-600 transition-all shadow-lg active:scale-95">
                {saving ? '儲存中...' : '確認修改'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}