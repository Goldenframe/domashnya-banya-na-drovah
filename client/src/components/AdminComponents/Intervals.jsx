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
            const response = await axios.get(`https://api.dom-ban-na-drovah.ru/api/adminAccount/${userId}/intervals`, {
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
            <nav className='nav' aria-label="Меню управления интервалами">
                <ul>
                    <li>
                        <NavLink 
                            to={''} 
                            end 
                            className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
                            aria-current={({ isActive }) => isActive ? 'page' : null}
                        >
                            Список интервалов
                        </NavLink>
                    </li>
                    <li>
                        <NavLink 
                            to={'new-interval'} 
                            className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
                            aria-current={({ isActive }) => isActive ? 'page' : null}
                        >
                            Добавить новый интервал
                        </NavLink>
                    </li>
                </ul>
            </nav>
            <main className='content' role="main">
                <Outlet context={{ userId, token, intervals, setIntervals, fetchIntervals, selectedDates, setSelectedDates }} />
            </main>
        </div>
    );
};

export default Intervals;