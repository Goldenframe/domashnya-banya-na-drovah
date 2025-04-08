import { useState } from "react";
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
  const [isCodeVerified, setIsCodeVerified] = useState(false); // Стейт для проверки правильности кода
  const [resendTimeout, setResendTimeout] = useState(null); // Таймер для повторной отправки кода
  const [showNewPassword, setShowNewPassword] = useState(false); // Для отображения пароля
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false); // Для подтверждения пароля
  const navigate = useNavigate();
  const { message, showMessage, error, showError, isVisible } =
    useShowMessage();
    const apiUrl = import.meta.env.VITE_API_URL; 
  const sendCode = async () => {
    try {
      const response = await axios.post(`/api/forgot-password`, {
        phone_number: phone,
      });
      showMessage(response.data.message);
      setIsCodeSent(true);
      setResendTimeout(setTimeout(() => setResendTimeout(null), 60000));
    } catch (error) {
      showError(error.response?.data?.error || "Ошибка отправки кода.");
    }
  };

  const resendCode = () => {
    sendCode();
  };

  const verifyCode = async () => {
    try {
      const response = await axios.post(`/api/verify-code`, {
        phone_number: phone,
        verification_code: code,
      });
      if (response.status === 200) {
        setIsCodeVerified(true);
        showMessage("Код подтверждения верен!");
      }
    } catch (error) {
      showError(error.response?.data?.error || "Ошибка проверки кода.");
    }
  };

  const resetPassword = async () => {
    if (newPassword !== confirmPassword) {
      showError("Пароли не совпадают!");
      return;
    }

    try {
      const response = await axios.post(`/api/reset-password`, {
        phone_number: phone,
        verification_code: code,
        new_password: newPassword,
      });

      showMessage(response.data.message);
      if (response.status === 200) {
        navigate("/login");
      }
    } catch (error) {
      showMessage(
        error.response?.data?.error || "Ошибка восстановления пароля."
      );
    }
  };

  const isPhoneValid = phone.length >= 11 && /^\d+$/.test(phone);

  return (
    <div
      className="auth-container"
      role="region"
      aria-labelledby="forgotPasswordTitle"
    >
      <div
        className="auth-block forget"
        role="group"
        aria-labelledby="forgotPasswordBlockLabel"
      >
        <div className="auth-content">
          <h2 id="forgotPasswordTitle" className="auth-title">
            ВОССТАНОВЛЕНИЕ ПАРОЛЯ
          </h2>
          {(message || error) && (
            <p
              className={`auth-message ${error ? "error" : "success"} ${
                isVisible ? "fade-in" : "fade-out"
              }`}
            >
              {message || error}
            </p>
          )}
          <div className="auth-form">
            {!isCodeVerified ? (
              !isCodeSent ? (
                <>
                  <label className="auth-label" htmlFor="phoneInput">
                    Номер телефона
                    <input
                      type="text"
                      id="phoneInput"
                      className="auth-input"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="89000000000"
                      aria-required="true"
                      aria-describedby="phoneError"
                    />
                    <span id="phoneError" className="screen-reader-only"></span>
                  </label>
                  <p className="auth-info">
                    На Ваш номер телефона поступит звонок, введите последние 4
                    цифры номера.
                  </p>
                  <button
                    className="auth-button"
                    onClick={sendCode}
                    disabled={!isPhoneValid}
                    aria-busy={!isPhoneValid}
                    aria-live="polite"
                  >
                    Отправить код
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
                      aria-describedby="codeError"
                    />
                    <span id="codeError" className="screen-reader-only"></span>
                  </label>
                  <button
                    className="auth-button"
                    onClick={verifyCode}
                    disabled={!code}
                    aria-busy={!code}
                    aria-live="polite"
                  >
                    Подтвердить код
                  </button>
                  {resendTimeout === null && (
                    <button
                      className="auth-button"
                      onClick={resendCode}
                      aria-busy={resendTimeout === null}
                      aria-live="polite"
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
                      aria-required="true"
                      aria-describedby="newPasswordError"
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
                    <span
                      id="newPasswordError"
                      className="screen-reader-only"
                    ></span>
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
                      aria-required="true"
                      aria-describedby="confirmNewPasswordError"
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
                    <span
                      id="confirmNewPasswordError"
                      className="screen-reader-only"
                    ></span>
                  </div>
                </label>
                <button
                  className="auth-button"
                  onClick={resetPassword}
                  disabled={!(newPassword && confirmPassword)}
                  aria-busy={!(newPassword && confirmPassword)}
                  aria-live="polite"
                >
                  Сохранить пароль
                </button>
              </>
            )}
          </div>
          <div className="auth-links">
            <p>
              Уже есть учетная запись?
              <Link to="/login" className="auth-link">
                {" "}
                Вернуться ко входу
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
