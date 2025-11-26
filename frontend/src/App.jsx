import React from 'react'
import HomeScreen from './screens/homeScreen'
import SignupScreen from './screens/signupScreen'
import { Route } from 'react-router'
import { Routes } from 'react-router'
import LoginScreen from './screens/loginScreen'
import {ToastContainer} from 'react-toastify'
import { useSelector } from 'react-redux'
import "react-toastify/dist/ReactToastify.css";




const App = () => {
  const {userInfo}=useSelector((state)=>state.auth)
  return (

    <div>     
      
        <Routes>
           <Route path='/register' element={<SignupScreen/>} />
           <Route path='/login' element={<LoginScreen/>} />
          <Route path='/' element={ userInfo? <HomeScreen/>:<LoginScreen/>} />
          
        </Routes>
     
      <ToastContainer  position="top-right"   autoClose={2000}   newestOnTop   pauseOnHover />

      
    
    </div>
  )
}

export default App