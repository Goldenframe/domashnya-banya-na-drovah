import React, { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import "../../styles/account.css";

const AdminAccountHeader = ({ userId }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isMenuOpen) {
      closeMenu();
    }
  }, [location]);

  const goToHome = (e) => {
    e.preventDefault();
    closeMenu();
    setTimeout(() => {
      navigate("/");
    }, 100);
  };

  const toggleMenu = () => {
    if (isMenuOpen) {
      closeMenu();
    } else {
      setIsMenuOpen(true);
      setIsClosing(false);
      document.body.style.overflow = "hidden";
    }
  };

  const closeMenu = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsMenuOpen(false);
      setIsClosing(false);
      document.body.style.overflow = "";
    }, 500);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isMenuOpen) {
        closeMenu();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isMenuOpen]);

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

        <button
          className="burger-menu"
          onClick={toggleMenu}
          aria-label={isMenuOpen ? "Закрыть меню" : "Открыть меню"}
          aria-expanded={isMenuOpen}
          aria-controls="main-navigation"
        >
          <span className="burger-line" aria-hidden="true"></span>
          <span className="burger-line" aria-hidden="true"></span>
          <span className="burger-line" aria-hidden="true"></span>
        </button>

        <nav
          id="main-navigation"
          className={`nav-links ${isMenuOpen ? "active" : ""} ${
            isClosing ? "closing" : ""
          }`}
          aria-label="Основная навигация"
        >
          <ul>
            <li>
              <NavLink
                to={`/adminAccount/${userId}/intervals`}
                className={({ isActive }) => (isActive ? "active" : "")}
                aria-current={({ isActive }) => (isActive ? "page" : null)}
              >
                Интервалы
              </NavLink>
            </li>
            <li>
              <NavLink
                to={`/adminAccount/${userId}/bookings/upcoming`}
                className={({ isActive }) => (isActive ? "active" : "")}
                aria-current={({ isActive }) => (isActive ? "page" : null)}
              >
                Бронирования
              </NavLink>
            </li>
            <li>
              <NavLink
                to={`/adminAccount/${userId}/discountsManager/new-discount`}
                className={({ isActive }) => (isActive ? "active" : "")}
                aria-current={({ isActive }) => (isActive ? "page" : null)}
              >
                Акции
              </NavLink>
            </li>
            <li>
              <NavLink
                to={`/adminAccount/${userId}/editProfile`}
                className={({ isActive }) => (isActive ? "active" : "")}
                aria-current={({ isActive }) => (isActive ? "page" : null)}
              >
                Профиль
              </NavLink>
            </li>
          </ul>
        </nav>

        {isMenuOpen && (
          <div
            className="menu-backdrop"
            onClick={closeMenu}
            role="presentation"
            aria-hidden="true"
          />
        )}
      </header>
    </div>
  );
};

export default AdminAccountHeader;
