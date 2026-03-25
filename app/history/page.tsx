"use client";

import Navbar from '../components/Navbar';

export default function HistoryPage() {
  // 延平歷史資料 (你可以隨時替換成真實的老照片網址與文案)
  const timelineEvents = [
    {
      year: '1946',
      title: '延平學院創立',
      description: '創辦人朱昭陽、宋進英等先輩，於二二八事件前夕，滿懷教育熱忱創辦了延平學院，為台灣人創辦的第一所正規大學。',
      image: 'https://images.unsplash.com/photo-1577412647305-991150c7d163?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80' // 暫時代替老照片
    },
    {
      year: '1948',
      title: '延平補校復校',
      description: '經歷二二八事件的挫折與停辦，先輩們不屈不撓，以「延平補校」之名在建國南路現址重新出發。',
      image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80' 
    },
    {
      year: '1959',
      title: '正式改制中學',
      description: '正式改制為「台北市私立延平高級中學」，成為台北市首屈一指的私立名校，開始孕育無數優秀校友。',
      image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
    },
    {
      year: '2020',
      title: '新大樓落成',
      description: '告別充滿回憶的舊校舍，現代化的新教學大樓落成，繼續承載新一代延平人的青春與夢想。',
      image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
    }
  ];

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto py-20 px-6">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-black text-[#003366] mb-4">延平時光走廊</h1>
          <p className="text-slate-500 text-lg">凝聚八十載歲月，回顧我們共同的青春記憶。</p>
        </div>

        {/* 時間軸主體 */}
        <div className="relative border-l-4 border-blue-900 ml-3 md:ml-1/2">
          {timelineEvents.map((event, index) => (
            <div key={index} className="mb-16 ml-8 relative group">
              {/* 時間軸上的圓點 */}
              <div className="absolute -left-[43px] top-1 h-6 w-6 rounded-full bg-white border-4 border-orange-500 shadow-md transition-transform group-hover:scale-125"></div>
              
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 transition-shadow hover:shadow-xl">
                <span className="text-orange-600 font-black text-xl tracking-wider mb-2 block">{event.year}</span>
                <h3 className="text-2xl font-bold text-[#003366] mb-3">{event.title}</h3>
                <p className="text-slate-600 leading-relaxed mb-4">{event.description}</p>
                
                {/* 假裝有老照片的區塊 */}
                <div className="w-full h-48 bg-slate-200 rounded-lg overflow-hidden relative">
                  <img src={event.image} alt={event.title} className="w-full h-full object-cover transition-transform duration-700 hover:scale-110" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}