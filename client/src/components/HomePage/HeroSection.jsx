import React, {useState, useEffect} from "react";
import imageIrl from "../../assets/img/1_4.webp";
import "../../styles/herosection.css";
import "../../styles/home.css";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { decodeToken } from "react-jwt";

const HeroSection = () => {
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  const handleBookClick = () => {
    console.log(userData)
    if (userData.role === 'user'){
      navigate(`/userAccount/${userData.userId}/bookingForm`);    }
    else{
      const bookingSection = document.getElementById('booking-terms');
      if (bookingSection) {
        bookingSection.scrollIntoView({
          behavior: 'smooth'
        });
      }
    }
  };
  
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
    <section className="hero">
      <div className="hero__container">
        <div className="hero__content">
          <h1 className="hero__title">
            ДОМАШНЯЯ БАНЯ
            <br />
            НА ДРОВАХ
          </h1>
          <p className="hero__description">
            Добро пожаловать в нашу уютную баню! Отвлекитесь от суеты и
            окунитесь в атмосферу тепла и комфорта. Наша баня – ваш уголок
            релаксации.
          </p>
          <button className="home-button" onClick={handleBookClick}>
            Забронировать
          </button>
          <p className="hero__address">г. Воронеж, ул. Егорова д. 10</p>
        </div>
        <div className="hero__image-wrapper">
          <img src={imageIrl} alt="Баня" className="hero__image" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;