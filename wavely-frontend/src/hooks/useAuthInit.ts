'use client';

import { useEffect } from 'react';
import { setCredentials } from '@/store/slices/authSlice';
import { useAppDispatch } from '@/store/hooks';
import { IUser } from '@/types';

// rehydrates Redux auth state from localStorage on app load
export function useAuthInit() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const userRaw = localStorage.getItem('user');

    if (token && userRaw) {
      try {
        const user = JSON.parse(userRaw) as IUser;
        dispatch(setCredentials({ user, accessToken: token }));
      } catch {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
      }
    }
  }, [dispatch]);
}
