"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect, useState, useCallback } from 'react';

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

// 建立一個可以從外部呼叫的地圖控制器
let mapRef: L.Map | null = null;

function MapInstanceCapture() {
  const map = useMap();
  useEffect(() => {
    mapRef = map;
  }, [map]);
  return null;
}

// 自動追蹤搜尋結果
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

  // 強制定位函數
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

  if (!mounted) return <div className="h-full w-full bg-slate-900 animate-pulse rounded-2xl"></div>;

  return (
    <div className="relative h-[600px] w-full rounded-2xl overflow-hidden shadow-2xl border-4 border-[#003300]">
      {/* 定位按鈕：改為直接呼叫 handleLocate */}
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
        
        {businesses.map((biz) => (
          biz.lat && biz.lng && (
            <Marker key={biz.id} position={[biz.lat, biz.lng]} icon={glowingIcon}>
              <Popup>
                {isPaidUser ? (
                  <div className="w-64 p-1">
                    <div className="bg-[#004d00] p-3 -m-4 mb-2"><h3 className="text-white font-black text-lg">✦ {biz.name}</h3></div>
                    <div className="pt-4 px-1 pb-2">
                      <p className="text-xs text-slate-700 mb-4">{biz.address}</p>
                      <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 shadow-inner text-xs text-orange-900 font-medium">
                        {biz.description || "歡迎校友蒞臨！"}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="w-64 p-4 text-center">
                    <div className="text-4xl mb-3">🔒</div>
                    <h3 className="font-bold text-[#004d00] mb-2">{biz.name}</h3>
                    <div className="bg-slate-50 p-4 rounded-xl text-[10px] text-slate-400">請先完成年度會費繳納以解鎖內容</div>
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