import React, { useState, useEffect } from 'react';
import Loader from './Loader';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import '../styles/calendar.css'

export default function CalendarAdmin({
    setBookingDateStart,
    setBookingDateEnd,
    setSelectedDates,
    selectedDates,
    intervals,
    bookings,
    bookingDateStart,
    bookingDateEnd,
    dateSelectionMethod
}) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);

    const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const calendarCells = [];

    const firstOfMonth = new Date(year, month, 1);
    const allDaysInMonth = Array.from({ length: new Date(year, month + 1, 0).getDate() }, (_, i) => new Date(year, month, i + 1));
    const firstAvailableDateWeekday = firstOfMonth.getDay();

    const emptyCellsBeforeFirstAvailable = (firstAvailableDateWeekday + 6) % 7;
    for (let i = 0; i < emptyCellsBeforeFirstAvailable; i++) {
        calendarCells.push(
            <div key={`empty-${i}`} aria-hidden="true" role="presentation" tabIndex="-1" />
        ); 
    }

    const handleDateClick = (formattedCurrentDate) => {
        if (dateSelectionMethod === 'range') {
            if (!selectedDate) {
                setSelectedDate(formattedCurrentDate);
                setBookingDateStart(formattedCurrentDate);
            } else {
                if (formattedCurrentDate === bookingDateStart) {
                    setSelectedDates([]);
                    setSelectedDate(null);
                    setBookingDateStart('');
                    setBookingDateEnd('');
                } else {
                    setBookingDateEnd(formattedCurrentDate);
                    setSelectedDates((prevState) => {
                        const start = new Date(bookingDateStart);
                        const end = new Date(formattedCurrentDate);
                        const datesInRange = [];
                        for (let d = start; d <= end; d.setDate(d.getDate() + 1)) {
                            datesInRange.push(formatDate(new Date(d)));
                        }
                        return [...new Set([...prevState, ...datesInRange])];
                    });
                    setSelectedDate(null);
                }
            }
        } else {
            setSelectedDates((prevState) => {
                if (prevState.includes(formattedCurrentDate)) {
                    return prevState.filter((date) => date !== formattedCurrentDate);
                } else {
                    return [...prevState, formattedCurrentDate];
                }
            });
            setBookingDateStart((prevState) =>
                prevState === formattedCurrentDate ? '' : formattedCurrentDate
            );
        }
    };

    allDaysInMonth.forEach((date) => {
        const formattedCurrentDate = formatDate(date);
        const dateWithoutTime = new Date(date.setHours(0, 0, 0, 0));
        const isPast = dateWithoutTime < today;

        const isSelected = selectedDates.includes(formattedCurrentDate);
        const hasBooking = bookings.some((booking) => booking.booking_date === formattedCurrentDate);
        const hasInterval = intervals.some((interval) => interval.booking_date === formattedCurrentDate);
        const startDate = new Date(bookingDateStart);
        const endDate = new Date(bookingDateEnd);
        const isInRange =
            dateSelectionMethod === 'range' &&
            date >= startDate &&
            date <= endDate;
        const isNoInterval = !hasInterval && !isPast;
        const isStart = formattedCurrentDate === bookingDateStart;

        let className = 'calendar_day';
        if (isPast) className += ' past';
        if (isSelected || isStart) className += ' selected';
        if (isInRange) className += ' range';
        if (hasInterval) className += ' interval';
        if (hasBooking) className += ' booking';
        if (isNoInterval) className += ' no-interval';

        calendarCells.push(
            <div
                key={`day-${formattedCurrentDate}`}
                className={className}
                onClick={() => {
                    if (!isPast) handleDateClick(formattedCurrentDate);
                }}
                role="gridcell"
                aria-selected={isSelected ? true : false}
                aria-current={
                    isSelected || isStart ? 'date' : undefined
                } 
                aria-label={
                    `${date.toLocaleString('ru-RU', {
                        weekday: 'long',
                    })}, ${date.getDate()} ${date.toLocaleString('ru-RU', {
                        month: 'long',
                    })} ${date.getFullYear()}`
                } 
                tabIndex={isPast ? '-1' : '0'} 
            >
                {date.getDate()}
            </div>
        );
    });

    const lastOfMonth = new Date(year, month + 1, 0);
    const lastDayWeekday = lastOfMonth.getDay();
    const emptyCellsAfterLastDay = (7 - lastDayWeekday) % 7;
    for (let i = 0; i < emptyCellsAfterLastDay; i++) {
        calendarCells.push(
            <div
                key={`empty-after-${i}`}
                aria-hidden="true"
                role="presentation"
                tabIndex="-1"
            />
        );
    }

    const monthNames = [
        'Январь',
        'Февраль',
        'Март',
        'Апрель',
        'Май',
        'Июнь',
        'Июль',
        'Август',
        'Сентябрь',
        'Октябрь',
        'Ноябрь',
        'Декабрь',
    ];

    return (
        <div className="calendar_container" role="application">
            <div className="calendar_header">
                <button
                    onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
                    type="button"
                    className="arrow-button"
                    aria-label="Предыдущий месяц" 
                >
                    <FontAwesomeIcon icon={faChevronLeft} />
                </button>
                <span style={{ textAlign: 'center' }}>
                    {`${monthNames[month]} ${year}`}
                </span>
                <button
                    onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
                    type="button"
                    className="arrow-button"
                    aria-label="Следующий месяц"
                >
                    <FontAwesomeIcon icon={faChevronRight} />
                </button>
            </div>
            <div className="calendar" role="grid"> 
                {['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС'].map((day, index) => (
                    <div
                        key={index}
                        style={{ textAlign: 'center' }}
                        role="columnheader"
                    >
                        {day}
                    </div>
                ))}
                {calendarCells}
            </div>
        </div>
    );
}