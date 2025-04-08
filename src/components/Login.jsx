import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { decodeToken } from "react-jwt";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import useShowMessage from './useShowMessage';
import Cookies from "js-cookie"; 
import '../styles/auth.css'

function Login() {
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [inputError, setInputError] = useState({ phone: false, password: false });

    const { message, showMessage, error, showError, isVisible } = useShowMessage();
    const navigate = useNavigate();
    const apiUrl = import.meta.env.VITE_API_URL; 
    const formatPhoneNumber = (value) => {
        const cleaned = value.replace(/\D/g, '');
        
        const limited = cleaned.slice(0, 11);
        
        let formatted = limited;
        if (limited.length > 0) {
            formatted = `+7 (`;
            if (limited.length > 1) {
                formatted += `${limited.slice(1, 4)}`;
            }
            if (limited.length > 4) {
                formatted += `) ${limited.slice(4, 7)}`;
            }
            if (limited.length > 7) {
                formatted += `-${limited.slice(7, 9)}`;
            }
            if (limited.length > 9) {
                formatted += `-${limited.slice(9)}`;
            }
        }
        
        return formatted;
    };

    const handlePhoneChange = (e) => {
        const input = e.target.value;
        const previousValue = phone;
        
        if (input.length < previousValue.length) {
            setPhone(input);
            return;
        }
        
        const formatted = formatPhoneNumber(input);
        setPhone(formatted);
    };

    const getCleanPhoneNumber = () => {
        const cleanPhone = phone.replace(/\D/g, '');
        return cleanPhone.length === 10 ? '7' + cleanPhone : cleanPhone;
    };

    const login = async () => {
        showError("");
        setInputError({ phone: false, password: false });

        const cleanPhone = getCleanPhoneNumber();
        
        if (!cleanPhone || cleanPhone.length < 11 || !password) {
            showError("Пожалуйста, введите корректный номер телефона и пароль.");
            setInputError({ phone: !cleanPhone || cleanPhone.length < 11, password: !password });
            return;
        }

        try {
            const response = await axios.post(`/api/login`, { 
                phone_number: cleanPhone, 
                password 
            });
            
            if (response.status === 200) {
                Cookies.set("token", response.data.token, { expires: 7, secure: true, sameSite: 'Strict' });
                Cookies.set("userId", response.data.userId, { expires: 7, secure: true, sameSite: 'Strict' });
                Cookies.set("firstName", response.data.first_name, { expires: 7, secure: true, sameSite: 'Strict' });
                Cookies.set("lastName", response.data.last_name, { expires: 7, secure: true, sameSite: 'Strict' });
                showMessage("Вход выполнен успешно!");
        
                const decodedToken = decodeToken(response.data.token);
                if (!decodedToken) {
                    console.error("Ошибка: токен не может быть декодирован");
                    return;
                }
        
                navigate(decodedToken.role === "admin" ? `/adminAccount/${response.data.userId}` : `/userAccount/${response.data.userId}`);
            }
        } catch (error) {
            if (error.response?.status === 401) {
                if (error.response?.data?.message.includes("Пользователя с таким номером телефона не существует!")) {
                    showError("Пользователя с таким номером телефона не существует!");
                    setInputError({ phone: true, password: false });
                } else if (error.response?.data?.message.includes("Неверный пароль")) {
                    showError("Неверный пароль! Попробуйте снова.");
                    setInputError({ phone: false, password: true });
                }
        
                setTimeout(() => setInputError({ phone: false, password: false }), 8000);
            } else {
                showError(error.response?.data?.message || "Ошибка входа.");
            }
        }
    };

    useEffect(() => {
        const token = Cookies.get("token");
        if (token) {
            const decodedToken = decodeToken(token);
            if (decodedToken.exp * 1000 > Date.now()) {
                navigate(decodedToken.role === "admin" ? `/adminAccount/${decodedToken.userId}` : `/userAccount/${decodedToken.userId}`);
            }
        }
    }, [navigate]);

    const isButtonDisabled = !(getCleanPhoneNumber().length >= 11) || !password;

    return (
        <div className="auth-container">
            <div className="auth-block log">
                <div className="auth-content">
                    <h2 className="auth-title">ВХОД</h2>

                    {(message || error) && (
                        <p
                            className={`auth-message ${error ? "error" : "success"} ${isVisible ? "fade-in" : "fade-out"}`}
                            role="alert" 
                        >
                            {message || error}
                        </p>
                    )}

                    <div className="auth-form">
                        <label className={`auth-label ${inputError.phone ? "error-label" : ""}`} htmlFor="phone">
                            Номер телефона
                            <input
                                type="tel"
                                id="phone"
                                className={`auth-input ${inputError.phone ? "error-input" : ""}`}
                                placeholder="+7 (XXX) XXX-XX-XX"
                                onChange={handlePhoneChange}
                                value={phone}
                                aria-describedby="phoneError"
                                required
                                maxLength={18}
                            />
                            {inputError.phone && <span id="phoneError" className="error-message">Неверный номер телефона</span>}
                        </label>

                        <label className={`auth-label ${inputError.password ? "error-label" : ""}`} htmlFor="password">
                            Пароль
                            <div className="passwordInput">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    className={`auth-input ${inputError.password ? "error-input" : ""}`}
                                    placeholder="Введите пароль"
                                    onChange={(e) => setPassword(e.target.value)}
                                    value={password}
                                    maxLength={16}
                                    aria-describedby="passwordError"
                                    required
                                />
                                <FontAwesomeIcon
                                    icon={showPassword ? faEyeSlash : faEye}
                                    className="passwordIcon"
                                    onClick={() => setShowPassword(!showPassword)}
                                    aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
                                    tabIndex="0" 
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" || e.key === " ") {
                                            setShowPassword(!showPassword);
                                        }
                                    }} 
                                    role="button" 
                                    aria-pressed={showPassword} 
                                />
                            </div>
                            {inputError.password && <span id="passwordError" className="error-message">Неверный пароль</span>}
                        </label>

                        <button
                            className="auth-button"
                            onClick={login}
                            disabled={isButtonDisabled}
                            aria-disabled={isButtonDisabled}
                        >
                            Войти
                        </button>
                    </div>

                    <div className="auth-links">
                        <p>
                            Еще нет учетной записи? <Link to="/register" className="auth-link">Зарегистрируйтесь</Link>
                        </p>
                        <Link to="/forgot-password" className="auth-link">Забыли пароль?</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;