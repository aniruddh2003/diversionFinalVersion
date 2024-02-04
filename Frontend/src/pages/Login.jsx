import React, { useState } from "react";
import { FaLock, FaUser } from "react-icons/fa";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const handleLogin = async () => {
    try {
      await axios.post("http://localhost:5000/login", { username, password });
      console.log("Login successful");
      navigate("/", { state: { user: username } });
      console.log("User registered successfully");
    } catch (error) {
      setUsername("");
      setPassword("");
      navigate("/login");
      console.log("Error logging in:", error);
    }
  };
  return (
    <div className="wrapper">
      <h1>Login</h1>
      <div className="input-box">
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <FaUser className="icon" />
      </div>
      <div className="input-box">
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <FaLock className="icon" />
      </div>
      <div className="remember-forgot">
        <label>
          <input type="checkbox" />
          Remember Me
        </label>
        <Link to="/">Forgot Password</Link>
      </div>
      <button onClick={handleLogin} className="btn">
        Login
      </button>
      <div className="register-link">
        <p>
          Dont have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
