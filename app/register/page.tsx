"use client";

import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { supabase } from '../../lib/supabase';
import Link from 'next/link';

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false); // 控制有沒有權限看表單
  const [authMessage, setAuthMessage] = useState("正在檢查權限..."); 
  const [userProfile, setUserProfile] = useState<any>(null);

  const [formData, setFormData] = useState({
    businessName: '',
    classYear: '',
    category: '美食餐飲',
    address: '',
    offer: ''
  });

  // 網頁一載入，馬上檢查身分！
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      // 1. 沒登入？擋下來！
      if (!session) {
        setAuthMessage("請先登入會員，才能登錄企業地圖喔！");
        return;
      }

      // 2. 查他的詳細身分資料
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (!profile) {
        setAuthMessage("找不到會員資料，請聯絡管理員。");
        return;
      }

      // 3. 審核還沒通過？擋下來！
      if (profile.status !== 'approved') {
        setAuthMessage("您的校友身分尚在審核中，待管理員核准後即可登錄企業！");
        return;
      }

      // 4. 還沒繳交會費？擋下來！
      if (!profile.is_paid) {
        setAuthMessage("您尚未繳交會費。請完成繳費後，解鎖企業地圖登錄權限！");
        return;
      }

      // 恭喜通關！把表單放出來給他填
      setIsAuthorized(true);
      setUserProfile(profile);
    };

    checkAuth();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. 呼叫 Google Geocoding API 將地址轉為經緯度
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      const geoResponse = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(formData.address)}&key=${apiKey}`);
      const geoData = await geoResponse.json();

      if (geoData.status !== 'OK' || geoData.results.length === 0) {
        alert("找不到這個地址的座標，請確認地址是否正確完整（包含縣市區）！");
        setLoading(false);
        return;
      }

      const lat = geoData.results[0].geometry.location.lat;
      const lng = geoData.results[0].geometry.location.lng;

      // 2. 把資料與真實座標存入 Supabase
      const { error } = await supabase
        .from('alumni_businesses')
        .insert([
          { 
            user_id: userProfile.id,
            name: formData.businessName,
            class_year: parseInt(formData.classYear),
            category: formData.category,
            address: formData.address,
            offer: formData.offer,
            lat: lat,
            lng: lng,
            status: 'pending' 
          }
        ]);

      if (error) throw error;

      alert("🎉 企業資料已送出！待管理員審核通過後即會顯示於地圖上。");
      window.location.href = '/map'; 

    } catch (error: any) {
      alert("出錯了: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      <div className="max-w-2xl mx-auto py-16 px-6">
        <div className="bg-white shadow-xl rounded-3xl p-8 border border-slate-100">
          
          {/* 如果沒有權限，就顯示這個阻擋畫面 */}
          {!isAuthorized ? (
            <div className="text-center py-10">
              <div className="text-6xl mb-6">🔒</div>
              <h2 className="text-2xl font-black text-[#003366] mb-4">權限不足</h2>
              <p className="text-slate-600 mb-8 font-medium">{authMessage}</p>
              <Link href="/" className="bg-slate-200 text-slate-700 px-6 py-3 rounded-xl font-bold hover:bg-slate-300 transition-colors">
                回首頁
              </Link>
            </div>
          ) : (
            /* 如果有權限，才顯示原本的表單 */
            <>
              <div className="text-center mb-10">
                <h1 className="text-3xl font-black text-[#003366] mb-2">加入校友企業地圖</h1>
                <p className="text-slate-500">哈囉 {userProfile?.full_name}！請填寫您的企業資訊，送出後將由管理員審核。</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">畢業屆次</label>
                    <input required type="number" className="w-full px-4 py-3 rounded-xl border border-slate-200" 
                      onChange={(e) => setFormData({...formData, classYear: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">企業名稱</label>
                    <input required type="text" className="w-full px-4 py-3 rounded-xl border border-slate-200" 
                      onChange={(e) => setFormData({...formData, businessName: e.target.value})} />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">公司地址</label>
                  <input required type="text" className="w-full px-4 py-3 rounded-xl border border-slate-200" 
                    onChange={(e) => setFormData({...formData, address: e.target.value})} />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">專屬優惠 (選填)</label>
                  <textarea className="w-full px-4 py-3 rounded-xl border border-slate-200 h-24" 
                    onChange={(e) => setFormData({...formData, offer: e.target.value})} />
                </div>

                <button disabled={loading} type="submit" className="w-full bg-[#003366] text-white py-4 rounded-xl font-black text-lg hover:bg-blue-800 transition-all">
                  {loading ? "送出中..." : "送出審核"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </main>
  );
}