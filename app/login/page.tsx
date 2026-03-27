"use client";

import { useState } from 'react';
import Navbar from '../components/Navbar';
import { supabase } from '../../lib/supabase';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      
      // 登入成功後，直接導向個人的「數位校友卡」頁面
      router.push('/profile');
    } catch (error: any) {
      setMessage("登入失敗，請檢查 Email 或密碼是否正確。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <div className="flex-grow flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full p-8 bg-white shadow-xl rounded-3xl border border-slate-100 relative overflow-hidden">
          
          {/* 視覺裝飾 */}
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-green-500 opacity-10 rounded-full blur-2xl pointer-events-none"></div>

          <div className="text-center mb-8 relative z-10">
            <h1 className="text-3xl font-black text-[#004d00]">校友登入</h1>
            <p className="text-sm text-slate-500 mt-2">歡迎回到延平校友總會</p>
          </div>

          {message && (
            <div className="mb-6 p-3 bg-red-50 text-red-600 rounded-lg text-sm font-bold text-center">
              {message}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5 relative z-10">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Email 登入帳號</label>
              <input required type="email" className="w-full px-4 py-3 rounded-xl border border-slate-200 text-black focus:ring-2 focus:ring-[#004d00] outline-none transition-all" 
                onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">密碼</label>
              <input required type="password" className="w-full px-4 py-3 rounded-xl border border-slate-200 text-black focus:ring-2 focus:ring-[#004d00] outline-none transition-all" 
                onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
            </div>

            <button disabled={loading} type="submit" className="w-full bg-[#004d00] text-white py-4 rounded-xl font-black text-lg hover:bg-green-900 transition-all shadow-md mt-2 disabled:bg-slate-400">
              {loading ? "驗證中..." : "登入系統"}
            </button>
          </form>

          {/* 乾淨俐落的動線導引 */}
          <div className="mt-8 text-center border-t border-slate-100 pt-6 relative z-10">
            <p className="text-slate-500 text-sm mb-3">還沒有專屬的數位校友卡嗎？</p>
            <Link href="/register" className="inline-block bg-orange-50 text-orange-600 font-bold px-6 py-2 rounded-full hover:bg-orange-100 transition-colors">
              前往註冊新帳號 &rarr;
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}