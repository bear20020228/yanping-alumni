"use client";

import { useState } from 'react';
import Navbar from '../components/Navbar';
import { ComposableMap, Geographies, Geography } from "react-simple-maps";

const geoUrl = "https://unpkg.com/taiwan-atlas/counties-10t.json";

const branchData = {
  north: [
    { name: "台灣大學校友分會", president: "王同學", contact: "台大 LINE 群", currentJob: "資工系 112級", events: ["台大延平週", "迎新杜鵑花節聚餐"] },
    { name: "清華大學校友分會", president: "李同學", contact: "清大 LINE 群", currentJob: "電機系 113級", events: ["梅竹賽聯合加油"] },
    { name: "陽明交通大學校友分會", president: "張同學", contact: "陽明交大 LINE 群", currentJob: "光電所 博一", events: ["竹科產業參訪"] },
    { name: "政治大學校友分會", president: "林同學", contact: "政大 LINE 群", currentJob: "法律系 112級", events: ["指南山包種茶節聚餐"] },
  ],
  central: [
    { name: "中興大學校友分會", president: "趙同學", contact: "中興 LINE 群", currentJob: "獸醫系 111級", events: ["興大湖畔野餐"] },
    { name: "東海大學校友分會", president: "孫同學", contact: "東海 LINE 群", currentJob: "建築系 114級", events: ["路思義教堂聯合團契"] },
  ],
  south: [
    { name: "成功大學校友分會", president: "劉同學", contact: "成大 LINE 群", currentJob: "機械所 碩二", events: ["成大榕園聚餐", "台南府城文化巡禮"] },
    { name: "中山大學校友分會", president: "陳同學", contact: "中山 LINE 群", currentJob: "海資系 112級", events: ["西子灣看海聚會"] },
  ],
  east: [
    { name: "東華大學校友分會", president: "許同學", contact: "東華 LINE 群", currentJob: "自然資源系 110級", events: ["東華湖畔燒烤"] },
    { name: "台東大學校友分會", president: "韓同學", contact: "台東大 LINE 群", currentJob: "體育系 113級", events: ["台東熱氣球聯合參觀"] },
  ]
};

type RegionKey = keyof typeof branchData;

const regionConfig = {
  north: { name: "北區大學", color: "text-blue-600", fillHex: "#3b82f6", hoverHex: "#93c5fd", border: "border-blue-100" },
  central: { name: "中區大學", color: "text-orange-600", fillHex: "#f97316", hoverHex: "#fdba74", border: "border-orange-100" },
  south: { name: "南區大學", color: "text-green-600", fillHex: "#16a34a", hoverHex: "#86efac", border: "border-green-100" },
  east: { name: "東區大學", color: "text-teal-600", fillHex: "#14b8a6", hoverHex: "#5eead4", border: "border-teal-100" }
};

const getRegion = (geoProps: any): RegionKey | null => {
  if (!geoProps) return null;
  const rawName = geoProps.COUNTYNAME || geoProps.name || geoProps.C_Name || '';
  const name = rawName.replace(/臺/g, '台');

  const north = ["台北市", "新北市", "基隆市", "桃園縣", "桃園市", "新竹縣", "新竹市", "宜蘭縣"];
  const central = ["苗栗縣", "台中市", "台中縣", "彰化縣", "南投縣", "雲林縣"];
  const south = ["嘉義縣", "嘉義市", "台南市", "台南縣", "高雄市", "高雄縣", "屏東縣"];
  const east = ["花蓮縣", "台東縣"];
  
  if (north.includes(name)) return 'north';
  if (central.includes(name)) return 'central';
  if (south.includes(name)) return 'south';
  if (east.includes(name)) return 'east';
  return null; 
};

