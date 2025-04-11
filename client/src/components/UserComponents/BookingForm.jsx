import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Calendar from '../Calendar.jsx';
import AdditionalServices from './AdditionalServices.jsx';
import useShowMessage from '../useShowMessage.jsx';
import '../../styles/buttons.css'
import '../../styles/account.css'
import '../../styles/auth.css'
import '../../styles/form.css'
import '../../styles/booking.css'

import Select from 'react-select';
import Cookies from "js-cookie";

function BookingForm({ userId, token }) {
    const [bookingDate, setBookingDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [additionalServices, setAdditionalServices] = useState({
        broom: { selected: false, quantity: 0 },
        towel: { selected: false, quantity: 0 },
        hat: { selected: false, quantity: 0 },
        sheets: { selected: false, quantity: 0 }
    });
    const [additionalServicesQuantity, setAdditionalServicesQuantity] = useState({
        broom: 0,
        towel: 0,
        hat: 0,
        sheets: 0
    });
    const [price, setPrice] = useState(0);
    const [availableStartTimes, setAvailableStartTimes] = useState([]);
    const [availableEndTimes, setAvailableEndTimes] = useState([]);
    const [availableDates, setAvailableDates] = useState([]);
    const [discounts, setDiscounts] = useState([]);
    const [timeLimitDiscount, setTimeLimitDiscount] = useState('');
    const [noTimeLimitDiscount, setNoTimeLimitDiscount] = useState('');
    const { message, showMessage, error, showError, isVisible } = useShowMessage();
    const today = new Date();
    const maxDate = new Date(today);
    maxDate.setDate(today.getDate() + 21);

    const fetchAvailableIntervals = useCallback(async () => {
        try {
            const token = Cookies.get("token");

            const response = await axios.get(`https://api.dom-ban-na-drovah.ru/api/userAccount/${userId}/availableIntervals/${bookingDate}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            let filteredIntervals = response.data.availableStartTimes;


            setAvailableStartTimes(filteredIntervals);
            showMessage('');
        } catch (error) {
            console.error('Ошибка при получении интервалов:', error);
            showError("Произошла ошибка при получении доступных интервалов.");
        }
    }, [userId, bookingDate]);

    const fetchAvailableEndTimes = useCallback(async (startTime, intervalId) => {
        try {
            const token = Cookies.get("token");
            const response = await axios.get(`https://api.dom-ban-na-drovah.ru/api/userAccount/${userId}/availableEndTimes/${bookingDate}/${startTime}/${intervalId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.availableEndTimes.length === 0) {
                setAvailableStartTimes(prev => prev.filter(interval => interval.startTime !== startTime));
                showMessage("Нет доступных конечных времен для выбранного времени начала.");
                setAvailableEndTimes([]);
            } else {
                const endTimes = response.data.availableEndTimes.map(time => time.endTime);
                if (!endTimes.includes("24:00")) {
                    const intervalEnd = "24:00";
                    endTimes.push(intervalEnd);
                }
                setAvailableEndTimes(endTimes);
                showMessage('');
            }
        } catch (error) {
            console.error('Ошибка при получении конечных времен:', error);
            showError("Произошла ошибка при получении доступных конечных времен.");
        }
    }, [userId, bookingDate]);
    useEffect(() => {
        if (bookingDate) {
            fetchAvailableIntervals();
        }
    }, [bookingDate, fetchAvailableIntervals]);

    useEffect(() => {
        let discountTimeLimit = discounts.filter(discount =>
            discount.time_discount_type === 'time_limit' &&
            discount.applicable_days.includes(bookingDate)
        );

        setTimeLimitDiscount(discountTimeLimit.length > 0 ? discountTimeLimit : []);
    }, [bookingDate, discounts]);

    useEffect(() => {
        let discountNoTimeLimit = discounts.filter(discount =>
            discount.time_discount_type === 'no_time_limit'
        );
        setNoTimeLimitDiscount(discountNoTimeLimit.length > 0 ? discountNoTimeLimit : []);
    }, [bookingDate, discounts]);

    const handleTimeChange = (selectedOption) => {
        const selectedStartTime = selectedOption.value;
        setStartTime(selectedStartTime);
        const selectedInterval = availableStartTimes.find(interval => interval.startTime === selectedStartTime);

        if (selectedInterval) {
            fetchAvailableEndTimes(selectedStartTime, selectedInterval.intervalId);

            if (endTime) {
                updatePrice(selectedStartTime, endTime);
            }
        } else {
            setAvailableEndTimes([]);
        }
    };

    const updatePrice = async (start, end) => {
        const startTimeDate = start ? new Date(`${bookingDate}T${start}`) : null;
        const endTimeDate = end ? new Date(`${bookingDate}T${end}`) : null;

        const basicPrice = startTimeDate && endTimeDate ? await calculatePrice(startTimeDate, endTimeDate) : 0;
        const additionalServicesCost = calculateAdditionalServicesCost(startTimeDate, endTimeDate);
        setPrice(basicPrice + additionalServicesCost);
    };

    useEffect(() => {
        updatePrice(startTime, endTime);
    }, [additionalServices, bookingDate]);

    const fetchDiscounts = async () => {
        try {
            const response = await axios.get(`https://api.dom-ban-na-drovah.ru/api/userAccount/${userId}/discounts`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDiscounts(response.data);
        } catch (error) {
            console.error("Ошибка при получении скидок:", error);
            return [];
        }
    };

    useEffect(() => {
        fetchDiscounts();
    }, [userId]);

    useEffect(() => {
        setStartTime('');
        setEndTime('');
    }, [bookingDate]);

    const calculatePrice = async (start, end) => {
        console.log('--- CALCULATION START ---');
        console.log('Original start:', start);
        console.log('Original end:', end);

        const startCopy = new Date(start);
        const endCopy = new Date(end);

        if (endCopy.getHours() === 0 && endCopy.getMinutes() === 0) {
            endCopy.setFullYear(
                startCopy.getFullYear(),
                startCopy.getMonth(),
                startCopy.getDate()
            );
            endCopy.setHours(24, 0, 0, 0);
        }

        console.log('Adjusted start:', startCopy);
        console.log('Adjusted end:', endCopy);

        if (endCopy <= startCopy) {
            console.log('Invalid time interval');
            return 0;
        }

        const durationMs = endCopy.getTime() - startCopy.getTime();
        const hours = durationMs / (1000 * 60 * 60);

        let cost = 0;
        const startHour = startCopy.getHours();
        const dayOfWeek = startCopy.getDay();

        if (dayOfWeek === 0 || dayOfWeek === 6) { // Выходные
            cost = hours <= 2 ? 3800 : Math.round(1600 * hours);
        } else { // Будни
            if (startHour >= 8 && startHour < 16) {
                cost = hours <= 2 ? 3500 : Math.round(1500 * hours);
            } else if (startHour >= 16 || startHour < 8) {
                cost = hours <= 2 ? 3800 : Math.round(1600 * hours);
            }
        }


        let discountApplied = 0;
        discounts.forEach(discount => {
            if (isDiscountApplicable(discount, startCopy, endCopy)) {
                const discountValue = calculateDiscountValue(cost, discount);
                cost -= discountValue;
                discountApplied += discountValue;
            }
        });
        const finalCost = Math.max(0, Math.round(cost));

        return finalCost;
    };

    const isDiscountApplicable = (discount, start, end) => {
        const validFrom = new Date(`${bookingDate}T${discount.valid_from}`);
        const validTill = new Date(`${bookingDate}T${discount.valid_till}`);
        const startTime = start || new Date(`${bookingDate}T08:00`);
        const endTime = end || new Date(`${bookingDate}T23:59`);

        return discount.time_discount_type === 'time_limit' ? (startTime >= validFrom && endTime <= validTill && discount.applicable_days.includes(bookingDate)) : (startTime >= validFrom && endTime <= validTill);
    };

    const calculateDiscountValue = (cost, discount) => {
        if (discount.discount_type === 'discount') {
            return cost * (discount.discount_percentage / 100);
        }
        return 0;
    };

    const calculateAdditionalServicesCost = (start, end) => {
        let cost = 0;
        const servicePrices = {
            broom: 150,
            towel: 200,
            hat: 50,
            sheets: 200
        };

        for (let service in additionalServices) {
            if (additionalServices[service]?.quantity > 0) {
                const discount = discounts.find(discount =>
                    Array.isArray(discount.applicable_services) &&
                    discount.applicable_services.includes(service) &&
                    discount.discount_type === 'discount_service' &&
                    isDiscountApplicable(discount, start, end)
                );

                console.log(`Проверяем скидку на ${service}:`, discount);

                const discountedPrice = discount?.service_prices?.[service] ?? servicePrices[service];
                cost += additionalServices[service].quantity * discountedPrice;
            }
        }
        return cost;
    };

    const getEndTimeOptions = (startTime) => {
        if (!startTime) return [];

        return availableEndTimes
            .filter(time => time > startTime)
            .sort()
            .map(time => ({ value: time, label: time }));
    };

    const startTimeOptions = availableStartTimes.map(interval => ({
        value: interval.startTime,
        label: interval.startTime,
    }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = Cookies.get("token");


        const startTimeDate = startTime ? new Date(`${bookingDate}T${startTime}`) : null;
        const endTimeDate = endTime ? new Date(`${bookingDate}T${endTime}`) : null;

        const appliedDiscounts = discounts.filter(discount => {
            if (!isDiscountApplicable(discount, startTimeDate, endTimeDate)) return false;
            if (discount.discount_type === 'discount_service') {
                return discount.applicable_services.some(service => additionalServices[service]?.quantity > 0);
            }
            return true;
        });

        console.log("Примененные скидки:", appliedDiscounts);

        const discountId = appliedDiscounts.length > 0 ? appliedDiscounts[0].id : null;
        try {
            if (!bookingDate || !startTime || !endTime) {
                throw new Error("Пожалуйста, выберите дату и время.");
            }
            const response = await axios.post(`https://api.dom-ban-na-drovah.ru/api/userAccount/${userId}/book`, {
                booking_date: bookingDate,
                start_time: startTime,
                end_time: endTime,
                price,
                broom: additionalServices.broom.selected,
                broom_quantity: additionalServices.broom.quantity + (additionalServicesQuantity.broom || 0),
                towel: additionalServices.towel.selected,
                towel_quantity: additionalServices.towel.quantity + (additionalServicesQuantity.towel || 0),
                hat: additionalServices.hat.selected,
                hat_quantity: additionalServices.hat.quantity + (additionalServicesQuantity.hat || 0),
                sheets: additionalServices.sheets.selected,
                sheets_quantity: additionalServices.sheets.quantity + (additionalServicesQuantity.sheets || 0),
                discount_id: discountId
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            showMessage('Бронь успешно оформлена!');
            const unavailableDates = await checkAvailability(userId, [bookingDate], token);
            if (unavailableDates.includes(bookingDate)) {
                setAvailableDates(prevDates => prevDates.filter(date => date !== bookingDate));
            } setBookingDate('');
            setStartTime('');
            setEndTime('');
            setPrice(0);
            setAdditionalServices({
                broom: { selected: false, quantity: 0 },
                towel: { selected: false, quantity: 0 },
                hat: { selected: false, quantity: 0 },
                sheets: { selected: false, quantity: 0 }
            });
            setAdditionalServicesQuantity({
                broom: 0,
                towel: 0,
                hat: 0,
                sheets: 0
            })
        } catch (err) {
            let errorMessage = err.message;
            if (err.response) {
                errorMessage = err.response.data.error || err.response.data.message || "Произошла непредвиденная ошибка.";
            } else if (err.request) {
                errorMessage = "Ошибка сети. Пожалуйста, проверьте Ваше соединение.";
            }
            showError(errorMessage);
            console.error("Ошибка при бронировании:", err);
        }
    };
    const checkAvailability = async (userId, selectedDates, token) => {
        const unavailableDates = [];

        for (const date of selectedDates) {
            try {
                const response = await axios.get(`https://api.dom-ban-na-drovah.ru/api/userAccount/${userId}/availableIntervals/${date}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.data.availableStartTimes.length === 0) {
                    unavailableDates.push(date);
                }
            } catch (error) {
                console.error(`Ошибка при проверке доступности для даты ${date}:`, error);
            }
        }

        return unavailableDates;
    };
    useEffect(() => {
        const datesToCheck = [];
        for (let i = 0; i < 62; i++) {
            const nextDate = new Date(today);
            nextDate.setDate(today.getDate() + i);
            datesToCheck.push(nextDate.toISOString().slice(0, 10));
        }

        checkAvailability(userId, datesToCheck, token).then(unavailableDates => {
            const filteredAvailableDates = datesToCheck.filter(date => !unavailableDates.includes(date));
            setAvailableDates(filteredAvailableDates);
            if (filteredAvailableDates.length > 0) {
                setBookingDate(filteredAvailableDates[0]);
            }
        });
    }, [userId, token]);



    return (
        <div className='account-content'>
            <div className="account-form">
                {(message || error) && (
                    <p
                        className={`auth-message ${error ? "error" : "success"} ${isVisible ? "fade-in" : "fade-out"}`}
                        role="alert"
                    >
                        {message || error}
                    </p>
                )}
                <form onSubmit={handleSubmit} className="booking-wrapper">
                    <div className="calendar-container">
                        <Calendar
                            availableDates={availableDates}
                            setAvailableDates={setAvailableDates}
                            setBookingDate={setBookingDate}
                            bookingDate={bookingDate}
                        />
                    </div>
                    <div className="time-controls">
                        {(noTimeLimitDiscount.length > 0) &&
                            <div className="discounts">
                                <div className="discount permanent-discount">
                                    {noTimeLimitDiscount.map((el, index) => (
                                        <div key={index}>Постоянная акция: {el.description}</div>
                                    ))}
                                </div>
                            </div>
                        }

                        {(timeLimitDiscount.length > 0) &&
                            <div className="discounts">
                                <div className="discount temporary-discount">
                                    {timeLimitDiscount.map((el, index) => (
                                        <div key={index}>Временная акция: {el.description}</div>
                                    ))}
                                </div>
                            </div>

                        }
                        <label className="form-label">
                            Время начала:
                            <Select
                                value={startTime ? { value: startTime, label: startTime } : null}
                                onChange={handleTimeChange}
                                options={startTimeOptions}
                                classNamePrefix="time-select"
                                placeholder="Выберите время"
                                isDisabled={startTimeOptions.length === 0}
                            />
                        </label>
                        <br />
                        <label className="form-label">
                            Время окончания:
                            <Select
                                value={endTime ? { value: endTime, label: endTime } : null}
                                onChange={(selectedOption) => {
                                    setEndTime(selectedOption.value);
                                    updatePrice(startTime, selectedOption.value);
                                }}
                                options={getEndTimeOptions(startTime)}
                                classNamePrefix="time-select"
                                placeholder="Выберите время"
                                isDisabled={!startTime || getEndTimeOptions(startTime).length === 0}
                            />
                        </label>
                    </div>
                    <div className='additional-services-container'>
                        <AdditionalServices
                            additionalServices={additionalServices}
                            setAdditionalServices={setAdditionalServices}
                            discounts={discounts}
                            start={startTime}
                            end={endTime}
                            bookingDate={bookingDate}
                            additionalServicesQuantity={additionalServicesQuantity}
                            setAdditionalServicesQuantity={setAdditionalServicesQuantity}
                        />
                    </div>
                    <div className="price-container">
                        <div className='price-content'>
                            <p className="price">Итоговая стоимость: {price} ₽</p>
                            <button
                                type="submit"
                                className="form-button"
                                disabled={!bookingDate || !startTime || !endTime}
                            >
                                Забронировать
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default BookingForm;

