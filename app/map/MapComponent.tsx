"use client";

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect, useState } from 'react';

// 定義螢火蟲發光特效的 Icon (利用 Tailwind 的 animate-ping)
const glowingIcon = L.divIcon({
  className: 'bg-transparent',
  html: `<div class="relative flex h-6 w-6 items-center justify-center">
           <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
           <span class="relative inline-flex rounded-full h-3 w-3 bg-orange-500 shadow-[0_0_12px_3px_rgba(249,115,22,0.9)]"></span>
         </div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

export default function MapComponent({ businesses }: { businesses: any[] }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="h-full w-full bg-slate-100 animate-pulse rounded-2xl"></div>;

  // 預設中心點：台北市
  const defaultCenter: [number, number] = [25.0330, 121.5654];

  return (
    <div className="h-[600px] w-full rounded-2xl overflow-hidden shadow-2xl border-4 border-[#003300]">
      <MapContainer center={defaultCenter} zoom={12} className="h-full w-full">
        {/* 使用暗色系地圖底圖，讓螢光效果更明顯 */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        />
        
        {businesses.map((biz) => {
          if (!biz.lat || !biz.lng) return null; // 沒有座標的不顯示
          
          return (
            <Marker key={biz.id} position={[biz.lat, biz.lng]} icon={glowingIcon}>
              <Popup className="custom-popup">
                <div className="p-1">
                  <h3 className="font-bold text-[#004d00] text-lg">{biz.name}</h3>
                  <p className="text-xs text-slate-500 mt-1">{biz.address}</p>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}