import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Outlet, NavLink } from 'react-router-dom';
import '../../styles/nav.css'
import '../../styles/account.css'


const Bookings = ({ userId, token }) => {
    const [bookings, setBookings] = useState([]);
    const apiUrl = import.meta.env.VITE_API_URL; 
    const fetchBookings = useCallback(async () => {
        try {
            const response = await axios.get(`https://api.dom-ban-na-drovah.ru/api/adminAccount/${userId}/bookings`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBookings(response.data);
            console.error(response.data);

        } catch (error) {
            console.error('Ошибка при получении бронирований:', error);
        }
    }, [userId, token]);

    useEffect(() => {
        fetchBookings();
    }, [fetchBookings]);

    return (
        <div className='account-content'>
                <nav className='nav'>
                    <NavLink to={'upcoming'} className={({ isActive }) => { return isActive ? 'nav-link active' : 'nav-link' }}>Актуальные бронирования</NavLink>
                    <NavLink to={'past'} className={({ isActive }) => { return isActive ? 'nav-link active' : 'nav-link' }}>Прошедшие бронирования</NavLink>
                </nav>
            <Outlet context={{ bookings }} />

        </div>
    );
};

export default Bookings;
