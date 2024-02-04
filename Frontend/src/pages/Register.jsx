import React, { useState } from "react";
import { FaLock, FaUser } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";

import axios from "axios";

const Register = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      await axios.post("http://localhost:5000/register", {
        username,
        password,
      });
      navigate("/login");
      console.log("User registered successfully");
    } catch (error) {
      setUsername("");
      setPassword("");
      console.error("Error registering user:", error);
    }
  };
  return (
    <div className="wrapper">
      {/* <form action=""> */}
      <h1>Sign Up</h1>
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
      <button onClick={handleRegister} className="btn">
        Register
      </button>
      <div className="register-link">
        <p>
          Have an account? <Link to="/login">Login</Link>
        </p>
      </div>
      {/* </form> */}
    </div>
  );
};

export default Register;
