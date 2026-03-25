"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null); // 用來儲存從資料庫抓來的會員詳細身分

  useEffect(() => {
    const fetchUserData = async () => {
      // 1. 先看有沒有人登入
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setUser(session.user);
        // 2. 有登入的話，去 profiles 表格查他的「審核狀態」和「繳費狀態」
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
          
        if (data) setProfile(data);
      } else {
        setUser(null);
        setProfile(null);
      }
    };
    
    fetchUserData();

    // 隨時監聽登入或登出動作，即時更新畫面
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        fetchUserData();
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/'; 
  };

  // 一個小工具：根據不同身分，給予不同顏色的標籤
  const renderStatusTag = () => {
    if (!profile) return null;
    
    if (profile.status === 'pending') {
      return <span className="text-yellow-800 text-xs bg-yellow-200 px-2 py-1 rounded font-bold">審核中</span>;
    }
    if (profile.status === 'approved' && profile.is_paid) {
      return <span className="text-green-800 text-xs bg-green-200 px-2 py-1 rounded font-bold">正式會員</span>;
    }
    // 如果審核通過但沒繳費
    return <span className="text-blue-200 text-xs bg-blue-800 px-2 py-1 rounded">一般會員</span>;
  };

  return (
    <nav className="bg-[#003366] text-white py-4 px-6 flex justify-between items-center shadow-md sticky top-0 z-50">
      <Link href="/" className="text-xl font-black tracking-wider hover:text-blue-200 transition-colors">
        延平校友總會
      </Link>
      
      <div className="flex items-center space-x-6 text-sm font-medium">
        <Link href="/" className="hover:text-blue-200 transition-colors">首頁</Link>
        <Link href="/history" className="hover:text-blue-200 transition-colors">時光走廊</Link>
        <Link href="/map" className="hover:text-blue-200 transition-colors">企業地圖</Link>
        <Link href="/events" className="hover:text-blue-200 transition-colors text-orange-300 font-bold">活動報名</Link>
        
        {/* 管理員專屬秘密通道 */}
        {profile?.role === 'admin' && (
          <Link href="/admin" className="text-orange-400 font-bold hover:text-orange-300 transition-colors">管理後台</Link>
        )}
        
        <div className="w-px h-4 bg-blue-400 opacity-50"></div>
        
        {/* 如果有登入，顯示姓名跟身分標籤 */}
        {user ? (
          <div className="flex items-center space-x-4">
            <span className="text-sm font-bold">{profile?.full_name}</span>
            {renderStatusTag()}
            <button onClick={handleLogout} className="hover:text-red-300 transition-colors font-bold">
              登出
            </button>
          </div>
        ) : (
          <Link href="/login" className="hover:text-blue-200 transition-colors">會員登入</Link>
        )}
        
        <Link href="/register" className="bg-white text-[#003366] px-5 py-2 rounded-full font-bold hover:bg-blue-50 transition-colors shadow-sm">
          加入企業地圖
        </Link>
      </div>
    </nav>
  );
}