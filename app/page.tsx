import Navbar from './components/Navbar';

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <Navbar />
      
      {/* 英雄區 */}
      <section className="py-24 bg-slate-50 text-center border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-4">
          <span className="text-blue-600 font-bold tracking-widest text-sm uppercase">Yanping Alumni</span>
          <h1 className="text-5xl font-black mt-4 mb-6 text-slate-900">凝聚延平情，共創校友力</h1>
          <p className="text-lg text-slate-600 mb-10">
            這是屬於延平人的專屬平台，無論你來自哪一屆，這裡永遠有學長姐的支持。
          </p>
          <div className="flex justify-center gap-4">
            <a href="/map" className="bg-[#003366] text-white px-8 py-4 rounded-xl font-bold hover:shadow-lg transition">查看校友地圖</a>
            <a href="/register" className="bg-white border border-slate-200 px-8 py-4 rounded-xl font-bold hover:bg-slate-50 transition">加入校友總會</a>
          </div>
        </div>
      </section>

      {/* 簡單公告區 */}
      <section className="py-16 max-w-5xl mx-auto px-6 text-center">
        <h2 className="text-2xl font-bold mb-8">最新公告</h2>
        <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
          <p className="text-blue-800 font-medium">✨ 2026 校友企業互助計畫正式啟動！歡迎各位學長姐登錄企業資料。</p>
        </div>
      </section>
    </main>
  );
}