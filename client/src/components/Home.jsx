import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Cookies from "js-cookie";
import { decodeToken } from "react-jwt";
import AdminAccountHeader from "./AdminComponents/AdminAccountHeader.jsx";
import UserAccount from "./UserComponents/UserAccount.jsx";
import "../styles/account.css";

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
    <div className="home-container">
      {userData ? (
        <>
          <div className="home-links">
            {userData.role === "admin" ? (
              <AdminAccountHeader userId={userData.userId} />
            ) : (
              <UserAccount userId={userData.userId} />
            )}
          </div>
        </>
      ) : (
        <>
          <div className="account-header">
            <Link to="/login" className="home-button">
              Войти
            </Link>
          </div>
        </>
      )}
      <p>Главная страница</p>
    </div>
  );
}

export default Home;
