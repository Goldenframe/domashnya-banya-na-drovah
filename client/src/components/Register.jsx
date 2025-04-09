import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import useShowMessage from "./useShowMessage.jsx";
import Cookies from "js-cookie";
import "../styles/auth.css";

const usePasswordToggle = (initialState = false) => {
  const [visible, setVisible] = useState(initialState);

  const toggle = () => setVisible(!visible);
  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      toggle();
    }
  };

  return {
    type: visible ? "text" : "password",
    icon: visible ? faEyeSlash : faEye,
    toggle,
    handleKeyDown,
    visible,
  };
};

function Register() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
    verificationCode: "",
  });

  const [uiState, setUiState] = useState({
    isCodeSent: false,
    canResendCode: true,
    isSubmitting: false,
  });

  const passwordToggle = usePasswordToggle();
  const confirmPasswordToggle = usePasswordToggle();
  const navigate = useNavigate();
  const { message, showMessage, error, showError, isVisible } =
    useShowMessage();
  const apiUrl = import.meta.env.VITE_API_URL;
  const formatPhoneNumber = (value) => {
    const cleaned = value.replace(/\D/g, "");

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
    const previousValue = formData.phoneNumber;

    if (input.length < previousValue.length) {
      setFormData((prev) => ({ ...prev, phoneNumber: input }));
      return;
    }

    const formatted = formatPhoneNumber(input);
    setFormData((prev) => ({ ...prev, phoneNumber: formatted }));
  };

  const getCleanPhoneNumber = () => {
    const cleanPhone = formData.phoneNumber.replace(/\D/g, "");
    return cleanPhone.length === 10 ? "7" + cleanPhone : cleanPhone;
  };

  const handleInputChange = (e, fieldName) => {
    const { id, value } = e.target;
    if (id === "phoneNumber") {
      handlePhoneChange(e);
    } else {
      setFormData((prev) => ({ ...prev, [id]: value }));
    }
  };

  const sendVerificationCode = async () => {
    setUiState((prev) => ({ ...prev, isSubmitting: true }));

    try {
      const cleanPhone = getCleanPhoneNumber();
      const response = await axios.post(`http://api.dom-ban-na-drovah.ru/api/register`, {
        phone_number: cleanPhone,
      });

      if (response.status === 200) {
        setUiState({
          isCodeSent: true,
          canResendCode: false,
          isSubmitting: false,
        });
        showMessage("Код отправлен на Ваш номер телефона.");
        setTimeout(
          () => setUiState((prev) => ({ ...prev, canResendCode: true })),
          60000
        );
      }
    } catch (error) {
      setUiState((prev) => ({ ...prev, isSubmitting: false }));
      showError(error.response?.data?.error || "Ошибка отправки кода.");
    }
  };

  const register = async () => {
    if (formData.password !== formData.confirmPassword) {
      showError("Пароли не совпадают!");
      return;
    }

    setUiState((prev) => ({ ...prev, isSubmitting: true }));

    try {
      const cleanPhone = getCleanPhoneNumber();
      const response = await axios.post("/api/verify-registration", {
        first_name: formData.firstName,
        last_name: formData.lastName,
        password: formData.password,
        phone_number: cleanPhone,
        verification_code: formData.verificationCode,
      });

      if (response.status === 201) {
        const { token, userId, first_name, last_name } = response.data;

        Cookies.set("token", token, { expires: 7, secure: true });
        Cookies.set("userId", userId, { expires: 7, secure: true });
        Cookies.set("firstName", first_name, { expires: 7, secure: true });
        Cookies.set("lastName", last_name, { expires: 7, secure: true });

        navigate(`/userAccount/${userId}`);
      }
    } catch (error) {
      showError(
        error.response?.data?.error ||
          "Ошибка регистрации. Пожалуйста, проверьте данные."
      );
    } finally {
      setUiState((prev) => ({ ...prev, isSubmitting: false }));
    }
  };

  const isFormValid =
    formData.firstName &&
    formData.lastName &&
    formData.password &&
    formData.confirmPassword &&
    getCleanPhoneNumber().length >= 11;

  const isVerificationFormValid = formData.verificationCode.length === 4;

  const renderPasswordIcon = (toggleProps) => (
    <FontAwesomeIcon
      icon={toggleProps.icon}
      className="passwordIcon"
      onClick={toggleProps.toggle}
      aria-label={toggleProps.visible ? "Скрыть пароль" : "Показать пароль"}
      tabIndex="0"
      onKeyDown={toggleProps.handleKeyDown}
      role="button"
      aria-pressed={toggleProps.visible}
    />
  );

  return (
    <div
      className="auth-container"
      role="region"
      aria-labelledby="registerTitle"
    >
      <div
        className="auth-block reg"
        role="group"
        aria-labelledby="registerBlockLabel"
      >
        <div className="auth-content">
          <h2 id="registerTitle" className="auth-title">
            РЕГИСТРАЦИЯ
          </h2>

          {(message || error) && (
            <p
              className={`auth-message ${error ? "error" : "success"} ${
                isVisible ? "fade-in" : "fade-out"
              }`}
              role="alert"
            >
              {message || error}
            </p>
          )}
          <div className="auth-form">
            <div className="auth-row">
              <div className="auth-column">
                <label className="auth-label" htmlFor="firstName">
                  Имя
                  <input
                    type="text"
                    id="firstName"
                    className="auth-input"
                    placeholder="Введите имя"
                    maxLength={20}
                    onChange={(e) => handleInputChange(e, "Имя")}
                    value={formData.firstName}
                    required
                    aria-required="true"
                    aria-describedby="firstNameError"
                  />
                  <span
                    id="firstNameError"
                    className="screen-reader-only"
                  ></span>
                </label>

                <label className="auth-label" htmlFor="lastName">
                  Фамилия
                  <input
                    type="text"
                    id="lastName"
                    className="auth-input"
                    placeholder="Введите фамилию"
                    maxLength={20}
                    onChange={(e) => handleInputChange(e, "Фамилия")}
                    value={formData.lastName}
                    required
                    aria-required="true"
                    aria-describedby="lastNameError"
                  />
                  <span
                    id="lastNameError"
                    className="screen-reader-only"
                  ></span>
                </label>
              </div>

              <div className="auth-column">
                <label className="auth-label" htmlFor="password">
                  Пароль
                  <div className="passwordInput">
                    <input
                      type={passwordToggle.type}
                      id="password"
                      className="auth-input"
                      placeholder="Введите пароль"
                      maxLength={16}
                      onChange={(e) => handleInputChange(e, "Пароль")}
                      value={formData.password}
                      required
                      aria-required="true"
                      aria-describedby="passwordError"
                    />
                    {renderPasswordIcon(passwordToggle)}
                  </div>
                  <span
                    id="passwordError"
                    className="screen-reader-only"
                  ></span>
                </label>

                <label className="auth-label" htmlFor="confirmPassword">
                  Проверка пароля
                  <div className="passwordInput">
                    <input
                      type={confirmPasswordToggle.type}
                      id="confirmPassword"
                      className="auth-input"
                      placeholder="Повторите пароль"
                      maxLength={16}
                      onChange={(e) => handleInputChange(e, "Проверка пароля")}
                      value={formData.confirmPassword}
                      required
                      aria-required="true"
                      aria-describedby="confirmPasswordError"
                    />
                    {renderPasswordIcon(confirmPasswordToggle)}
                  </div>
                  <span
                    id="confirmPasswordError"
                    className="screen-reader-only"
                  ></span>
                </label>
              </div>

              <div className="auth-column">
                <label className="auth-label" htmlFor="phoneNumber">
                  Номер телефона
                  <input
                    type="tel"
                    id="phoneNumber"
                    className="auth-input"
                    placeholder="+7 (XXX) XXX-XX-XX"
                    maxLength={18}
                    onChange={(e) => handleInputChange(e, "Номер телефона")}
                    value={formData.phoneNumber}
                    required
                    aria-required="true"
                    aria-describedby="phoneNumberError"
                  />
                  <span
                    id="phoneNumberError"
                    className="screen-reader-only"
                  ></span>
                </label>

                {isFormValid && (
                  <label className="auth-label" htmlFor="verificationCode">
                    Код верификации
                    <input
                      type="text"
                      id="verificationCode"
                      className="auth-input"
                      placeholder="Введите код"
                      maxLength={4}
                      onChange={(e) => handleInputChange(e, "Код верификации")}
                      value={formData.verificationCode}
                      required
                      aria-required="true"
                      aria-describedby="verificationCodeError"
                    />
                    <span
                      id="verificationCodeError"
                      className="screen-reader-only"
                    ></span>
                  </label>
                )}
              </div>
            </div>
          </div>

          {!uiState.isCodeSent && !isFormValid && (
            <button
              className="auth-button"
              onClick={sendVerificationCode}
              disabled={!isFormValid || uiState.isSubmitting}
              aria-busy={uiState.isSubmitting}
              aria-live="polite"
            >
              Зарегистрироваться
            </button>
          )}

          {isFormValid && !uiState.isCodeSent && (
            <>
              <p className="auth-info">
                На Ваш номер телефона поступит звонок, введите последние 4 цифры
                номера.
              </p>
              <button
                className="auth-button"
                onClick={sendVerificationCode}
                disabled={!isFormValid || uiState.isSubmitting}
                aria-busy={uiState.isSubmitting}
                aria-live="polite"
              >
                {uiState.isSubmitting ? "Отправка..." : "Отправить код"}
              </button>
            </>
          )}

          {uiState.isCodeSent && (
            <>
              <button
                className="auth-button"
                onClick={register}
                disabled={!isVerificationFormValid || uiState.isSubmitting}
                aria-busy={uiState.isSubmitting}
                aria-live="polite"
              >
                {uiState.isSubmitting ? "Регистрация..." : "Зарегистрироваться"}
              </button>

              {uiState.canResendCode && (
                <button
                  className="auth-button"
                  onClick={sendVerificationCode}
                  disabled={uiState.isSubmitting}
                  aria-busy={uiState.isSubmitting}
                  aria-live="polite"
                >
                  Отправить код еще раз
                </button>
              )}
            </>
          )}

          <div className="auth-links">
            <p>
              Уже есть учетная запись?
              <Link to="/domashnya-banya-na-drovah/login" className="auth-link">
                {" "}
                Войдите
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
