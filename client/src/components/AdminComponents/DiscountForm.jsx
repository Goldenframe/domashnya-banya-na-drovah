import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useLocation, useOutletContext } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import '../../styles/auth.css'
import '../../styles/account.css'
import '../../styles/form.css'
import Select from 'react-select';
import '../../styles/calendar.css'
import '../../styles/discounts.css'
import '../../styles/additional-services.css'
import useShowMessage from '../useShowMessage.jsx';



export default function DiscountForm() {
    const { discounts, setCurrentDiscount, fetchActiveDiscounts, userId, token } = useOutletContext();
    const location = useLocation();
    const discountData = useMemo(() => {
        return location.state?.discount || {};
    }, [location.state]); const [description, setDescription] = useState(discountData.description || '');
    const [discountType, setDiscountType] = useState(discountData.discount_type || 'discount');
    const [applicableServices, setApplicableServices] = useState(discountData.applicable_services || []);
    const [servicePrices, setServicePrices] = useState(discountData.service_prices || { broom: 150, towel: 200, hat: 50, sheets: 200 });
    const [freeServiceCounts, setFreeServiceCounts] = useState(discountData.free_service_counts || { broom: 0, towel: 0, hat: 0, sheets: 0 });
    const [minServiceCounts, setMinServiceCounts] = useState(discountData.min_service_counts || { broom: 0, towel: 0, hat: 0, sheets: 0 });
    const [additionalServices, setAdditionalServices] = useState(discountData.additional_services || {
        broom: { selected: false, quantity: 0 },
        towel: { selected: false, quantity: 0 },
        hat: { selected: false, quantity: 0 },
        sheets: { selected: false, quantity: 0 }
    });
    const [selectedDates, setSelectedDates] = useState(discountData.applicable_days || []);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [startTime, setStartTime] = useState(discountData.valid_from || '');
    const [endTime, setEndTime] = useState(discountData.valid_till || '');
    const [discountPercentage, setDiscountPercentage] = useState(discountData.discount_percentage || 0);
    const [timeDiscountType, setTimeDiscountType] = useState(discountData.time_discount_type || 'no_time_limit');
    const timeStartOptions = Array.from({ length: 15 }, (_, i) => {
        const hour = (8 + i).toString().padStart(2, '0') + ':00';
        return { value: hour, label: hour };
    });
    const { message, showMessage, error, showError, isVisible } = useShowMessage();
    const apiUrl = import.meta.env.VITE_API_URL; 
    const timeEndOptions = Array.from({ length: 15 }, (_, i) => {
        const hour = (10 + i).toString().padStart(2, '0') + ':00';
        return { value: hour, label: hour };
    });

    const handleServicePriceChange = (service, value) => {
        const previousPrice = servicePrices[service];

        setServicePrices((prev) => {
            const newPrices = { ...prev, [service]: value };
            return newPrices;
        });

        if (previousPrice !== value) {
            setAdditionalServices((prev) => ({
                ...prev,
                [service]: { ...prev[service], selected: true }
            }));
        } else {
            setAdditionalServices((prev) => ({
                ...prev,
                [service]: { ...prev[service], selected: false }
            }));
        }
    };

    const handleMinServiceCountChange = (service, value) => {
        setMinServiceCounts((prev) => ({
            ...prev,
            [service]: value
        }));
    };

    const handleFreeServiceCountChange = (service, value) => {
        setFreeServiceCounts((prev) => ({
            ...prev,
            [service]: value
        }));
    };
    const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };
    useEffect(() => {
        console.log("isFormValid", isFormValid);
        if (discountData.id) {
            if (discountData.discount_type === 'discount_service') {
                setServicePrices(prevPrices => {
                    const newPrices = discountData.service_prices || {};
                    return JSON.stringify(prevPrices) !== JSON.stringify(newPrices) ? newPrices : prevPrices;
                });
            } else if (discountData.discount_type === 'free') {
                setFreeServiceCounts(prevCounts => {
                    const newCounts = discountData.free_service_counts || {};
                    return JSON.stringify(prevCounts) !== JSON.stringify(newCounts) ? newCounts : prevCounts;
                });
                setMinServiceCounts(prevCounts => {
                    const newCounts = discountData.min_service_counts || {};
                    return JSON.stringify(prevCounts) !== JSON.stringify(newCounts) ? newCounts : prevCounts;
                });
            }
            const selectedServices = discountData.applicable_services || [];
            const updatedAdditionalServices = {};
            selectedServices.forEach(service => {
                updatedAdditionalServices[service] = { selected: true };
            });
            setAdditionalServices(prevServices => {
                return JSON.stringify(prevServices) !== JSON.stringify(updatedAdditionalServices) ? updatedAdditionalServices : prevServices;
            });
        }
    }, [discountData]);


    const handleServiceSelection = (e) => {
        const { value, checked } = e.target;
        setAdditionalServices((prev) => ({ ...prev, [value]: { ...prev[value], selected: checked } }));
        if (!checked) {
            setServicePrices((prevPrices) => ({ ...prevPrices, [value]: 0 }));
            setFreeServiceCounts((prevCounts) => ({ ...prevCounts, [value]: 0 }));
            setMinServiceCounts((prevCounts) => ({ ...prevCounts, [value]: 0 }));
        }
    };
    const handleDateSelection = (date) => {
        const formattedDate = formatDate(date);
        setSelectedDates((prevDates) => {
            if (prevDates.includes(formattedDate)) {
                return prevDates.filter(d => d !== formattedDate);
            } else {
                return [...prevDates, formattedDate];
            }
        });
    };
    const createDiscount = async (newDiscount) => {
        try {
            const response = await axios.post(`https://api.dom-ban-na-drovah.ru/api/adminAccount/${userId}/discounts`, newDiscount, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error("Ошибка при создании скидки:", error);
            showError('Возникла ошибка при создании скидки!');
        }
    };

    const updateDiscount = async (discountId, updatedDiscount) => {
        try {
            const response = await axios.put(`https://api.dom-ban-na-drovah.ru/api/adminAccount/${userId}/discounts/${discountId}`, updatedDiscount, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            console.error("Ошибка при обновлении скидки:", error);
            showError('Возникла ошибка при обновлении скидки!');
        }
    };

    const handleAddDiscount = async (e) => {
        e.preventDefault();
        const newDiscount = {
            description,
            discountType,
            applicableDays: timeDiscountType === 'time_limit' ? selectedDates : [],
            validFrom: startTime,
            validTill: endTime,
            timeDiscountType,
            discountPercentage: discountType === 'discount' ? parseFloat(discountPercentage) : null,
            applicableServices: Object.keys(additionalServices).filter((service) => additionalServices[service]?.selected),
            servicePrices: discountType === 'discount_service' ? servicePrices : {},
            freeServiceCounts: discountType === 'free' ? freeServiceCounts : {},
            minServiceCounts: discountType === 'free' ? minServiceCounts : {},
        };

        try {
            if (discountData.id) {
                await updateDiscount(discountData.id, newDiscount);
                showMessage('Акция успешно обновлена!');
            } else {
                await createDiscount(newDiscount);
                showMessage('Акция успешно добавлена!');
            }

            fetchActiveDiscounts();
            showMessage('')
            clearForm();
        } catch (error) {
            console.error("Ошибка при добавлении или обновлении скидки:", error);
            showError("Ошибка при добавлении или обновлении скидки. Попробуйте позже.");
        }
    };
    const clearForm = () => {
        setDescription('');
        setSelectedDates([]);
        setStartTime('');
        setEndTime('');
        setDiscountPercentage(0);
        setApplicableServices([]);
        setServicePrices({ broom: 150, towel: 200, hat: 50, sheets: 200 });
        setFreeServiceCounts({ broom: 0, towel: 0, hat: 0, sheets: 0 });
        setMinServiceCounts({ broom: 0, towel: 0, hat: 0, sheets: 0 });
        setCurrentDiscount(null);
    };
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstOfMonth = new Date(year, month, 1);
    const allDaysInMonth = Array.from(
        { length: new Date(year, month + 1, 0).getDate() },
        (_, i) => new Date(year, month, i + 1)
    );

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const emptyCellsBeforeFirstAvailable = (firstOfMonth.getDay() + 6) % 7;

    const monthNames = [
        "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
        "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"
    ];

    const calendarCells = [];

    for (let i = 0; i < emptyCellsBeforeFirstAvailable; i++) {
        calendarCells.push(<div key={`empty-${i}`} className="empty-cell" />);
    }

    allDaysInMonth.forEach(date => {
        const formattedDate = formatDate(date);
        const isPast = date < today;
        const isSelected = selectedDates.includes(formattedDate);
        const isDiscounted = discounts.some(discount => discount.applicable_days.includes(formattedDate));

        let className = "calendar_day";
        if (isPast) className += " past";
        if (isSelected) className += " selected";
        if (isDiscounted) className += " discounted";

        calendarCells.push(
            <div
                key={`day-${formattedDate}`}
                className={className}
                onClick={() => !isPast && handleDateSelection(date)}
            >
                {date.getDate()}
            </div>
        );
    });

    const lastOfMonth = new Date(year, month + 1, 0);
    const lastDayWeekday = lastOfMonth.getDay();
    const emptyCellsAfterLastDay = (7 - lastDayWeekday) % 7;

    for (let i = 0; i < emptyCellsAfterLastDay; i++) {
        calendarCells.push(<div key={`empty-after-${i}`} />);
    }
    const isFormValid = description && discountType && startTime && endTime &&
        ((discountType === 'discount' ? discountPercentage : true) ||
            ((discountType === 'discount_service' ? Object.values(servicePrices).some(price => price > 0) : true) &&
                (discountType === 'free' ? Object.values(freeServiceCounts).some(count => count > 0) : true)));

    const isFormEmpty = !description && !startTime && !endTime &&
        (!discountPercentage || !Object.values(servicePrices).some(price => price > 0) ||
            !Object.values(freeServiceCounts).some(count => count > 0));


    const getServicePrice = (service) => {
        const basePrices = {
            broom: 150,
            towel: 200,
            hat: 50,
            sheets: 200
        };
        return basePrices[service] || 0;
    };
    return (
        <div className="account-form">
            {(message || error) && (
                <p
                    className={`auth-message ${error ? "error" : "success"} ${isVisible ? "fade-in" : "fade-out"}`}
                    role="alert"
                >
                    {message || error}
                </p>
            )}
            <form onSubmit={handleAddDiscount}>
                <div>
                    <label className="form-label">Описание акции:</label>
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} required></textarea>
                </div>
                <div className='discount-label'>
                    <label className="form-label">
                        <span className="text-secondary">Тип акции по длительности: </span>
                        <button
                            type="button"
                            className={`mode-btn ${timeDiscountType === 'no_time_limit' ? 'selected' : ''}`}
                            onClick={() => setTimeDiscountType('no_time_limit')}
                        >
                            неограниченная акция
                        </button>
                        <span className="text-secondary"> / </span>
                        <button
                            type="button"
                            className={`mode-btn ${timeDiscountType === 'time_limit' ? 'selected' : ''}`}
                            onClick={() => setTimeDiscountType('time_limit')}
                        >
                            ограниченная акция
                        </button>
                    </label>
                </div>
                <div className='form-wrapper'>
                    {timeDiscountType === 'time_limit' && (
                        <div className="calendar-container">
                            <div className='calendar_container'>
                                <div className='calendar_header'>
                                    <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))} type='button' className='arrow-button'>
                                        <FontAwesomeIcon icon={faChevronLeft} />
                                    </button>                                <span>{`${monthNames[month]} ${year}`}</span>
                                    <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))} type='button' className='arrow-button'>
                                        <FontAwesomeIcon icon={faChevronRight} />
                                    </button>
                                </div>
                                <div className='calendar'>
                                    {['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС'].map((day, index) => (
                                        <div key={index} style={{ textAlign: 'center', fontWeight: 'bold' }}>
                                            {day}
                                        </div>
                                    ))}
                                    {calendarCells}
                                </div>
                            </div>
                        </div>
                    )}


                    <div className={`time-controls ${timeDiscountType !== 'time_limit' ? 'align-left' : ''}`}>
                        <label htmlFor="startTime" className="form-label">Время начала:
                            <Select
                                id="startTime"
                                value={startTime ? { value: startTime, label: startTime } : null}
                                onChange={(selectedOption) => setStartTime(selectedOption.value)}
                                options={timeStartOptions}
                                classNamePrefix="time-select"
                                placeholder="Выберите время"
                                isDisabled={timeStartOptions.length === 0}
                                required
                            />
                        </label>
                        <br />
                        <label htmlFor="endTime" className="form-label">Время окончания:
                            <Select
                                id="endTime"
                                value={endTime ? { value: endTime, label: endTime } : null}
                                onChange={(selectedOption) => setEndTime(selectedOption.value)}
                                options={timeEndOptions}
                                classNamePrefix="time-select"
                                placeholder="Выберите время"
                                isDisabled={timeEndOptions.length === 0}
                                required
                            />
                        </label>
                    </div>
                </div>
                <div className='discount-label'>
                    <label className="form-label">
                        <span className="text-secondary">Тип скидки: </span>
                        <button
                            type="button"
                            className={`mode-btn ${discountType === 'discount' ? 'selected' : ''}`}
                            onClick={() => setDiscountType('discount')}
                        >
                            скидка на стоимость
                        </button>
                        <span className="text-secondary"> / </span>
                        <button
                            type="button"
                            className={`mode-btn ${discountType === 'discount_service' ? 'selected' : ''}`}
                            onClick={() => setDiscountType('discount_service')}
                        >
                            скидка на доп. услугу
                        </button>
                        <span className="text-secondary"> / </span>
                        <button
                            type="button"
                            className={`mode-btn ${discountType === 'free' ? 'selected' : ''}`}
                            onClick={() => setDiscountType('free')}
                        >
                            бесплатные услуги
                        </button>
                    </label>
                </div>
                <div className='discount-container'>
                    <div className="additional-services">
                        {discountType === 'discount' && (
                            <div>
                                <label className="service-item perсentage-discount">
                                    <span>Процент скидки:</span>
                                    <div className="service-quantity">
                                        <input
                                            type="number"
                                            value={discountPercentage}
                                            onChange={(e) => setDiscountPercentage(e.target.value)}
                                            min="0"
                                            max="100"
                                            required
                                            className="service-quantity-input"

                                        />
                                    </div>
                                </label>
                            </div>
                        )}

                        {(discountType && discountType !== 'discount') && (
                            <>
                                {['broom', 'towel', 'hat', 'sheets'].map((service) => (
                                    <div key={service}>

                                        {discountType === 'discount_service' && (
                                            <label className="service-item">
                                                <span>
                                                    {service === 'broom' ? 'Веник' : service === 'towel' ? 'Полотенце' : service === 'hat' ? 'Шапка' : 'Простыня'}
                                                    (изначальная цена {getServicePrice(service)} ₽)
                                                </span>
                                                <div className="service-quantity">
                                                    <input
                                                        min="0"
                                                        type="number"
                                                        value={servicePrices[service] || ''}
                                                        onChange={(e) => handleServicePriceChange(service, e.target.value)}
                                                        className="service-quantity-input"
                                                    />
                                                </div>
                                            </label>
                                        )}

                                        {discountType === 'free' && (
                                            <label className="service-item">
                                                <div className='free-service-item'>
                                                    <span>
                                                        {service === 'broom' ? 'Веник' : service === 'towel' ? 'Полотенце' : service === 'hat' ? 'Шапка' : 'Простыня'}
                                                    </span>
                                                    <div className='free-service-quantity'>
                                                        <label>Минимальное количество для бесплатной услуги:</label>

                                                        <div className="service-quantity">
                                                            <input
                                                                type="number"
                                                                value={minServiceCounts[service] || ""}
                                                                onChange={(e) => handleMinServiceCountChange(service, e.target.value)}
                                                                className="service-quantity-input"
                                                                min="0"
                                                                step="1"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className='free-service-quantity'>
                                                        <label>Количество бесплатных услуг:</label>
                                                        <div className="service-quantity">
                                                            <input
                                                                type="number"
                                                                value={freeServiceCounts[service] || ''}
                                                                onChange={(e) => handleFreeServiceCountChange(service, e.target.value)}
                                                                className="service-quantity-input"
                                                                min="0"
                                                                step="1"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </label>
                                        )}
                                    </div>
                                ))}
                            </>
                        )}
                    </div>
                </div>
                <div>
                    <button type="submit" disabled={!isFormValid} className='form-button'>
                        {discountData.id ? "Сохранить изменения" : "Добавить акцию"}
                    </button>
                </div>
                {!isFormEmpty && (
                    <div>
                        <p className="auth-cancel" onClick={clearForm}>Отменить изменения</p>
                    </div>
                )}
            </form>
        </div>)
}
