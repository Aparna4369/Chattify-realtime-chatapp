import React, { useEffect, useState } from "react";
import { Container, Card, Form, Button } from "react-bootstrap";
import "../styles/signup.css";
import logo from '../assets/logo.png';
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useLoginMutation } from "../slices/userApiSlice";
import { setCredentials } from "../slices/authSlice";
import { toast } from "react-toastify";
import Loader from "../components/Loader";

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [login, { isLoading }] = useLoginMutation();
  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    if (userInfo) navigate('/home');
  }, [userInfo, navigate]);

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const res = await login({ email, password }).unwrap();
      dispatch(setCredentials(res));
    } catch (error) {
      toast.error(error.data?.message || "Invalid email or password");
    }
  };

  return (
    <div className="body">
      <Container className="container text-center">
        <Card className="card shadow-lg rounded mx-auto">
          <Card.Body>
            <img src={logo} width="100" height="100" alt="logo" />
            <Card.Title className="head">Login</Card.Title>

            {isLoading ? (
              <Loader />
            ) : (
              <Form onSubmit={submitHandler}>
                <Form.Control
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mb-3"
                  autoComplete="username"
                  required
                />
                <Form.Control
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mb-3"
                  autoComplete="current-password"
                  required
                />
                <Button type="submit" className="Btn w-100" disabled={isLoading}>
                  {isLoading ? "Logging in..." : "Login"}
                </Button>
              </Form>
            )}

            <span className="text-dark">
              Don't have an account? <Link to="/register">Create an account here</Link>
            </span>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default LoginScreen;
