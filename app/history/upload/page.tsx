"use client";

import { useState } from 'react';
import Navbar from '../../components/Navbar';
import { supabase } from '../../../lib/supabase';
import { useRouter } from 'next/navigation';

export default function PhotoUploadPage() {
  const [desc, setDesc] = useState('');
  const [year, setYear] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !year || !desc) return alert('所有欄位皆為必填');
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const path = `${session?.user.id}/${Date.now()}.${file.name.split('.').pop()}`;
      
      // 1. 上傳 Storage
      await supabase.storage.from('old_photos').upload(path, file);
      const { data: { publicUrl } } = supabase.storage.from('old_photos').getPublicUrl(path);

      // 2. 存入資料庫
      await supabase.from('old_photos').insert([{
        url: publicUrl,
        storage_path: path,
        description: desc,
        year_taken: parseInt(year),
        uploader_id: session?.user.id,
        status: 'pending'
      }]);

      alert('感謝分享！照片已送出審核。');
      router.push('/history');
    } catch (err) {
      alert('上傳失敗');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <div className="flex-grow flex items-center justify-center p-6">
        <form onSubmit={handleUpload} className="max-w-md w-full bg-white p-8 rounded-[2rem] shadow-2xl space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-black text-[#004d00]">珍貴回憶募集</h2>
            <p className="text-sm text-slate-400 mt-2">請提供照片、拍攝大約年份與簡短故事</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-500 ml-1">照片檔案</label>
              <input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)} className="w-full mt-1 text-sm file:bg-[#004d00] file:text-white file:border-0 file:px-4 file:py-2 file:rounded-full file:cursor-pointer" />
            </div>
            
            <input type="number" placeholder="拍攝西元年 (例: 1985)" value={year} onChange={e => setYear(e.target.value)} className="w-full p-4 border rounded-2xl bg-slate-50 focus:ring-2 focus:ring-[#004d00] outline-none" />
            
            <textarea placeholder="這張照片背後的故事..." value={desc} onChange={e => setDesc(e.target.value)} className="w-full p-4 border rounded-2xl bg-slate-50 focus:ring-2 focus:ring-[#004d00] outline-none" rows={4} />
          </div>

          <button disabled={loading} className="w-full bg-orange-500 text-white py-4 rounded-2xl font-bold hover:bg-orange-600 shadow-lg transition-all disabled:bg-slate-300">
            {loading ? '穿越時空中...' : '送出審核'}
          </button>
        </form>
      </div>
    </main>
  );
}