'use client';

import { logoutUser } from '@/store/slices/authSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { useAuthInit } from '@/hooks/useAuthInit';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function FeedClient() {
  useAuthInit();

  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user } = useAppSelector((s) => s.auth);

  // protected route: no token → back to login
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) router.replace('/login');
  }, [router]);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    router.replace('/login');
  };

  if (!user) return null;

  return (
    <div className="_layout _layout_main_wrapper">
      <div className="container" style={{ paddingTop: 40 }}>
        <h4>
          Logged in as {user.firstName} {user.lastName}
        </h4>
        <p>Feed UI coming next.</p>
        <button type="button" className="_btn1" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
}
