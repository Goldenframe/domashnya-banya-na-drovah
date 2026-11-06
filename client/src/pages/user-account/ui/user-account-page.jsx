import React, { useEffect, useState, Suspense, lazy } from 'react';
import { Link, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import Loader from '@/shared/ui/loader';
import { UserAccountHeader } from '@/widgets/account-navigation';
import Cookies from 'js-cookie';
import UserFooter from './user-footer.jsx';

const BookingForm = lazy(() => import('./booking/booking-form.jsx'));
const UserBookings = lazy(() => import('./bookings/user-bookings.jsx'));
const EditProfile = lazy(() => import('@/features/edit-profile'));
const UserUpcomingBookings = lazy(() => import('./bookings/user-upcoming-bookings.jsx'));
const UserPastBookings = lazy(() => import('./bookings/user-past-bookings.jsx'));


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
            <UserAccountHeader userId={userData.userId} />
            <main className="account-container">
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
            </main>
            <UserFooter userId={userData.userId} />

        </div>
    );
}

export default UserAccount;
