import React, { useState, useEffect } from 'react';
import Loader from './Loader';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import '../styles/calendar.css'

export default function Calendar({ availableDates, bookingDate, setBookingDate }) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const dates = availableDates.map(date => new Date(date)).sort((a, b) => a - b);
    const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const calendarCells = [];
    const firstOfMonth = new Date(year, month, 1);
    const allDaysInMonth = Array.from({ length: new Date(year, month + 1, 0).getDate() }, (_, i) => new Date(year, month, i + 1));
    const unavailableDates = allDaysInMonth.filter(date => !dates.some(d => formatDate(d) === formatDate(date)));
    const firstAvailableDateWeekday = firstOfMonth.getDay();

    const emptyCellsBeforeFirstAvailable = (firstAvailableDateWeekday + 6) % 7;
    for (let i = 0; i < emptyCellsBeforeFirstAvailable; i++) {
        calendarCells.push(<div key={`empty-${i}`} aria-hidden="true" role="presentation" tabIndex="-1" />);
    }

    allDaysInMonth.forEach(date => {
        const formattedCurrentDate = formatDate(date);
        const isUnavailable = unavailableDates.some(d => formatDate(d) === formattedCurrentDate);

        let className = "calendar_day";
        if (isUnavailable) className += " no-interval";
        if (bookingDate.includes(formattedCurrentDate)) className += ' selected'

        calendarCells.push(
            <div
                key={`day-${formattedCurrentDate}`}
                className={className}
                onClick={!isUnavailable ? () => setBookingDate(prevState => { return prevState === formattedCurrentDate ? '' : formattedCurrentDate }) : undefined}
                role="gridcell"
                aria-label={`${date.toLocaleString('ru-RU', { weekday: 'long' })}, ${date.getDate()} ${date.toLocaleString('ru-RU', { month: 'long' })} ${date.getFullYear()}`}
                tabIndex={isUnavailable ? "-1" : "0"}
            >
                {date.getDate()}
            </div>
        );
    });

    const lastOfMonth = new Date(year, month + 1, 0);
    const lastDayWeekday = lastOfMonth.getDay();
    const emptyCellsAfterLastDay = (7 - lastDayWeekday) % 7;

    for (let i = 0; i < emptyCellsAfterLastDay; i++) {
        calendarCells.push(<div key={`empty-after-${i}`} aria-hidden="true" role="presentation" tabIndex="-1" />);
    }

    const monthNames = [
        "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
        "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"
    ];

    return (
        <div role="application">
            <div className='calendar_container'>
                <div className='calendar_header'>
                    <button
                        onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
                        type='button'
                        className='arrow-button'
                        aria-label="Предыдущий месяц"
                    >
                        <FontAwesomeIcon icon={faChevronLeft} />
                    </button>
                    <span>{`${monthNames[month]} ${year}`}</span>
                    <button
                        onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
                        type='button'
                        className='arrow-button'
                        aria-label="Следующий месяц"
                    >
                        <FontAwesomeIcon icon={faChevronRight} />
                    </button>
                </div>
                <div className='calendar' role="grid">
                    {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((day, index) => (
                        <div key={index} style={{ textAlign: 'center', fontWeight: 'bold' }} role="columnheader">
                            {day}
                        </div>
                    ))}
                    {calendarCells}
                </div>
            </div>
        </div>
    );
}