import React, { useState } from "react";
import { Container, Card, Form, Button } from "react-bootstrap";
import "../styles/signup.css";
import logo from '../assets/logo.png';
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useRegisterMutation } from "../slices/userApiSlice";
import { toast } from "react-toastify";
import { setCredentials } from "../slices/authSlice";

const SignupScreen = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [register, { isLoading }] = useRegisterMutation();

 const submitHandler = async (e) => {
  e.preventDefault();
  if (password !== confirmPassword) {
    toast.error("Passwords do not match");
    return;
  }

  try {
    const userData = { name, email, password };
    const res = await register(userData).unwrap();
    
    // ✅ DEBUG: Log entire response
    console.log('=== FULL REGISTRATION RESPONSE ===');
    console.log('Response object:', res);
    console.log('Response keys:', Object.keys(res));
    console.log('Has token?', 'token' in res);
    console.log('Token value:', res.token);
    console.log('=== END DEBUG ===');
    
    // Store in localStorage
    if (res.token) {
      localStorage.setItem('token', res.token);
      console.log('✅ Token stored in localStorage');
    } else {
      console.error('❌ ERROR: No token in response!');
      console.error('Response was:', res);
    }
    
    // Dispatch to Redux
    dispatch(setCredentials({
      userInfo: {
        _id: res._id,
        name: res.name,
        email: res.email,
        image: res.image
      },
      token: res.token // This will be undefined if no token
    }));
    
    toast.success("Account created successfully!");
    navigate("/home");
    
  } catch (error) {
    toast.error(error?.data?.message || error.message);
  }
};

  return (
    <div className="body">
      <Container className="text-center">
        <Card className="card shadow-lg p-3 rounded mx-auto">
          <Card.Body>
            <img src={logo} width="100" height="100" alt="logo" />
            <Card.Title className="head mx-3">Create an Account</Card.Title>

            <Form onSubmit={submitHandler}>
              <Form.Control
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
                className="mb-3"
              />
              <Form.Control
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="username"
                className="mb-3"
              />
              <Form.Control
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                className="mb-3"
              />
              <Form.Control
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
                className="mb-3"
              />

              <Button type="submit" className="Btn w-100" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create an Account"}
              </Button>
            </Form>

            <span className="text-dark">
              Already have an account? <Link to="/login">Login Here</Link>
            </span>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default SignupScreen;