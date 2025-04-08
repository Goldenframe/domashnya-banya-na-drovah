import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import '../../styles/nav.css'
import '../../styles/account.css'
const AdminDiscountsManager = ({ userId, token }) => {
    const [discounts, setDiscounts] = useState([]);
    const [currentDiscount, setCurrentDiscount] = useState(null);
    const navigate = useNavigate();
    const apiUrl = import.meta.env.VITE_API_URL; 
    const handleEditDiscount = (discount) => {
        setCurrentDiscount(discount);
        navigate(`/adminAccount/${userId}/discountsManager/new-discount`, { state: { discount }, replace: true });
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
            const response = await axios.get('/api/adminAccount/:userId/discounts/active', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDiscounts(response.data);
        } catch (error) {
            console.error("Ошибка при загрузке скидок:", error);
        }
    };

    return (
        <div className='account-content'>
                <nav className='nav'>
                    <NavLink to={'new-discount'} className={({ isActive }) => { return isActive ? 'nav-link active' : 'nav-link' }}>Управление акциями</NavLink>
                    <NavLink to={'discount-list'} className={({ isActive }) => { return isActive ? 'nav-link active' : 'nav-link' }}>Список акций</NavLink>
                </nav>
            <Outlet context={{ discounts, setDiscounts, currentDiscount, setCurrentDiscount, fetchActiveDiscounts, userId, token, handleEditDiscount }} />

        </div>
    );
};

export default AdminDiscountsManager;