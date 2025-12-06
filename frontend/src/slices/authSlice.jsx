import { createSlice } from "@reduxjs/toolkit";

// Get initial state from localStorage
const userInfoFromStorage = localStorage.getItem('userInfo')
  ? JSON.parse(localStorage.getItem('userInfo'))
  : null;

const tokenFromStorage = localStorage.getItem('token') || null;

const initialState = {
  userInfo: userInfoFromStorage,
  token: tokenFromStorage, // ✅ Store token separately
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      console.log('setCredentials called with:', action.payload);
      
      // Handle different response formats
      if (action.payload._id) {
        // If payload contains user object
        state.userInfo = {
          _id: action.payload._id,
          name: action.payload.name,
          email: action.payload.email,
          image: action.payload.image,
        };
        
        // Store token if provided
        if (action.payload.token) {
          state.token = action.payload.token;
          localStorage.setItem('token', action.payload.token);
        }
        
        // Store user info
        localStorage.setItem('userInfo', JSON.stringify(state.userInfo));
        
      } else if (action.payload.userInfo && action.payload.token) {
        // If payload has separate userInfo and token
        state.userInfo = action.payload.userInfo;
        state.token = action.payload.token;
        
        localStorage.setItem('userInfo', JSON.stringify(action.payload.userInfo));
        localStorage.setItem('token', action.payload.token);
        
      } else {
        // Fallback: store everything as userInfo
        state.userInfo = action.payload;
        localStorage.setItem('userInfo', JSON.stringify(action.payload));
      }
      
      console.log('State after setCredentials:', state);
    },
    
    logout: (state) => {
      state.userInfo = null;
      state.token = null;
      localStorage.removeItem('userInfo');
      localStorage.removeItem('token');
      console.log('User logged out, localStorage cleared');
    }
  }
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;