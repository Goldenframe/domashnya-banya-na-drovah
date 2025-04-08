import React, { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom';
import '../../styles/table.css'
import '../../styles/account.css'

export default function PastBookings() {

    const { bookings } = useOutletContext();
    const [userType, setUserType] = useState('');
    const [userTypesSet, setUserTypesSet] = useState([]);

    useEffect(() => {
        const newUserTypeSet = new Set(bookings.map(booking => booking.user_type));
        setUserTypesSet(Array.from(newUserTypeSet));
    }, [bookings])

    const today = new Date();

    const pastBookings = bookings.filter(booking => {
        const bookingDateTime = new Date(booking.booking_date);
        const bookingStartTime = new Date(booking.start_time);
        return bookingDateTime < today ||
            (bookingDateTime.toDateString() === today.toDateString() && bookingStartTime < today);
    });

    const filteredPastBookings = userType ? pastBookings.filter(booking => booking.user_type === userType) : pastBookings;

    return (
        <div className='table-container'>
            {filteredPastBookings.length > 0 ? (
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Гость</th>
                            <th>Тип гостя</th>
                            <th>Дата</th>
                            <th>Начало</th>
                            <th>Конец</th>
                            <th>Веники</th>
                            <th>Полотенца</th>
                            <th>Шапки</th>
                            <th>Простыни</th>
                            <th>Цена</th>
                            <th>Акция</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredPastBookings.map(booking => (
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
    )
}
