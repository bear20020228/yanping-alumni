"use client";

import { useState, useEffect, useMemo } from 'react';
import { APIProvider, Map, AdvancedMarker, InfoWindow } from '@vis.gl/react-google-maps';
import Navbar from '../components/Navbar';
import { supabase } from '../../lib/supabase';

export default function MapPage() {
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  // 新增：用來控制地圖「鏡頭」的變數
  const [mapCenter, setMapCenter] = useState({ lat: 25.0375, lng: 121.5450 }); // 預設延平中學附近
  const [mapZoom, setMapZoom] = useState(13);

  useEffect(() => {
    async function fetchBusinesses() {
      // 進階版：只抓取 status 等於 'approved' 的資料！
      const { data, error } = await supabase
        .from('alumni_businesses')
        .select('*')
        .eq('status', 'approved');
        
      if (data) setBusinesses(data);
      setLoading(false);
    }
    fetchBusinesses();
  }, []);

  const filteredData = useMemo(() => {
    return businesses.filter(item => 
      item.name.includes(searchQuery) || item.category.includes(searchQuery)
    );
  }, [businesses, searchQuery]);

  // 新增：當點擊店家時的專屬動作
  const handleSelectBusiness = (item: any) => {
    setSelectedId(item.id);
    setMapCenter({ lat: item.lat, lng: item.lng }); // 把鏡頭對準這家店
    setMapZoom(17); // 放大地圖 (數字越大靠越近)
  };

  return (
    <main className="flex flex-col h-screen bg-white">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        {/* 左側列表 */}
        <div className="w-80 shadow-xl z-10 bg-white flex flex-col p-4 overflow-y-auto">
          <input 
            type="text" 
            placeholder="搜尋校友企業..." 
            className="w-full p-2 border border-slate-300 rounded-lg mb-4 text-black outline-none"
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          
          <div className="space-y-3">
            {loading ? <p className="text-sm text-slate-400">載入中...</p> : (
              filteredData.map(item => (
                <div 
                  key={item.id}
                  onClick={() => handleSelectBusiness(item)} // 換成我們剛寫的新動作
                  className={`p-3 rounded-xl border cursor-pointer transition ${selectedId === item.id ? 'border-blue-500 bg-blue-50 shadow-md' : 'border-slate-100 hover:bg-slate-50'}`}
                >
                  <h3 className="font-bold text-[#003366] text-sm">{item.name}</h3>
                  <p className="text-[10px] text-slate-500">第 {item.class_year} 屆 | {item.category}</p>
                  <p className="text-[10px] mt-1 text-orange-600 font-medium">🎁 {item.offer}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 右側地圖 */}
        <div className="flex-1 relative">
          <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""}>
            <Map
              center={mapCenter} // 綁定我們設定的鏡頭中心
              zoom={mapZoom}     // 綁定我們設定的縮放大小
              onCameraChanged={(ev) => {
                // 讓使用者自己拖拉地圖時，也能更新鏡頭位置，才不會卡住
                setMapCenter(ev.detail.center);
                setMapZoom(ev.detail.zoom);
              }}
              mapId="DEMO_MAP_ID"
              disableDefaultUI={true}
            >
              {filteredData.map((item) => (
                <AdvancedMarker
                  key={item.id}
                  position={{ lat: item.lat, lng: item.lng }}
                  onClick={() => handleSelectBusiness(item)} // 點擊地圖標記也套用一樣的動作
                >
                  <div className={`p-2 rounded-lg shadow-lg border-2 border-white transition-all ${selectedId === item.id ? 'bg-orange-500 scale-125' : 'bg-[#003366]'}`}>
                    <span className="text-white text-[10px] font-bold whitespace-nowrap">{item.name}</span>
                  </div>
                </AdvancedMarker>
              ))}

              {selectedId && (
                <InfoWindow
                  position={{ 
                    lat: filteredData.find(i => i.id === selectedId)?.lat, 
                    lng: filteredData.find(i => i.id === selectedId)?.lng 
                  }}
                  onCloseClick={() => setSelectedId(null)}
                >
                  <div className="p-1 max-w-[150px]">
                    <p className="font-bold text-sm">{filteredData.find(i => i.id === selectedId)?.name}</p>
                    <p className="text-xs mt-1 italic font-bold text-orange-600">{filteredData.find(i => i.id === selectedId)?.offer}</p>
                  </div>
                </InfoWindow>
              )}
            </Map>
          </APIProvider>
        </div>
      </div>
    </main>
  );
}