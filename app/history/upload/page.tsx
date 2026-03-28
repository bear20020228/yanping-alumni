"use client";

import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import { supabase } from '../../../lib/supabase';
import { useRouter } from 'next/navigation';

export default function PhotoUploadPage() {
  const [desc, setDesc] = useState('');
  const [year, setYear] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true); // 新增：權限檢查狀態
  const router = useRouter();

  // --- 新增：網頁一載入，立刻檢查登入狀態 ---
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert('請先登入校友帳號，才能進入照片上傳專區喔！');
        router.push('/login'); // 沒登入直接踢去登入頁
      } else {
        setCheckingAuth(false); // 有登入，放行顯示表單
      }
    };
    checkSession();
  }, [router]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !year || !desc) return alert('所有欄位皆為必填');
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("請重新登入");

      const path = `${session.user.id}/${Date.now()}.${file.name.split('.').pop()}`;
      
      // 1. 上傳 Storage
      const { error: uploadError } = await supabase.storage.from('old_photos').upload(path, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('old_photos').getPublicUrl(path);

      // 2. 存入資料庫
      const { error: dbError } = await supabase.from('old_photos').insert([{
        url: publicUrl,
        storage_path: path,
        description: desc,
        year_taken: parseInt(year),
        uploader_id: session.user.id,
        status: 'pending'
      }]);

      if (dbError) throw dbError;

      alert('感謝分享！照片已送出審核。');
      router.push('/history');
    } catch (err: any) {
      alert('上傳失敗：' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // 檢查權限時顯示白畫面或 Loading，避免表單閃爍
  if (checkingAuth) return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-bold text-slate-400">驗證身分中...</div>;

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <div className="flex-grow flex items-center justify-center p-6 mt-10">
        <form onSubmit={handleUpload} className="max-w-md w-full bg-white p-10 rounded-[2rem] shadow-2xl border border-slate-100 space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black text-[#004d00]">珍貴回憶募集</h2>
            <p className="text-sm text-slate-500 mt-2">請提供照片、拍攝大約年份與簡短故事</p>
          </div>

          <div className="space-y-5">
            <div className="bg-slate-50 p-4 rounded-2xl border border-dashed border-slate-300">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">照片檔案</label>
              <input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)} className="w-full text-sm file:bg-[#004d00] file:text-white file:border-0 file:px-4 file:py-2 file:rounded-full file:cursor-pointer file:font-bold hover:file:bg-[#003300] transition-all" />
            </div>
            
            <div>
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">拍攝年份</label>
              <input type="number" placeholder="例: 1985" value={year} onChange={e => setYear(e.target.value)} className="w-full p-4 border border-slate-200 rounded-2xl bg-white focus:ring-2 focus:ring-[#004d00] outline-none transition-all font-bold" />
            </div>
            
            <div>
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">照片故事</label>
              <textarea placeholder="這張照片背後的故事..." value={desc} onChange={e => setDesc(e.target.value)} className="w-full p-4 border border-slate-200 rounded-2xl bg-white focus:ring-2 focus:ring-[#004d00] outline-none transition-all resize-none" rows={4} />
            </div>
          </div>

          <button disabled={loading} className="w-full mt-4 bg-orange-500 text-white py-4 rounded-2xl font-black hover:bg-orange-600 shadow-lg transition-all disabled:bg-slate-300 active:scale-95 text-lg">
            {loading ? '穿越時空中...' : '送出審核'}
          </button>
        </form>
      </div>
    </main>
  );
}