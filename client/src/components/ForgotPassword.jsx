import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import useShowMessage from "./useShowMessage.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import "../styles/auth.css";

function ForgotPassword() {
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isCodeVerified, setIsCodeVerified] = useState(false);
  const [resendTimeout, setResendTimeout] = useState(null);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const { message, showMessage, error, showError, isVisible } =
    useShowMessage();
  const navigate = useNavigate();

  const phoneInputRef = useRef(null);
  const codeInputRef = useRef(null);
  const newPasswordInputRef = useRef(null);
  const confirmPasswordInputRef = useRef(null);

  useEffect(() => {
    if (phoneInputRef.current && !isCodeSent && !isCodeVerified) {
      phoneInputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    if (isCodeSent && codeInputRef.current) {
      codeInputRef.current.focus();
    } else if (isCodeVerified && newPasswordInputRef.current) {
      newPasswordInputRef.current.focus();
    }
  }, [isCodeSent, isCodeVerified]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Enter") {
        if (!isCodeVerified && !isCodeSent && isPhoneValid) {
          sendCode();
        } else if (!isCodeVerified && isCodeSent && code) {
          verifyCode();
        } else if (isCodeVerified && newPassword && confirmPassword) {
          resetPassword();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  });

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
    const previousValue = phone;
    if (input.length < previousValue.length) {
      setPhone(input);
      return;
    }
    const formatted = formatPhoneNumber(input);
    setPhone(formatted);
  };

  const getCleanPhoneNumber = () => {
    const cleanPhone = phone.replace(/\D/g, "");
    return cleanPhone.length === 10 ? "7" + cleanPhone : cleanPhone;
  };

  const isPhoneValid = getCleanPhoneNumber().length === 11;

  const sendCode = async () => {
    try {
      const response = await axios.post(`https://api.dom-ban-na-drovah.ru/api/forgot-password`, {
        phone_number: getCleanPhoneNumber(),
      });
      showMessage(response.data.message);
      setIsCodeSent(true);
      setResendTimeout(setTimeout(() => setResendTimeout(null), 60000));
    } catch (error) {
      showError(error.response?.data?.error || "Ошибка отправки кода.");
      if (phoneInputRef.current) {
        phoneInputRef.current.focus();
      }
    }
  };

  const resendCode = () => {
    sendCode();
  };

  const verifyCode = async () => {
    try {
      const response = await axios.post(`https://api.dom-ban-na-drovah.ru/api/verify-code`, {
        phone_number: getCleanPhoneNumber(),
        verification_code: code,
      });
      if (response.status === 200) {
        setIsCodeVerified(true);
        showMessage("Код подтверждения верен!");
      }
    } catch (error) {
      showError(error.response?.data?.error || "Ошибка проверки кода.");
      if (codeInputRef.current) {
        codeInputRef.current.focus();
      }
    }
  };

  const resetPassword = async () => {
    if (newPassword !== confirmPassword) {
      showError("Пароли не совпадают!");
      if (newPasswordInputRef.current) {
        newPasswordInputRef.current.focus();
      }
      return;
    }

    try {
      const response = await axios.post(`https://api.dom-ban-na-drovah.ru/api/reset-password`, {
        phone_number: getCleanPhoneNumber(),
        verification_code: code,
        new_password: newPassword,
      });

      showMessage(response.data.message);
      if (response.status === 200) {
        navigate("/login");
      }
    } catch (error) {
      showError(error.response?.data?.error || "Ошибка восстановления пароля.");
      if (newPasswordInputRef.current) {
        newPasswordInputRef.current.focus();
      }
    }
  };

  return (
    <main
      className="auth-container"
      role="main"
      aria-labelledby="forgotPasswordTitle"
    >
      <div
        className="auth-block forget"
        role="group"
        aria-labelledby="forgotPasswordBlockLabel"
      >
        <div className="auth-content">
          <h1 id="forgotPasswordTitle" className="auth-title">
            ВОССТАНОВЛЕНИЕ ПАРОЛЯ
          </h1>
          {(message || error) && (
            <div
              className={`auth-message ${error ? "error" : "success"} ${
                isVisible ? "fade-in" : "fade-out"
              }`}
              role="alert"
              aria-live="assertive"
            >
              {message || error}
            </div>
          )}
          <form className="auth-form" onSubmit={(e) => e.preventDefault()}>
            {!isCodeVerified ? (
              !isCodeSent ? (
                <>
                  <label className="auth-label" htmlFor="phoneInput">
                    Номер телефона
                    <input
                      type="tel"
                      id="phoneInput"
                      className="auth-input"
                      value={phone}
                      onChange={handlePhoneChange}
                      placeholder="+7 (900) 000-00-00"
                      aria-required="true"
                      aria-invalid={!isPhoneValid && phone.length > 0}
                      aria-describedby={
                        !isPhoneValid && phone.length > 0
                          ? "phoneError"
                          : undefined
                      }
                      ref={phoneInputRef}
                    />
                    {!isPhoneValid && phone.length > 0 && (
                      <span id="phoneError" className="auth-error-message">
                        Введите корректный номер телефона
                      </span>
                    )}
                  </label>
                  <p className="auth-info">
                    На Ваш номер телефона поступит звонок, введите последние 4
                    цифры номера.
                  </p>
                  <button
                    className="auth-button"
                    onClick={sendCode}
                    disabled={!isPhoneValid}
                    aria-disabled={!isPhoneValid}
                  >
                    {!isPhoneValid ? "Введите номер телефона" : "Отправить код"}
                  </button>
                </>
              ) : (
                <>
                  <label className="auth-label" htmlFor="codeInput">
                    Код подтверждения
                    <input
                      type="text"
                      id="codeInput"
                      className="auth-input"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      maxLength={4}
                      aria-required="true"
                      aria-invalid={code.length > 0 && code.length < 4}
                      aria-describedby={
                        code.length > 0 && code.length < 4
                          ? "codeError"
                          : undefined
                      }
                      ref={codeInputRef}
                    />
                    {code.length > 0 && code.length < 4 && (
                      <span id="codeError" className="auth-error-message">
                        Код должен содержать 4 цифры
                      </span>
                    )}
                  </label>
                  <button
                    className="auth-button"
                    onClick={verifyCode}
                    disabled={code.length !== 4}
                    aria-disabled={code.length !== 4}
                  >
                    {code.length !== 4
                      ? "Введите 4 цифры кода"
                      : "Подтвердить код"}
                  </button>
                  {resendTimeout === null && (
                    <button
                      className="auth-button secondary"
                      onClick={resendCode}
                    >
                      Отправить код снова
                    </button>
                  )}
                </>
              )
            ) : (
              <>
                <label className="auth-label" htmlFor="newPasswordInput">
                  Новый пароль
                  <div className="passwordInput">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      id="newPasswordInput"
                      className="auth-input"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      maxLength={16}
                      minLength={8}
                      aria-required="true"
                      aria-invalid={
                        newPassword.length > 0 && newPassword.length < 8
                      }
                      aria-describedby={
                        newPassword.length > 0 && newPassword.length < 8
                          ? "newPasswordError"
                          : undefined
                      }
                      ref={newPasswordInputRef}
                    />
                    <FontAwesomeIcon
                      icon={showNewPassword ? faEyeSlash : faEye}
                      className="passwordIcon"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      aria-label={
                        showNewPassword ? "Скрыть пароль" : "Показать пароль"
                      }
                      tabIndex="0"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          setShowNewPassword(!showNewPassword);
                        }
                      }}
                      role="button"
                      aria-pressed={showNewPassword}
                    />
                    {newPassword.length > 0 && newPassword.length < 8 && (
                      <span
                        id="newPasswordError"
                        className="auth-error-message"
                      >
                        Пароль должен содержать не менее 8 символов
                      </span>
                    )}
                  </div>
                </label>
                <label className="auth-label" htmlFor="confirmNewPasswordInput">
                  Подтвердите пароль
                  <div className="passwordInput">
                    <input
                      type={showConfirmNewPassword ? "text" : "password"}
                      id="confirmNewPasswordInput"
                      className="auth-input"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      maxLength={16}
                      minLength={8}
                      aria-required="true"
                      aria-invalid={
                        confirmPassword.length > 0 &&
                        confirmPassword !== newPassword
                      }
                      aria-describedby={
                        confirmPassword.length > 0 &&
                        confirmPassword !== newPassword
                          ? "confirmNewPasswordError"
                          : undefined
                      }
                      ref={confirmPasswordInputRef}
                    />
                    <FontAwesomeIcon
                      icon={showConfirmNewPassword ? faEyeSlash : faEye}
                      className="passwordIcon"
                      onClick={() =>
                        setShowConfirmNewPassword(!showConfirmNewPassword)
                      }
                      aria-label={
                        showConfirmNewPassword
                          ? "Скрыть пароль"
                          : "Показать пароль"
                      }
                      tabIndex="0"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          setShowConfirmNewPassword(!showConfirmNewPassword);
                        }
                      }}
                      role="button"
                      aria-pressed={showConfirmNewPassword}
                    />
                    {confirmPassword.length > 0 &&
                      confirmPassword !== newPassword && (
                        <span
                          id="confirmNewPasswordError"
                          className="auth-error-message"
                        >
                          Пароли не совпадают
                        </span>
                      )}
                  </div>
                </label>
                <button
                  className="auth-button"
                  onClick={resetPassword}
                  disabled={
                    !(
                      newPassword &&
                      confirmPassword &&
                      newPassword === confirmPassword &&
                      newPassword.length >= 8
                    )
                  }
                  aria-disabled={
                    !(
                      newPassword &&
                      confirmPassword &&
                      newPassword === confirmPassword &&
                      newPassword.length >= 8
                    )
                  }
                >
                  Сохранить пароль
                </button>
              </>
            )}
          </form>
          <div className="auth-links">
            <p>
              Уже есть учетная запись?{" "}
              <Link to="/login" className="auth-link">
                Вернуться ко входу
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

export default ForgotPassword;
