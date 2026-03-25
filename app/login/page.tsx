"use client";

import { useState } from 'react';
import Navbar from '../components/Navbar';
import { supabase } from '../../lib/supabase';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true); // 控制顯示「登入」還是「註冊」
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // 表單資料
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    classYear: ''
  });

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      if (isLogin) {
        // 【登入邏輯】
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        if (error) throw error;
        
        alert("登入成功！");
    window.location.href = '/';
      } else {
        // 【註冊邏輯】
        // 1. 先建立帳號密碼
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
        });
        if (authError) throw authError;

        // 2. 帳號建立成功後，把資料寫入 profiles 表
        if (authData.user) {
          const { error: profileError } = await supabase.from('profiles').insert([
            {
              id: authData.user.id, // 綁定剛剛建立的帳號 ID
              full_name: formData.fullName,
              class_year: parseInt(formData.classYear),
              // status, is_paid, role 這些在資料庫已經有預設值了，不用特別寫
            }
          ]);
          if (profileError) throw profileError;
        }

        alert("註冊成功！您的帳號目前正在審核中。");
        setIsLogin(true); // 註冊完切換回登入畫面
      }
    } catch (error: any) {
      setMessage("發生錯誤：" + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-md mx-auto mt-20 p-8 bg-white shadow-xl rounded-3xl border border-slate-100">
        <h1 className="text-3xl font-black text-center text-[#003366] mb-8">
          {isLogin ? "校友登入" : "註冊校友帳號"}
        </h1>

        {message && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium">
            {message}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-5">
          {!isLogin && (
            <>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">真實姓名</label>
                <input required type="text" className="w-full px-4 py-3 rounded-xl border border-slate-200 text-black" 
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">畢業屆次</label>
                <input required type="number" className="w-full px-4 py-3 rounded-xl border border-slate-200 text-black" placeholder="例如：55"
                  onChange={(e) => setFormData({...formData, classYear: e.target.value})} />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Email (將作為登入帳號)</label>
            <input required type="email" className="w-full px-4 py-3 rounded-xl border border-slate-200 text-black" 
              onChange={(e) => setFormData({...formData, email: e.target.value})} />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">密碼 (至少 6 碼)</label>
            <input required type="password" className="w-full px-4 py-3 rounded-xl border border-slate-200 text-black" 
              onChange={(e) => setFormData({...formData, password: e.target.value})} />
          </div>

          <button disabled={loading} type="submit" className="w-full bg-[#003366] text-white py-4 rounded-xl font-black text-lg hover:bg-blue-800 transition-all">
            {loading ? "處理中..." : (isLogin ? "登入" : "註冊並送出審核")}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button 
            onClick={() => { setIsLogin(!isLogin); setMessage(""); }} 
            className="text-slate-500 hover:text-[#003366] font-medium text-sm transition-colors"
          >
            {isLogin ? "還沒有帳號？點此註冊" : "已經有帳號了？點此登入"}
          </button>
        </div>
      </div>
    </main>
  );
}