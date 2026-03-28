"use client";

import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { supabase } from '../../lib/supabase';
import Link from 'next/link';

export default function HistoryPage() {
  const [userPhotos, setUserPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. 靜態正史資料：僅保留最後一張照片
  const timelineEvents = [
    {
      year: '1946',
      title: '延平學院誕生：荒野暗夜中的螢光',
      description: '創辦人朱昭陽、宋進英先生秉持「生命的意義，不在當大臣，而在培養大臣」之理念，在林獻堂先生及企業界資助下創立。創校典禮於雙十節夜晚舉行，一千一百多名學生在燭影下聆聽朱先生訓詞：「我們要當荒野暗夜中的螢光」。'
    },
    {
      year: '1947',
      title: '動盪歲月：消失在塵埃中的五個月',
      description: '二二八事件爆發，延平學院因學生滿腔愛鄉血忱，遭軍隊假借名義命令停辦。五個多月的蓊鬱榮耀化作創痕，延平學院在時空中消失了。朱昭陽先生隨即積極奔走，在風雨中守護台灣人的精神支柱。'
    },
    {
      year: '1948',
      title: '艱難復校：補習學校名義先行',
      description: '三十七年九月以「延平高中補習學校」名義先行復校。雖然地位低微，但師資陣容極其堅強，包含許多知名教授如前總統李登輝先生。民國四十二年，終於遷入現今建國南路校址。'
    },
    {
      year: '1959 - 至今',
      title: '邁向巔峰：弦歌不輟，平實紮根',
      description: '四十八年正式立案中學辦理至今。延平從大學源頭走來，篤志力行「品德不可壞、才智不可無、群性不可失」之風範，躋身全國私校之首。新大樓的落成，更象徵延平精神延綿不絕，邁向新的顛峰。',
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
        <div className="bg-white p-8 md:p-12 rounded-[2rem] shadow-xl border border-green-100 mb-24 text-slate-700 leading-loose">
          <h2 className="text-2xl font-bold text-[#004d00] mb-6 border-l-4 border-orange-500 pl-4">創校理念與精神</h2>
          <p className="mb-6">
            延平大學由朱昭陽先生與宋進英先生創立，敦請林獻堂先生為董事長。創校董事包含林獻堂、蔡培火、楊肇嘉、杜聰明、吳三連等熱心教育人士，共同為台灣人創辦了第一所大學。
          </p>
          <blockquote className="bg-green-50 p-6 rounded-2xl italic text-[#004d00] font-medium my-8 text-center">
            「給這混亂、昏昧的社會提供一線光明，我們要當荒野暗夜中的螢光。」 —— 朱昭陽
          </blockquote>
        </div>

        {/* 正史時間軸 */}
        <div className="space-y-16 mb-32">
          {timelineEvents.map((event, index) => (
            <div key={index} className="flex flex-col md:flex-row gap-8 items-center md:items-start group">
              <div className="w-full md:w-1/3 text-center md:text-right">
                <span className="text-5xl font-black text-orange-500/30 group-hover:text-orange-500 transition-colors duration-500">
                  {event.year}
                </span>
              </div>
              
              <div className="w-full md:w-2/3 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm group-hover:shadow-2xl group-hover:border-green-200 transition-all duration-500">
                <h3 className="text-2xl font-bold text-[#004d00] mb-4">{event.title}</h3>
                <p className="text-slate-600 mb-6 leading-relaxed">{event.description}</p>
                
                {/* 修正後的圖片渲染邏輯：只有存在路徑時才渲染容器 */}
                {event.image && (
                  <div className="rounded-2xl overflow-hidden shadow-lg aspect-video">
                    <img 
                      src={event.image} 
                      alt={event.title} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* 校友回憶區塊 */}
        <div className="border-t border-slate-200 pt-20">
          <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
            <div className="text-center md:text-left">
              <h2 className="text-3xl font-black text-[#004d00]">校友回憶走廊</h2>
              <p className="text-slate-500 mt-2 italic text-sm">那些年，我們在建國南路的日子...</p>
            </div>
            <Link 
              href="/history/upload" 
              className="bg-orange-500 text-white px-8 py-3 rounded-full font-black hover:bg-orange-600 transition-all shadow-lg transform hover:-translate-y-1"
            >
              + 我要投稿老照片
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-20 italic text-slate-400">正在沖洗回憶照片...</div>
          ) : userPhotos.length === 0 ? (
            <div className="text-center py-10 text-slate-400 bg-white rounded-3xl border border-dashed">
              目前尚無校友投稿，期待您的第一張珍貴回憶。
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {userPhotos.map((photo) => (
                <div key={photo.id} className="bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-2xl transition-all border border-slate-100 flex flex-col">
                  <div className="aspect-[4/3] overflow-hidden">
                    <img src={photo.url} className="w-full h-full object-cover" alt="Alumni Photo" />
                  </div>
                  <div className="p-8">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="bg-orange-100 text-orange-700 text-xs font-black px-3 py-1 rounded-full">
                        民國 {photo.year_taken - 1911} 年 / 西元 {photo.year_taken}
                      </span>
                    </div>
                    <p className="text-slate-700 leading-relaxed text-sm mb-6">
                      {photo.description}
                    </p>
                    <div className="mt-auto pt-4 border-t border-slate-50 flex justify-between items-center">
                      <span className="text-[10px] text-slate-400 italic">提供者：{photo.profiles?.full_name || '校友'}</span>
                      <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded">Verified Memory</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-32 text-center">
          <p className="text-[#004d00] font-bold text-xl italic">「品德不可壞，才智不可無，群性不可失」</p>
          <div className="mt-8 h-1 w-24 bg-orange-500 mx-auto rounded-full"></div>
        </div>
      </div>

      <Link 
        href="/history/upload" 
        className="fixed bottom-8 right-8 z-[1000] flex items-center gap-3 bg-orange-500 text-white pl-5 pr-7 py-4 rounded-full shadow-[0_20px_50px_rgba(249,115,22,0.4)] hover:bg-orange-600 transition-all hover:scale-110 active:scale-95 group"
      >
        <span className="text-2xl group-hover:rotate-12 transition-transform">📸</span>
        <span className="font-black tracking-widest text-sm">投稿回憶</span>
      </Link>
    </main>
  );
}