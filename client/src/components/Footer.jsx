// Footer.jsx
import React from "react";
import { NavLink } from "react-router-dom";
import "../styles/footer.css";

const Footer = () => {
  return (
    <footer className="main-footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3 className="footer-title">ДомБан</h3>
          <p className="footer-text">
            Комфортные бани для вашего отдыха и релаксации
          </p>
        </div>

        <div className="footer-section">
          <h4 className="footer-subtitle">Навигация</h4>
          <ul className="footer-links">
            <li>
              <NavLink to="/" className="footer-link">
                Главная
              </NavLink>
            </li>
            <li>
              <NavLink to="/baths" className="footer-link">
                Наши бани
              </NavLink>
            </li>
            <li>
              <NavLink to="/booking" className="footer-link">
                Бронирование
              </NavLink>
            </li>
            <li>
              <NavLink to="/contacts" className="footer-link">
                Контакты
              </NavLink>
            </li>
          </ul>
        </div>

        <div className="footer-section">
          <h4 className="footer-subtitle">Контакты</h4>
          <ul className="footer-contacts">
            <li>
              <a href="tel:+79036547447" className="footer-link">
                +7 (903) 654-74-47
              </a>
            </li>
            <li>
              <a href="mailto:info@domban.ru" className="footer-link">
                info@domban.ru
              </a>
            </li>
            <li className="footer-address">
            г. Воронеж, ул. Егорова д. 10
            </li>
          </ul>
        </div>

        
      </div>

      <div className="footer-bottom">
        <p className="copyright">
          © {new Date().getFullYear()} ДомБан. Все права защищены
        </p>
      </div>
    </footer>
  );
};

export default Footer;