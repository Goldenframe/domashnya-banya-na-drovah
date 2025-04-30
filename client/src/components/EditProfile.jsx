import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { faArrowRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import { faUserXmark } from "@fortawesome/free-solid-svg-icons";
import useShowMessage from "./useShowMessage";
import Cookies from "js-cookie";
import "../styles/auth.css";
import "../styles/password.css";
import "../styles/account.css";

const EditProfile = ({ userId, token, updateUserData }) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isPhoneChanged, setIsPhoneChanged] = useState(false);
  const [initialData, setInitialData] = useState({});
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasChanged, setHasChanged] = useState(false);
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [inputError, setInputError] = useState({
    firstName: false,
    lastName: false,
    phone: false,
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });
  const [isProfileUpdated, setIsProfileUpdated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { message, showMessage, error, showError, isVisible } =
    useShowMessage();
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL;
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(
          `https://api.dom-ban-na-drovah.ru/api/userAccount/${userId}/profileData`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setInitialData(response.data);
        setFirstName(response.data.first_name);
        setLastName(response.data.last_name);
        setPhoneNumber(formatPhoneNumber(response.data.phone_number));
      } catch (error) {
        showError("Ошибка загрузки данных пользователя");
        console.error("Ошибка загрузки данных пользователя:", error);
      }
    };
    fetchUserData();
  }, [userId, token]);

  const normalizePhoneNumber = (phone) => {
    return phone.replace(/\D/g, "");
  };

  useEffect(() => {
    const cleanCurrentPhone = normalizePhoneNumber(phoneNumber);
    const cleanInitialPhone = normalizePhoneNumber(
      initialData.phone_number || ""
    );

    setHasChanged(
      firstName !== initialData.first_name ||
        lastName !== initialData.last_name ||
        cleanCurrentPhone !== cleanInitialPhone ||
        newPassword !== "" ||
        confirmPassword !== ""
    );

    setIsPhoneChanged(
      cleanCurrentPhone !== cleanInitialPhone && cleanCurrentPhone.trim() !== ""
    );
  }, [
    firstName,
    lastName,
    phoneNumber,
    newPassword,
    confirmPassword,
    initialData,
  ]);

  const handleDeleteAccount = async () => {
    try {
      const token = Cookies.get("token");
      if (!token) {
        showError("Не найден токен. Пожалуйста, войдите снова.");
        return;
      }

      const response = await axios.delete(`https://api.dom-ban-na-drovah.ru/api/userAccount/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showMessage(response.data.message);

      Cookies.remove("token");
      Cookies.remove("userId");
      Cookies.remove("firstName");
      Cookies.remove("lastName");

      navigate("/login");
    } catch (error) {
      showError("Ошибка при удалении аккаунта");
      console.error("Ошибка при удалении аккаунта:", error);
    }
  };

  const handleCancelModal = () => {
    setIsModalOpen(false);
  };
  const handleLogout = () => {
    Cookies.remove("token");
    Cookies.remove("userId");
    Cookies.remove("firstName");
    Cookies.remove("lastName");

    navigate("/");
  };

  const handleConfirmDelete = () => {
    handleDeleteAccount();
    setIsModalOpen(false);
  };

  const handleInputChange = (setter) => (e) => {
    if (e.target.id === "phoneNumber") {
      handlePhoneChange(e);
    } else {
      setter(e.target.value);
    }

    if (e.target.id === "currentPassword") {
      setHasChanged(false);
    } else {
      setHasChanged(true);
    }
  };

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
    const previousValue = phoneNumber;

    if (input.length < previousValue.length) {
      setPhoneNumber(input);
      return;
    }

    const formatted = formatPhoneNumber(input);
    setPhoneNumber(formatted);
  };

  const getCleanPhoneNumber = () => {
    const cleanPhone = normalizePhoneNumber(phoneNumber);
    return cleanPhone.length === 10 ? "7" + cleanPhone : cleanPhone;
  };

  const handlePhoneChangeRequest = async () => {
    try {
      setIsCodeSent(false);
      const cleanPhone = getCleanPhoneNumber();
      const response = await axios.post(
        `https://api.dom-ban-na-drovah.ru/api/request-phone-change`,
        { userId, new_phone_number: cleanPhone },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.status === 200) {
        setIsCodeSent(true);
        showMessage("Код для изменения номера отправлен");
      } else {
        showError(response.data.error || "Ошибка при отправке кода");
      }
    } catch (error) {
      showError("Ошибка при отправке кода верификации");
      console.error("Ошибка при отправке кода верификации:", error);
    }
  };
  const handlePhoneChangeVerify = async () => {
    try {
      const cleanPhone = getCleanPhoneNumber();
      const response = await axios.post(
        `https://api.dom-ban-na-drovah.ru/api/verify-phone-change`,
        {
          userId,
          new_phone_number: cleanPhone,
          verification_code: verificationCode,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      showMessage(response.data.message);
      updateUserData({ phone_number: cleanPhone });
      setIsCodeSent(false);
    } catch (error) {
      showError("Ошибка при подтверждении номера");
      console.error("Ошибка при подтверждении номера:", error);
    }
  };
  const validateForm = () => {
    let hasError = false;
    if (newPassword && !currentPassword) {
      showError("Пожалуйста, введите текущий пароль.");
      setInputError((prev) => ({ ...prev, currentPassword: true }));
      hasError = true;
    }

    if (newPassword && newPassword !== confirmPassword) {
      showError("Пароли не совпадают.");
      setInputError((prev) => ({ ...prev, confirmPassword: true }));
      hasError = true;
    }

    if (isPhoneChanged && !isPhoneValid()) {
      showError("Номер телефона некорректен.");
      setInputError((prev) => ({ ...prev, phone: true }));
      hasError = true;
    }

    return !hasError;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setInputError({
      firstName: false,
      lastName: false,
      phone: false,
      currentPassword: false,
      newPassword: false,
      confirmPassword: false,
    });

    const nameRegex = /^[А-Яа-яЁё]+$/;

    if (!nameRegex.test(firstName)) {
      setInputError((prevState) => ({ ...prevState, firstName: true }));
      showError("Имя должно содержать только русские буквы.");
      setTimeout(
        () =>
          setInputError((prevState) => ({ ...prevState, firstName: false })),
        7000
      );
      return;
    }

    if (!nameRegex.test(lastName)) {
      setInputError((prevState) => ({ ...prevState, lastName: true }));
      showError("Фамилия должна содержать только русские буквы.");
      setTimeout(
        () => setInputError((prevState) => ({ ...prevState, lastName: false })),
        7000
      );
      return;
    }

    if (isPhoneChanged && !isPhoneValid()) {
      setInputError((prevState) => ({ ...prevState, phone: true }));
      showError("Введите корректный номер телефона.");
      setTimeout(
        () => setInputError((prevState) => ({ ...prevState, phone: false })),
        7000
      );
      return;
    }

    if (isPhoneChanged && isPhoneValid()) {
      if (isCodeSent) {
        await handlePhoneChangeVerify();
      } else {
        await handlePhoneChangeRequest();
      }
      return;
    }

    if (!validateForm()) return;

    try {
      const cleanPhone = getCleanPhoneNumber();
      const response = await axios.post(
        `https://api.dom-ban-na-drovah.ru/api/userAccount/${userId}/editProfile`,
        {
          userId,
          first_name: firstName,
          last_name: lastName,
          phone_number: cleanPhone,
          current_password: currentPassword,
          new_password: newPassword,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 200) {
        showMessage(response.data.message);
        updateUserData({
          first_name: firstName,
          last_name: lastName,
          phone_number: cleanPhone,
        });
        setIsProfileUpdated(true);
        setHasChanged(false);
      } else {
        showError(response.data.error || "Ошибка регистрации.");
      }
    } catch (error) {
      if (error.response?.status === 400) {
        const errorMsg =
          error.response?.data?.error ||
          "Некорректные данные. Проверьте форму.";
        showError(errorMsg);

        const errorData = error.response?.data?.error;

        setInputError((prevState) => ({
          ...prevState,
          phone:
            errorData.includes("телефон") || errorData.includes("корректно"),
          currentPassword:
            errorData.includes("пароль") && errorData.includes("текущий"),
          newPassword:
            errorData.includes("пароль") && errorData.includes("новый"),
        }));

        setTimeout(
          () =>
            setInputError({
              firstName: false,
              lastName: false,
              phone: false,
              currentPassword: false,
              newPassword: false,
              confirmPassword: false,
            }),
          8000
        );
      } else if (error.response?.status === 500) {
        showError("Произошла ошибка на сервере. Попробуйте позже.");
      } else {
        showError(
          error.response?.data?.message || "Ошибка при обновлении данных."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelChanges = async () => {
    try {
      const response = await axios.get(
        `https://api.dom-ban-na-drovah.ru/api/userAccount/${userId}/profileData`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setInitialData(response.data);
      setFirstName(response.data.first_name);
      setLastName(response.data.last_name);
      setPhoneNumber(formatPhoneNumber(response.data.phone_number));
      setNewPassword("");
      setConfirmPassword("");
      setHasChanged(false);
      setIsPhoneChanged(false);
      setIsProfileUpdated(false);
    } catch (error) {
      showError("Ошибка загрузки данных пользователя.");
      console.error(error);
    }
  };

  const isPhoneValid = () => {
    const cleanPhone = getCleanPhoneNumber();
    return cleanPhone.length === 11 && /^[0-9]+$/.test(cleanPhone);
  };
  const isPasswordsMatch = newPassword === confirmPassword;
  const isButtonDisabled =
    !hasChanged ||
    (isPhoneChanged && !isPhoneValid()) ||
    (newPassword && !isPasswordsMatch) ||
    inputError.phone;

  const getButtonText = () => {
    if (isPhoneChanged && isPhoneValid()) {
      return isCodeSent ? "Подтвердить" : "Отправить код";
    }
    return hasChanged ? "Сохранить" : "Сохранить";
  };

  return (
    <>
      <main
        className="auth-block edit"
        role="main"
        aria-labelledby="profile-heading"
      >
        <div className="auth-content">
          <h1 className="auth-title" id="profile-heading">
            ЛИЧНЫЙ ПРОФИЛЬ
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
          {isPhoneChanged && isPhoneValid() && (
            <p className="auth-info" aria-live="polite">
              Вам поступит звонок. Для смены телефона введите последние 4 цифры
              звонившего номера.
            </p>
          )}
          {newPassword && !currentPassword && (
            <p className="auth-info" aria-live="polite">
              Перед тем как установить новый пароль, пожалуйста, введите текущий
              пароль.
            </p>
          )}
          <form
            className="auth-form"
            onSubmit={handleSubmit}
            autoComplete="off"
          >
            <div className="auth-row">
              <div className="auth-column">
                <label
                  className={`auth-label ${
                    inputError.firstName ? "error-label" : ""
                  }`}
                  htmlFor="firstName"
                >
                  Имя
                  <input
                    type="text"
                    id="firstName"
                    className={`auth-input ${
                      inputError.firstName ? "error-input" : ""
                    }`}
                    placeholder="Введите имя"
                    onChange={handleInputChange(setFirstName)}
                    value={firstName}
                    maxLength={20}
                    aria-required="true"
                    aria-invalid={!!inputError.firstName}
                    aria-describedby={
                      inputError.firstName ? "firstName-error" : undefined
                    }
                  />
                  {inputError.firstName && (
                    <span id="firstName-error" className="visually-hidden">
                      {inputError.firstName}
                    </span>
                  )}
                </label>
                <label
                  className={`auth-label ${
                    inputError.lastName ? "error-label" : ""
                  }`}
                  htmlFor="lastName"
                >
                  Фамилия
                  <input
                    type="text"
                    id="lastName"
                    className={`auth-input ${
                      inputError.lastName ? "error-input" : ""
                    }`}
                    placeholder="Введите фамилию"
                    onChange={handleInputChange(setLastName)}
                    value={lastName}
                    maxLength={20}
                    aria-required="true"
                    aria-invalid={!!inputError.lastName}
                    aria-describedby={
                      inputError.lastName ? "lastName-error" : undefined
                    }
                  />
                  {inputError.lastName && (
                    <span id="lastName-error" className="visually-hidden">
                      {inputError.lastName}
                    </span>
                  )}
                </label>
              </div>
              <div className="auth-column">
                <label
                  className={`auth-label ${
                    inputError.phone ? "error-label" : ""
                  }`}
                  htmlFor="phoneNumber"
                >
                  Номер телефона
                  <input
                    type="tel"
                    id="phoneNumber"
                    className={`auth-input ${
                      inputError.phone ? "error-input" : ""
                    }`}
                    placeholder="+7 (XXX) XXX-XX-XX"
                    onChange={handleInputChange(setPhoneNumber)}
                    value={phoneNumber}
                    maxLength={18}
                    aria-required="true"
                    aria-invalid={!!inputError.phone}
                    aria-describedby={
                      inputError.phone ? "phone-error" : undefined
                    }
                    autoComplete="off"
                  />
                  {inputError.phone && (
                    <span id="phone-error" className="visually-hidden">
                      {inputError.phone}
                    </span>
                  )}
                </label>
                {isCodeSent && (
                  <label className="auth-label" htmlFor="verificationCode">
                    Код верификации
                    <input
                      type="text"
                      id="verificationCode"
                      className="auth-input"
                      onChange={handleInputChange(setVerificationCode)}
                      value={verificationCode}
                      maxLength={4}
                      aria-required="true"
                      aria-label="Введите 4-значный код верификации"
                    />
                  </label>
                )}
              </div>

              <div className="auth-column">
                <label
                  className={`auth-label ${
                    inputError.currentPassword ? "error-label" : ""
                  }`}
                  htmlFor="currentPassword"
                >
                  Текущий пароль
                  <div className="passwordInput">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      id="currentPassword"
                      className={`auth-input ${
                        inputError.currentPassword ? "error-input" : ""
                      }`}
                      value={currentPassword}
                      onChange={handleInputChange(setCurrentPassword)}
                      autoComplete="current-password"
                      maxLength={16}
                      aria-required={!!newPassword}
                      aria-invalid={!!inputError.currentPassword}
                      aria-describedby={
                        inputError.currentPassword
                          ? "currentPassword-error"
                          : undefined
                      }
                    />
                    <button
                      type="button"
                      className="passwordToggle"
                      onClick={() =>
                        setShowCurrentPassword(!showCurrentPassword)
                      }
                      aria-label={
                        showCurrentPassword
                          ? "Скрыть пароль"
                          : "Показать пароль"
                      }
                      aria-controls="currentPassword"
                    >
                      <FontAwesomeIcon
                        icon={showCurrentPassword ? faEyeSlash : faEye}
                        className="passwordIcon"
                      />
                    </button>
                  </div>
                  {inputError.currentPassword && (
                    <span
                      id="currentPassword-error"
                      className="visually-hidden"
                    >
                      {inputError.currentPassword}
                    </span>
                  )}
                </label>
                <label
                  className={`auth-label ${
                    inputError.newPassword ? "error-label" : ""
                  }`}
                  htmlFor="newPassword"
                >
                  Новый пароль
                  <div className="passwordInput">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      id="newPassword"
                      className={`auth-input ${
                        inputError.newPassword ? "error-input" : ""
                      }`}
                      value={newPassword}
                      onChange={handleInputChange(setNewPassword)}
                      autoComplete="new-password"
                      maxLength={16}
                      aria-required="true"
                      aria-invalid={!!inputError.newPassword}
                      aria-describedby={
                        inputError.newPassword ? "newPassword-error" : undefined
                      }
                    />
                    <button
                      type="button"
                      className="passwordToggle"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      aria-label={
                        showNewPassword ? "Скрыть пароль" : "Показать пароль"
                      }
                      aria-controls="newPassword"
                    >
                      <FontAwesomeIcon
                        icon={showNewPassword ? faEyeSlash : faEye}
                        className="passwordIcon"
                      />
                    </button>
                  </div>
                  {inputError.newPassword && (
                    <span id="newPassword-error" className="visually-hidden">
                      {inputError.newPassword}
                    </span>
                  )}
                </label>

                {newPassword && (
                  <label
                    className={`auth-label ${
                      inputError.confirmPassword ? "error-label" : ""
                    }`}
                    htmlFor="confirmPassword"
                  >
                    Подтверждение пароля
                    <div className="passwordInput">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        id="confirmPassword"
                        className={`auth-input ${
                          inputError.confirmPassword ? "error-input" : ""
                        }`}
                        value={confirmPassword}
                        onChange={handleInputChange(setConfirmPassword)}
                        autoComplete="new-password"
                        maxLength={16}
                        aria-required="true"
                        aria-invalid={!!inputError.confirmPassword}
                        aria-describedby={
                          inputError.confirmPassword
                            ? "confirmPassword-error"
                            : undefined
                        }
                      />
                      <button
                        type="button"
                        className="passwordToggle"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        aria-label={
                          showConfirmPassword
                            ? "Скрыть пароль"
                            : "Показать пароль"
                        }
                        aria-controls="confirmPassword"
                      >
                        <FontAwesomeIcon
                          icon={showConfirmPassword ? faEyeSlash : faEye}
                          className="passwordIcon"
                        />
                      </button>
                    </div>
                    {inputError.confirmPassword && (
                      <span
                        id="confirmPassword-error"
                        className="visually-hidden"
                      >
                        {inputError.confirmPassword}
                      </span>
                    )}
                  </label>
                )}
              </div>
            </div>
            <div className="buttonGroup">
              <button
                className="auth-button"
                type="submit"
                disabled={isButtonDisabled}
                aria-busy={isSubmitting}
              >
                {getButtonText()}
              </button>
              {hasChanged && (
                <button
                  type="button"
                  className="auth-cancel"
                  onClick={handleCancelChanges}
                  aria-label="Отменить изменения"
                >
                  Отменить изменения
                </button>
              )}
            </div>
          </form>
        </div>
      </main>
      {isModalOpen && (
        <div
          className="modal-delete"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-heading"
        >
          <h3 id="modal-heading">
            Вы уверены, что хотите удалить свой аккаунт?
          </h3>
          <div className="modal-buttons">
            <button className="auth-button" onClick={handleConfirmDelete}>
              Удалить
            </button>
            <button
              className="auth-button"
              onClick={handleCancelModal}
              autoFocus
            >
              Отмена
            </button>
          </div>
        </div>
      )}
      <div className="account-action-buttons">
        <button className="logout-button" onClick={handleLogout}>
          <span>
            <FontAwesomeIcon
              icon={faArrowRightFromBracket}
              className="icon"
              aria-hidden="true"
            />
            <span>Выйти из аккаунта</span>
          </span>
        </button>
        <button
          className="delete-button"
          onClick={() => setIsModalOpen(true)}
          aria-haspopup="dialog"
        >
          <span>
            <FontAwesomeIcon
              icon={faUserXmark}
              className="icon"
              aria-hidden="true"
            />
            <span>Удалить аккаунт</span>
          </span>
        </button>
      </div>
    </>
  );
};

export default EditProfile;
