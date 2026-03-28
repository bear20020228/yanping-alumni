"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

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

  // --- 新增：加入企業地圖按鈕的即時攔截器 ---
  const handleMapJoinClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsMenuOpen(false); // 關閉手機版選單
    
    // 即時檢查當前 Session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      alert('請先登入會員，才能登錄您的企業地圖喔！');
      router.push('/login');
    } else {
      router.push('/add-business');
    }
  };

  const renderStatusTag = () => {
    if (!profile) return null;
    if (profile.role === 'admin') return <span className="text-red-800 text-[10px] bg-red-200 px-2 py-0.5 rounded font-black">管理員</span>;
    if (profile.status === 'pending') return <span className="text-yellow-800 text-[10px] bg-yellow-100 px-2 py-0.5 rounded font-black">審核中</span>;
    if (profile.status === 'approved' && profile.is_paid) return <span className="text-green-800 text-[10px] bg-green-200 px-2 py-0.5 rounded font-black">正式會員</span>;
    return <span className="text-green-100 text-[10px] bg-green-900 px-2 py-0.5 rounded font-black">一般會員</span>;
  };

  return (
    <>
      <nav className="bg-[#004d00] text-white sticky top-0 z-50 shadow-lg border-b border-green-900">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          
          <Link href="/" className="text-2xl font-black tracking-tighter text-white hover:text-green-200 transition-colors">
            延平校友總會
          </Link>
          
          <div className="hidden md:flex items-center space-x-6 text-sm font-bold">
            <Link href="/" className="hover:text-green-200 transition-colors">首頁</Link>
            <Link href="/history" className="hover:text-green-200 transition-colors">時光走廊</Link>
            <Link href="/map" className="hover:text-green-200 transition-colors">企業地圖</Link>
            <Link href="/events" className="text-yellow-300 hover:text-yellow-200 transition-colors">活動報名</Link>
            
            <div className="w-px h-4 bg-green-700"></div>
            
            {user ? (
              <div className="flex items-center space-x-5">
                <div className="flex flex-col items-end leading-none">
                  <span className="text-sm font-black text-white mb-1">{profile?.full_name}</span>
                  {renderStatusTag()}
                </div>
                <Link href="/profile" className="text-green-200 hover:text-white transition-colors">數位校友卡</Link>
                {profile?.role === 'admin' && (
                  <Link href="/admin" className="text-orange-400 hover:text-orange-300">管理後台</Link>
                )}
                <button onClick={handleLogout} className="hover:text-red-300 text-xs">登出</button>
              </div>
            ) : (
              <Link href="/login" className="hover:text-green-200 transition-colors">會員登入</Link>
            )}
            
            {/* 改為按鈕點擊觸發攔截 */}
            <button 
              onClick={handleMapJoinClick}
              className="bg-orange-500 text-white px-6 py-2.5 rounded-full font-black hover:bg-orange-600 transition-all shadow-md active:scale-95 text-xs"
            >
              加入企業地圖
            </button>
          </div>

          <button className="md:hidden text-white p-1.5 z-[60] relative" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </nav>

      <div className={`fixed inset-0 bg-black/70 z-[55] transition-opacity duration-300 ${isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsMenuOpen(false)} />
      <div className={`fixed inset-y-0 right-0 z-[60] w-72 bg-[#002200] shadow-2xl p-8 pt-24 space-y-6 transform transition-transform duration-300 ease-in-out ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <Link href="/" className="block text-lg font-black text-white" onClick={() => setIsMenuOpen(false)}>首頁</Link>
        <Link href="/history" className="block text-lg font-black text-white" onClick={() => setIsMenuOpen(false)}>時光走廊</Link>
        <Link href="/map" className="block text-lg font-black text-white" onClick={() => setIsMenuOpen(false)}>企業地圖</Link>
        <Link href="/events" className="block text-lg font-black text-yellow-300" onClick={() => setIsMenuOpen(false)}>活動報名</Link>
        
        <div className="h-px w-full bg-green-900 my-6 opacity-50"></div>
        
        {user ? (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="font-black text-xl text-white">{profile?.full_name}</span>
              {renderStatusTag()}
            </div>
            <Link href="/profile" className="block text-green-200 font-bold" onClick={() => setIsMenuOpen(false)}>數位校友卡</Link>
            {profile?.role === 'admin' && (
              <Link href="/admin" className="block text-orange-400 font-bold" onClick={() => setIsMenuOpen(false)}>管理後台</Link>
            )}
            <button onClick={handleLogout} className="block text-red-400 font-bold">登出</button>
          </div>
        ) : (
          <Link href="/login" className="block text-lg font-bold text-white" onClick={() => setIsMenuOpen(false)}>會員登入</Link>
        )}
        
        <button 
          onClick={handleMapJoinClick}
          className="w-full bg-orange-500 text-white py-4 rounded-2xl font-black text-center shadow-lg active:scale-95"
        >
          加入企業地圖
        </button>
      </div>
    </>
  );
}