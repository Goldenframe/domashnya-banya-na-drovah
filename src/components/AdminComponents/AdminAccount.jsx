import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import Intervals from './Intervals.jsx';
import Bookings from './Bookings.jsx';
import AdminDiscountsManager from './AdminDiscountsManager.jsx';
import EditProfile from '../EditProfile.jsx';
import UpcomingBookings from './UpcomingBookings.jsx';
import PastBookings from './PastBookings.jsx';
import AdminAccountHeader from './AdminAccountHeader.jsx';
import IntervalList from './IntervalList.jsx';
import AddInterval from './AddInterval.jsx';
import DiscountList from './DiscountList.jsx';
import DiscountForm from './DiscountForm.jsx';
import Cookies from 'js-cookie';
import Home from '../Home';

function AdminAccount() {
    const navigate = useNavigate();
    const [userData, setUserData] = useState({
        firstName: Cookies.get('firstName'),
        lastName: Cookies.get('lastName'),
        userId: Cookies.get('userId'),
        token: Cookies.get('token'),
    });

    useEffect(() => {
        const token = Cookies.get('token');
        if (!token) {
            navigate('/');
        }
    }, [navigate]);

    const updateUserData = (updatedData) => {
        setUserData(prevData => ({
            ...prevData,
            firstName: updatedData.first_name,
            lastName: updatedData.last_name,
            phoneNumber: updatedData.phone_number,
        }));

        Cookies.set('firstName', updatedData.first_name, { expires: 7, secure: true, sameSite: 'Strict' });
        Cookies.set('lastName', updatedData.last_name, { expires: 7, secure: true, sameSite: 'Strict' });
        Cookies.set('phoneNumber', updatedData.phone_number, { expires: 7, secure: true, sameSite: 'Strict' });
    };
    return (
        <div>
            <AdminAccountHeader userId={userData.userId} />
            <div className="account-container">
                <Routes>
                    <Route path="/" element={<Navigate to="/" />} />
                    <Route path="intervals" element={<Intervals userId={userData.userId} token={userData.token} />}>
                        <Route index element={<IntervalList />} />
                        <Route path='new-interval' element={<AddInterval />} />
                    </Route>
                    <Route path="bookings" element={<Bookings userId={userData.userId} token={userData.token} />} >
                        <Route path='upcoming' element={<UpcomingBookings />} />
                        <Route path='past' element={<PastBookings />} />
                    </Route>
                    <Route path="discountsManager" element={<AdminDiscountsManager userId={userData.userId} token={userData.token} />} >
                        <Route path='new-discount' element={<DiscountForm />} />
                        <Route path='discount-list' element={<DiscountList />} />
                    </Route>
                    <Route path='editProfile' element={<EditProfile userId={userData.userId} token={userData.token} updateUserData={updateUserData} />} />
                    <Route path="*" element={<Navigate to={`/adminAccount/${userData.userId}/intervals`} />} />
                </Routes>

            </div>
        </div>
    );
}

export default AdminAccount;
