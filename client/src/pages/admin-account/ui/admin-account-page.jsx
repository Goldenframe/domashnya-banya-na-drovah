import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate, Navigate } from "react-router-dom";
import Intervals from "./intervals/intervals.jsx";
import Bookings from "./bookings/bookings.jsx";
import AdminDiscountsManager from "./discounts/admin-discounts-manager.jsx";
import EditProfile from "@/features/edit-profile";
import UpcomingBookings from "./bookings/upcoming-bookings.jsx";
import PastBookings from "./bookings/past-bookings.jsx";
import { AdminAccountHeader } from "@/widgets/account-navigation";
import IntervalList from "./intervals/interval-list.jsx";
import AddInterval from "./intervals/add-interval.jsx";
import DiscountList from "./discounts/discount-list.jsx";
import DiscountForm from "./discounts/discount-form.jsx";
import Cookies from "js-cookie";
import AdminFooter from "./admin-footer.jsx";

function AdminAccount() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({
    firstName: Cookies.get("firstName"),
    lastName: Cookies.get("lastName"),
    userId: Cookies.get("userId"),
    token: Cookies.get("token"),
  });

  useEffect(() => {
    const token = Cookies.get("token");
    if (!token) {
      navigate("/");
    }
  }, [navigate]);

  const updateUserData = (updatedData) => {
    setUserData((prevData) => ({
      ...prevData,
      firstName: updatedData.first_name,
      lastName: updatedData.last_name,
      phoneNumber: updatedData.phone_number,
    }));

    Cookies.set("firstName", updatedData.first_name, {
      expires: 7,
      secure: true,
      sameSite: "Strict",
    });
    Cookies.set("lastName", updatedData.last_name, {
      expires: 7,
      secure: true,
      sameSite: "Strict",
    });
    Cookies.set("phoneNumber", updatedData.phone_number, {
      expires: 7,
      secure: true,
      sameSite: "Strict",
    });
  };

  return (
      <div aria-labelledby="page-title">
        <AdminAccountHeader
          userId={userData.userId}
          aria-label="Навигация по аккаунту администратора"
        />

        <main
          className="account-container"
          role="region"
          aria-label="Основное содержимое"
        >
          <Routes>
            <Route
              path="/"
              element={
                <Navigate
                  to={`/adminAccount/${userData.userId}/intervals`}
                  replace
                  aria-label="Перенаправление на страницу интервалов"
                />
              }
            />

            <Route
              path="intervals"
              element={
                <Intervals
                  userId={userData.userId}
                  token={userData.token}
                  aria-label="Управление интервалами"
                />
              }
            >
              <Route
                index
                element={
                  <IntervalList aria-label="Список доступных интервалов" />
                }
              />
              <Route
                path="new-interval"
                element={
                  <AddInterval aria-label="Форма добавления нового интервала" />
                }
              />
            </Route>

            <Route
              path="bookings"
              element={
                <Bookings
                  userId={userData.userId}
                  token={userData.token}
                  aria-label="Управление бронированиями"
                />
              }
            >
              <Route
                path="upcoming"
                element={
                  <UpcomingBookings aria-label="Предстоящие бронирования" />
                }
              />
              <Route
                path="past"
                element={<PastBookings aria-label="Прошедшие бронирования" />}
              />
            </Route>

            <Route
              path="discountsManager"
              element={
                <AdminDiscountsManager
                  userId={userData.userId}
                  token={userData.token}
                  aria-label="Управление скидками"
                />
              }
            >
              <Route
                path="new-discount"
                element={
                  <DiscountForm aria-label="Форма создания новой скидки" />
                }
              />
              <Route
                path="discount-list"
                element={<DiscountList aria-label="Список скидок" />}
              />
            </Route>

            <Route
              path="editProfile"
              element={
                <EditProfile
                  userId={userData.userId}
                  token={userData.token}
                  updateUserData={updateUserData}
                  aria-label="Редактирование профиля"
                />
              }
            />

            <Route
              path="*"
              element={
                <Navigate
                  to={`/adminAccount/${userData.userId}/intervals`}
                  replace
                  aria-label="Перенаправление на страницу по умолчанию"
                />
              }
            />
          </Routes>
        </main>
        <AdminFooter userId={userData.userId} />
      </div>
  );
}

export default AdminAccount;
