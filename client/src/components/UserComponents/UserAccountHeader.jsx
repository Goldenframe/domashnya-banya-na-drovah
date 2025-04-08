import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';

const UserAccountHeader = ({ userId }) => {
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
        navigate("/", { replace: true });
    };

    const toggleMenu = () => {
        if (isMenuOpen) {
            closeMenu();
        } else {
            setIsMenuOpen(true);
            setIsClosing(false);
        }
    };

    const closeMenu = () => {
        setIsClosing(true);
        setTimeout(() => {
            setIsMenuOpen(false);
            setIsClosing(false);
        }, 500); 
    };

    return (
        <header className="account-header">
            <button className="burger-menu" onClick={toggleMenu}>
                <span className="burger-line"></span>
                <span className="burger-line"></span>
                <span className="burger-line"></span>
            </button>
            <nav className={`nav-links ${isMenuOpen ? 'active' : ''} ${isClosing ? 'closing' : ''}`}>
                <NavLink to="/" onClick={goToHome}>Главная</NavLink>
                <NavLink to={`/userAccount/${userId}/bookingForm`}>Оформить бронь</NavLink>
                <NavLink to={`/userAccount/${userId}/bookings/upcoming`} style={{ paddingLeft: 15 }}>Ваши бронирования</NavLink>
                <NavLink to={`/userAccount/${userId}/editProfile`} style={{ paddingLeft: 15 }}>Профиль</NavLink>
            </nav>
        </header>
    );
};

export default UserAccountHeader;