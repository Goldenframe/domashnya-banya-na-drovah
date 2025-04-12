import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import '../../styles/nav.css';
import '../../styles/account.css';

const AdminDiscountsManager = ({ userId, token }) => {
    const [discounts, setDiscounts] = useState([]);
    const [currentDiscount, setCurrentDiscount] = useState(null);
    const navigate = useNavigate();
    const apiUrl = import.meta.env.VITE_API_URL;

    const handleEditDiscount = (discount) => {
        setCurrentDiscount(discount);
        navigate(`/adminAccount/${userId}/discountsManager/new-discount`, { 
            state: { discount }, 
            replace: true 
        });
    };

    useEffect(() => {
        const loadData = async () => {
            await new Promise(resolve => setTimeout(resolve, 1000));
        };
        loadData();
    }, []);

    useEffect(() => {
        fetchActiveDiscounts();
    }, []);

    const fetchActiveDiscounts = async () => {
        try {
            const response = await axios.get(
                `https://api.dom-ban-na-drovah.ru/api/adminAccount/${userId}/discounts/active`, 
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            setDiscounts(response.data);
        } catch (error) {
            console.error("Ошибка при загрузке скидок:", error);
        }
    };

    return (
        <div className='account-content'>
            <nav className='nav' aria-label="Меню управления скидками">
                <ul>
                    <li>
                        <NavLink 
                            to="new-discount" 
                            className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
                            aria-current={({ isActive }) => isActive ? 'page' : null}
                        >
                            Управление акциями
                        </NavLink>
                    </li>
                    <li>
                        <NavLink 
                            to="discount-list" 
                            className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
                            aria-current={({ isActive }) => isActive ? 'page' : null}
                        >
                            Список акций
                        </NavLink>
                    </li>
                </ul>
            </nav>
            <main className='content' role="main">
                <Outlet context={{ 
                    discounts, 
                    setDiscounts, 
                    currentDiscount, 
                    setCurrentDiscount, 
                    fetchActiveDiscounts, 
                    userId, 
                    token, 
                    handleEditDiscount 
                }} />
            </main>
        </div>
    );
};

export default AdminDiscountsManager;