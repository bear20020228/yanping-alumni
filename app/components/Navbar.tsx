"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false); // 控制手機版漢堡選單的開關

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
        if (data) setProfile(data);
      } else {
        setUser(null);
        setProfile(null);
      }
    };
    
    fetchUserData();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') fetchUserData();
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/'; 
  };

  const renderStatusTag = () => {
    if (!profile) return null;
    if (profile.role === 'admin') return <span className="text-red-800 text-xs bg-red-200 px-2 py-1 rounded font-bold">管理員</span>;
    if (profile.status === 'pending') return <span className="text-yellow-800 text-xs bg-yellow-200 px-2 py-1 rounded font-bold">審核中</span>;
    if (profile.status === 'approved' && profile.is_paid) return <span className="text-green-800 text-xs bg-green-200 px-2 py-1 rounded font-bold">正式會員</span>;
    return <span className="text-blue-200 text-xs bg-blue-800 px-2 py-1 rounded">一般會員</span>;
  };

  return (
    <nav className="bg-[#003366] text-white sticky top-0 z-50 shadow-md">
      <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
        
        {/* 左側 Logo: 點擊回首頁 */}
        <Link href="/" className="text-xl font-black tracking-wider hover:text-blue-200 transition-colors">
          延平校友總會
        </Link>
        
        {/* 桌機版選單 (大螢幕顯示 md:flex，小螢幕隱藏 md:hidden) */}
        <div className="hidden md:flex items-center space-x-6 text-sm font-medium">
          <Link href="/" className="hover:text-blue-200 transition-colors">首頁</Link>
          <Link href="/history" className="hover:text-blue-200 transition-colors">時光走廊</Link>
          <Link href="/map" className="hover:text-blue-200 transition-colors">企業地圖</Link>
          <Link href="/events" className="hover:text-blue-200 transition-colors text-orange-300 font-bold">活動報名</Link>
          
          <div className="w-px h-4 bg-blue-400 opacity-50"></div>
          
          {user ? (
            <div className="flex items-center space-x-3">
              <span className="text-sm font-bold">{profile?.full_name}</span>
              {renderStatusTag()}
              {profile?.role === 'admin' && (
                <Link href="/admin" className="text-orange-400 font-bold hover:text-orange-300 transition-colors">管理後台</Link>
              )}
              <button onClick={handleLogout} className="hover:text-red-300 transition-colors font-bold pl-2 border-l border-blue-400">登出</button>
            </div>
          ) : (
            <Link href="/login" className="hover:text-blue-200 transition-colors">會員登入</Link>
          )}
          
          <Link href="/register" className="bg-white text-[#003366] px-5 py-2 rounded-full font-bold hover:bg-blue-50 transition-colors shadow-sm text-sm">
            加入企業地圖
          </Link>
        </div>

        {/* 手機版漢堡按鈕 (小螢幕顯示 md:hidden，大螢幕隱藏 md:flex) */}
        <button 
          className="md:hidden text-white focus:outline-none" 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /> // 叉叉圖示 X
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /> // 三條線圖示 ☰
            )}
          </svg>
        </button>
      </div>

      {/* 手機版下拉選單 (點擊漢堡按鈕後展開) */}
      {isMenuOpen && (
        <div className="md:hidden bg-[#002244] border-t border-blue-800 px-4 py-6 space-y-4 shadow-xl">
          <Link href="/" className="block text-base font-medium hover:text-blue-200" onClick={() => setIsMenuOpen(false)}>首頁</Link>
          <Link href="/history" className="block text-base font-medium hover:text-blue-200" onClick={() => setIsMenuOpen(false)}>時光走廊</Link>
          <Link href="/map" className="block text-base font-medium hover:text-blue-200" onClick={() => setIsMenuOpen(false)}>企業地圖</Link>
          <Link href="/events" className="block text-base font-medium text-orange-300" onClick={() => setIsMenuOpen(false)}>活動報名</Link>
          
          <div className="h-px w-full bg-blue-800 my-4"></div>
          
          {user ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <span className="font-bold">{profile?.full_name}</span>
                {renderStatusTag()}
              </div>
              {profile?.role === 'admin' && (
                <Link href="/admin" className="block text-orange-400 font-bold" onClick={() => setIsMenuOpen(false)}>管理後台</Link>
              )}
              <button onClick={handleLogout} className="block text-red-300 font-bold w-full text-left">登出</button>
            </div>
          ) : (
            <Link href="/login" className="block text-base font-medium hover:text-blue-200" onClick={() => setIsMenuOpen(false)}>會員登入</Link>
          )}
          
          <Link href="/register" className="block w-full text-center mt-4 bg-white text-[#003366] px-5 py-3 rounded-xl font-bold" onClick={() => setIsMenuOpen(false)}>
            加入企業地圖
          </Link>
        </div>
      )}
    </nav>
  );
}