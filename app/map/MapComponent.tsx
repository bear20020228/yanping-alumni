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

// 內部組件：處理地圖中心點跳轉
function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 15, { duration: 2 }); // 絲滑飛入動畫
  }, [center, map]);
  return null;
}

export default function MapComponent({ businesses }: { businesses: any[] }) {
  const [mounted, setMounted] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([25.0330, 121.5654]); // 預設台北

  useEffect(() => {
    setMounted(true);
    // 自動嘗試獲取使用者位置
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setMapCenter([pos.coords.latitude, pos.coords.longitude]);
        },
        () => console.log("使用者拒絕提供位置，使用預設中心點")
      );
    }
  }, []);

  if (!mounted) return <div className="h-full w-full bg-slate-100 animate-pulse rounded-2xl"></div>;

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
        className="absolute top-20 left-3 z-[1000] bg-white text-[#004d00] p-2 rounded-md shadow-md hover:bg-slate-100 font-bold text-xs border border-slate-300"
      >
        📍 我的位置
      </button>

      <MapContainer center={mapCenter} zoom={13} className="h-full w-full">
        <ChangeView center={mapCenter} />
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; CARTO'
        />
        
        {businesses.map((biz) => (
          biz.lat && biz.lng && (
            <Marker key={biz.id} position={[biz.lat, biz.lng]} icon={glowingIcon}>
              <Popup>
                <div className="p-2 min-w-[150px]">
                  <h3 className="font-bold text-[#004d00] text-lg mb-1">{biz.name}</h3>
                  <p className="text-xs text-slate-600 mb-2">{biz.address}</p>
                  <div className="bg-orange-50 p-2 rounded text-xs text-orange-800 italic">
                    {biz.description || "歡迎校友光臨！"}
                  </div>
                </div>
              </Popup>
            </Marker>
          )
        ))}
      </MapContainer>
    </div>
  );
}