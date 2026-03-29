"use client";

import { useState } from 'react';
import Navbar from '../components/Navbar';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    identityType: '', // 新增：身分別
    fullName: '',
    classYear: '',
    industry: '',
    phone: '',      
    address: ''     
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. 在 Supabase Auth 建立登入帳號
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (authError) throw authError;
      
      const userId = authData.user?.id;
      if (!userId) throw new Error("帳號建立失敗，請稍後再試。");

      // 針對非畢業校友，屆次直接設為 null
      const parsedClassYear = formData.identityType === '畢業校友' && formData.classYear 
        ? parseInt(formData.classYear) 
        : null;

      // 2. 將詳細資料寫入 profiles 表格
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: userId,
            identity_type: formData.identityType, // 存入身分別
            full_name: formData.fullName,
            class_year: parsedClassYear,          // 動態存入屆次
            industry: formData.industry || '未提供',
            phone: formData.phone,
            address: formData.address,
            status: 'pending', // 預設為待審核
            is_paid: false
          }
        ]);

      if (profileError) throw profileError;

      alert("🎉 註冊成功！請等待總會管理員審核您的身分。");
      router.push('/profile'); // 註冊完直接導向個人檔案頁面

    } catch (error: any) {
      alert("註冊失敗: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-xl mx-auto py-16 px-6">
        <div className="bg-white shadow-2xl rounded-[2.5rem] p-10 border border-slate-100">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-black text-[#003366] mb-3">校友註冊系統</h1>
            <p className="text-slate-500 text-sm">歡迎回到延平！請填寫您的真實資料，以便總會核對身分與寄送通知。</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* 帳號密碼區 */}
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
              <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Account Setup</h2>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">登入信箱 (Email)</label>
                <input required type="email" placeholder="example@email.com" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#003366] focus:ring-1 focus:ring-[#003366] transition-all bg-white text-slate-900" 
                  onChange={(e) => setFormData({...formData, email: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">設定密碼 (至少 6 碼)</label>
                <input required type="password" minLength={6} placeholder="••••••••" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#003366] focus:ring-1 focus:ring-[#003366] transition-all bg-white text-slate-900" 
                  onChange={(e) => setFormData({...formData, password: e.target.value})} />
              </div>
            </div>

            {/* 個人資料區 */}
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
              <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Personal Info</h2>
              
              {/* 新增：身分別選擇 */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">身分別</label>
                <select required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#003366] transition-all bg-white text-slate-900 appearance-none"
                  value={formData.identityType} 
                  onChange={(e) => setFormData({...formData, identityType: e.target.value})}>
                  <option value="" disabled>請選擇您的身分...</option>
                  <option value="畢業校友">畢業校友</option>
                  <option value="在校生">在校生</option>
                  <option value="校內員工">校內員工</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">真實姓名</label>
                  <input required type="text" placeholder="例：王小明" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#003366] transition-all bg-white text-slate-900" 
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})} />
                </div>
                
                {/* 條件渲染：只有選擇「畢業校友」才顯示這欄 */}
                {formData.identityType === '畢業校友' && (
                  <div className="animate-fade-in-up">
                    <label className="block text-sm font-bold text-slate-700 mb-2">畢業屆次</label>
                    <input required type="number" placeholder="例：55" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#003366] transition-all bg-white text-slate-900" 
                      onChange={(e) => setFormData({...formData, classYear: e.target.value})} />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">手機號碼</label>
                <input required type="tel" placeholder="例：0912345678" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#003366] transition-all bg-white text-slate-900" 
                  onChange={(e) => setFormData({...formData, phone: e.target.value})} />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">聯絡地址 (實體會刊/贈品寄送)</label>
                <input required type="text" placeholder="請填寫完整收件地址" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#003366] transition-all bg-white text-slate-900" 
                  onChange={(e) => setFormData({...formData, address: e.target.value})} />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">目前行業 / 任職公司 (選填)</label>
                <input type="text" placeholder="例：科技業 / 台積電" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#003366] transition-all bg-white text-slate-900" 
                  onChange={(e) => setFormData({...formData, industry: e.target.value})} />
              </div>
            </div>

            <button disabled={loading} type="submit" className="w-full bg-[#004d00] text-white py-4 rounded-2xl font-black text-lg hover:bg-[#003300] active:scale-95 transition-all shadow-lg">
              {loading ? "處理中..." : "確認註冊"}
            </button>
            
            <div className="text-center mt-6">
              <p className="text-sm text-slate-500">已經有帳號了？ <Link href="/login" className="text-[#003366] font-bold hover:underline">點此登入</Link></p>
            </div>
          </form>

        </div>
      </div>
    </main>
  );
}