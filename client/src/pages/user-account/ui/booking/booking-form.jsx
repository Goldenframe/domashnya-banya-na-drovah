import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  calendarQuery, createBooking, endTimesQuery, refreshBookings, startTimesQuery,
} from "../../api/booking-queries.js";
import { bookingSchema } from "../../model/booking-schema.js";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFormField } from "@/shared/lib/use-form-field.js";
import React, { useState, useEffect, useRef } from "react";
import { api } from "@/shared/api";
import Calendar from "./calendar.jsx";
import AdditionalServices from "./additional-services.jsx";
import useShowMessage from "@/shared/lib/use-show-message.js";
import "@/shared/ui/styles/buttons.css";
import "@/shared/ui/styles/account.css";
import "@/shared/ui/styles/auth.css";
import "@/shared/ui/styles/form.css";
import "./booking.css";

import Select from "react-select";

function BookingForm({ userId, token }) {
  const form = useForm({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      bookingDate: "",
      startTime: "",
      endTime: "",
      additionalServices: {
        broom: { selected: false, quantity: 0 },
        towel: { selected: false, quantity: 0 },
        hat: { selected: false, quantity: 0 },
        sheets: { selected: false, quantity: 0 },
      },
      additionalServicesQuantity: {
        broom: 0,
        towel: 0,
        hat: 0,
        sheets: 0,
      },
    },
  });
  const [bookingDate, setBookingDate] = useFormField(form, "bookingDate");
  const [startTime, setStartTime] = useFormField(form, "startTime");
  const [endTime, setEndTime] = useFormField(form, "endTime");
  const [additionalServices, setAdditionalServices] = useFormField(form, "additionalServices");
  const [additionalServicesQuantity, setAdditionalServicesQuantity] = useFormField(form, "additionalServicesQuantity");
  const [price, setPrice] = useState(0);
  const [discounts, setDiscounts] = useState([]);
  const [timeLimitDiscount, setTimeLimitDiscount] = useState("");
  const [noTimeLimitDiscount, setNoTimeLimitDiscount] = useState("");
  const { message, showMessage, error, showError, isVisible } =
    useShowMessage();
  const queryClient = useQueryClient();
  const hasSelectedInitialDate = useRef(false);
  const [datesToCheck] = useState(() => Array.from({ length: 62 }, (_, offset) => {
    const date = new Date();
    date.setDate(date.getDate() + offset);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return [year, month, day].join("-");
  }));
  const calendar = useQuery(calendarQuery(queryClient, userId, token, datesToCheck));
  const availableDates = calendar.data?.availableDates ?? [];
  const startTimes = useQuery({ ...startTimesQuery(userId, token, bookingDate), staleTime: 30 * 1000 });
  const availableStartTimes = startTimes.data ?? [];
  const intervalId = availableStartTimes.find((interval) => interval.startTime === startTime)?.intervalId;
  const endTimes = useQuery(endTimesQuery(userId, token, bookingDate, startTime, intervalId));
  const availableEndTimes = endTimes.data ?? [];
  const bookingMutation = useMutation({
    mutationFn: (booking) => createBooking(userId, token, booking),
    onSuccess: (_, booking) => refreshBookings(queryClient, userId, booking.booking_date),
  });

  useEffect(() => {
    if (!hasSelectedInitialDate.current && calendar.data?.availableDates.length) {
      hasSelectedInitialDate.current = true;
      setBookingDate(calendar.data.availableDates[0]);
    }
  }, [calendar.data, setBookingDate]);

  useEffect(() => {
    if (startTime && startTimes.isSuccess && intervalId == null) {
      setStartTime("");
      setEndTime("");
    }
  }, [startTime, startTimes.isSuccess, intervalId, setStartTime, setEndTime]);

  useEffect(() => {
    if (endTime && endTimes.isSuccess && !endTimes.data.includes(endTime)) {
      setEndTime("");
    }
  }, [endTime, endTimes.isSuccess, endTimes.data, setEndTime]);

  useEffect(() => {
    let discountTimeLimit = discounts.filter(
      (discount) =>
        discount.time_discount_type === "time_limit" &&
        discount.applicable_days.includes(bookingDate)
    );

    setTimeLimitDiscount(discountTimeLimit.length > 0 ? discountTimeLimit : []);
  }, [bookingDate, discounts]);

  useEffect(() => {
    let discountNoTimeLimit = discounts.filter(
      (discount) => discount.time_discount_type === "no_time_limit"
    );
    setNoTimeLimitDiscount(
      discountNoTimeLimit.length > 0 ? discountNoTimeLimit : []
    );
  }, [bookingDate, discounts]);

  const handleDateChange = (date) => {
    setBookingDate(date);
    setStartTime("");
    setEndTime("");
  };

  const handleTimeChange = (selectedOption) => {
    setStartTime(selectedOption?.value ?? "");
    setEndTime("");
  };

  const updatePrice = async (start, end) => {
    const startTimeDate = start ? new Date(`${bookingDate}T${start}`) : null;
    const endTimeDate = end ? new Date(`${bookingDate}T${end}`) : null;

    const basicPrice =
      startTimeDate && endTimeDate
        ? await calculatePrice(startTimeDate, endTimeDate)
        : 0;
    const additionalServicesCost = calculateAdditionalServicesCost(
      startTimeDate,
      endTimeDate
    );
    setPrice(basicPrice + additionalServicesCost);
  };

  useEffect(() => {
    updatePrice(startTime, endTime);
  }, [additionalServices, bookingDate, startTime, endTime, discounts]);

  const fetchDiscounts = async () => {
    try {
      const response = await api.get(
        `/api/userAccount/${userId}/discounts`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setDiscounts(response.data);
    } catch (error) {
      console.error("Ошибка при получении скидок:", error);
      return [];
    }
  };

  useEffect(() => {
    fetchDiscounts();
  }, [userId]);

  const calculatePrice = async (start, end) => {
    console.log("--- CALCULATION START ---");
    console.log("Original start:", start);
    console.log("Original end:", end);

    const startCopy = new Date(start);
    const endCopy = new Date(end);

    if (endCopy.getHours() === 0 && endCopy.getMinutes() === 0) {
      endCopy.setFullYear(
        startCopy.getFullYear(),
        startCopy.getMonth(),
        startCopy.getDate()
      );
      endCopy.setHours(24, 0, 0, 0);
    }

    console.log("Adjusted start:", startCopy);
    console.log("Adjusted end:", endCopy);

    if (endCopy <= startCopy) {
      console.log("Invalid time interval");
      return 0;
    }

    const durationMs = endCopy.getTime() - startCopy.getTime();
    const hours = durationMs / (1000 * 60 * 60);

    let cost = 0;
    const startHour = startCopy.getHours();
    const dayOfWeek = startCopy.getDay();

    if (dayOfWeek === 0 || dayOfWeek === 6) {
      // Выходные
      cost = hours <= 2 ? 3800 : Math.round(1600 * hours);
    } else {
      // Будни
      if (startHour >= 8 && startHour < 16) {
        cost = hours <= 2 ? 3500 : Math.round(1500 * hours);
      } else if (startHour >= 16 || startHour < 8) {
        cost = hours <= 2 ? 3800 : Math.round(1600 * hours);
      }
    }

    let discountApplied = 0;
    discounts.forEach((discount) => {
      if (isDiscountApplicable(discount, startCopy, endCopy)) {
        const discountValue = calculateDiscountValue(cost, discount);
        cost -= discountValue;
        discountApplied += discountValue;
      }
    });
    const finalCost = Math.max(0, Math.round(cost));

    return finalCost;
  };

  const isDiscountApplicable = (discount, start, end) => {
    const validFrom = new Date(`${bookingDate}T${discount.valid_from}`);
    const validTill = new Date(`${bookingDate}T${discount.valid_till}`);
    const startTime = start || new Date(`${bookingDate}T08:00`);
    const endTime = end || new Date(`${bookingDate}T23:59`);

    return discount.time_discount_type === "time_limit"
      ? startTime >= validFrom &&
          endTime <= validTill &&
          discount.applicable_days.includes(bookingDate)
      : startTime >= validFrom && endTime <= validTill;
  };

  const calculateDiscountValue = (cost, discount) => {
    if (discount.discount_type === "discount") {
      return cost * (discount.discount_percentage / 100);
    }
    return 0;
  };

  const calculateAdditionalServicesCost = (start, end) => {
    let cost = 0;
    const servicePrices = {
      broom: 150,
      towel: 200,
      hat: 50,
      sheets: 200,
    };

    for (let service in additionalServices) {
      if (additionalServices[service]?.quantity > 0) {
        const discount = discounts.find(
          (discount) =>
            Array.isArray(discount.applicable_services) &&
            discount.applicable_services.includes(service) &&
            discount.discount_type === "discount_service" &&
            isDiscountApplicable(discount, start, end)
        );

        const discountedPrice =
          discount?.service_prices?.[service] ?? servicePrices[service];
        cost += additionalServices[service].quantity * discountedPrice;
      }
    }
    return cost;
  };

  const getEndTimeOptions = (startTime) => {
    if (!startTime) return [];

    return availableEndTimes
      .filter((time) => time > startTime)
      .sort()
      .map((time) => ({ value: time, label: time }));
  };

  const startTimeOptions = availableStartTimes.map((interval) => ({
    value: interval.startTime,
    label: interval.startTime,
  }));

  const canBook = Boolean(bookingDate && startTime && endTime && intervalId != null &&
    startTimes.isSuccess && endTimes.isSuccess && availableEndTimes.includes(endTime));

  const submitBooking = async ({ bookingDate, startTime, endTime, additionalServices, additionalServicesQuantity }) => {
    if (!canBook) {
      showError("Выберите доступную дату и время.");
      return;
    }

    const startTimeDate = startTime
      ? new Date(`${bookingDate}T${startTime}`)
      : null;
    const endTimeDate = endTime ? new Date(`${bookingDate}T${endTime}`) : null;

    const appliedDiscounts = discounts.filter((discount) => {
      if (!isDiscountApplicable(discount, startTimeDate, endTimeDate))
        return false;
      if (discount.discount_type === "discount_service") {
        return discount.applicable_services.some(
          (service) => additionalServices[service]?.quantity > 0
        );
      }
      return true;
    });

    console.log("Примененные скидки:", appliedDiscounts);

    const discountId =
      appliedDiscounts.length > 0 ? appliedDiscounts[0].id : null;
    try {
      await bookingMutation.mutateAsync({
        booking_date: bookingDate,
        start_time: startTime,
        end_time: endTime,
        price,
        broom: additionalServices.broom.selected,
        broom_quantity:
          additionalServices.broom.quantity +
          (additionalServicesQuantity.broom || 0),
        towel: additionalServices.towel.selected,
        towel_quantity:
          additionalServices.towel.quantity +
          (additionalServicesQuantity.towel || 0),
        hat: additionalServices.hat.selected,
        hat_quantity:
          additionalServices.hat.quantity +
          (additionalServicesQuantity.hat || 0),
        sheets: additionalServices.sheets.selected,
        sheets_quantity:
          additionalServices.sheets.quantity +
          (additionalServicesQuantity.sheets || 0),
        discount_id: discountId,
      });
      showMessage("Бронь успешно оформлена!");
      setBookingDate("");
      setStartTime("");
      setEndTime("");
      setPrice(0);
      setAdditionalServices({
        broom: { selected: false, quantity: 0 },
        towel: { selected: false, quantity: 0 },
        hat: { selected: false, quantity: 0 },
        sheets: { selected: false, quantity: 0 },
      });
      setAdditionalServicesQuantity({
        broom: 0,
        towel: 0,
        hat: 0,
        sheets: 0,
      });
    } catch (err) {
      let errorMessage = err.message;
      if (err.response) {
        errorMessage =
          err.response.data.error ||
          err.response.data.message ||
          "Произошла непредвиденная ошибка.";
      } else if (err.request) {
        errorMessage = "Ошибка сети. Пожалуйста, проверьте Ваше соединение.";
      }
      showError(errorMessage);
      console.error("Ошибка при бронировании:", err);
    }
  };
  return (
    <section className="account-content">
      <div className="account-form book">
        {(message || error) && (
          <div
            className={`auth-message ${error ? "error" : "success"} ${
              isVisible ? "fade-in" : "fade-out"
            }`}
            role={error ? "alert" : "status"}
            aria-live="assertive"
          >
            {message || error}
          </div>
        )}

        <form
          onSubmit={form.handleSubmit(submitBooking, (errors) => {
            showError(Object.values(errors)[0]?.message || "Проверьте данные бронирования.");
          })}
          className="booking-wrapper"
          aria-labelledby="bookingFormTitle"
        >
          <div className="calendar-container">
            {calendar.isPending && <p role="status">Загружаем доступные даты…</p>}
            {(calendar.isError || calendar.data?.failedDays > 0) && (
              <div role="alert">
                <p>{calendar.isError ? "Не удалось загрузить календарь." : "Часть дат не удалось проверить."}</p>
                <button type="button" onClick={() => calendar.refetch()}>Повторить</button>
              </div>
            )}
            <Calendar
              availableDates={availableDates}
              setBookingDate={handleDateChange}
              bookingDate={bookingDate}
            />
          </div>

          <div className="time-controls">
            {(startTimes.isError || endTimes.isError) && (
              <div role="alert">
                <p>Не удалось загрузить доступное время.</p>
                <button type="button" onClick={() => (startTimes.isError ? startTimes : endTimes).refetch()}>
                  Повторить
                </button>
              </div>
            )}
            {noTimeLimitDiscount.length > 0 && (
              <section
                aria-labelledby="permanentDiscountsHeading"
                className="discounts"
              >
                <div className="discount permanent-discount" role="region">
                  {noTimeLimitDiscount.map((el, index) => (
                    <p key={index}>
                      <strong>Постоянная акция:</strong> {el.description}
                    </p>
                  ))}
                </div>
              </section>
            )}

            {timeLimitDiscount.length > 0 && (
              <section
                aria-labelledby="temporaryDiscountsHeading"
                className="discounts"
              >
                <div className="discount temporary-discount" role="region">
                  {timeLimitDiscount.map((el, index) => (
                    <p key={index}>
                      <strong>Временная акция:</strong> {el.description}
                    </p>
                  ))}
                </div>
              </section>
            )}

            <div className="form-group">
              <label htmlFor="startTimeSelect" className="form-label">
                Время начала:
              </label>
              <Select
                id="startTimeSelect"
                inputId="startTimeInput"
                value={
                  startTime ? { value: startTime, label: startTime } : null
                }
                onChange={handleTimeChange}
                options={startTimeOptions}
                classNamePrefix="time-select"
                placeholder="Выберите время"
                isDisabled={startTimeOptions.length === 0}
                aria-labelledby="startTimeLabel"
                aria-describedby={
                  startTimeOptions.length === 0 ? "noStartTimesHelp" : undefined
                }
              />
            </div>

            <div className="form-group">
              <label htmlFor="endTimeSelect" className="form-label">
                Время окончания:
              </label>
              <Select
                id="endTimeSelect"
                inputId="endTimeInput"
                value={endTime ? { value: endTime, label: endTime } : null}
                onChange={(selectedOption) => {
                  setEndTime(selectedOption?.value ?? "");
                }}
                options={getEndTimeOptions(startTime)}
                classNamePrefix="time-select"
                placeholder="Выберите время"
                isDisabled={
                  !startTime || getEndTimeOptions(startTime).length === 0
                }
                aria-labelledby="endTimeLabel"
                aria-describedby={
                  !startTime
                    ? "selectStartTimeFirstHelp"
                    : getEndTimeOptions(startTime).length === 0
                    ? "noEndTimesHelp"
                    : undefined
                }
              />
            </div>
          </div>

          <div className="additional-services-container">
            <AdditionalServices
              additionalServices={additionalServices}
              setAdditionalServices={setAdditionalServices}
              discounts={discounts}
              start={startTime}
              end={endTime}
              bookingDate={bookingDate}
              additionalServicesQuantity={additionalServicesQuantity}
              setAdditionalServicesQuantity={setAdditionalServicesQuantity}
            />
          </div>

          <div className="price-container" role="region" aria-live="polite">
            <div className="price-content">
              <p className="price">
                Итоговая стоимость:
                <span aria-label={`${price} рублей`}>{price} ₽</span>
              </p>
              <button
                type="submit"
                className="form-button"
                disabled={!canBook || form.formState.isSubmitting}
                aria-disabled={!canBook || form.formState.isSubmitting}
              >
                Забронировать
              </button>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}

export default BookingForm;
