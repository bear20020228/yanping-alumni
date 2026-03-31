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
    email: '', password: '',
    fullName: '', gender: '', birthdate: '', nationalId: '',
    gradYearRoc: '', gradDept: '',
    highestEdu: '', university: '', department: '', experience: '', currentJob: '',
    mobilePhone: '', homePhone: '', companyPhone: '',
    zipCode: '', address: '',
    membershipType: '', bankLast5: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (authError) throw authError;
      
      const userId = authData.user?.id;
      if (!userId) throw new Error("帳號建立失敗。");

      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: userId,
            full_name: formData.fullName,
            gender: formData.gender,
            birthdate: formData.birthdate,
            national_id: formData.nationalId,
            class_year: formData.gradYearRoc ? parseInt(formData.gradYearRoc) : null,
            graduation_dept: formData.gradDept,
            phone: formData.mobilePhone,
            home_phone: formData.homePhone,
            company_phone: formData.companyPhone,
            zip_code: formData.zipCode,
            address: formData.address,
            highest_education: formData.highestEdu,
            university: formData.university,
            department: formData.department,
            experience: formData.experience,
            industry: formData.currentJob, 
            membership_type: formData.membershipType,
            bank_last_5: formData.bankLast5,
            status: 'pending',
            is_paid: false
          }
        ]);

      if (profileError) throw profileError;

      alert("註冊資料已送出！請確認是否已完成匯款，總會核對帳號末五碼無誤後將開通您的會籍。");
      router.push('/profile');

    } catch (error: any) {
      alert("註冊失敗: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-3xl mx-auto py-16 px-6">
        <div className="bg-white shadow-2xl rounded-[2.5rem] p-10 border border-slate-100">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-black text-[#003366] mb-3">校友入會申請書</h1>
            <p className="text-slate-500 text-sm">請填寫申請書並同時完成繳費手續，標示 * 為必填項目</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* 1. 系統登入設定 */}
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
              <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">系統登入設定</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">登入信箱 (Email) <span className="text-red-500">*</span></label>
                  <input required type="email" placeholder="example@email.com" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#003366] bg-white text-slate-900" 
                    onChange={(e) => setFormData({...formData, email: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">設定密碼 (至少 6 碼) <span className="text-red-500">*</span></label>
                  <input required type="password" minLength={6} placeholder="••••••••" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#003366] bg-white text-slate-900" 
                    onChange={(e) => setFormData({...formData, password: e.target.value})} />
                </div>
              </div>
            </div>

            {/* 2. 基本資料 */}
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
              <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">基本資料</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">姓名 <span className="text-red-500">*</span></label>
                  <input required type="text" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#003366] bg-white text-slate-900" 
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">性別 <span className="text-red-500">*</span></label>
                  <select required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#003366] bg-white text-slate-900"
                    onChange={(e) => setFormData({...formData, gender: e.target.value})}>
                    <option value="">請選擇</option>
                    <option value="男">男</option>
                    <option value="女">女</option>
                    <option value="不透露">不透露</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">出生日期 <span className="text-red-500">*</span></label>
                  <input required type="date" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#003366] bg-white text-slate-900" 
                    onChange={(e) => setFormData({...formData, birthdate: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">身分證字號 <span className="text-red-500">*</span></label>
                <input required type="text" placeholder="大寫英文字母與數字" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#003366] bg-white text-slate-900 uppercase" 
                  onChange={(e) => setFormData({...formData, nationalId: e.target.value.toUpperCase()})} />
              </div>
            </div>

            {/* 3. 延平學經歷 */}
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
              <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">延平學歷與現職</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">畢業年度 (民國)</label>
                  <input type="number" placeholder="例：85" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#003366] bg-white text-slate-900" 
                    onChange={(e) => setFormData({...formData, gradYearRoc: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">畢業部別</label>
                  <select className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#003366] bg-white text-slate-900"
                    onChange={(e) => setFormData({...formData, gradDept: e.target.value})}>
                    <option value="">請選擇</option>
                    <option value="初中部">初中部</option>
                    <option value="國中部">國中部</option>
                    <option value="高中部">高中部</option>
                    <option value="國中部與高中部皆有">國中部與高中部皆有</option>
                    <option value="電子科">電子科</option>
                    <option value="其他">其他</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">最高學歷 <span className="text-red-500">*</span></label>
                  <select required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#003366] bg-white text-slate-900"
                    onChange={(e) => setFormData({...formData, highestEdu: e.target.value})}>
                    <option value="">請選擇</option>
                    <option value="國中">國中</option>
                    <option value="高中">高中</option>
                    <option value="專科">專科</option>
                    <option value="大學">大學</option>
                    <option value="研究所">研究所</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">現職 (在學生請填學校/科系/年級)</label>
                  <input type="text" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#003366] bg-white text-slate-900" 
                    onChange={(e) => setFormData({...formData, currentJob: e.target.value})} />
                </div>
              </div>

              {/* 新增：大學與科系 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">就讀 / 畢業大學 (選填)</label>
                  <input type="text" placeholder="例：台灣大學" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#003366] bg-white text-slate-900" 
                    onChange={(e) => setFormData({...formData, university: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">就讀 / 畢業科系 (選填)</label>
                  <input type="text" placeholder="例：資訊工程學系" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#003366] bg-white text-slate-900" 
                    onChange={(e) => setFormData({...formData, department: e.target.value})} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">經歷 (選填)</label>
                <input type="text" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#003366] bg-white text-slate-900" 
                  onChange={(e) => setFormData({...formData, experience: e.target.value})} />
              </div>
            </div>

            {/* 4. 聯絡資訊 */}
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
              <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">聯絡資訊</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">行動電話 <span className="text-red-500">*</span></label>
                  <input required type="tel" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#003366] bg-white text-slate-900" 
                    onChange={(e) => setFormData({...formData, mobilePhone: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">住家電話</label>
                  <input type="tel" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#003366] bg-white text-slate-900" 
                    onChange={(e) => setFormData({...formData, homePhone: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">公司電話</label>
                  <input type="tel" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#003366] bg-white text-slate-900" 
                    onChange={(e) => setFormData({...formData, companyPhone: e.target.value})} />
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-1/3">
                  <label className="block text-sm font-bold text-slate-700 mb-2">郵遞區號 <span className="text-red-500">*</span></label>
                  <input required type="text" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#003366] bg-white text-slate-900" 
                    onChange={(e) => setFormData({...formData, zipCode: e.target.value})} />
                </div>
                <div className="w-2/3">
                  <label className="block text-sm font-bold text-slate-700 mb-2">通訊地址 <span className="text-red-500">*</span></label>
                  <input required type="text" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#003366] bg-white text-slate-900" 
                    onChange={(e) => setFormData({...formData, address: e.target.value})} />
                </div>
              </div>
            </div>

            {/* 5. 會籍與繳費 */}
            <div className="p-6 bg-[#003366] text-white rounded-2xl shadow-inner space-y-6">
              <h2 className="text-sm font-black text-orange-400 uppercase tracking-widest border-b border-white/20 pb-2">會費與繳費確認</h2>
              
              <div className="bg-white/10 p-4 rounded-xl text-sm leading-relaxed">
                <p className="font-bold mb-2">📌 繳費資訊</p>
                <ul className="list-disc list-inside space-y-1 text-slate-200">
                  <li><strong>匯款帳戶：</strong>台北富邦銀行 仁愛分行 (代碼 012-7048)</li>
                  <li><strong>帳號：</strong>00704-102-030564</li>
                  <li><strong>戶名：</strong>中華民國私立延平高級中學校友總會吳建鋐</li>
                </ul>
              </div>

              <div>
                <label className="block text-sm font-bold text-white mb-2">申請會籍種類 <span className="text-red-400">*</span></label>
                <select required className="w-full px-4 py-3 rounded-xl border-none focus:ring-2 focus:ring-orange-400 bg-white text-slate-900 font-bold"
                  onChange={(e) => setFormData({...formData, membershipType: e.target.value})}>
                  <option value="">請選擇入會身分</option>
                  <option value="一般會員">一般會員 (新入會首年 1,000元，爾後每年 500元)</option>
                  <option value="在學生會員">在學生會員 (新入會首年 750元，爾後每年 250元)</option>
                  <option value="永久會員">永久會員 (入會費一次性 10,000元)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-white mb-2">匯款帳號末五碼 (供對帳使用) <span className="text-red-400">*</span></label>
                <input required type="text" maxLength={5} placeholder="請輸入 5 位數字" className="w-full px-4 py-3 rounded-xl border-none focus:ring-2 focus:ring-orange-400 bg-white text-slate-900 font-bold tracking-widest" 
                  onChange={(e) => setFormData({...formData, bankLast5: e.target.value})} />
              </div>
            </div>

            <button disabled={loading} type="submit" className="w-full bg-[#004d00] text-white py-5 rounded-2xl font-black text-lg hover:bg-[#003300] active:scale-95 transition-all shadow-xl">
              {loading ? "處理中..." : "確認送出申請書"}
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