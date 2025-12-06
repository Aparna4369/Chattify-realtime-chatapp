import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://chattify-realtime-chatapp.onrender.com/api',
    credentials: 'include',
    prepareHeaders: (headers, { getState }) => {
      const state = getState();
      
      console.log('🔐 API Slice: Getting token from state...');
      
      // Get token from multiple possible locations
      let token = state.auth?.token || 
                  state.auth?.userInfo?.token ||
                  localStorage.getItem('token');
      
      console.log('🔐 Token found:', !!token);
      
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
        console.log('🔐 Authorization header set');
      } else {
        console.log('🔐 No token available for Authorization header');
        console.log('🔐 Auth state:', state.auth);
        console.log('🔐 localStorage token:', localStorage.getItem('token'));
      }
      
      return headers;
    },
  }),
  tagTypes: ['User', 'Chat', 'Messages'],
  endpoints: () => ({}),
});

export default apiSlice;