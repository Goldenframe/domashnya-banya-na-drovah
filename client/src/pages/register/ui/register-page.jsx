import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cleanPhoneNumber, verificationCodeSchema } from "@/shared/lib/phone.js";
import { registrationSchema, registrationVerificationSchema } from "../model/registration-schema.js";
import { useState } from "react";
import { api } from "@/shared/api";
import { useNavigate, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faEyeSlash,
  faArrowLeft,
} from "@fortawesome/free-solid-svg-icons";
import useShowMessage from "@/shared/lib/use-show-message.js";
import Cookies from "js-cookie";
import "@/shared/ui/styles/auth.css";
import "@/shared/ui/styles/auth-background.css";

const usePasswordToggle = (initialState = false) => {
  const [visible, setVisible] = useState(initialState);

  const toggle = () => setVisible(!visible);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
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
  const [uiState, setUiState] = useState({
    isCodeSent: false,
    canResendCode: true,
    isSubmitting: false,
  });

  const form = useForm({
    resolver: zodResolver(uiState.isCodeSent ? registrationVerificationSchema : registrationSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      password: "",
      confirmPassword: "",
      phoneNumber: "",
      verificationCode: "",
    },
  });
  const formData = form.watch();

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
      if (limited.length > 1) formatted += `${limited.slice(1, 4)}`;
      if (limited.length > 4) formatted += `) ${limited.slice(4, 7)}`;
      if (limited.length > 7) formatted += `-${limited.slice(7, 9)}`;
      if (limited.length > 9) formatted += `-${limited.slice(9)}`;
    }

    return formatted;
  };

  const handlePhoneChange = (e) => {
    const input = e.target.value;
    const previousValue = formData.phoneNumber;

    if (input.length < previousValue.length) {
      form.setValue("phoneNumber", input);
      return;
    }

    const formatted = formatPhoneNumber(input);
    form.setValue("phoneNumber", formatted);
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    if (id === "phoneNumber") {
      handlePhoneChange(e);
    } else {
      form.setValue(id, value);
    }
  };

  const sendVerificationCode = async ({ phoneNumber }) => {
    setUiState((prev) => ({ ...prev, isSubmitting: true }));

    try {
      const cleanPhone = cleanPhoneNumber(phoneNumber);
      const response = await api.post(
        `/api/register`,
        {
          phone_number: cleanPhone,
        },
        {
          withCredentials: true,
        }
      );

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

  const register = async (values) => {
    setUiState((prev) => ({ ...prev, isSubmitting: true }));

    try {
      const cleanPhone = cleanPhoneNumber(values.phoneNumber);
      const response = await api.post(
        "/api/verify-registration",
        {
          first_name: values.firstName,
          last_name: values.lastName,
          password: values.password,
          phone_number: cleanPhone,
          verification_code: values.verificationCode,
        },
        {
          withCredentials: true,
        }
      );

      if (response.status === 201) {
        const { token, userId, first_name, last_name } = response.data;
        Cookies.set("token", token, { expires: 7, secure: true });
        Cookies.set("userId", userId, { expires: 7, secure: true });
        Cookies.set("firstName", first_name, { expires: 7, secure: true });
        Cookies.set("lastName", last_name, { expires: 7, secure: true });
        navigate(`/userAccount/${userId}`);
      } else {
        showError("Неизвестная ошибка сервера");
      }
    } catch (error) {
      if (error.code === "ECONNABORTED") {
        showError("Сервер не отвечает. Попробуйте позже.");
      } else {
        showError(
          error.response?.data?.error || "Ошибка регистрации. Проверьте данные."
        );
      }
    } finally {
      setUiState((prev) => ({ ...prev, isSubmitting: false }));
    }
  };

  const isFormValid = registrationSchema.safeParse(formData).success;
  const isVerificationFormValid = verificationCodeSchema.safeParse(formData.verificationCode).success;
  const showValidationError = (errors) => showError(Object.values(errors)[0].message);
  const requestCode = form.handleSubmit(sendVerificationCode, showValidationError);
  const submitRegistration = form.handleSubmit(register, showValidationError);
  const resendCode = () => {
    const result = registrationSchema.safeParse(form.getValues());
    if (result.success) return sendVerificationCode(result.data);
    showError(result.error.issues[0].message);
  };

  const renderPasswordIcon = (toggleProps) => (
    <FontAwesomeIcon
      icon={toggleProps.icon}
      className="passwordIcon"
      onClick={toggleProps.toggle}
      onKeyDown={toggleProps.handleKeyDown}
      tabIndex="0"
      role="button"
      aria-label={toggleProps.visible ? "Скрыть пароль" : "Показать пароль"}
      aria-pressed={toggleProps.visible}
    />
  );

  return (
    <div className="auth-page auth-background">
      <header className="auth-header">
        <button
          className="back-button"
          onClick={() => navigate("/")}
          aria-label="Вернуться на главную"
        >
          <FontAwesomeIcon icon={faArrowLeft} />
          <span>На главную</span>
        </button>
      </header>
      <main
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
            <h1 id="registerTitle" className="auth-title">
              РЕГИСТРАЦИЯ
            </h1>

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

            <form noValidate onSubmit={uiState.isCodeSent ? submitRegistration : requestCode}>
              <div className="auth-form">
                <div className="auth-row">
                  <div className="auth-column">
                    <label className="auth-label" htmlFor="firstName">
                      Имя
                      <input
                        type="text"
                        {...form.register("firstName")}
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
                        {...form.register("lastName")}
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
                          {...form.register("password")}
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
                          {...form.register("confirmPassword")}
                          id="confirmPassword"
                          className="auth-input"
                          placeholder="Повторите пароль"
                          maxLength={16}
                          onChange={(e) =>
                            handleInputChange(e, "Проверка пароля")
                          }
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
                        {...form.register("phoneNumber")}
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
                          {...form.register("verificationCode")}
                          id="verificationCode"
                          className="auth-input"
                          placeholder="Введите код"
                          maxLength={4}
                          onChange={(e) =>
                            handleInputChange(e, "Код верификации")
                          }

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
                  type="submit"
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
                    На Ваш номер телефона поступит звонок, введите последние 4
                    цифры номера.
                  </p>
                  <button
                    className="auth-button"
                    type="submit"
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
                    type="submit"
                    disabled={!isVerificationFormValid || uiState.isSubmitting}
                    aria-busy={uiState.isSubmitting}
                    aria-live="polite"
                  >
                    {uiState.isSubmitting
                      ? "Регистрация..."
                      : "Зарегистрироваться"}
                  </button>

                  {uiState.canResendCode && (
                    <button
                      className="auth-button"
                      type="button"
                      onClick={resendCode}
                      disabled={uiState.isSubmitting}
                      aria-busy={uiState.isSubmitting}
                      aria-live="polite"
                    >
                      Отправить код еще раз
                    </button>
                  )}
                </>
              )}

            </form>

            <div className="auth-links">
              <p>
                Уже есть учетная запись?
                <Link to="/login" className="auth-link">
                  Войдите
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Register;
