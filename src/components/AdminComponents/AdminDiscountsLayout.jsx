import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../styles/calendar.css'

const AdminDiscountsManager = ({ userId, token }) => {
    const [discounts, setDiscounts] = useState([]);
    const [description, setDescription] = useState('');
    const [discountType, setDiscountType] = useState('');
    const [applicableServices, setApplicableServices] = useState([]);
    const [servicePrices, setServicePrices] = useState({ broom: 150, towel: 200, hat: 50, sheets: 200 });
    const [freeServiceCounts, setFreeServiceCounts] = useState({ broom: 0, towel: 0, hat: 0, sheets: 0 });
    const [minServiceCounts, setMinServiceCounts] = useState({ broom: 0, towel: 0, hat: 0, sheets: 0 });
    const [additionalServices, setAdditionalServices] = useState({
        broom: { selected: false, quantity: 0 },
        towel: { selected: false, quantity: 0 },
        hat: { selected: false, quantity: 0 },
        sheets: { selected: false, quantity: 0 }
    });
    const [selectedDates, setSelectedDates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [discountPercentage, setDiscountPercentage] = useState(0);
    const [timeDiscountType, setTimeDiscountType] = useState('');
    const [isDiscountListVisible, setDiscountListVisible] = useState(false);
    const [currentDiscount, setCurrentDiscount] = useState(null);

    const handleEditDiscount = (discount) => {
        console.log(discount);
        setCurrentDiscount(discount);
        setDescription(discount.description);
        setDiscountType(discount.discount_type);
        setTimeDiscountType(discount.time_discount_type);
        setStartTime(discount.valid_from);
        setEndTime(discount.valid_till);
        setDiscountPercentage(discount.discount_percentage || '');
        if (discount.discount_type === 'discount_service') {
            setServicePrices(discount.service_prices || {});
        } else if (discount.discount_type === 'free') {
            setFreeServiceCounts(discount.free_service_counts || {});
            setMinServiceCounts(discount.min_service_counts || {});
        }
        const selectedServices = discount.applicable_services || [];
        const updatedAdditionalServices = {};
        selectedServices.forEach(service => {
            updatedAdditionalServices[service] = { selected: true };
        });
        setAdditionalServices(updatedAdditionalServices);
    };

    const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    useEffect(() => {
        const loadData = async () => {
            await new Promise(resolve => setTimeout(resolve, 1000));
            setLoading(false);
        };
        loadData();
    }, []);
    useEffect(() => {
        fetchActiveDiscounts();
    }, []);

    const fetchActiveDiscounts = async () => {
        try {
            const response = await axios.get('/api/adminAccount/:userId/discounts/active', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDiscounts(response.data);
        } catch (error) {
            console.error("Ошибка при загрузке скидок:", error);
        }
    };
    const handleServicePriceChange = (service, newPrice) => {
        setServicePrices((prevPrices) => ({
            ...prevPrices,
            [service]: parseFloat(newPrice) || 0,
        }));
    };

    const handleFreeServiceCountChange = (service, newCount) => {
        setFreeServiceCounts((prevCounts) => ({
            ...prevCounts,
            [service]: parseInt(newCount) || 0,
        }));
    };

    const handleMinServiceCountChange = (service, newCount) => {
        setMinServiceCounts((prevCounts) => ({
            ...prevCounts,
            [service]: parseInt(newCount) || 0,
        }));
    };
    const handleServiceSelection = (e) => {
        const { value, checked } = e.target;
        setAdditionalServices((prev) => ({
            ...prev,
            [value]: { ...prev[value], selected: checked }
        }));
    };
    const createDiscount = async (newDiscount) => {
        try {
            const response = await axios.post(`/api/adminAccount/:userId/discounts`, newDiscount, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error("Ошибка при создании скидки:", error);
            throw error;
        }
    };

    const updateDiscount = async (discountId, updatedDiscount) => {
        try {
            const response = await axios.put(`/api/adminAccount/:userId/discounts/${discountId}`, updatedDiscount, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error("Ошибка при обновлении скидки:", error);
            throw error;
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
            applicableServices: Object.keys(additionalServices).filter(service => additionalServices[service]?.selected),
            servicePrices: discountType === 'discount_service' ? servicePrices : {},
            freeServiceCounts: discountType === 'free' ? freeServiceCounts : {},
            minServiceCounts: discountType === 'free' ? minServiceCounts : {},
        };
        try {
            if (currentDiscount) {
                await updateDiscount(currentDiscount.id, newDiscount);
            } else {
                await createDiscount(newDiscount);
            }
            fetchActiveDiscounts();
            clearForm();
        } catch (error) {
            console.error("Ошибка при добавлении скидки:", error);
            alert("Ошибка при добавлении скидки. Попробуйте позже.");
        }
    };
    const handleDeleteDiscount = async (discountId) => {
        try {
            const response = await axios.delete(`/api/adminAccount/${userId}/discounts/${discountId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.status === 200 || response.status === 204) {
                setDiscounts(discounts.filter(discount => discount.id !== discountId));
            } else {
                alert('Ошибка при удалении акции');
            }
        } catch (error) {
            console.error('Ошибка при удалении акции:', error);
            alert('Ошибка при удалении акции');
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
    const toggleDiscountList = () => {
        setDiscountListVisible(prevState => !prevState);
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

    // Основные даты
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

    const clearForm = () => {
        setDescription('');
        setDiscountType('');
        setSelectedDates([]);
        setStartTime('');
        setEndTime('');
        setTimeDiscountType('');
        setDiscountPercentage(0);
        setApplicableServices([]);
        setServicePrices({ broom: 150, towel: 200, hat: 50, sheets: 200 });
        setFreeServiceCounts({ broom: 0, towel: 0, hat: 0, sheets: 0 });
        setMinServiceCounts({ broom: 0, towel: 0, hat: 0, sheets: 0 });
        setCurrentDiscount(null);
    };

    return (
        <div className="discounts-manager">
            <h3>Управление cкидками</h3>
            <form onSubmit={handleAddDiscount}>
                <div>
                    <label>Описание:</label>
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} required></textarea>
                </div>
                <div>
                    <label>Тип акции по длительности:</label>
                    <select value={timeDiscountType} onChange={(e) => setTimeDiscountType(e.target.value)}>
                        <option value="">Выберите тип акции</option>
                        <option value="time_limit">Ограниченная акция</option>
                        <option value="no_time_limit">Неограниченная акция</option>
                    </select>
                </div>
                {timeDiscountType === 'time_limit' &&
                    <div>
                        <label>Выберите даты действия акции:</label>
                        <div className='calendar_container'>
                            <div className='calendar_header'>
                                <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))} type='button'>Назад</button>
                                <span>{`${monthNames[month]} ${year}`}</span>
                                <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))} type='button'>Вперед</button>
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
                    </div>}

                <div>
                    <label htmlFor="startTime">Время начала:</label>
                    <select id="startTime" value={startTime} onChange={e => setStartTime(e.target.value)}>
                        <option value="">Выберите время</option>
                        {Array.from({ length: 15 }, (_, i) => {
                            const hour = (8 + i).toString().padStart(2, '0') + ':00';
                            return <option key={hour} value={hour}>{hour}</option>;
                        })}
                    </select>
                    <br />
                    <label htmlFor="endTime">Время окончания:</label>
                    <select id="endTime" value={endTime} onChange={e => setEndTime(e.target.value)}>
                        <option value="">Выберите время</option>
                        {Array.from({ length: 15 }, (_, i) => {
                            const hour = (10 + i).toString().padStart(2, '0') + ':00';
                            return <option key={hour} value={hour}>{hour}</option>;
                        })}
                    </select>
                    <div>
                        <label>Тип скидки:</label>
                        <select value={discountType} onChange={(e) => setDiscountType(e.target.value)}>
                            <option value="">Выберите тип скидки</option>
                            <option value="discount">Скидка на стоимость</option>
                            <option value="discount_service">Скидка на стоимость доп. услуги</option>
                            <option value="free">Бесплатные услуги</option>
                        </select>
                    </div>
                    {discountType === 'discount' && (
                        <div>
                            <label>Уровень процента скидки:</label>
                            <input type="number" value={discountPercentage} onChange={(e) => setDiscountPercentage(e.target.value)} min="0" max="100" />
                        </div>
                    )}
                    {(discountType && discountType !== 'discount') && (
                        <div>
                            <label>Дополнительные услуги:</label>
                            <div>
                                {['broom', 'towel', 'hat', 'sheets'].map((service) => (
                                    <div key={service}>
                                        <label>
                                            <input
                                                type="checkbox"
                                                value={service}
                                                checked={additionalServices[service]?.selected || false}
                                                onChange={handleServiceSelection}
                                            />
                                            {service === 'broom' ? 'Веник' : service === 'towel' ? 'Полотенце' : service === 'hat' ? 'Шапка' : 'Простыня'}
                                        </label>
                                        <br />
                                        {discountType === 'discount_service' && additionalServices[service]?.selected && (
                                            <>
                                                <label>Новая стоимость для {service === 'broom' ? 'веника' : service === 'towel' ? 'полотенца' : service === 'hat' ? 'шапки' : 'простыни'}:</label>
                                                <input
                                                    type="number"
                                                    value={servicePrices[service] || ''}
                                                    onChange={(e) => handleServicePriceChange(service, e.target.value)}
                                                />
                                            </>
                                        )}
                                        {discountType === 'free' && additionalServices[service]?.selected && (
                                            <>
                                                <label>Минимальное количество для бесплатной услуги:</label>
                                                <input
                                                    type="number"
                                                    value={minServiceCounts[service] || ''}
                                                    onChange={(e) => handleMinServiceCountChange(service, e.target.value)}
                                                />
                                                <label>Количество бесплатных услуг:</label>
                                                <input
                                                    type="number"
                                                    value={freeServiceCounts[service] || ''}
                                                    onChange={(e) => handleFreeServiceCountChange(service, e.target.value)}
                                                />
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div>
                    <button type="submit">Добавить акцию</button>
                </div>

                <div>
                    <button type="button" onClick={() => { clearForm() }}>Очистить форму</button>
                </div>
            </form>
            <div>
                <h3 onClick={toggleDiscountList} style={{ cursor: 'pointer' }}>
                    Список акций: {isDiscountListVisible ? 'Скрыть акции' : 'Показать акции'}
                </h3>
                {isDiscountListVisible && (
                    <div>
                        {discounts.map(discount => (
                            <div key={discount.id}>
                                <h4>Описание акции: {discount.description}</h4>
                                {discount.time_discount_type === 'time_limit' ? (
                                    <p>
                                        Действует с {discount.valid_from} по {discount.valid_till === '24:00' ? '00:00' : discount.valid_till}
                                    </p>
                                ) : (
                                    <p>Действует постоянно</p>
                                )}
                                {discount.applicable_days.length > 0 && (
                                    <p>
                                        Применимо в дни: {discount.applicable_days.map(day => (
                                            <span key={day}>{new Date(day).toLocaleDateString('ru-RU')}, </span>
                                        ))}
                                    </p>
                                )}
                                <p>Тип скидки: {discount.discount_type === 'discount' ? 'Скидка на стоимость' : discount.discount_type === 'discount_service' ? 'Скидка на стоимость доп. услуги' : 'Бесплатные услуги'}</p>
                                {discount.discount_percentage && (
                                    <p>Процент скидки: {discount.discount_percentage}%</p>
                                )}
                                {discount.applicable_services.length > 0 && (
                                    <p>
                                        Применимо к услугам: {discount.applicable_services.map(service => {
                                            switch (service) {
                                                case 'broom':
                                                    return 'веники';
                                                case 'towel':
                                                    return 'полотенца';
                                                case 'hat':
                                                    return 'шапки';
                                                case 'sheets':
                                                    return 'простыни';
                                                default:
                                                    return service;
                                            }
                                        }).join(', ')}
                                    </p>
                                )}
                                {discount.discount_type === 'discount_service' && discount.service_prices && (
                                    <div>
                                        {discount.applicable_services.map(service => {
                                            const price = discount.service_prices[service];
                                            if (price !== undefined) {
                                                return (
                                                    <p key={service}>
                                                        Новая стоимость для {service === 'broom' ? 'веника' : service === 'towel' ? 'полотенца' : service === 'hat' ? 'шапки' : service === 'sheets' ? 'простыни' : service}: {price} руб.
                                                    </p>
                                                );
                                            }
                                            return null;
                                        })}
                                    </div>
                                )}
                                {discount.discount_type === 'free' && discount.free_service_counts && (
                                    <div>
                                        {Object.entries(discount.free_service_counts).map(([service, count]) => (
                                            <p key={service}>
                                                {count} {service === 'broom' ? 'веника' : service === 'towel' ? 'полотенца' : service === 'hat' ? 'шапки' : service === 'sheets' ? 'простыни' : service} в подарок
                                            </p>
                                        ))}
                                    </div>
                                )}
                                <button onClick={() => handleEditDiscount(discount)}>Редактировать</button>
                                <button onClick={() => handleDeleteDiscount(discount.id)}>Удалить акцию</button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDiscountsManager;