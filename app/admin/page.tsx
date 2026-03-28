"use client";

import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/login');
      return;
    }

    const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
    if (data) setProfile({ ...data, email: session.user.email });
    setLoading(false);
  };

  // 上傳繳費證明邏輯
  const handleUploadProof = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // 1. 上傳圖片到 Storage (proofs bucket)
      const fileExt = file.name.split('.').pop();
      const fileName = `${session.user.id}_${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('proofs')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // 2. 獲取圖片公開網址
      const { data: { publicUrl } } = supabase.storage
        .from('proofs')
        .getPublicUrl(fileName);

      // 3. 更新資料庫 profiles 欄位
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ payment_proof_url: publicUrl })
        .eq('id', session.user.id);

      if (updateError) throw updateError;

      alert('證明已上傳！請等待管理員核對。');
      fetchUserProfile(); // 重新整理頁面狀態
    } catch (err: any) {
      alert('上傳失敗：' + err.message);
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center italic">讀取中...</div>;

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-3xl mx-auto py-12 px-6">
        <h1 className="text-3xl font-black text-[#003366] mb-8">我的帳號</h1>

        {/* 數位校友卡 (視覺保留) */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#004d00] to-[#002200] rounded-2xl shadow-2xl p-8 text-white mb-8">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-orange-500 opacity-20 rounded-full blur-2xl"></div>
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex justify-between items-start mb-10">
              <div>
                <h2 className="text-2xl font-black tracking-widest text-orange-400">延平中學校友總會</h2>
                <p className="text-sm text-green-100 mt-1 opacity-80 italic">Yanping Alumni Association</p>
              </div>
              <span className="px-3 py-1 bg-white/20 rounded-full text-[10px] font-bold tracking-wider backdrop-blur-sm uppercase">
                {profile.identity_type}
              </span>
            </div>
            <div>
              <p className="text-[10px] text-green-200 mb-1 uppercase tracking-widest">Name</p>
              <h3 className="text-3xl font-bold mb-4">{profile.full_name || '未填寫'}</h3>
              <div className="flex gap-8 border-t border-white/10 pt-4">
                <div>
                  <p className="text-[10px] text-green-200 uppercase">Class</p>
                  <p className="font-bold">第 {profile.class_year} 屆</p>
                </div>
                <div>
                  <p className="text-[10px] text-green-200 uppercase">Industry</p>
                  <p className="font-bold">{profile.industry || '未提供'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 繳費與審核狀態區 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-6">
          <div className="flex justify-between items-center border-b pb-4">
            <h3 className="font-bold text-slate-800">會籍審核狀態</h3>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${profile.status === 'approved' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
              {profile.status === 'approved' ? '✓ 已核准身分' : '待審核'}
            </span>
          </div>

          <div className="flex justify-between items-center border-b pb-4">
            <h3 className="font-bold text-slate-800">年度會費狀態</h3>
            {profile.is_paid ? (
              <span className="text-green-600 font-bold flex items-center gap-1">
                <span className="text-lg">●</span> 已完成繳費
              </span>
            ) : (
              <span className="text-red-500 font-bold flex items-center gap-1">
                <span className="text-lg animate-pulse">●</span> 未繳費 / 待確認
              </span>
            )}
          </div>

          {/* 如果還沒確認繳費，顯示上傳區 */}
          {!profile.is_paid && (
            <div className="pt-2">
              <p className="text-sm text-slate-500 mb-4">
                請轉帳至總會帳戶後，上傳轉帳成功截圖或收據以供核對。
              </p>
              
              {profile.payment_proof_url ? (
                <div className="bg-slate-50 p-4 rounded-xl border border-dashed border-slate-300 text-center">
                  <p className="text-xs text-blue-600 font-bold mb-2 italic">已上傳證明，審核中...</p>
                  <img src={profile.payment_proof_url} alt="Proof" className="h-32 mx-auto rounded-lg shadow-sm opacity-50" />
                  <label className="mt-3 block text-[10px] text-slate-400 cursor-pointer hover:text-blue-500">
                    重新上傳
                    <input type="file" className="hidden" accept="image/*" onChange={handleUploadProof} disabled={uploading} />
                  </label>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-2xl cursor-pointer hover:bg-slate-50 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <p className="mb-1 text-sm text-slate-600 font-bold">{uploading ? '正在上傳...' : '點擊上傳繳費證明'}</p>
                    <p className="text-xs text-slate-400">支援 JPG, PNG 格式</p>
                  </div>
                  <input type="file" className="hidden" accept="image/*" onChange={handleUploadProof} disabled={uploading} />
                </label>
              )}
            </div>
          )}
        </div>

        <div className="mt-8 text-center">
          <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-4">Yanping Alumni System v1.0</p>
          <button onClick={() => supabase.auth.signOut().then(() => router.push('/'))} className="text-slate-400 text-xs hover:text-red-500">
            登出帳號
          </button>
        </div>
      </div>
    </main>
  );
}