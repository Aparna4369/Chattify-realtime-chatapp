import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://chattify-realtime-chatapp.onrender.com/api',
    credentials: 'include',
    prepareHeaders: (headers, { getState, endpoint }) => {
      const token = getState().auth?.userInfo?.token;
      
      
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      
      
      const noCacheEndpoints = ['getUsers', 'getChat']; 
      
      if (noCacheEndpoints.includes(endpoint)) {
        headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
        headers.set('Pragma', 'no-cache');
        headers.set('Expires', '0');
      }
      
      
      headers.set('X-Request-Time', Date.now().toString());
      
      return headers;
    },
  }),
  tagTypes: ['User', 'Chat', 'Messages'],
  endpoints: () => ({}),
});

export default apiSlice;