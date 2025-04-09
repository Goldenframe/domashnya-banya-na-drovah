import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useOutletContext } from 'react-router-dom';
import '../../styles/auth.css'
import '../../styles/discounts.css'



export default function DiscountList() {

    const { discounts, setDiscounts, handleEditDiscount, userId, token } = useOutletContext();
    const apiUrl = import.meta.env.VITE_API_URL; 
    const handleDeleteDiscount = async (discountId) => {
        try {
            const response = await axios.delete(`https://api.dom-ban-na-drovah.ru/api/adminAccount/${userId}/discounts/${discountId}`, {
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

    return (
        <>
            {discounts.length > 0 ?
                <div className='discount-card-container'>{
                    discounts.map(discount => (
                        <div key={discount.id} className='discount-card'>
                            <div className='discount-header'>
                                <h4>Акция №{discount.id}</h4>
                            </div>
                            <div className='discount-content'>
                                <p className='discount-info'>
                                    <span>Описание акции:</span> <span>{discount.description}</span>
                                </p>
                                {discount.time_discount_type === 'no-time_limit' && 
                                    <p className='discount-info'>Действует постоянно</p>
                                }
                                <p className='discount-info'>
                                    <span>Действует</span> <span>c {discount.valid_from} до {discount.valid_till === '24:00' ? '00:00' : discount.valid_till}</span>
                                </p>
                                {discount.applicable_days.length > 0 && (
                                    <p className='discount-info'>
                                        <span>Применимо в дни:</span>

                                        <span>{discount.applicable_days.map(day => (
                                            <span key={day}>{new Date(day).toLocaleDateString('ru-RU')}, </span>
                                        ))}</span>
                                    </p>
                                )}
                                <p className='discount-info'><span>Тип скидки:</span> <span>{discount.discount_type === 'discount' ? 'Скидка на стоимость' : discount.discount_type === 'discount_service' ? 'Скидка на стоимость доп. услуги' : 'Бесплатные услуги'}</span></p>
                                {discount.discount_percentage && (
                                    <p className='discount-info'><span>Процент скидки:</span> <span>{discount.discount_percentage}%</span></p>
                                )}
                                {discount.applicable_services.length > 0 && (
                                    <p className='discount-info'>
                                        <span>Применимо к услугам:</span>
                                        <span>{discount.applicable_services.map(service => {
                                            switch (service) {
                                                case 'broom':
                                                    return 'Веники';
                                                case 'towel':
                                                    return 'Полотенца';
                                                case 'hat':
                                                    return 'Шапки';
                                                case 'sheets':
                                                    return 'Простыни';
                                                default:
                                                    return service;
                                            }
                                        }).join(', ')}
                                        </span>
                                    </p>
                                )}
                                {discount.discount_type === 'discount_service' && discount.service_prices && (
                                    <>
                                        {discount.applicable_services.map(service => {
                                            const price = discount.service_prices[service];
                                            if (price !== undefined) {
                                                return (
                                                    <p key={service} className='discount-info'>
                                                        <span>Новая стоимость для {service === 'broom' ? 'веника' : service === 'towel' ? 'полотенца' : service === 'hat' ? 'шапки' : service === 'sheets' ? 'простыни' : service}:</span> <span>{price} руб.</span>
                                                    </p>
                                                );
                                            }
                                            return null;
                                        })}
                                    </>
                                )}
                                {discount.discount_type === 'free' && discount.free_service_counts && (
                                    <>
                                        {Object.entries(discount.free_service_counts).map(([service, count]) => {
                                            if (count > 0) {
                                                let serviceName;
                                                switch (service) {
                                                    case 'broom':
                                                        serviceName = count === 1 ? 'веник' : 'веника';
                                                        break;
                                                    case 'towel':
                                                        serviceName = count === 1 ? 'полотенце' : 'полотенца';
                                                        break;
                                                    case 'hat':
                                                        serviceName = count === 1 ? 'шапка' : 'шапки';
                                                        break;
                                                    case 'sheets':
                                                        serviceName = count === 1 ? 'простыня' : 'простыни';
                                                        break;
                                                    default:
                                                        serviceName = service;
                                                }
                                                const minCount = discount.min_service_counts?.[service] || 0;

                                                return (
                                                    <p key={service} className='discount-info'>
                                                        За {minCount} {service === 'broom' ? 'веника' : service === 'towel' ? 'полотенца' : service === 'hat' ? 'шапки' : service === 'sheets' ? 'простыни' : service} {count} {serviceName} в подарок
                                                    </p>
                                                );
                                            }
                                            return null;
                                        })}
                                    </>
                                )}
                                <div className='actions-buttons'>
                                    <button onClick={() => handleDeleteDiscount(discount.id)} className='auth-button'>Удалить</button>
                                    <p className="auth-cancel" onClick={() => handleEditDiscount(discount)}>Редактировать</p>
                                </div>
                            </div>
                        </div>
                    ))
                }</div>

                : <div className='empty-container'>
                    <p className='empty-list'>Акций нет.</p>
                </div>
            }

        </ >
    )
}
