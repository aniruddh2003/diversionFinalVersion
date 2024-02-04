import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Stats from "../components/Stats";
import Actions from "../components/Actions";
import History from "../components/History";
import Testimonials from "../components/Testimonials";
import styles from "../style";

const Home = () => {
  const location = useLocation();
  const { user } = location.state || {};
  const navigate = useNavigate();
  const handleLogout = async () => {
    try {
      // await axios.post("http://localhost:3000/logout");
      navigate("/login");
    } catch (error) {
      console.error(
        "Error during logout:",
        error.response ? error.response.data.message : error.message
      );
    }
  };
  return (
    <div className="bg-primary w-full overflow-hidden">
      <div className={`${styles.paddingX} ${styles.flexCenter}`}>
        <div className={`${styles.boxWidth}`}>
          <Navbar />
        </div>
      </div>

      <div className={`bg-primary ${styles.flexStart}`}>
        <div className={`${styles.boxWidth}`}>
          <Hero />
        </div>
      </div>

      <div className={`bg-primary ${styles.paddingX} ${styles.flexCenter}`}>
        <div className={`${styles.boxWidth}`}>
          <Stats />
          <Actions />
          {/* <Button /> */}
          <History />
          <Testimonials />
          {/*
        <Billing />
        <CardDeal />
        <Testimonials />
        <Clients />
        <CTA />
        <Footer /> */}
        </div>
      </div>
    </div>
  );
};

export default Home;
