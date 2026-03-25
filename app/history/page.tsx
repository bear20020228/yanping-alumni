"use client";

import Navbar from '../components/Navbar';

export default function HistoryPage() {
  const timelineEvents = [
    {
      year: '1946',
      title: '延平學院誕生：荒野暗夜中的螢光',
      description: '創辦人朱昭陽、宋進英先生秉持「生命的意義，不在當大臣，而在培養大臣」之理念，在林獻堂先生及企業界資助下創立。創校典禮於雙十節夜晚舉行，一千一百多名學生在燭影下聆聽朱先生訓詞：「我們要當荒野暗夜中的螢光」。',
      image: '/LINE_ALBUM_待選延平桌曆照片_260326_1.jpg' // 黑白舊大門，象徵起點
    },
    {
      year: '1947',
      title: '動盪歲月：消失在塵埃中的五個月',
      description: '二二八事件爆發，延平學院因學生滿腔愛鄉血忱，遭軍隊假借名義命令停辦。五個多月的蓊鬱榮耀化作創痕，延平學院在時空中消失了。朱昭陽先生隨即積極奔走，在風雨中守護台灣人的精神支柱。',
      image: '/LINE_ALBUM_待選延平桌曆照片_260326_3.jpg' // 舊教室照片，回憶過往
    },
    {
      year: '1948',
      title: '艱難復校：補習學校名義先行',
      description: '三十七年九月以「延平高中補習學校」名義先行復校。雖然地位低微，但師資陣容極其堅強，包含許多知名教授如前總統李登輝先生。民國四十二年，終於遷入現今建國南路校址。',
      image: '/placeholder_lee.jpg' // 此處可留空或放李登輝先生相關意象
    },
    {
      year: '1959 - 至今',
      title: '邁向巔峰：弦歌不輟，平實紮根',
      description: '四十八年正式立案中學辦理至今。延平從大學源頭走來，篤志力行「品德不可壞、才智不可無、群性不可失」之風範，躋身全國私校之首。新大樓的落成，更象徵延平精神延綿不絕，邁向新的顛峰。',
      image: '/LINE_ALBUM_待選延平桌曆照片_260326_2.jpg' // 新大樓落成，象徵現代與未來
    }
  ];

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />
      
      {/* 延平綠頂部：充滿史詩感的 Header */}
      <div className="relative h-[60vh] bg-cover bg-center" style={{ backgroundImage: "url('/LINE_ALBUM_待選延平桌曆照片_260326_2.jpg')" }}>
        <div className="absolute inset-0 bg-[#004d00]/85" />
        <div className="relative max-w-5xl mx-auto px-6 h-full flex flex-col justify-center items-center text-center text-white">
          <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-widest">歷史的足跡</h1>
          <p className="text-lg md:text-2xl font-medium leading-relaxed max-w-3xl text-green-50">
            「生命的意義，不在當大臣，而在培養大臣。」<br />
            喚起延平人共同的記憶，凝聚共同的力量，走過傳統，邁向顛峰。
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto py-20 px-6">
        {/* 核心校史敘述區塊 */}
        <div className="bg-white p-8 md:p-12 rounded-[2rem] shadow-xl border border-green-100 mb-20 text-slate-700 leading-loose">
          <h2 className="text-2xl font-bold text-[#004d00] mb-6 border-l-4 border-orange-500 pl-4">創校理念與精神</h2>
          <p className="mb-6">
            延平大學由朱昭陽先生與宋進英先生創立，敦請林獻堂先生為董事長，命名為「延平」以紀念鄭成功不屈不撓的精神。
            創校董事群星熠熠，包含林獻堂、蔡培火、楊肇嘉、杜聰明、吳三連等熱心教育人士，共同為台灣人創辦了第一所大學。
          </p>
          <blockquote className="bg-green-50 p-6 rounded-2xl italic text-[#004d00] font-medium my-8">
            「給這混亂、昏昧的社會提供一線光明，我們要當荒野暗夜中的螢光。」 —— 朱昭陽
          </blockquote>
          <p>
            雖然經歷二二八事件的重創與停辦，延平人像苦行僧一般日日求進，從補校到中學，弦歌不輟。
            知道自己從哪裡來，才曉得要往哪裡去。我們不背負過去，而是為了走得更踏實。
          </p>
        </div>

        {/* 時間軸美化 */}
        <div className="space-y-16">
          {timelineEvents.map((event, index) => (
            <div key={index} className="flex flex-col md:flex-row gap-8 items-center md:items-start group">
              <div className="w-full md:w-1/3 text-center md:text-right">
                <span className="text-5xl font-black text-orange-500/30 group-hover:text-orange-500 transition-colors duration-500">{event.year}</span>
              </div>
              
              <div className="w-full md:w-2/3 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm group-hover:shadow-2xl group-hover:border-green-200 transition-all duration-500">
                <h3 className="text-2xl font-bold text-[#004d00] mb-4">{event.title}</h3>
                <p className="text-slate-600 mb-6 leading-relaxed">{event.description}</p>
                {!event.image.includes('placeholder') && (
                  <div className="rounded-2xl overflow-hidden shadow-lg aspect-video">
                    <img src={event.image} alt={biz.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-24 text-center">
          <p className="text-[#004d00] font-bold text-xl italic">「品德不可壞，才智不可無，群性不可失」</p>
          <div className="mt-8 h-1 w-24 bg-orange-500 mx-auto rounded-full"></div>
        </div>
      </div>
    </main>
  );
}