"use client";

import Navbar from './components/Navbar';
import Link from 'next/link';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  // --- 核心攔截邏輯：確保點擊「加入企業地圖」時身分正確 ---
  const handleMapJoinClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    // 即時檢查 Session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      alert('請先登入會員，才能登錄您的企業地圖喔！');
      router.push('/login'); // 沒登入去登入頁
    } else {
      router.push('/add-business'); // 有登入去填寫企業資料頁
    }
  };

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      {/* 首頁 Hero 區塊 */}
      <div className="relative h-[90vh] bg-cover bg-center" style={{ backgroundImage: "url('/LINE_ALBUM_待選延平桌曆照片_260326_3.jpg')" }}>
        <div className="absolute inset-0 bg-[#004d00]/75" />
        
        <div className="relative max-w-7xl mx-auto px-6 h-full flex flex-col justify-center items-center text-center text-white pt-16">
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-tight mb-8">
            延平人，歡迎回家！<br />
            <span className="text-yellow-300 text-3xl md:text-5xl font-black uppercase">Yanping Alumni Platform</span>
          </h1>
          
          <p className="max-w-3xl text-xl md:text-2xl text-green-100 mb-12 font-bold leading-relaxed">
            這裡是延平人的專屬空間。不論您是第幾屆，<br className="hidden md:block" />
            都歡迎回來連結學長姐，找尋商機，回憶青春。
          </p>
          
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6">
            <Link href="/map" className="bg-orange-500 text-white px-12 py-5 rounded-full font-black text-xl hover:bg-orange-600 transition-all shadow-[0_10px_40px_rgba(249,115,22,0.4)] transform hover:-translate-y-1 duration-300">
              探索校友地圖
            </Link>
            
            {/* 這裡從 Link 改成 button，並綁定 handleMapJoinClick */}
            <button 
              onClick={handleMapJoinClick}
              className="bg-white text-[#004d00] px-12 py-5 rounded-full font-black text-xl hover:bg-green-50 transition-all shadow-xl transform hover:-translate-y-1 duration-300"
            >
              加入企業地圖
            </button>
          </div>
        </div>
      </div>

      {/* 下方功能簡介區塊 */}
      <div className="max-w-7xl mx-auto px-6 py-24 grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
        {[
          { icon: '🗺️', title: '企業地圖', desc: '串連全球校友企業，點擊尋找商機與服務' },
          { icon: '📅', title: '活動報名', desc: '掌握總會最新動態，一鍵報名精彩校友活動' },
          { icon: '📜', title: '時光走廊', desc: '凝聚八十載歲月，回顧我們共同的青春記憶' },
        ].map(item => (
          <div key={item.title} className="bg-white p-12 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 group">
            <div className="text-6xl mb-8 group-hover:scale-110 transition-transform duration-500">{item.icon}</div>
            <h3 className="text-2xl font-black text-[#004d00] mb-4 tracking-tighter">{item.title}</h3>
            <p className="text-slate-500 text-base font-bold leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* 底部 Footer */}
      <footer className="bg-[#002200] text-green-800/60 py-16 px-6 text-center border-t border-green-900">
        <p className="font-black tracking-widest uppercase text-sm mb-2">Yanping Alumni Association</p>
        <p className="text-xs font-bold opacity-50">© 2026 台北市私立延平高級中學校友總會. All Rights Reserved.</p>
      </footer>
    </main>
  );
}