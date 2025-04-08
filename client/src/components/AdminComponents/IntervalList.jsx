import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useOutletContext } from 'react-router-dom';
import useShowMessage from '../useShowMessage';
import '../../styles/table.css'
import '../../styles/account.css'



export default function IntervalList() {
    const { userId, token, intervals, fetchIntervals, selectedDates } = useOutletContext();
    const { message, showMessage, error, showError, isVisible } = useShowMessage();

    const [visibleIntervals, setVisibleIntervals] = useState(5);
    const apiUrl = import.meta.env.VITE_API_URL; 
    const deleteInterval = async (intervalId) => {
        if (!intervalId) {
            console.error("Необходимо передать корректный идентификатор интервала для удаления.");
            return;
        }
        try {
            await axios.delete(`/api/adminAccount/${userId}/intervals/${intervalId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            showMessage('Интервал успешно удален!');
            fetchIntervals();
        } catch (error) {
            console.error("Ошибка при удалении интервала:", error);
        }
    };

    useEffect(() => {
        fetchIntervals();
    }, [fetchIntervals, selectedDates]);

    const groupedIntervals = intervals.reduce((acc, interval) => {
        const date = interval.booking_date;
        if (!acc[date]) acc[date] = [];
        acc[date].push(interval);
        return acc;
    }, {});

    const loadMoreIntervals = () => {
        setVisibleIntervals(prev => prev + 5);
    };

    return (
        <div className='table-container'>
            {(message || error) && (
                <p
                    className={`auth-message ${error ? "error" : "success"} ${isVisible ? "fade-in" : "fade-out"}`}
                    role="alert"
                >
                    {message || error}
                </p>
            )}
            {intervals.length > 0 ? <>{Object.keys(groupedIntervals)
                .sort((a, b) => new Date(a) - new Date(b))
                .slice(0, visibleIntervals)
                .map(date => {
                    const formattedDate = new Date(date).toLocaleDateString('ru-RU');
                    const sortedIntervals = groupedIntervals[date].sort((a, b) => {
                        const startA = new Date(`1970-01-01T${a.start_time}:00`);
                        const startB = new Date(`1970-01-01T${b.start_time}:00`);
                        return startA - startB;
                    });
                    return (
                        <div key={date} className='table-date'>
                            <p>{formattedDate}</p>
                            <table className='table-interval'>
                                <thead>
                                    <tr>
                                        <th>Начало интервала</th>
                                        <th>Конец интервала</th>
                                        <th>Действия</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedIntervals.map(interval => (
                                        <tr key={interval.id}>
                                            <td data-label="Начало интервала">{interval.start_time}</td>
                                            <td data-label="Конец интервала">{interval.end_time}</td>
                                            <td data-label="Действия">
                                                <button onClick={() => deleteInterval(interval.id)} className='table-button'>Удалить</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    );
                })}
                {Object.keys(groupedIntervals).length > visibleIntervals && (
                    <button onClick={loadMoreIntervals} className='load-more'>Загрузить еще</button>
                )}</> : <div className='empty-container'>
                <p className='empty-list'>Интервалов нет.</p>
            </div>}

        </div>
    );
}


