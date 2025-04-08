import React, { useEffect } from 'react';
import '../../styles/buttons.css'
import '../../styles/account.css'
import '../../styles/form.css'
import '../../styles/additional-services.css'

export default function AdditionalServices({ additionalServices, setAdditionalServices, discounts, start, end, bookingDate, additionalServicesQuantity, setAdditionalServicesQuantity }) {
    const servicePrices = { broom: 150, towel: 200, hat: 50, sheets: 200 };
    const maxQuantities = { broom: 4, towel: 8, hat: 8, sheets: 2 };

    const updateFreeServicesQuantity = () => {
        const newAdditionalServicesQuantity = { ...additionalServicesQuantity };
    
        discounts.forEach(discount => {
            if (discount.discount_type !== 'free' || !isDiscountApplicable(discount)) return;
    
            // Применяем скидку ко всем услугам, если applicable_services пуст
            const applicableServices = discount.applicable_services.length > 0 
                ? discount.applicable_services 
                : Object.keys(discount.free_service_counts);
    
            applicableServices.forEach(service => {
                const quantity = additionalServices[service]?.quantity || 0;
    
                // Проверяем минимальное количество для скидки
                const minCount = parseInt(discount.min_service_counts?.[service] || "0", 10);
                if (quantity >= minCount) {
                    const freeCount = Math.floor(quantity / minCount) * discount.free_service_counts[service];
                    newAdditionalServicesQuantity[service] = (newAdditionalServicesQuantity[service] || 0) + freeCount;
                }
            });
        });
    
        console.log("Обновленные бесплатные услуги:", newAdditionalServicesQuantity);
        setAdditionalServicesQuantity(newAdditionalServicesQuantity);
    };
    
    
    useEffect(() => {
        updateFreeServicesQuantity();
    }, [bookingDate, additionalServices]);

    const handleQuantityChange = (service, quantity) => {
        quantity = Math.max(0, Math.min(quantity, maxQuantities[service]));
        
        setAdditionalServices(prev => {
            const updatedServices = {
                ...prev,
                [service]: {
                    selected: quantity > 0,
                    quantity: quantity
                }
            };
            console.log("Обновленные услуги:", updatedServices);
            return updatedServices;
        });

        const freeCount = getFreeServiceCount(service, quantity);
        setAdditionalServicesQuantity(prev => {
            const updatedFreeServices = { ...prev, [service]: freeCount };
            console.log("Обновленные бесплатные услуги:", updatedFreeServices);
            return updatedFreeServices;
        });
    };

    const isDiscountApplicable = (discount) => {
        if (!start || !end || !bookingDate) return false;
        
        const startTime = new Date(`${bookingDate}T${start}`);
        const endTime = new Date(`${bookingDate}T${end}`);
        const validFrom = new Date(`${bookingDate}T${discount.valid_from}`);
        const validTill = new Date(`${bookingDate}T${discount.valid_till}`);
        
        const applicable = discount.time_discount_type === 'time_limit' 
            ? (startTime >= validFrom && endTime <= validTill && discount.applicable_days.includes(bookingDate))
            : (startTime >= validFrom && endTime <= validTill);
        
        console.log("Проверяем скидку:", discount, "Применима:", applicable);
        return applicable;
    };

    const getFreeServiceCount = (service, quantity, discount) => {
        if (discount && quantity >= discount.min_service_counts?.[service]) {
            return Math.floor(quantity / discount.min_service_counts[service]) * discount.free_service_counts[service];
        }
        return 0;
    };

    const getServicePrice = (service) => {
        const discount = discounts?.find(d => 
            d.applicable_services?.includes(service) && 
            d.discount_type === 'discount_service' && 
            isDiscountApplicable(d)
        );
        return discount?.service_prices?.[service] ?? servicePrices[service];
    };

    const changeQuantity = (service, delta) => {
        const current = additionalServices[service]?.quantity || 0;
        handleQuantityChange(service, current + delta);
    };

    return (
        <div className="additional-services">
            <label className="service-item">
                <span>Дубовые веники
                    (+{getServicePrice('broom')} ₽)</span>                  {additionalServicesQuantity.broom > 0 && (
                    <span className="free-gift"> (+{additionalServicesQuantity.broom} в подарок)</span>
                )}
                <div className="service-quantity">
                    <button onClick={() => changeQuantity('broom', -1)} type='button'>-</button>
                    <input
                        type="number"
                        min="0"
                        max={maxQuantities.broom}
                        value={additionalServices.broom?.quantity || 0}
                        onChange={(e) => handleQuantityChange('broom', parseInt(e.target.value))}
                        className="service-quantity-input"
                    />
                    <button onClick={() => changeQuantity('broom', 1)} type='button'>+</button>
                </div>
                {/* {getFreeServiceCount('broom', additionalServices.broom?.quantity || 0) > 0 && (
                    <span className="free-gift"> (+{getFreeServiceCount('broom', additionalServices.broom?.quantity || 0)} в подарок)</span>
                )} */}

            </label>
            <br />
            <label className="service-item">
                <span>Полотенце
                    (+{getServicePrice('towel')} ₽)</span>
                <div className="service-quantity">
                    <button onClick={() => changeQuantity('towel', -1)} type='button'>-</button>
                    <input
                        type="number"
                        min="0"
                        max={maxQuantities.towel}
                        value={additionalServices.towel?.quantity || 0}
                        onChange={(e) => handleQuantityChange('towel', parseInt(e.target.value))}
                        className="service-quantity-input"
                    />
                    <button onClick={() => changeQuantity('towel', 1)} type='button'>+</button>
                </div>
                {/* {getFreeServiceCount('towel', additionalServices.towel?.quantity || 0) > 0 && (
                    <span className="free-gift"> (+{getFreeServiceCount('towel', additionalServices.towel?.quantity || 0)} в подарок)</span>
                )} */}
                
            </label>
            <br />
            <label className="service-item">
                <span>Шапка
                    (+{getServicePrice('hat')} ₽)</span>
                <div className="service-quantity">
                    <button onClick={() => changeQuantity('hat', -1)} type='button'>-</button>
                    <input
                        type="number"
                        min="0"
                        max={maxQuantities.hat}
                        value={additionalServices.hat?.quantity || 0}
                        onChange={(e) => handleQuantityChange('hat', parseInt(e.target.value))}
                        className="service-quantity-input"
                    />
                    <button onClick={() => changeQuantity('hat', 1)} type='button'>+</button>
                </div>
                {getFreeServiceCount('hat', additionalServices.hat?.quantity || 0) > 0 && (
                    <span className="free-gift"> (+{getFreeServiceCount('hat', additionalServices.hat?.quantity || 0)} в подарок)</span>
                )}
            </label>
            <br />
            <label className="service-item">
                <span>Простынь
                    (+{getServicePrice('sheets')} ₽)</span>
                <div className="service-quantity">
                    <button onClick={() => changeQuantity('sheets', -1)} type='button'>-</button>
                    <input
                        type="number"
                        min="0"
                        max={maxQuantities.sheets}
                        value={additionalServices.sheets?.quantity || 0}
                        onChange={(e) => handleQuantityChange('sheets', parseInt(e.target.value))}
                        className="service-quantity-input"
                    />
                    <button onClick={() => changeQuantity('sheets', 1)} type='button'>+</button>
                </div>
                {getFreeServiceCount('sheets', additionalServices.sheets?.quantity || 0) > 0 && (
                    <span className="free-gift"> (+{getFreeServiceCount('sheets', additionalServices.sheets?.quantity || 0)} в подарок)</span>
                )}
            </label>
        </div>

    );
}
