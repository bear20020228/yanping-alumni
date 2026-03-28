"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect, useState, useCallback, useMemo } from 'react';

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

let mapRef: L.Map | null = null;

function MapInstanceCapture() {
  const map = useMap();
  useEffect(() => { mapRef = map; }, [map]);
  return null;
}

function SearchTracker({ businesses }: { businesses: any[] }) {
  const map = useMap();
  useEffect(() => {
    if (businesses.length > 0) {
      const target = businesses[0];
      if (target.lat && target.lng) {
        map.flyTo([target.lat, target.lng], 15, { duration: 1.5 });
      }
    }
  }, [businesses, map]);
  return null;
}

export default function MapComponent({ businesses, isPaidUser }: { businesses: any[], isPaidUser: boolean }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLocate = useCallback(() => {
    if (!navigator.geolocation) {
      alert("您的瀏覽器不支持定位功能");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (mapRef) {
          mapRef.flyTo([pos.coords.latitude, pos.coords.longitude], 16, { duration: 2 });
        }
      },
      (err) => {
        console.error(err);
        alert("無法取得位置，請檢查是否已開啟 GPS 或授權瀏覽器定位權限。");
      },
      { enableHighAccuracy: true }
    );
  }, []);

  // 核心邏輯：將相同座標的企業群組化 (Group by lat, lng)
  const groupedBusinesses = useMemo(() => {
    const groups: Record<string, any[]> = {};
    businesses.forEach(biz => {
      if (biz.lat && biz.lng) {
        const key = `${biz.lat},${biz.lng}`;
        if (!groups[key]) {
          groups[key] = [];
        }
        groups[key].push(biz);
      }
    });
    return Object.values(groups); // 轉回陣列格式
  }, [businesses]);

  if (!mounted) return <div className="h-full w-full bg-slate-900 animate-pulse rounded-2xl"></div>;

  return (
    <div className="relative h-[600px] w-full rounded-2xl overflow-hidden shadow-2xl border-4 border-[#003300]">
      <button 
        onClick={handleLocate}
        className="absolute top-4 left-4 z-[1000] bg-white/90 backdrop-blur text-[#004d00] px-4 py-2 rounded-xl shadow-lg hover:bg-white font-bold text-sm border border-green-900/20 active:scale-95 transition-all"
      >
        📍 我的位置
      </button>

      <MapContainer center={[25.0330, 121.5654]} zoom={13} className="h-full w-full">
        <MapInstanceCapture />
        <SearchTracker businesses={businesses} />
        <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" attribution='&copy; CARTO' />
        
        {/* 改為渲染群組資料 */}
        {groupedBusinesses.map((group, index) => {
          const firstBiz = group[0]; // 拿第一家店的座標來放圖釘
          const isMultiple = group.length > 1;

          return (
            <Marker key={`group-${index}`} position={[firstBiz.lat, firstBiz.lng]} icon={glowingIcon}>
              <Popup>
                {/* 加上 max-h-80 與 overflow-y-auto 讓內容過多時可滾動 */}
                <div className="w-64 max-h-80 overflow-y-auto overflow-x-hidden p-1">
                  
                  {/* 置頂標題區塊 */}
                  <div className="bg-[#004d00] p-3 -m-4 mb-2 sticky top-0 z-10 shadow-md">
                    <h3 className="text-white font-black text-base leading-tight">
                      {isMultiple ? `✦ 此地點有 ${group.length} 家校友企業` : `✦ ${firstBiz.name}`}
                    </h3>
                  </div>

                  <div className="pt-4 px-1 pb-2 space-y-4">
                    {group.map((biz) => (
                      <div key={biz.id} className={isMultiple ? "border-b border-slate-200 pb-4 last:border-0 last:pb-0" : ""}>
                        {/* 如果有多家店，個別顯示店名與分類標籤 */}
                        {isMultiple && (
                          <div className="mb-2">
                            <h4 className="font-bold text-slate-800 text-sm">{biz.name}</h4>
                            {biz.category && (
                              <span className="inline-block bg-orange-100 text-orange-700 text-[10px] font-black px-2 py-0.5 rounded mt-1">
                                {biz.category}
                              </span>
                            )}
                          </div>
                        )}
                        
                        <p className="text-xs text-slate-700 mb-3 leading-relaxed">{biz.address}</p>
                        
                        {isPaidUser ? (
                          <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 shadow-inner text-xs text-orange-900 font-medium">
                            {biz.description || "歡迎校友蒞臨！"}
                          </div>
                        ) : (
                          <div className="bg-slate-50 p-3 rounded-xl text-[10px] text-slate-400 text-center border border-slate-100 font-bold">
                            🔒 結帳出示數位校友卡享專屬優惠
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}