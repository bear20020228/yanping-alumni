"use client";

import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [sessionUser, setSessionUser] = useState<any>(null);
  const [myBusinesses, setMyBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  // 控制編輯模式
  const [isEditing, setIsEditing] = useState(false);
  const [needsCompletion, setNeedsCompletion] = useState(false);
  
  // 表單狀態
  const [editData, setEditData] = useState({ 
    phone: '', 
    address: '', 
    industry: '',
    identity_type: '',
    class_year: '' 
  });
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }
      setSessionUser(session.user);

      // 1. 抓取個人資料
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error) {
        setErrorMsg(error.message);
      } else if (data) {
        setProfile({ ...data, email: session.user.email });
        
        const initialEditData = {
          phone: data.phone || '',
          address: data.address || '',
          industry: data.industry || '',
          identity_type: data.identity_type || '',
          class_year: data.class_year?.toString() || ''
        };

        if (!data.phone || !data.address) {
          setNeedsCompletion(true);
          setEditData(initialEditData);
        } else {
          setNeedsCompletion(false);
          setEditData(initialEditData);
        }
      }

      // 2. 抓取企業資料
      const { data: bizData } = await supabase
        .from('alumni_businesses')
        .select('*')
        .eq('user_id', session.user.id);
      
      if (bizData) setMyBusinesses(bizData);

    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      // 判斷是否更改了身分，如果是，則需要重新審核
      const isIdentityChanged = profile.identity_type !== editData.identity_type;
      
      const updatePayload: any = {
        phone: editData.phone,
        address: editData.address,
        industry: editData.industry,
        identity_type: editData.identity_type,
        class_year: editData.identity_type === '畢業校友' && editData.class_year ? parseInt(editData.class_year) : null,
      };

      if (isIdentityChanged) {
        updatePayload.status = 'pending'; // 強制重新審核
      }

      const { error } = await supabase
        .from('profiles')
        .update(updatePayload)
        .eq('id', sessionUser.id);

      if (error) throw error;
      
      alert(isIdentityChanged ? '身分資料已更新！將重新進入總會審核流程。' : '資料已更新完成！');
      setIsEditing(false);
      fetchUserProfile(); 
    } catch (err: any) {
      alert('儲存失敗：' + err.message);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleUploadProof = async (e: React.ChangeEvent<HTMLInputElement>) => {
    // ... 原本的上傳邏輯保持不變 ...
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      if (!sessionUser) return;
      const fileExt = file.name.split('.').pop();
      const fileName = `${sessionUser.id}_${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage.from('proofs').upload(fileName, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('proofs').getPublicUrl(fileName);
      const { error: updateError } = await supabase.from('profiles').update({ payment_proof_url: publicUrl }).eq('id', sessionUser.id);
      if (updateError) throw updateError;

      alert('證明已上傳！請等待管理員核對。');
      fetchUserProfile(); 
    } catch (err: any) {
      alert('上傳失敗：' + err.message);
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-bold text-slate-400 text-sm">LOADING...</div>;

  if (!profile) return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-xl mx-auto mt-20 p-10 bg-white shadow-2xl rounded-[2.5rem] text-center border border-slate-200">
        <span className="text-4xl">⚠️</span>
        <h2 className="text-xl font-black text-slate-800 mt-4 mb-2">資料抓取失敗</h2>
        <button onClick={() => fetchUserProfile()} className="w-full mt-4 bg-[#003366] text-white py-4 rounded-2xl font-black text-sm active:scale-95 transition-all shadow-lg">重新整理</button>
      </div>
    </main>
  );

  // --- 共用的表單內容 (給強制補齊和主動編輯使用) ---
  const ProfileForm = () => (
    <form onSubmit={handleSaveProfile} className="space-y-5">
      <div>
        <label className="block text-sm font-bold text-slate-700 mb-2">身分別 <span className="text-red-500">*</span></label>
        <select required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#003366] bg-white text-slate-900"
          value={editData.identity_type} 
          onChange={(e) => setEditData({...editData, identity_type: e.target.value})}>
          <option value="" disabled>請選擇您的身分...</option>
          <option value="畢業校友">畢業校友</option>
          <option value="在校生">在校生</option>
          <option value="校內員工">校內員工</option>
        </select>
      </div>

      {editData.identity_type === '畢業校友' && (
        <div className="animate-fade-in-up">
          <label className="block text-sm font-bold text-slate-700 mb-2">畢業屆次 <span className="text-red-500">*</span></label>
          <input required type="number" placeholder="例：55" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#003366] bg-white text-slate-900" 
            value={editData.class_year} onChange={(e) => setEditData({...editData, class_year: e.target.value})} />
        </div>
      )}

      <div>
        <label className="block text-sm font-bold text-slate-700 mb-2">手機號碼 <span className="text-red-500">*</span></label>
        <input required type="tel" placeholder="例：0912345678" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#003366] bg-white text-slate-900" 
          value={editData.phone} onChange={(e) => setEditData({...editData, phone: e.target.value})} />
      </div>
      <div>
        <label className="block text-sm font-bold text-slate-700 mb-2">收信地址 <span className="text-red-500">*</span></label>
        <input required type="text" placeholder="請填寫完整地址" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#003366] bg-white text-slate-900" 
          value={editData.address} onChange={(e) => setEditData({...editData, address: e.target.value})} />
      </div>
      <div>
        <label className="block text-sm font-bold text-slate-700 mb-2">所屬行業 / 公司 (選填)</label>
        <input type="text" placeholder="例：科技業 / 台積電" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#003366] bg-white text-slate-900" 
          value={editData.industry} onChange={(e) => setEditData({...editData, industry: e.target.value})} />
      </div>
      
      <div className="flex gap-4 mt-6">
        {!needsCompletion && (
          <button type="button" onClick={() => setIsEditing(false)} className="w-1/3 bg-slate-100 text-slate-500 py-4 rounded-2xl font-black hover:bg-slate-200 transition-all">
            取消
          </button>
        )}
        <button disabled={savingProfile} type="submit" className={`${needsCompletion ? 'w-full' : 'w-2/3'} bg-[#004d00] text-white py-4 rounded-2xl font-black shadow-lg hover:bg-[#003300] active:scale-95 transition-all`}>
          {savingProfile ? '儲存中...' : '確認送出'}
        </button>
      </div>
    </form>
  );

  // --- 強制補齊資料畫面 ---
  if (needsCompletion) return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-xl mx-auto py-16 px-6">
        <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl border border-slate-100">
          <div className="text-center mb-8">
            <span className="text-4xl mb-4 block">📋</span>
            <h1 className="text-2xl font-black text-[#003366] mb-2">請補齊聯絡資料</h1>
            <p className="text-slate-500 text-sm">為了確保活動聯絡與會刊寄送，請填寫您的基本資料即可解鎖校友專區。</p>
          </div>
          <ProfileForm />
        </div>
      </div>
    </main>
  );

  // --- 主動編輯資料畫面 ---
  if (isEditing) return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-xl mx-auto py-16 px-6">
        <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl border border-slate-100">
          <div className="mb-8">
            <h1 className="text-2xl font-black text-[#003366] mb-2">修改個人資料</h1>
            {profile.identity_type !== editData.identity_type && (
              <div className="bg-orange-50 border-l-4 border-orange-500 p-3 mt-4 text-xs text-orange-700 font-bold">
                ⚠️ 注意：更動身分別將會重新觸發人工審核流程。
              </div>
            )}
          </div>
          <ProfileForm />
        </div>
      </div>
    </main>
  );

  // --- 原本的數位校友卡主畫面 ---
  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-3xl mx-auto py-12 px-6">
        <div className="flex justify-between items-end mb-8">
          <h1 className="text-3xl font-black text-[#003366] tracking-tighter">我的帳號中心</h1>
          <button onClick={() => setIsEditing(true)} className="text-sm font-black text-orange-500 hover:text-orange-600 bg-orange-50 px-4 py-2 rounded-xl transition-colors">
            ✏️ 編輯個人資料
          </button>
        </div>

        {profile?.status !== 'approved' && (
          <div className="bg-orange-50 border-l-4 border-orange-500 p-4 mb-8 rounded-r-lg shadow-sm">
            <p className="text-orange-700 font-bold">審核中</p>
            <p className="text-orange-600 text-sm mt-1">您的校友身分正在等待總會人工審核，核准後即可解鎖完整功能。</p>
          </div>
        )}

        {/* 數位校友卡 */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#004d00] to-[#002200] rounded-[2.5rem] shadow-2xl p-10 text-white mb-10">
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex justify-between items-start mb-12">
              <div>
                <h2 className="text-2xl font-black tracking-widest text-orange-400">延平中學校友總會</h2>
                <p className="text-[10px] text-green-300 mt-1 opacity-70 tracking-[0.2em] font-bold">DIGITAL ALUMNI CARD</p>
              </div>
              <span className="inline-block px-4 py-1.5 bg-white/10 rounded-full text-[10px] font-black tracking-widest backdrop-blur-md uppercase border border-white/20">
                {profile?.role === 'admin' ? '系統管理員' : (profile?.identity_type || '會員')}
              </span>
            </div>

            <div>
              <p className="text-[10px] text-green-300 mb-1 uppercase tracking-[0.2em] font-black opacity-60">Full Name</p>
              <h3 className="text-4xl font-black mb-8 tracking-tight">{profile?.full_name}</h3>
              <div className="flex gap-12 border-t border-white/10 pt-6">
                {profile?.class_year && (
                  <div><p className="text-[10px] text-green-300 font-bold uppercase mb-1">Class</p><p className="font-black text-xl">第 {profile?.class_year} 屆</p></div>
                )}
                <div><p className="text-[10px] text-green-300 font-bold uppercase mb-1">Phone</p><p className="font-black text-xl">{profile?.phone}</p></div>
              </div>
            </div>
          </div>
        </div>

        {/* 帳號狀態與繳費區塊 */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200 space-y-6 mb-10">
          <div className="flex justify-between items-center border-b border-slate-50 pb-6">
            <h3 className="font-black text-slate-800 text-sm italic">登入信箱</h3>
            <span className="text-slate-600 text-sm">{profile?.email}</span>
          </div>
          <div className="flex justify-between items-center border-b border-slate-50 pb-6">
            <h3 className="font-black text-slate-800 text-sm italic">會籍審核狀態</h3>
            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black ${profile?.status === 'approved' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
              {profile?.status === 'approved' ? 'VERIFIED' : 'PENDING'}
            </span>
          </div>
          <div className="flex justify-between items-center border-b border-slate-50 pb-6">
            <h3 className="font-black text-slate-800 text-sm italic">年度會費確認</h3>
            <span className={`text-xs font-black ${profile?.is_paid ? "text-green-600" : "text-red-500"}`}>
              {profile?.is_paid ? '✓ 已完成繳費' : '✕ 待確認 / 未繳費'}
            </span>
          </div>

          {!profile?.is_paid && (
            <div className="pt-4">
              {profile?.payment_proof_url ? (
                <div className="bg-slate-50 p-6 rounded-2xl border border-dashed border-slate-300 text-center">
                  <p className="text-xs text-[#003366] font-bold mb-3 italic">已上傳證明，審核中</p>
                  <img src={profile.payment_proof_url} alt="Proof" className="h-40 mx-auto rounded-lg shadow-md opacity-75 object-cover" />
                  <label className="mt-4 inline-block text-[10px] text-slate-400 cursor-pointer hover:text-[#003366] transition-colors">
                    重選檔案並更換
                    <input type="file" className="hidden" accept="image/*" onChange={handleUploadProof} disabled={uploading} />
                  </label>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-slate-300 rounded-2xl cursor-pointer hover:bg-slate-50 transition-colors">
                  <span className="text-3xl mb-2">📸</span>
                  <p className="text-sm text-slate-600 font-bold">{uploading ? '上傳中...' : '點擊上傳繳費截圖'}</p>
                  <input type="file" className="hidden" accept="image/*" onChange={handleUploadProof} disabled={uploading} />
                </label>
              )}
            </div>
          )}
        </div>

        {/* 我的企業管理區塊 */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200">
          <h2 className="text-xl font-black text-[#003366] mb-6 border-l-4 border-orange-500 pl-4">我的企業管理</h2>
          
          {myBusinesses.length === 0 ? (
            <div className="bg-slate-50 rounded-2xl p-8 text-center border border-dashed border-slate-300">
              <span className="text-4xl block mb-3">🏢</span>
              <p className="text-slate-500 text-sm font-bold mb-4">您尚未登錄任何企業資訊</p>
              <Link href="/add-business" className="inline-block bg-orange-500 text-white px-6 py-2.5 rounded-full font-black text-sm hover:bg-orange-600 transition-all shadow-md active:scale-95">
                立即加入企業地圖
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {myBusinesses.map((biz) => (
                <div key={biz.id} className="flex flex-col md:flex-row justify-between md:items-center bg-slate-50 p-5 rounded-2xl border border-slate-100 group hover:border-orange-200 transition-colors gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-black text-lg text-slate-800">{biz.name}</h3>
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-black ${biz.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {biz.status === 'approved' ? '已核准上架' : '審核中'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium">📍 {biz.address} | 🏷️ {biz.category}</p>
                  </div>
                  
                  <Link href={`/edit-business/${biz.id}`} className="text-center bg-white border border-slate-200 text-slate-600 px-5 py-2.5 rounded-xl text-sm font-black hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 transition-all shadow-sm">
                    修改資料
                  </Link>
                </div>
              ))}
              
              <div className="pt-4 border-t border-slate-100 text-right">
                <Link href="/add-business" className="text-sm font-black text-orange-500 hover:text-orange-600 transition-colors">
                  + 新增其他企業
                </Link>
              </div>
            </div>
          )}
        </div>

        <div className="mt-12 text-center">
          <button onClick={() => supabase.auth.signOut().then(() => router.push('/'))} className="text-slate-400 text-[10px] font-black tracking-[0.2em] uppercase hover:text-red-500 transition-colors">
            Logout Security Session
          </button>
        </div>
      </div>
    </main>
  );
}