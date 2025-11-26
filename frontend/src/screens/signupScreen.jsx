import React from "react";
import { useState,useEffect } from "react";
import { Container } from "react-bootstrap";
import { Card, Form, Button } from "react-bootstrap";
import "../styles/signup.css";
import logo from '../assets/logo.png'
import { Link, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useRegisterMutation } from "../slices/userApiSlice";
import {setCredentials} from '../slices/authSlice'
import { toast } from "react-toastify";


const SignupScreen = () => {
  const [name,setName]=useState("")
  const[email,setEmail]= useState("")
  const[password,setPassword]= useState("")
  const [confirmPassword,setConfirmPassword]=useState("")

  const dispatch=useDispatch()
  const navigate=useNavigate()

  const [register,{isLoading}]=useRegisterMutation()
  const {userInfo}=useSelector((state)=>state.auth)
  const {search}=useLocation()

  const sp=new URLSearchParams(search);
  const redirect=sp.get("redirect") || '/'


  useEffect(()=>{
    if(userInfo){
      navigate(redirect)
    } 

  },[userInfo,redirect,navigate])


  

  const submitHandler=async(e)=>{
    e.preventDefault()
    if(password!==confirmPassword){
      toast.error("password is do not match");
      
    }else{
      try{
        const res=await register({name,email,password}).unwrap()
        dispatch(setCredentials({...res}))
        toast.success("Your Account Created Successfully....Please Login")
        navigate('/')
      }catch(error){
        toast.error(error?.data.message || error.message)

      }
    }
    
  }
  return (
    <div className="body">
      <Container className="text-center">
        <Card className="card shadow-lg p-3 rounded mx-auto ">
          <Card.Body>
          <img src={logo}  width='100' height='100' />
            <Card.Title className="head mx-3">Create an Account</Card.Title>

            <Form onSubmit={submitHandler}>
              <Form.Control
                type="name"
                placeholder="Name"
                value={name}
                onChange={(e)=>setName(e.target.value)}
                required
                autoComplete="name"
                className="mb-3"
              />
              <Form.Control
                type="email"
                autoComplete="username"
                placeholder="Email"
                value={email}
                onChange={(e)=>setEmail(e.target.value)}
                required
                className="mb-3"
              />
              <Form.Control
                type="password"
                autoComplete="new-password"
                placeholder="Password"
                value={password}
                onChange={(e)=>setPassword(e.target.value)}
                required
                className="mb-3"
              />
              <Form.Control
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e)=>setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
                className="mb-3"
              />
              <Form.Group controlId="formFile" className="mb-3">                
                <Form.Control type="file" />
                <Form.Label className="text-dark fs-6">Upload Your profile picture here</Form.Label>
              </Form.Group>
              <Button type="submit" className="Btn w-100" disabled={isLoading}>                
                {isLoading ? "Creating....": "Create an Account"} 
                <Link to={'/'}></Link>
              </Button>
            </Form>
            
              <span className="text-dark">Already have an account? 
                <Link to='/login'>Login Here</Link>
              </span>
           
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default SignupScreen;
