"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect, useState } from 'react';

// 螢火蟲特效 Icon
const glowingIcon = L.divIcon({
  className: 'bg-transparent',
  html: `<div class="relative flex h-6 w-6 items-center justify-center">
           <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
           <span class="relative inline-flex rounded-full h-3 w-3 bg-orange-500 shadow-[0_0_12px_3px_rgba(249,115,22,0.9)]"></span>
         </div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

// 核心功能：監控搜尋結果並自動跳轉地圖
function SearchTracker({ businesses }: { businesses: any[] }) {
  const map = useMap();
  useEffect(() => {
    if (businesses.length > 0) {
      // 只要搜尋結果有變動，地圖自動飛向搜尋結果的第一筆
      const firstResult = businesses[0];
      if (firstResult.lat && firstResult.lng) {
        map.flyTo([firstResult.lat, firstResult.lng], 15, { duration: 1.5 });
      }
    }
  }, [businesses, map]);
  return null;
}

// 接收 isPaidUser 參數來控制權限
export default function MapComponent({ businesses, isPaidUser }: { businesses: any[], isPaidUser: boolean }) {
  const [mounted, setMounted] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([25.0330, 121.5654]);

  useEffect(() => {
    setMounted(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setMapCenter([pos.coords.latitude, pos.coords.longitude]),
        () => console.log("使用預設中心點")
      );
    }
  }, []);

  if (!mounted) return <div className="h-full w-full bg-slate-900 animate-pulse rounded-2xl text-white flex items-center justify-center italic">定位星圖中...</div>;

  return (
    <div className="relative h-[600px] w-full rounded-2xl overflow-hidden shadow-2xl border-4 border-[#003300]">
      {/* 定位按鈕 */}
      <button 
        onClick={() => {
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((pos) => {
              setMapCenter([pos.coords.latitude, pos.coords.longitude]);
            });
          }
        }}
        className="absolute top-4 left-4 z-[1000] bg-white/90 backdrop-blur text-[#004d00] px-4 py-2 rounded-xl shadow-lg hover:bg-white font-bold text-sm border border-green-900/20 transition-all active:scale-95"
      >
        📍 我的位置
      </button>

      <MapContainer center={mapCenter} zoom={13} className="h-full w-full">
        {/* 啟用搜尋追蹤邏輯 */}
        <SearchTracker businesses={businesses} />
        
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; CARTO'
        />
        
        {businesses.map((biz) => (
          biz.lat && biz.lng && (
            <Marker key={biz.id} position={[biz.lat, biz.lng]} icon={glowingIcon}>
              <Popup className="custom-alumni-popup">
                {isPaidUser ? (
                  /* --- 權限通過：顯示完整優惠資訊 --- */
                  <div className="w-64 overflow-hidden rounded-lg font-sans">
                    <div className="bg-[#004d00] p-3 -m-4 mb-2">
                      <h3 className="text-white font-black text-lg flex items-center gap-2">
                        <span className="text-orange-400 text-xl">✦</span>
                        {biz.name}
                      </h3>
                    </div>
                    <div className="pt-4 px-1 pb-2">
                      <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">Business Address</p>
                      <p className="text-xs text-slate-700 mb-4 leading-relaxed border-l-2 border-orange-200 pl-2">{biz.address}</p>
                      <div className="relative bg-orange-50 border border-orange-200 rounded-xl p-3 shadow-inner">
                        <div className="absolute -top-2 left-3 bg-orange-500 text-white text-[9px] px-2 py-0.5 rounded-full font-bold">校友專屬優惠</div>
                        <p className="text-xs text-orange-900 font-medium leading-normal pt-1">{biz.description || "歡迎校友憑數位校友卡蒞臨洽詢！"}</p>
                      </div>
                      <div className="mt-4 flex justify-between items-center text-[10px] text-slate-400 italic">
                        <span>#延平人挺延平人</span>
                        <span className="bg-slate-100 px-2 py-1 rounded text-slate-500">Verified</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* --- 權限鎖定：提示繳費 --- */
                  <div className="w-64 p-4 text-center">
                    <div className="text-4xl mb-3">🔒</div>
                    <h3 className="font-bold text-[#004d00] text-lg mb-1">{biz.name}</h3>
                    <p className="text-xs text-slate-500 mb-4">此企業提供校友專屬互惠方案</p>
                    <div className="bg-slate-50 border border-dashed border-slate-300 p-4 rounded-xl">
                      <p className="text-xs text-slate-600 font-bold mb-1">內容已鎖定</p>
                      <p className="text-[10px] text-slate-400 leading-relaxed">請先完成年度會費繳納，<br/>即可解鎖全台校友優惠詳情。</p>
                    </div>
                  </div>
                )}
              </Popup>
            </Marker>
          )
        ))}
      </MapContainer>
    </div>
  );
}