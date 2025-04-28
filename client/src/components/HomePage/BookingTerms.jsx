import React from "react";
import "../../styles/home.css";
import { useNavigate } from "react-router-dom";

export default function BookingTerms() {
  const navigate = useNavigate();

  return (
    <section className="booking-terms">
      <h2 className="title" id="booking-terms">УСЛОВИЯ БРОНИРОВАНИЯ</h2>
      <p className="booking-info">
        Для оформления бронирования через сайт необходимо{" "}
        <span>зарегистрироваться</span>.
      </p>
      <p className="booking-info">
        Если вы не хотите регистрироваться, вы можете{" "}
        <span>
          связаться с нами по телефону:
          <br />8 (903) 654-74-47
        </span>{" "}
        – мы с радостью поможем вам оформить бронь!
      </p>

      <button className="home-button" onClick={() => navigate("/register")}>
        Зарегистрироваться
      </button>
    </section>
  );
}
