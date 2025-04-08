import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import '../../styles/account.css'

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

            <nav className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
                <NavLink to="/" onClick={goToHome}>Главная</NavLink>
                <NavLink to={`/adminAccount/${userId}/intervals`}>Интервалы</NavLink>
                <NavLink to={`/adminAccount/${userId}/bookings/upcoming`}>Бронирования</NavLink>
                <NavLink to={`/adminAccount/${userId}/discountsManager/new-discount`}>Акции</NavLink>
                <NavLink to={`/adminAccount/${userId}/editProfile`}>Профиль</NavLink>
            </nav>
        </header>
    );
};

export default AdminAccountHeader;