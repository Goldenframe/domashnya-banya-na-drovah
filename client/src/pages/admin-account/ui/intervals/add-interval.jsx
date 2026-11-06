import { intervalSchema } from "../../model/interval-schema.js";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFormField } from "@/shared/lib/use-form-field.js";
import React, { useState, useEffect } from "react";
import { api } from "@/shared/api";
import CalendarAdmin from "./calendar-admin.jsx";
import useShowMessage from "@/shared/lib/use-show-message.js";
import { useOutletContext } from "react-router-dom";
import "@/shared/ui/styles/buttons.css";
import "@/shared/ui/styles/account.css";
import "@/shared/ui/styles/auth.css";
import "@/shared/ui/styles/form.css";
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

  const [availableIntervals, setAvailableIntervals] = useState([]);
  const form = useForm({
    resolver: zodResolver(intervalSchema),
    defaultValues: {
      bookingDateStart: "",
      bookingDateEnd: "",
      startTime: "",
      endTime: "",
      dateSelectionMethod: "individual",
      selectedDates: [],
    },
  });
  const [bookingDateStart, setBookingDateStart] = useFormField(form, "bookingDateStart");
  const [bookingDateEnd, setBookingDateEnd] = useFormField(form, "bookingDateEnd");
  const [startTime, setStartTime] = useFormField(form, "startTime");
  const [endTime, setEndTime] = useFormField(form, "endTime");
  const [dateSelectionMethod, setDateSelectionMethod] = useFormField(form, "dateSelectionMethod");
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
      const response = await api.get(
        `/api/adminAccount/${userId}/availableIntervals/${bookingDateStart}`,
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

  useEffect(() => {
    form.setValue("selectedDates", selectedDates);
  }, [form.setValue, selectedDates]);

  const addInterval = async ({ dateSelectionMethod, bookingDateStart, bookingDateEnd, startTime, endTime, selectedDates }) => {
    try {
      const intervalsToAdd = [];
      if (dateSelectionMethod === "range") {
        const startDate = new Date(bookingDateStart);
        const endDate = new Date(bookingDateEnd);
        for (let d = startDate; d <= endDate; d.setDate(d.getDate() + 1)) {
          const currentDate = new Date(d);
          intervalsToAdd.push({
            booking_date: currentDate.toISOString().split("T")[0],
            start_time: startTime,
            end_time: endTime,
          });
        }
      } else {
        selectedDates.forEach((formattedCurrentDate) => {
          const currentDate = new Date(formattedCurrentDate);
          intervalsToAdd.push({
            booking_date: currentDate.toISOString().split("T")[0],
            start_time: startTime,
            end_time: endTime,
          });
        });
      }

      const responses = await Promise.all(
        intervalsToAdd.map((interval) =>
          api.post(`/api/adminAccount/${userId}/intervals`, interval, {
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

  const submitInterval = form.handleSubmit(addInterval, (errors) => {
    showError(Object.values(errors)[0]?.message || "Проверьте данные интервала.");
  });

  return (
    <form className="account-form interval" onSubmit={submitInterval} noValidate>
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
            />
          </div>
          <button
            type="submit"
            className="form-button"
            disabled={isButtonDisabled || form.formState.isSubmitting}
            aria-disabled={isButtonDisabled || form.formState.isSubmitting}
          >
            Добавить интервал
          </button>
        </div>
      </div>
    </form>
  );
}