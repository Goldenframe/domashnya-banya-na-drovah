import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import '../../styles/table.css';
import '../../styles/account.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUp, faArrowDown } from '@fortawesome/free-solid-svg-icons';

export default function UpcomingBookings() {
    const { bookings } = useOutletContext();
    const today = new Date();
    const upcomingBookings = bookings.filter(booking => {
        const bookingDateTime = new Date(booking.booking_date);
        const bookingStartTime = new Date(booking.start_time);
        return bookingDateTime > today || (bookingDateTime.toDateString() === today.toDateString() && bookingStartTime >= today);
    });

    const [sortParam, setSortParam] = useState('');
    const [sortOrder, setSortOrder] = useState('asc');

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
            case 'time':
                comparison = new Date(a.start_time) - new Date(b.start_time);
                break;
            case 'price':
                comparison = a.price - b.price;
                break;
            case 'name':
                const nameA = `${a.first_name} ${a.last_name}`.toLowerCase();
                const nameB = `${b.first_name} ${b.last_name}`.toLowerCase();
                comparison = nameA.localeCompare(nameB);
                break;
            default:
                return 0;
        }
        return sortOrder === 'asc' ? comparison : -comparison;
    });

    return (
        <div className='table-container'>
            {sortedBookings.length > 0 ? (
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th onClick={() => handleSort('name')} className="sortable">
                                Гость
                                <FontAwesomeIcon
                                    icon={sortParam === 'name' && sortOrder === 'asc' ? faArrowUp : faArrowDown}
                                    className="sort-icon"
                                />
                            </th>
                            <th>Тип гостя</th>
                            <th onClick={() => handleSort('time')} className="sortable">
                                Дата
                                <FontAwesomeIcon
                                    icon={sortParam === 'time' && sortOrder === 'asc' ? faArrowUp : faArrowDown}
                                    className="sort-icon"
                                />
                            </th>
                            <th>Начало</th>
                            <th>Конец</th>
                            <th>Веники</th>
                            <th>Полотенца</th>
                            <th>Шапки</th>
                            <th>Простыни</th>
                            <th onClick={() => handleSort('price')} className="sortable">
                                Цена
                                <FontAwesomeIcon
                                    icon={sortParam === 'price' && sortOrder === 'asc' ? faArrowUp : faArrowDown}
                                    className="sort-icon"
                                />
                            </th>
                            <th>Акция</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedBookings.map(booking => (
                            <tr key={booking.booking_id}>
                                <td data-label="ID">{booking.booking_id}</td>
                                <td data-label="Гость">{(booking.first_name && booking.last_name) ? `${booking.first_name} ${booking.last_name}` : 'Гость удален'}</td>
                                <td data-label="Тип гостя">{booking.user_type}</td>
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
