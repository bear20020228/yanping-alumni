"use client";

import { useState } from 'react';
import Navbar from '../components/Navbar';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [classYear, setClassYear] = useState('');
  const [identityType, setIdentityType] = useState('alumni'); // 預設為校友
  const [industry, setIndustry] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. 建立 Auth 帳號
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('註冊失敗，請稍後再試。');

      // 2. 將詳細資料寫入 profiles 表格
      const { error: profileError } = await supabase.from('profiles').insert([
        {
          id: authData.user.id,
          full_name: fullName,
          class_year: parseInt(classYear) || null,
          identity_type: identityType,
          industry: industry,
          status: 'pending', // 預設為待審核
          is_paid: false,
        }
      ]);

      if (profileError) {
        console.error('Profile 寫入失敗:', profileError);
        throw new Error('帳號已建立，但資料寫入失敗，請聯繫管理員。');
      }

      alert('註冊成功！請等待管理員審核您的校友身分。');
      router.push('/profile'); // 註冊完直接導向數位校友卡頁面看狀態
      
    } catch (err: any) {
      setError(err.message || '發生未知錯誤');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <div className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black text-[#004d00]">加入校友總會</h2>
            <p className="text-sm text-slate-500 mt-2">建立您的專屬數位校友卡，串聯延平人脈</p>
          </div>

          {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 font-bold">{error}</div>}

          <form onSubmit={handleRegister} className="space-y-5">
            {/* 帳號密碼區 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-1">Email 信箱 (登入帳號)</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#004d00] outline-none transition-all" placeholder="your@email.com" />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-1">密碼 (至少 6 碼)</label>
                <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#004d00] outline-none transition-all" placeholder="••••••••" />
              </div>
            </div>

            <hr className="border-slate-200" />

            {/* 個人資料區 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-sm font-bold text-slate-700 mb-1">真實姓名</label>
                <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#004d00] outline-none" placeholder="例如：王小明" />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-sm font-bold text-slate-700 mb-1">畢業屆次</label>
                <input type="number" required value={classYear} onChange={(e) => setClassYear(e.target.value)} className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#004d00] outline-none" placeholder="例如：60" />
              </div>
              
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-sm font-bold text-slate-700 mb-1">身分別</label>
                <select value={identityType} onChange={(e) => setIdentityType(e.target.value)} className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#004d00] outline-none bg-white">
                  <option value="alumni">延平校友</option>
                  <option value="student">在校生</option>
                  <option value="teacher">教職員</option>
                </select>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-sm font-bold text-slate-700 mb-1">目前產業/職業</label>
                <input type="text" value={industry} onChange={(e) => setIndustry(e.target.value)} className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#004d00] outline-none" placeholder="例如：科技業、學生" />
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-[#004d00] text-white font-bold py-3.5 rounded-xl hover:bg-green-900 transition-colors shadow-lg mt-4 disabled:bg-slate-400">
              {loading ? '處理中...' : '送出註冊資料'}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}