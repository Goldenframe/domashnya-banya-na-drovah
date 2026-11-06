import { useQuery } from "@tanstack/react-query";
import { bookingsQuery } from "../../api/booking-queries.js";
import { NavLink, Outlet } from "react-router-dom";
import "@/shared/ui/styles/nav.css";

export default function UserBookings({ userId, token }) {
  const { data: bookings = [], isPending, isError, refetch } = useQuery(
    bookingsQuery(userId, token)
  );

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
        {isPending && <p role="status">Загружаем бронирования…</p>}
        {isError && (
          <div role="alert">
            <p>Не удалось загрузить бронирования.</p>
            <button type="button" className="form-button" onClick={() => refetch()}>
              Повторить
            </button>
          </div>
        )}
        {!isPending && (!isError || bookings.length > 0) && (
          <Outlet context={{ bookings, userId, token }} />
        )}
      </main>
    </div>
  );
}
