import React, { useEffect, useState, Suspense, lazy } from 'react';
import { Link, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import Loader from '../Loader.jsx';
import Cookies from 'js-cookie';

const BookingForm = lazy(() => import('./BookingForm.jsx'));
const UserBookings = lazy(() => import('./UserBookings.jsx'));
const EditProfile = lazy(() => import('../EditProfile.jsx'));
const UserAccountHeader = lazy(() => import('./UserAccountHeader.jsx'));
const UserUpcomingBookings = lazy(() => import('./UserUpcomingBookings.jsx'));
const UserPastBookings = lazy(() => import('./UserPastBookings.jsx'));


function UserAccount() {
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        const token = Cookies.get('token');
        if (!token) {
            navigate('/');
        } else {
            setUserData({
                firstName: Cookies.get('firstName'),
                lastName: Cookies.get('lastName'),
                userId: Cookies.get('userId'),
                token,
            });
        }
    }, [navigate]);

    const updateUserData = (updatedData) => {
        setUserData(prevData => ({
            ...prevData,
            firstName: updatedData.first_name,
            lastName: updatedData.last_name,
        }));

        Cookies.set('firstName', updatedData.first_name, { expires: 7 });
        Cookies.set('lastName', updatedData.last_name, { expires: 7 });
    };

    if (!userData) {
        return <Loader />;
    }



    return (
        <div>
            <Suspense fallback={<Loader />}>
                <UserAccountHeader userId={userData.userId} />
            </Suspense>
            <div className="account-container">
                <Suspense fallback={<Loader />}>
                    <Routes>
                        <Route path="/" element={<Navigate to="/" />} />
                        <Route path='bookingForm' element={<BookingForm userId={userData.userId} token={userData.token} />} />
                        <Route path="bookings" element={<UserBookings userId={userData.userId} token={userData.token} />}>
                            <Route path="upcoming" element={<UserUpcomingBookings />} />
                            <Route path="past" element={<UserPastBookings />} />
                        </Route>
                        <Route path='editProfile' element={<EditProfile userId={userData.userId} token={userData.token} updateUserData={updateUserData} />} />
                        <Route path="*" element={<Navigate to={`/`} />} />
                    </Routes>
                </Suspense>
            </div>
        </div>
    );
}

export default UserAccount;
