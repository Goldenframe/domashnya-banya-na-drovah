import React, { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { Outlet, NavLink } from 'react-router-dom';
import '../../styles/nav.css'
import '../../styles/account.css'


const Intervals = ({ userId, token }) => {
    const [intervals, setIntervals] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [selectedDates, setSelectedDates] = useState([]);
    const today = new Date();
    const maxDate = new Date(today);
    maxDate.setDate(today.getDate() + 21);
    const apiUrl = import.meta.env.VITE_API_URL; 
    const fetchIntervals = useCallback(async () => {
        try {
            const response = await axios.get(`/api/adminAccount/${userId}/intervals`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data) {
                setIntervals(response.data.intervals);
                setBookings(response.data.bookings);
            } else {
                console.warn('Интервалы отсутствуют в ответе', response.data);
            }
        } catch (error) {
            console.error('Ошибка при получении интервалов:', error);
        }
    }, [userId, token]);

    useEffect(() => {
        if (userId && token) {
            fetchIntervals();  
        }
    }, [userId, token, fetchIntervals]);

    return (
        <div className='account-content'>
                <nav className='nav'>
                    <NavLink to={''} end className={({ isActive }) => { return isActive ? 'nav-link active' : 'nav-link' }}>Список интервалов</NavLink>
                    <NavLink to={'new-interval'} className={({ isActive }) => { return isActive ? 'nav-link active' : 'nav-link' }}>Добавить новый интервал</NavLink>
                </nav>
            <Outlet context={{ userId, token, intervals, setIntervals, fetchIntervals, selectedDates, setSelectedDates }} />

        </div>
    );
};

export default Intervals;