import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import '../../styles/table.css'
import '../../styles/account.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUp, faArrowDown } from '@fortawesome/free-solid-svg-icons';

export default function UserPastBookings() {
    const { bookings } = useOutletContext();

    const [sortParam, setSortParam] = useState('');
    const [sortOrder, setSortOrder] = useState('asc');
    const today = new Date();

    const pastBookings = bookings.filter(booking => {
        const bookingDateTime = new Date(booking.booking_date);
        const bookingStartTime = new Date(booking.start_time);
        return bookingDateTime < today || (bookingDateTime.toDateString() === today.toDateString() && bookingStartTime < today);
    });

    const handleSort = (param) => {
        if (sortParam === param) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortParam(param);
            setSortOrder('asc');
        }
    };

    const sortedBookings = [...pastBookings].sort((a, b) => {
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

    return (
        <div className='table-container'>
            {sortedBookings.length > 0 ? (
                <table className="accessible-table" role="grid" aria-labelledby="past-bookings-title">
                    <caption id="past-bookings-title">Прошедшие бронирования</caption>
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