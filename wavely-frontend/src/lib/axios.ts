import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export const axiosPublic = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

export const axiosPrivate = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, 
});

axiosPrivate.interceptors.request.use((config) => {
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

axiosPrivate.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const res = await axiosPublic.post('/auth/refresh-token');
        const newToken = res.data?.data?.accessToken;

        if (newToken) {
          localStorage.setItem('accessToken', newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return axiosPrivate(originalRequest);
        }
      } catch {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  },
);
