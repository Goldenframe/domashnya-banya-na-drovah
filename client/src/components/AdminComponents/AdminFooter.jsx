import React from "react";
import { NavLink } from "react-router-dom";
import "../../styles/footer.css";

const AdminFooter = ({ userId }) => {
  return (
    <footer className="main-footer">
      <div className="footer-container">
        <div className="footer-section">
          <NavLink to="/" className="footer-title" aria-label="На главную">
            ДомБан
          </NavLink>
        </div>

        <div className="footer-section">
          <h4 className="footer-subtitle">Навигация</h4>
          <nav aria-label="Дополнительная навигация">
            <ul className="footer-links">
              <li>
                <NavLink
                  to={`/adminAccount/${userId}/intervals`}
                  className="footer-link"
                  aria-current={({ isActive }) => (isActive ? "page" : null)}
                >
                  Интервалы
                </NavLink>
              </li>
              <li>
                <NavLink
                  to={`/adminAccount/${userId}/bookings/upcoming`}
                  className="footer-link"
                  aria-current={({ isActive }) => (isActive ? "page" : null)}
                >
                  Бронирования
                </NavLink>
              </li>
              <li>
                <NavLink
                  to={`/adminAccount/${userId}/discountsManager/new-discount`}
                  className="footer-link"
                  aria-current={({ isActive }) => (isActive ? "page" : null)}
                >
                  Акции
                </NavLink>
              </li>
              <li>
                <NavLink
                  to={`/adminAccount/${userId}/editProfile`}
                  className="footer-link"
                  aria-current={({ isActive }) => (isActive ? "page" : null)}
                >
                  Профиль
                </NavLink>
              </li>
            </ul>
          </nav>
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
                9036547447@mail.ru
              </a>
            </li>
            <li className="footer-address">г. Воронеж, ул. Егорова д. 10</li>
          </ul>
        </div>
      </div>
    </footer>
  );
};

export default AdminFooter;
