import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { decodeToken } from "react-jwt";
import { AdminAccountHeader, UserAccountHeader } from "@/widgets/account-navigation";
import "@/shared/ui/styles/account.css";
import HeroSection from "./hero-section.jsx";
import GallerySlider from "./gallery-slider.jsx";
import BathRental from "./bath-rental.jsx";
import BookingTerms from "./booking-terms.jsx";
import VirtualTour from "./virtual-tour.jsx";
import GuestHeader from "./guest-header.jsx";
import Footer from "./footer.jsx";

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
