import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "../styles/account.css";

const GuestHeader = () => {
  const navigate = useNavigate();

  const goToHome = (e) => {
    e.preventDefault();
    navigate("/");
  };

  return (
    <div className="home-links">
      <header className="account-header" role="banner">
        <NavLink
          to="/"
          className="logo"
          aria-current={({ isActive }) => (isActive ? "page" : null)}
          onClick={goToHome}
        >
          ДомБан
        </NavLink>

        <div className="login-container">
          <NavLink
            to="/login"
            className="login-button"
            aria-current={({ isActive }) => (isActive ? "page" : null)}
          >
            Войти
          </NavLink>
        </div>
      </header>
    </div>
  );
};

export default GuestHeader;