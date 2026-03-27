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
    if (profile.role === 'admin') return <span className="text-red-800 text-xs bg-red-200 px-2.5 py-1 rounded font-bold">管理員</span>;
    if (profile.status === 'pending') return <span className="text-yellow-800 text-xs bg-yellow-100 px-2.5 py-1 rounded font-bold">審核中</span>;
    if (profile.status === 'approved' && profile.is_paid) return <span className="text-green-800 text-xs bg-green-200 px-2.5 py-1 rounded font-bold">正式會員</span>;
    return <span className="text-green-100 text-xs bg-green-900 px-2.5 py-1 rounded">一般會員</span>; // 改為綠色系
  };

  return (
    <>
      {/* 導覽列主體：換上 Yanping Green (#004d00) */}
      <nav className="bg-[#004d00] text-white sticky top-0 z-50 shadow-lg border-b border-green-900">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          
          {/* 左側 Logo */}
          <Link href="/" className="text-2xl font-black tracking-widest text-white hover:text-green-200 transition-colors">
            延平校友總會
          </Link>
          
          {/* 桌機版選單 */}
          <div className="hidden md:flex items-center space-x-6 text-sm font-medium">
            <Link href="/" className="hover:text-green-200 transition-colors py-1.5">首頁</Link>
            <Link href="/history" className="hover:text-green-200 transition-colors py-1.5">時光走廊</Link>
            <Link href="/map" className="hover:text-green-200 transition-colors py-1.5">企業地圖</Link>
            <Link href="/events" className="hover:text-yellow-200 transition-colors py-1.5 text-yellow-300 font-bold">活動報名</Link>
            
            <div className="w-px h-5 bg-green-700 opacity-60"></div>
            
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="flex flex-col items-end">
                  <span className="text-sm font-bold text-white">{profile?.full_name}</span>
                  {renderStatusTag()}
                </div>
                
                {/* 桌機版：數位校友卡 */}
                <Link href="/profile" className="text-green-200 font-bold hover:text-white transition-colors">數位校友卡</Link>
                
                {profile?.role === 'admin' && (
                  <Link href="/admin" className="text-orange-400 font-bold hover:text-orange-300 transition-colors">管理後台</Link>
                )}
                <button onClick={handleLogout} className="hover:text-red-300 transition-colors font-bold text-sm">登出</button>
              </div>
            ) : (
              <Link href="/login" className="hover:text-green-200 transition-colors py-1.5">會員登入</Link>
            )}
            
            <Link href="/register" className="bg-orange-500 text-white px-6 py-2.5 rounded-full font-bold hover:bg-orange-600 transition-colors shadow-sm text-sm transform hover:scale-105 duration-300">
              加入企業地圖
            </Link>
          </div>

          {/* 手機版漢堡按鈕 */}
          <button 
            className="md:hidden text-white focus:outline-none p-1.5 z-50 relative" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /> // 叉叉
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /> // 三條線
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* 手機版側邊選單：縮進去模式 (Sliding Sidebar) */}
      <div 
        className={`fixed inset-0 bg-black/60 z-40 transition-opacity duration-300 ${isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
        onClick={() => setIsMenuOpen(false)}
      />
      <div 
        className={`fixed inset-y-0 right-0 z-50 w-72 bg-[#003300] border-l border-green-900 shadow-xl p-6 pt-24 space-y-6 transform transition-transform duration-300 ease-in-out ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <Link href="/" className="block text-lg font-medium hover:text-green-200 text-white" onClick={() => setIsMenuOpen(false)}>首頁</Link>
        <Link href="/history" className="block text-lg font-medium hover:text-green-200 text-white" onClick={() => setIsMenuOpen(false)}>時光走廊</Link>
        <Link href="/map" className="block text-lg font-medium hover:text-green-200 text-white" onClick={() => setIsMenuOpen(false)}>企業地圖</Link>
        <Link href="/events" className="block text-lg font-bold text-yellow-300" onClick={() => setIsMenuOpen(false)}>活動報名</Link>
        
        <div className="h-px w-full bg-green-800 my-6"></div>
        
        {user ? (
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <span className="font-bold text-lg text-white">{profile?.full_name}</span>
              {renderStatusTag()}
            </div>
            
            {/* 手機版：數位校友卡 */}
            <Link href="/profile" className="block text-green-200 font-bold hover:text-white transition-colors" onClick={() => setIsMenuOpen(false)}>數位校友卡</Link>

            {profile?.role === 'admin' && (
              <Link href="/admin" className="block text-orange-400 font-bold" onClick={() => setIsMenuOpen(false)}>管理後台</Link>
            )}

            <button onClick={handleLogout} className="block text-red-300 font-bold w-full text-left">登出</button>
          </div>
        ) : (
          
          <Link href="/login" className="block text-base font-medium hover:text-green-200 text-white" onClick={() => setIsMenuOpen(false)}>會員登入</Link>
        )}
        
        <Link href="/register" className="block w-full text-center mt-6 bg-white text-[#004d00] px-5 py-3.5 rounded-xl font-bold hover:bg-blue-50 transition-colors shadow-lg" onClick={() => setIsMenuOpen(false)}>
          加入企業地圖
        </Link>
      </div>
    </>
  );
}