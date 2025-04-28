import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { NavLink, Outlet } from "react-router-dom";
import "../../styles/nav.css";

export default function UserBookings({ userId, token }) {
  const [bookings, setBookings] = useState([]);
  const apiUrl = import.meta.env.VITE_API_URL;
  const fetchUserBookings = useCallback(async () => {
    try {
      const response = await axios.get(
        `https://api.dom-ban-na-drovah.ru/api/userAccount/${userId}/bookings`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setBookings(response.data);
    } catch (error) {
      console.error("Ошибка при получении бронирований:", error);
    }
  }, [userId, token]);

  useEffect(() => {
    fetchUserBookings();
  }, [fetchUserBookings]);

  return (
    <div className="account-content">
      <nav className="nav" aria-label="Меню бронирований">
        <ul>
          <li>
            <NavLink
              to="upcoming"
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
              aria-current={({ isActive }) => (isActive ? "page" : null)}
            >
              Предстоящие
            </NavLink>
          </li>
          <li>
            <NavLink
              to="past"
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
              aria-current={({ isActive }) => (isActive ? "page" : null)}
            >
              Прошедшие
            </NavLink>
          </li>
        </ul>
      </nav>
      <main className="content" role="main">
        <Outlet context={{ bookings, setBookings, userId, token }} />
      </main>
    </div>
  );
}
