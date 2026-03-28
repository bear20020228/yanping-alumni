"use client";

import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';

export default function HistoryPage() {
  const [userPhotos, setUserPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // 1. 根據詳細校史整理的靜態資料
  const timelineEvents = [
    {
      year: '1945',
      title: '播種：培養大臣的夙願',
      description: '日本投降後，創辦人朱昭陽與宋進英先生秉持「生命的意義，不在當大臣，而在培養大臣」的理念，在劉明先生等企業家資助下籌創「延平大學」，並由董事長林獻堂先生命名，紀念鄭成功不屈不撓的精神。'
    },
    {
      year: '1946',
      title: '誕生：荒野暗夜中的螢光',
      description: '九月正式招收經、法兩科學生。雙十節夜晚在開南商工操場舉行創校典禮，一千一百多名學子在燭影中聆聽朱先生訓詞：「我們要當荒野暗夜中的螢光」。這是台灣人創辦的第一所大學。'
    },
    {
      year: '1947',
      title: '創傷：消失在塵埃中的五個月',
      description: '二二八事件爆發，校園遭軍隊假借名義命令停辦。五個月的蓊鬱榮耀化作創痕，師生四散，延平學院在時空中彷彿成了消失的傳說。'
    },
    {
      year: '1948',
      title: '韌性：補習學校艱難復校',
      description: '朱昭陽先生積極奔走，九月以「延平高中補習學校」名義先行復校。雖地位低微但評價極高，包含前總統李登輝先生等多位碩彥均曾於此任教，傳承知命感與求知熱忱。'
    },
    {
      year: '1953',
      title: '根植：建國南路現址立基',
      description: '民國四十二年，延平正式在現今的建國南路校地興建校舍。這條河流找到了源頭，開始在台北的心臟地帶紮根，繼續為台灣作育人才。'
    },
    {
      year: '1959 - 至今',
      title: '巔峰：弦歌不輟，私校之首',
      description: '民國四十八年正式立案辦理中學。延平人體會「品德不可壞、才智不可無、群性不可失」之校訓，紮根成長，躋身全國私校之首，延綿不絕。',
      image: '/LINE_ALBUM_待選延平桌曆照片_260326_2.jpg'
    }
  ];

  useEffect(() => {
    const fetchPhotos = async () => {
      const { data } = await supabase
        .from('old_photos')
        .select('*, profiles(full_name)')
        .eq('status', 'approved')
        .order('year_taken', { ascending: true });
      if (data) setUserPhotos(data);
      setLoading(false);
    };
    fetchPhotos();
  }, []);

  const handleUploadClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      alert('請先登入校友帳號，才能上傳珍貴的老照片喔！');
      router.push('/login');
    } else {
      router.push('/history/upload');
    }
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />
      
      {/* 延平綠頂部 */}
      <div className="relative h-[60vh] bg-cover bg-center" style={{ backgroundImage: "url('/LINE_ALBUM_待選延平桌曆照片_260326_2.jpg')" }}>
        <div className="absolute inset-0 bg-[#004d00]/85" />
        <div className="relative max-w-5xl mx-auto px-6 h-full flex flex-col justify-center items-center text-center text-white">
          <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-widest text-white">歷史的足跡</h1>
          <p className="text-lg md:text-2xl font-medium leading-relaxed max-w-3xl text-green-50">
            「生命的意義，不在當大臣，而在培養大臣。」<br />
            喚起延平人共同的記憶，凝聚共同的情感。
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto py-20 px-6">
        {/* 創校精神 */}
        <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-xl border border-green-100 mb-24 text-slate-700 leading-loose">
          <h2 className="text-2xl font-black text-[#004d00] mb-6 border-l-8 border-orange-500 pl-4 uppercase tracking-tighter">創校理念與精神</h2>
          <p className="mb-6 font-medium">
            創立於民國三十五年，創校董事包含 林獻堂、蔡培火、楊肇嘉、杜聰明、吳三連、丘念台、游彌堅 等熱心教育人士，共同為台灣人創辦了第一所大學。
          </p>
          <blockquote className="bg-green-50 p-8 rounded-[2rem] italic text-[#004d00] font-bold my-8 text-center text-xl shadow-inner">
            「給這混亂、昏昧的社會提供一線光明，我們要當荒野暗夜中的螢光。」 —— 朱昭陽
          </blockquote>
        </div>

        {/* 正史時間軸 */}
        <div className="space-y-16 mb-32 relative">
          {/* 垂直軸線裝飾 */}
          <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-1 bg-slate-200 hidden md:block" />
          
          {timelineEvents.map((event, index) => (
            <div key={index} className={`flex flex-col md:flex-row gap-8 items-center md:items-start group relative z-10 ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
              <div className={`w-full md:w-1/2 text-center ${index % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                <span className="text-6xl font-black text-[#004d00]/10 group-hover:text-orange-500/20 transition-all duration-700">
                  {event.year}
                </span>
              </div>
              
              <div className="w-full md:w-1/2 bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm group-hover:shadow-2xl group-hover:-translate-y-2 transition-all duration-500">
                <h3 className="text-2xl font-black text-[#004d00] mb-4 tracking-tight">{event.title}</h3>
                <p className="text-slate-600 mb-6 leading-relaxed font-medium">{event.description}</p>
                {event.image && (
                  <div className="rounded-2xl overflow-hidden shadow-lg aspect-video">
                    <img src={event.image} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* 校友回憶區塊 */}
        <div className="border-t-2 border-slate-200 pt-20">
          <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
            <div className="text-center md:text-left">
              <h2 className="text-3xl font-black text-[#004d00] uppercase tracking-tighter">校友回憶走廊</h2>
              <p className="text-slate-500 mt-2 italic font-medium">河流有方向，就因為它有源頭。我們在建國南路的日子...</p>
            </div>
            <button 
              onClick={handleUploadClick}
              className="bg-orange-500 text-white px-10 py-4 rounded-full font-black hover:bg-orange-600 transition-all shadow-lg active:scale-95"
            >
              + 我要投稿老照片
            </button>
          </div>

          {loading ? (
            <div className="text-center py-20 italic text-slate-400 font-bold">正在沖洗回憶照片...</div>
          ) : userPhotos.length === 0 ? (
            <div className="text-center py-16 text-slate-400 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200 font-bold">
              目前尚無校友投稿，期待您的第一張珍貴回憶。
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {userPhotos.map((photo) => (
                <div key={photo.id} className="bg-white rounded-[2.5rem] overflow-hidden shadow-md hover:shadow-2xl transition-all border border-slate-100 flex flex-col group">
                  <div className="aspect-[4/3] overflow-hidden">
                    <img src={photo.url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Alumni Photo" />
                  </div>
                  <div className="p-8">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="bg-orange-100 text-orange-700 text-xs font-black px-3 py-1 rounded-full">
                        民國 {photo.year_taken - 1911} 年 / 西元 {photo.year_taken}
                      </span>
                    </div>
                    <p className="text-slate-700 leading-relaxed font-medium mb-6 line-clamp-4">
                      {photo.description}
                    </p>
                    <div className="mt-auto pt-4 border-t border-slate-50 flex justify-between items-center">
                      <span className="text-[10px] text-slate-400 font-bold italic uppercase">By: {photo.profiles?.full_name || 'Alumni'}</span>
                      <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-black tracking-widest uppercase">Memory Verified</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-40 text-center">
          <p className="text-[#004d00] font-black text-2xl italic tracking-tighter">「品德不可壞，才智不可無，群性不可失」</p>
          <div className="mt-8 h-1.5 w-32 bg-orange-500 mx-auto rounded-full"></div>
        </div>
      </div>

      <button 
        onClick={handleUploadClick}
        className="fixed bottom-10 right-10 z-[1000] flex items-center gap-3 bg-orange-500 text-white pl-6 pr-8 py-5 rounded-full shadow-2xl hover:bg-orange-600 transition-all hover:scale-110 active:scale-95 group"
      >
        <span className="text-2xl group-hover:rotate-12 transition-transform">📸</span>
        <span className="font-black tracking-widest text-sm uppercase">投稿回憶</span>
      </button>
    </main>
  );
}