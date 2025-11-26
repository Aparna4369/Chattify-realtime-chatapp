import React, { useEffect } from "react";
import { Container } from "react-bootstrap";
import { Card, Form, Button } from "react-bootstrap";
import "../styles/signup.css";
import logo from '../assets/logo.png'
import {Link, useLocation} from 'react-router-dom'
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch,useSelector } from "react-redux";
import { useLoginMutation } from "../slices/userApiSlice";
import { setCredentials } from "../slices/authSlice";
import { toast } from "react-toastify";



const LoginScreen = () => {
  const [email,setEmail]=useState('')
  const [password,setPassword]=useState('')
  const navigate=useNavigate() 
  const dispatch=useDispatch()

  const [login,{isLoading}]=useLoginMutation()
  const {userInfo}=useSelector((state)=>state.auth)
  const {search}=useLocation()

  const sp=new URLSearchParams(search)
  const redirect=sp.get('redirect') ||'/'

useEffect(() => {
  if (userInfo) {
    navigate(redirect);
  }
}, [userInfo, navigate, redirect]);




  const submitHandler=async(e)=>{
    e.preventDefault()
    try{
      const res=await login({email,password}).unwrap()
      dispatch(setCredentials({...res}))
      navigate('/')
    }catch(error){
      toast.error(error?.data.message||error.message)
    }
    
  }

  return (
    <div className="body">
      <Container className="container text-center">
        <Card className="card shadow-lg rounded mx-auto ">
          <Card.Body>
          <img src={logo}  width='100' height='100' />
            <Card.Title className="head">Login</Card.Title>
             <Form onSubmit={submitHandler}>
           
              <Form.Control
                type="email"
                autoComplete="username"
                placeholder="Email"
                value={email}
                onChange={(e)=>setEmail(e.target.value)}
                className="mb-3"
              />
              <Form.Control
                type="password"
                autoComplete="new-password"
                placeholder="Password"
                value={password}
                onChange={(e)=>setPassword(e.target.value)}
                className="mb-3"
              />
              
             
              <Button type="submit" className="Btn w-100  ">    
                           
                Login
              </Button>
            </Form>
            
              <span className="text-dark">Don't have an account? 
                <Link to='/register'>Create an account here</Link>
                
              </span>
           
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default LoginScreen;
