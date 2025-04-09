import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import axios from 'axios';
import '../../styles/table.css';
import '../../styles/account.css';
import '../../styles/auth.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUp, faArrowDown } from '@fortawesome/free-solid-svg-icons';

import useShowMessage from '../useShowMessage';

export default function UserUpcomingBookings() {
    const { bookings, setBookings, userId, token } = useOutletContext();
    const { message, showMessage, error, showError, isVisible } = useShowMessage();
    const today = new Date();

    const [sortParam, setSortParam] = useState('');
    const [sortOrder, setSortOrder] = useState('asc');
    const apiUrl = import.meta.env.VITE_API_URL; 
    const upcomingBookings = bookings.filter(booking => {
        const bookingDateTime = new Date(booking.booking_date);
        const bookingStartTime = new Date(booking.start_time);
        return bookingDateTime > today || (bookingDateTime.toDateString() === today.toDateString() && bookingStartTime >= today);
    });

    const handleSort = (param) => {
        if (sortParam === param) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortParam(param);
            setSortOrder('asc');
        }
    };

    const sortedBookings = [...upcomingBookings].sort((a, b) => {
        let comparison = 0;
        switch (sortParam) {
            case 'date':
                comparison = new Date(a.booking_date) - new Date(b.booking_date);
                break;
            case 'price':
                comparison = a.price - b.price;
                break;
            case 'discount':
                comparison = (a.discount_status ? 1 : 0) - (b.discount_status ? 1 : 0);
                break;
            default:
                return 0;
        }
        return sortOrder === 'asc' ? comparison : -comparison;
    });

    const handleCancelBooking = async (bookingId, bookingDate) => {
        if (!bookingId) {
            showError('ID бронирования не найден.');
            return;
        }

        const bookingDateObj = new Date(bookingDate);
        if (bookingDateObj < today) {
            showError('Нельзя отменить бронь, так как дата уже наступила.');
            return;
        }

        try {
            await axios.delete(`http://api.dom-ban-na-drovah.ru/api/userAccount/${userId}/bookings/${bookingId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBookings(prevBookings => prevBookings.filter(booking => booking.booking_id !== bookingId));
            showMessage('Бронь успешно отменена.');
        } catch (error) {
            console.error('Ошибка при отмене бронирования:', error.response || error.message);
            showError('Не удалось отменить бронь.');
        }
    };

    return (
        <div className='table-container'>
            {(message || error) && sortedBookings.length > 0 && (
                <p className={`auth-message ${error ? "error" : "success"} ${isVisible ? "fade-in" : "fade-out"}`} role="alert">
                    {message || error}
                </p>
            )}
            {sortedBookings.length > 0 ? (
                <table className="accessible-table" role="grid" aria-labelledby="upcoming-bookings-title">
                    <caption id="upcoming-bookings-title">Предстоящие бронирования</caption>
                    <thead>
                        <tr>
                            <th scope="col" onClick={() => handleSort('date')} className="sortable">
                                Дата
                                <FontAwesomeIcon icon={sortParam === 'date' && sortOrder === 'asc' ? faArrowUp : faArrowDown} className="sort-icon" title="Сортируй по дате" />
                            </th>
                            <th scope="col">Начало</th>
                            <th scope="col">Конец</th>
                            <th scope="col">Веники</th>
                            <th scope="col">Полотенца</th>
                            <th scope="col">Шапки</th>
                            <th scope="col">Простыни</th>
                            <th scope="col" onClick={() => handleSort('price')} className="sortable">
                                Цена
                                <FontAwesomeIcon icon={sortParam === 'price' && sortOrder === 'asc' ? faArrowUp : faArrowDown} className="sort-icon" title="Сортируй по цене" />
                            </th>
                            <th scope="col" onClick={() => handleSort('discount')} className="sortable">
                                Акция
                                <FontAwesomeIcon icon={sortParam === 'discount' && sortOrder === 'asc' ? faArrowUp : faArrowDown} className="sort-icon" title="Сортируй по акции" />
                            </th>
                            <th scope="col">Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedBookings.map(booking => (
                            <tr key={booking.booking_id}>
                                <td data-label="Дата">{new Date(booking.booking_date).toLocaleDateString('ru-RU')}</td>
                                <td data-label="Начало">{new Date(booking.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                                <td data-label="Конец">{new Date(booking.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                                <td data-label="Веники">{booking.broom ? booking.broom_quantity : <span className='not-selected'>0</span>}</td>
                                <td data-label="Полотенца">{booking.towel ? booking.towel_quantity : <span className='not-selected'>0</span>}</td>
                                <td data-label="Шапки">{booking.hat ? booking.hat_quantity : <span className='not-selected'>0</span>}</td>
                                <td data-label="Простыни">{booking.sheets ? booking.sheets_quantity : <span className='not-selected'>0</span>}</td>
                                <td data-label="Цена">{booking.price} ₽</td>
                                <td data-label="Акция">{booking.discount_status}</td>
                                <td data-label="Действия">
                                    <button onClick={() => handleCancelBooking(booking.booking_id, booking.booking_date)} className='table-button'>Отменить</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <div className='empty-container'>
                    <p className='empty-list'>Бронирований нет.</p>
                </div>
            )}
        </div>
    );
}