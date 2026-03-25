"use client";

import Navbar from '../components/Navbar';

export default function HistoryPage() {
  const timelineEvents = [
    {
      year: '1946',
      title: '延平學院創立',
      description: '創辦人朱昭陽、宋進英等先輩，於二二八事件前夕，滿懷教育熱忱創辦了延平學院，為台灣人創辦的第一所正規大學。',
      image: '/LINE_ALBUM_待選延平桌曆照片_260326_1.jpg' // 黑白舊校門
    },
    {
      year: '1948',
      title: '延平補校復校',
      description: '經歷二二八事件的挫折與停辦，先輩們不屈不撓，以「延平補校」之名在建國南路現址重新出發。',
      image: '/LINE_ALBUM_待選延平桌曆照片_260326_3.jpg' // 舊教室大樓
    },
    {
      year: '1959',
      title: '正式改制中學',
      description: '正式改制為「台北市私立延平高級中學」，成為台北市首屈一指的私立名校，開始孕育無數優秀校友。',
      image: '/placeholder_middle_years.jpg'
    },
    {
      year: '2020',
      title: '新大樓落成',
      description: '告別充滿回憶的舊校舍，現代化的新教學大樓落成，繼續承載新一代延平人的青春與夢想。',
      image: '/LINE_ALBUM_待選延平桌曆照片_260326_2.jpg' // 施工中/新大樓
    }
  ];

  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      
      {/* 專業美化：專業校史Header區塊 */}
      <div className="relative h-[50vh] bg-cover bg-center" style={{ backgroundImage: "url('/LINE_ALBUM_待選延平桌曆照片_260326_2.jpg')" }}>
        {/* 遮罩：提升質感，提升文字清晰 */}
        <div className="absolute inset-0 bg-[#003366]/80" />
        
        <div className="relative max-w-7xl mx-auto px-6 h-full flex flex-col justify-center items-center text-center text-white pt-16">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight mb-4">
            延平時光走廊
          </h1>
          <p className="max-w-2xl text-lg md:text-xl text-blue-100 mb-12 font-medium leading-relaxed">
            凝聚八十載歲月，匯聚全球延平人的智慧與榮耀。
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto py-24 px-6">
        {/* 時間軸主體 */}
        <div className="relative border-l-4 border-blue-900 ml-3 md:ml-1/2">
          {timelineEvents.map((event, index) => (
            <div key={index} className="mb-16 ml-8 relative group">
              {/* 時間軸上的圓點 */}
              <div className="absolute -left-[43px] top-1 h-6 w-6 rounded-full bg-white border-4 border-orange-500 shadow-md transition-transform group-hover:scale-125"></div>
              
              <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm transition-all hover:shadow-2xl hover:border-slate-200 duration-300">
                <span className="text-orange-600 font-black text-2xl tracking-wider mb-2 block">{event.year}</span>
                <h3 className="text-3xl font-bold text-[#003366] mb-4">{event.title}</h3>
                <p className="text-slate-600 text-lg leading-relaxed mb-6 font-medium">{event.description}</p>
                
                {/* 使用你上傳照片的圖片區塊 */}
                {event.image.includes('placeholder') ? (
                  <div className="w-full h-48 bg-slate-200 rounded-2xl overflow-hidden relative flex items-center justify-center">
                    <span className="text-slate-400 font-bold text-lg">早年校史 (無照片)</span>
                  </div>
                ) : (
                  <div className="w-full h-64 bg-slate-200 rounded-2xl overflow-hidden relative shadow-lg">
                    <img src={event.image} alt={event.title} className="w-full h-full object-cover transition-transform duration-700 hover:scale-110" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}