import React, { useState, useEffect } from "react";
import axios from "axios";
import CalendarAdmin from "../CalendarAdmin.jsx";
import useShowMessage from "../useShowMessage.jsx";
import { useOutletContext } from "react-router-dom";
import "../../styles/buttons.css";
import "../../styles/account.css";
import "../../styles/auth.css";
import "../../styles/form.css";
import Select from "react-select";

export default function AddInterval() {
  const {
    userId,
    token,
    intervals,
    setIntervals,
    selectedDates,
    setSelectedDates,
  } = useOutletContext();

  const [bookingDateStart, setBookingDateStart] = useState("");
  const [bookingDateEnd, setBookingDateEnd] = useState("");
  const [availableIntervals, setAvailableIntervals] = useState([]);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [dateSelectionMethod, setDateSelectionMethod] = useState("individual");
  const { message, showMessage, error, showError, isVisible } =
    useShowMessage();
  const apiUrl = import.meta.env.VITE_API_URL;

  const startTimeOptions = availableIntervals.map((interval) => ({
    value: interval.start_time.slice(0, 5),
    label: interval.start_time.slice(0, 5),
  }));

  const endTimeOptions = availableIntervals.map((interval) => ({
    value: interval.end_time.slice(0, 5),
    label: interval.end_time.slice(0, 5),
  }));

  const fetchAvailableIntervals = async () => {
    try {
      const response = await axios.get(
        `https://api.dom-ban-na-drovah.ru/api/adminAccount/${userId}/availableIntervals/${bookingDateStart}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.intervals && response.data.intervals.length > 0) {
        setAvailableIntervals(response.data.intervals);
      } else {
        setAvailableIntervals([]);
      }

      setStartTime("");
      setEndTime("");
    } catch (err) {
      showError("Ошибка при получении доступных интервалов.");
    }
  };

  useEffect(() => {
    if (bookingDateStart) {
      fetchAvailableIntervals();
    }
  }, [bookingDateStart, userId]);

  const addInterval = async () => {
    try {
      if (
        (!bookingDateStart && dateSelectionMethod === "range") ||
        (!selectedDates.length && dateSelectionMethod === "individual") ||
        !startTime ||
        !endTime
      ) {
        showError(
          "Пожалуйста, выберите хотя бы одну дату и заполните все поля интервала."
        );
        throw new Error(
          "Пожалуйста, выберите хотя бы одну дату и заполните все поля интервала."
        );
      }

      const intervalsToAdd = [];
      if (dateSelectionMethod === "range") {
        const startDate = new Date(bookingDateStart);
        const endDate = new Date(bookingDateEnd);
        for (let d = startDate; d <= endDate; d.setDate(d.getDate() + 1)) {
          const currentDate = new Date(d);
          const startDateTime = new Date(
            `${currentDate.toISOString().split("T")[0]}T${startTime}`
          );
          const endDateTime = new Date(
            `${currentDate.toISOString().split("T")[0]}T${endTime}`
          );
          if (endDateTime <= startDateTime) {
            showError("Время окончания должно быть после времени начала.");
            throw new Error(
              "Время окончания должно быть после времени начала."
            );
          }
          intervalsToAdd.push({
            booking_date: currentDate.toISOString().split("T")[0],
            start_time: startTime,
            end_time: endTime,
          });
        }
      } else {
        selectedDates.forEach((formattedCurrentDate) => {
          const currentDate = new Date(formattedCurrentDate);
          const startDateTime = new Date(
            `${currentDate.toISOString().split("T")[0]}T${startTime}`
          );
          const endDateTime = new Date(
            `${currentDate.toISOString().split("T")[0]}T${endTime}`
          );
          if (endDateTime <= startDateTime) {
            showError("Время окончания должно быть после времени начала.");
            throw new Error(
              "Время окончания должно быть после времени начала."
            );
          }
          intervalsToAdd.push({
            booking_date: currentDate.toISOString().split("T")[0],
            start_time: startTime,
            end_time: endTime,
          });
        });
      }

      const responses = await Promise.all(
        intervalsToAdd.map((interval) =>
          axios.post(`https://api.dom-ban-na-drovah.ru/api/adminAccount/${userId}/intervals`, interval, {
            headers: { Authorization: `Bearer ${token}` },
          })
        )
      );

      const newIntervals = responses
        .map((response) => {
          if (response.data.interval) {
            return {
              id: response.data.id,
              booking_date: response.data.interval.booking_date,
              start_time: response.data.interval.start_time,
              end_time: response.data.interval.end_time,
            };
          } else {
            return null;
          }
        })
        .filter((interval) => interval !== null);

      setIntervals((prevIntervals) => [...prevIntervals, ...newIntervals]);
      setStartTime("");
      setEndTime("");
      setBookingDateStart("");
      setBookingDateEnd("");
      const message =
        intervalsToAdd.length === 1
          ? "Интервал успешно добавлен!"
          : "Интервалы успешно добавлены!";
      showMessage(message);
      setSelectedDates([]);
    } catch (err) {
      let errorMessage = err.message;
      if (err.response) {
        errorMessage =
          err.response.data.error ||
          err.response.data.message ||
          "Произошла непредвиденная ошибка.";
      }
      showError(`Ошибка при добавлении интервала: ${errorMessage}`);
    }
  };

  const isButtonDisabled = 
    (dateSelectionMethod === "range" && (!bookingDateStart || !bookingDateEnd)) ||
    (dateSelectionMethod === "individual" && selectedDates.length === 0) ||
    !startTime || 
    !endTime;

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !isButtonDisabled) {
      addInterval();
    }
  };

  return (
    <div className="account-form interval" onKeyDown={handleKeyDown}>
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
      <div className="form-wrapper">
        <div className="calendar-container">
          <fieldset className="date-selection-method">
            <legend className="form-label">
              <span className="text-secondary">Выбрать метод выбора дат:</span>
            </legend>
            <div className="method-buttons">
              <button
                type="button"
                className={`mode-btn ${
                  dateSelectionMethod === "individual" ? "selected" : ""
                }`}
                onClick={() => setDateSelectionMethod("individual")}
                aria-pressed={dateSelectionMethod === "individual"}
              >
                отдельные даты
              </button>
              <span className="text-secondary"> / </span>
              <button
                type="button"
                className={`mode-btn ${
                  dateSelectionMethod === "range" ? "selected" : ""
                }`}
                onClick={() => setDateSelectionMethod("range")}
                aria-pressed={dateSelectionMethod === "range"}
              >
                диапазон дат
              </button>
            </div>
          </fieldset>
          <CalendarAdmin
            setBookingDateStart={setBookingDateStart}
            setBookingDateEnd={setBookingDateEnd}
            setSelectedDates={setSelectedDates}
            selectedDates={selectedDates}
            bookings={[]}
            intervals={intervals}
            bookingDateStart={bookingDateStart}
            bookingDateEnd={bookingDateEnd}
            dateSelectionMethod={dateSelectionMethod}
          />
        </div>

        <div className="time-controls">
          <div className="time-select">
            <label htmlFor="startTime" className="form-label">
              Время начала:
            </label>
            <Select
              id="startTime"
              value={startTime ? { value: startTime, label: startTime } : null}
              onChange={(selectedOption) => setStartTime(selectedOption.value)}
              options={startTimeOptions}
              classNamePrefix="time-select"
              placeholder="Выбрать время"
              isDisabled={startTimeOptions.length === 0}
              aria-label="Выберите время начала"
              inputId="startTime-input"
              noOptionsMessage={() => "Нет доступных вариантов"}
              onKeyDown={handleKeyDown}
            />
          </div>
          <div className="time-select">
            <label htmlFor="endTime" className="form-label">
              Время окончания:
            </label>
            <Select
              id="endTime"
              value={endTime ? { value: endTime, label: endTime } : null}
              onChange={(selectedOption) => setEndTime(selectedOption.value)}
              options={endTimeOptions}
              classNamePrefix="time-select"
              placeholder="Выбрать время"
              isDisabled={endTimeOptions.length === 0}
              aria-label="Выберите время окончания"
              inputId="endTime-input"
              noOptionsMessage={() => "Нет доступных вариантов"}
              onKeyDown={handleKeyDown}
            />
          </div>
          <button
            onClick={addInterval}
            className="form-button"
            disabled={isButtonDisabled}
            aria-disabled={isButtonDisabled}
          >
            Добавить интервал
          </button>
        </div>
      </div>
    </div>
  );
}