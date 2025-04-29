import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Cookies from "js-cookie";
import { decodeToken } from "react-jwt";
import AdminAccountHeader from "./AdminComponents/AdminAccountHeader.jsx";
import UserAccount from "./UserComponents/UserAccount.jsx";
import "../styles/account.css";
import HeroSection from "./HomePage/HeroSection.jsx";
import GallerySlider from "./HomePage/GallerySlider.jsx";
import BathRental from "./HomePage/BathRental.jsx";
import BookingTerms from "./HomePage/BookingTerms.jsx";
import VirtualTour from "./HomePage/VirtualTour.jsx";
import GuestHeader from "./GuestHeader.jsx";
import Footer from "./Footer.jsx";
import UserAccountHeader from "./UserComponents/UserAccountHeader.jsx";

function Home() {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const token = Cookies.get("token");

    if (token) {
      const decoded = decodeToken(token);
      if (decoded) {
        setUserData({
          userId: decoded.userId,
          firstName: Cookies.get("firstName"),
          role: decoded.role,
        });
      }
    }
  }, []);

  return (
    <>
      <main className="home-container">
        {userData ? (
          <>
            <div>
              {userData.role === "admin" ? (
                <>
                  <AdminAccountHeader userId={userData.userId} />
                  <HeroSection />
                  <GallerySlider />
                  <BathRental />
                  <VirtualTour />
                </>
              ) : (
                <>
                  <UserAccountHeader userId={userData.userId} />
                  <HeroSection />
                  <GallerySlider />
                  <BathRental />
                  <VirtualTour />
                </>
              )}
            </div>
          </>
        ) : (
          <>
            <GuestHeader />

            <HeroSection />
            <GallerySlider />
            <BathRental />
            <BookingTerms />
            <VirtualTour />
          </>
        )}
      </main>
      <Footer />
    </>
  );
}

export default Home;
