import Navbar from './components/Navbar';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      {/* 首頁 Hero 區塊：專業美化延平背景圖 */}
      <div className="relative h-[90vh] bg-cover bg-center" style={{ backgroundImage: "url('/LINE_ALBUM_待選延平桌曆照片_260326_3.jpg')" }}>
        {/* 延平藍遮罩：讓文字清晰，提升質感 */}
        <div className="absolute inset-0 bg-[#003366]/75" />
        
        <div className="relative max-w-7xl mx-auto px-6 h-full flex flex-col justify-center items-center text-center text-white pt-16">
          <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-tight mb-6">
            延平校友總會<br />
            <span className="text-orange-400">暨企業地圖</span>
          </h1>
          
          <p className="max-w-3xl text-xl md:text-2xl text-blue-100 mb-12 font-medium leading-relaxed">
            凝聚八十載歲月，匯聚全球延平人的智慧與商機。<br />
            探索校友企業，深化同窗情誼，共創母校榮耀。
          </p>
          
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6">
            <Link href="/map" className="bg-orange-500 text-white px-12 py-4 rounded-full font-bold text-lg hover:bg-orange-600 transition-colors shadow-lg transform hover:scale-105 duration-300">
              探索校友地圖
            </Link>
            <Link href="/register" className="bg-white text-[#003366] px-12 py-4 rounded-full font-bold text-lg hover:bg-blue-50 transition-colors shadow-lg transform hover:scale-105 duration-300">
              加入企業地圖
            </Link>
          </div>
        </div>
      </div>

      {/* 下方功能簡介區塊 (留白設計，提升高級感) */}
      <div className="max-w-7xl mx-auto px-6 py-24 grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
        {[
          { icon: '🗺️', title: '企業地圖', desc: '串連全球校友企業，點擊尋找商機與服務' },
          { icon: '📅', title: '活動報名', desc: '掌握總會最新動態，一鍵報名精彩校友活動' },
          { icon: '📜', title: '時光走廊', desc: '凝聚八十載歲月，回顧我們共同的青春記憶' },
        ].map(item => (
          <div key={item.title} className="bg-slate-50 p-10 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-shadow duration-300">
            <div className="text-5xl mb-6">{item.icon}</div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">{item.title}</h3>
            <p className="text-slate-600 text-base font-medium">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* 底部 Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 px-6 text-center border-t border-slate-800">
        <p className="font-medium">© 2026 台北市私立延平高級中學校友總會. All Rights Reserved.</p>
        <p className="text-xs mt-2">Yanping Alumni Association - Digital Platform MVP v1.0</p>
      </footer>
    </main>
  );
}