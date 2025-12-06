import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://chattify-realtime-chatapp.onrender.com/api',
    credentials: 'include',
    prepareHeaders: (headers, { getState }) => {
      const state = getState();
      
      // Try multiple sources for token
      const token = state.auth?.userInfo?.token || 
                    localStorage.getItem('token');
      
      // Add Authorization header if token exists
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      
      // ✅ CORRECT: REMOVE ALL CUSTOM HEADERS THAT CAUSE CORS
      // No X-Request-Time header
      // No Cache-Control headers (browser handles this)
      // No Pragma or Expires headers
      
      return headers;
    },
  }),
  tagTypes: ['User', 'Chat', 'Messages'],
  endpoints: () => ({}),
});

export default apiSlice;