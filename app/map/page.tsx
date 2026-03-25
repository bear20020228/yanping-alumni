"use client";

import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { supabase } from '../../lib/supabase';
import { GoogleMap, useJsApiLoader, MarkerF, InfoWindowF } from '@react-google-maps/api';

const mapContainerStyle = { width: '100%', height: '100%' };
const center = { lat: 25.037, lng: 121.540 }; // 延平附近

export default function MapPage() {
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selected, setSelected] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""
  });

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const fetchBusinesses = async () => {
    const { data } = await supabase.from('alumni_businesses').select('*').eq('status', 'approved');
    if (data) {
      setBusinesses(data);
      setFiltered(data);
    }
    setLoading(false);
  };

  const handleSearch = (e: string) => {
    setSearchTerm(e);
    const results = businesses.filter(b => 
      b.name.includes(e) || b.category.includes(e) || b.address.includes(e)
    );
    setFiltered(results);
  };

  return (
    <main className="h-screen flex flex-col bg-white">
      <Navbar />
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        <div className="w-full md:w-80 lg:w-96 bg-slate-50 border-r border-slate-200 flex flex-col h-2/5 md:h-full z-10 shadow-xl">
          <div className="p-4 bg-white border-b border-slate-200">
            <div className="relative">
              <input
                type="text"
                placeholder="搜尋校友企業..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-[#004d00]"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
              />
              <span className="absolute left-3 top-2.5">🔍</span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {loading ? <p className="text-center py-10">載入中...</p> : (
              filtered.map(biz => (
                <div key={biz.id} onClick={() => setSelected(biz)} className={`p-4 rounded-2xl cursor-pointer border ${selected?.id === biz.id ? 'bg-green-50 border-[#004d00]' : 'bg-white border-slate-100'}`}>
                  <h3 className="font-bold text-[#004d00]">{biz.name}</h3>
                  <p className="text-xs text-slate-500">第 {biz.class_year} 屆 | {biz.category}</p>
                </div>
              ))
            )}
          </div>
        </div>
        <div className="flex-1 h-3/5 md:h-full relative">
          {isLoaded ? (
            <GoogleMap mapContainerStyle={mapContainerStyle} center={selected ? { lat: selected.lat, lng: selected.lng } : center} zoom={13}>
              {filtered.map(biz => (
                <MarkerF key={biz.id} position={{ lat: biz.lat, lng: biz.lng }} onClick={() => setSelected(biz)} />
              ))}
              {selected && (
                <InfoWindowF position={{ lat: selected.lat, lng: selected.lng }} onCloseClick={() => setSelected(null)}>
                  <div className="p-2">
                    <h4 className="font-bold text-[#004d00]">{selected.name}</h4>
                    <p className="text-xs">{selected.address}</p>
                  </div>
                </InfoWindowF>
              )}
            </GoogleMap>
          ) : <div className="h-full flex items-center justify-center">地圖載入中...</div>}
        </div>
      </div>
    </main>
  );
}