export default function BranchesPage() {
  const [selectedRegion, setSelectedRegion] = useState<RegionKey | null>(null);

  // 用來處理浮動視窗的資料
  const activeRegionBranches = selectedRegion ? branchData[selectedRegion] : [];
  const config = selectedRegion ? regionConfig[selectedRegion] : null;

  return (
    <main className="min-h-screen bg-slate-50 relative">
      <Navbar />
      <div className="max-w-5xl mx-auto py-16 px-6">
        
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-[#003366] mb-4 tracking-tighter">校友大學分會</h1>
          <p className="text-slate-500 text-sm font-bold tracking-widest uppercase">點擊下方地圖區塊，查看各地區大學延平校友會資訊</p>
        </div>

        {/* 滿版地圖區塊 */}
        <div className="w-full h-[650px] bg-white p-4 rounded-[3rem] shadow-xl border border-slate-100 overflow-hidden relative">
          <ComposableMap
            projection="geoMercator"
            projectionConfig={{
              scale: 10000,          
              center: [121, 23.6]   
            }}
            className="w-full h-full drop-shadow-md outline-none"
          >
            <Geographies geography={geoUrl}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const regionName = getRegion(geo.properties);
                  const isSelected = regionName === selectedRegion;
                  const regionStyle = regionName ? regionConfig[regionName] : null;

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      onClick={() => {
                        if (regionName) setSelectedRegion(regionName);
                      }}
                      className={regionName ? "cursor-pointer outline-none" : "pointer-events-none outline-none"}
                      style={{
                        default: {
                          fill: isSelected ? regionStyle?.fillHex : "#e2e8f0", 
                          stroke: "#ffffff",
                          strokeWidth: 1,
                          outline: "none",
                          transition: "all 250ms"
                        },
                        hover: {
                          fill: regionStyle ? regionStyle.hoverHex : "#e2e8f0",
                          stroke: "#ffffff",
                          strokeWidth: 1,
                          outline: "none",
                          transition: "all 250ms cursor-pointer"
                        },
                        pressed: {
                          fill: regionStyle?.fillHex,
                          outline: "none"
                        }
                      }}
                    />
                  );
                })
              }
            </Geographies>
          </ComposableMap>
        </div>
      </div>

      {/* 浮動視窗 (Modal) */}
      {selectedRegion && config && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
          onClick={() => setSelectedRegion(null)} // 點擊背景關閉
        >
          {/* 毛玻璃背景 */}
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
          
          {/* 視窗主體 */}
          <div 
            className={`relative w-full max-w-4xl bg-white rounded-[2.5rem] shadow-2xl border-4 ${config.border} flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200`}
            onClick={(e) => e.stopPropagation()} // 阻止點擊事件冒泡到背景
          >
            {/* 視窗頭部 */}
            <div className="flex justify-between items-center p-8 border-b border-slate-100 bg-slate-50">
              <div>
                <h2 className={`text-3xl font-black ${config.color} mb-1`}>{config.name}</h2>
                <span className="text-xs font-bold bg-white border border-slate-200 text-slate-500 px-3 py-1 rounded-full shadow-sm">
                  涵蓋 {activeRegionBranches.length} 家分會
                </span>
              </div>
              <button 
                onClick={() => setSelectedRegion(null)}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-400 hover:text-red-500 hover:bg-red-50 hover:border-red-100 font-black text-xl transition-all shadow-sm"
              >
                ✕
              </button>
            </div>

            {/* 視窗內容 (可滾動) */}
            <div className="p-8 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {activeRegionBranches.map((branch, idx) => (
                  <div key={idx} className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm space-y-5 flex flex-col justify-between hover:border-slate-300 transition-colors">
                    <div>
                        <h3 className="text-xl font-black text-slate-800 mb-3 border-l-4 border-orange-500 pl-3 leading-tight">{branch.name}</h3>
                        
                        <div className="flex flex-col gap-2 pt-3 text-sm text-slate-600 font-medium">
                            <span className="flex items-center gap-2">👤 <strong>會長:</strong> {branch.president}</span>
                            <span className="flex items-center gap-2">🎓 <strong>系級:</strong> {branch.currentJob}</span>
                            <span className={`flex items-center gap-2 ${config.color} font-bold bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 mt-1 w-fit`}>
                              💬 {branch.contact}
                            </span>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-slate-50">
                        <div className="flex flex-wrap gap-2">
                            {branch.events.map((evt, eIdx) => (
                                <span key={eIdx} className="bg-slate-50 border border-slate-200 text-slate-500 text-[10px] font-bold px-3 py-1.5 rounded-lg">
                                    {evt}
                                </span>
                            ))}
                        </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}