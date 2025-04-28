import React, { useEffect } from "react";
import "../../styles/buttons.css";
import "../../styles/account.css";
import "../../styles/form.css";
import "../../styles/additional-services.css";

export default function AdditionalServices({
  additionalServices,
  setAdditionalServices,
  discounts,
  start,
  end,
  bookingDate,
  additionalServicesQuantity,
  setAdditionalServicesQuantity,
}) {
  const servicePrices = { broom: 150, towel: 200, hat: 50, sheets: 200 };
  const maxQuantities = { broom: 4, towel: 8, hat: 8, sheets: 2 };

  const updateFreeServicesQuantity = () => {
    const newAdditionalServicesQuantity = { ...additionalServicesQuantity };

    discounts.forEach((discount) => {
      if (discount.discount_type !== "free" || !isDiscountApplicable(discount))
        return;

      // Применяем скидку ко всем услугам, если applicable_services пуст
      const applicableServices =
        discount.applicable_services.length > 0
          ? discount.applicable_services
          : Object.keys(discount.free_service_counts);

      applicableServices.forEach((service) => {
        const quantity = additionalServices[service]?.quantity || 0;

        // Проверяем минимальное количество для скидки
        const minCount = parseInt(
          discount.min_service_counts?.[service] || "0",
          10
        );
        if (quantity >= minCount) {
          const freeCount =
            Math.floor(quantity / minCount) *
            discount.free_service_counts[service];
          newAdditionalServicesQuantity[service] =
            (newAdditionalServicesQuantity[service] || 0) + freeCount;
        }
      });
    });

    console.log(
      "Обновленные бесплатные услуги:",
      newAdditionalServicesQuantity
    );
    setAdditionalServicesQuantity(newAdditionalServicesQuantity);
  };

  useEffect(() => {
    updateFreeServicesQuantity();
  }, [bookingDate, additionalServices]);

  const handleQuantityChange = (service, quantity) => {
    quantity = Math.max(0, Math.min(quantity, maxQuantities[service]));

    setAdditionalServices((prev) => {
      const updatedServices = {
        ...prev,
        [service]: {
          selected: quantity > 0,
          quantity: quantity,
        },
      };
      console.log("Обновленные услуги:", updatedServices);
      return updatedServices;
    });

    const freeCount = getFreeServiceCount(service, quantity);
    setAdditionalServicesQuantity((prev) => {
      const updatedFreeServices = { ...prev, [service]: freeCount };
      console.log("Обновленные бесплатные услуги:", updatedFreeServices);
      return updatedFreeServices;
    });
  };

  const isDiscountApplicable = (discount) => {
    if (!start || !end || !bookingDate) return false;

    const startTime = new Date(`${bookingDate}T${start}`);
    const endTime = new Date(`${bookingDate}T${end}`);
    const validFrom = new Date(`${bookingDate}T${discount.valid_from}`);
    const validTill = new Date(`${bookingDate}T${discount.valid_till}`);

    const applicable =
      discount.time_discount_type === "time_limit"
        ? startTime >= validFrom &&
          endTime <= validTill &&
          discount.applicable_days.includes(bookingDate)
        : startTime >= validFrom && endTime <= validTill;

    console.log("Проверяем скидку:", discount, "Применима:", applicable);
    return applicable;
  };

  const getFreeServiceCount = (service, quantity, discount) => {
    if (discount && quantity >= discount.min_service_counts?.[service]) {
      return (
        Math.floor(quantity / discount.min_service_counts[service]) *
        discount.free_service_counts[service]
      );
    }
    return 0;
  };

  const getServicePrice = (service) => {
    const discount = discounts?.find(
      (d) =>
        d.applicable_services?.includes(service) &&
        d.discount_type === "discount_service" &&
        isDiscountApplicable(d)
    );
    return discount?.service_prices?.[service] ?? servicePrices[service];
  };

  const changeQuantity = (service, delta) => {
    const current = additionalServices[service]?.quantity || 0;
    handleQuantityChange(service, current + delta);
  };

  return (
    <section
      className="additional-services"
      aria-labelledby="additional-services-heading"
    >
      <div className="service-item">
        <div className="service-info">
          <label htmlFor="broom-quantity">
            Дубовые веники (+{getServicePrice("broom")} ₽)
            {additionalServicesQuantity.broom > 0 && (
              <span className="free-gift">
                {" "}
                (+{additionalServicesQuantity.broom} в подарок)
              </span>
            )}
          </label>
        </div>
        <div className="service-quantity">
          <button
            onClick={() => changeQuantity("broom", -1)}
            type="button"
            aria-label="Уменьшить количество дубовых веников"
            disabled={additionalServices.broom?.quantity === 0}
          >
            -
          </button>
          <input
            id="broom-quantity"
            type="number"
            min="0"
            max={maxQuantities.broom}
            value={additionalServices.broom?.quantity || 0}
            onChange={(e) =>
              handleQuantityChange("broom", parseInt(e.target.value))
            }
            className="service-quantity-input"
            aria-label="Количество дубовых веников"
          />
          <button
            onClick={() => changeQuantity("broom", 1)}
            type="button"
            aria-label="Увеличить количество дубовых веников"
            disabled={
              additionalServices.broom?.quantity === maxQuantities.broom
            }
          >
            +
          </button>
        </div>
      </div>

      <div className="service-item">
        <div className="service-info">
          <label htmlFor="towel-quantity">
            Полотенце (+{getServicePrice("towel")} ₽)
          </label>
        </div>
        <div className="service-quantity">
          <button
            onClick={() => changeQuantity("towel", -1)}
            type="button"
            aria-label="Уменьшить количество полотенец"
            disabled={additionalServices.towel?.quantity === 0}
          >
            -
          </button>
          <input
            id="towel-quantity"
            type="number"
            min="0"
            max={maxQuantities.towel}
            value={additionalServices.towel?.quantity || 0}
            onChange={(e) =>
              handleQuantityChange("towel", parseInt(e.target.value))
            }
            className="service-quantity-input"
            aria-label="Количество полотенец"
          />
          <button
            onClick={() => changeQuantity("towel", 1)}
            type="button"
            aria-label="Увеличить количество полотенец"
            disabled={
              additionalServices.towel?.quantity === maxQuantities.towel
            }
          >
            +
          </button>
        </div>
      </div>

      <div className="service-item">
        <div className="service-info">
          <label htmlFor="hat-quantity">
            Шапка (+{getServicePrice("hat")} ₽)
            {getFreeServiceCount("hat", additionalServices.hat?.quantity || 0) >
              0 && (
              <span className="free-gift">
                {" "}
                (+
                {getFreeServiceCount(
                  "hat",
                  additionalServices.hat?.quantity || 0
                )}{" "}
                в подарок)
              </span>
            )}
          </label>
        </div>
        <div className="service-quantity">
          <button
            onClick={() => changeQuantity("hat", -1)}
            type="button"
            aria-label="Уменьшить количество шапок"
            disabled={additionalServices.hat?.quantity === 0}
          >
            -
          </button>
          <input
            id="hat-quantity"
            type="number"
            min="0"
            max={maxQuantities.hat}
            value={additionalServices.hat?.quantity || 0}
            onChange={(e) =>
              handleQuantityChange("hat", parseInt(e.target.value))
            }
            className="service-quantity-input"
            aria-label="Количество шапок"
          />
          <button
            onClick={() => changeQuantity("hat", 1)}
            type="button"
            aria-label="Увеличить количество шапок"
            disabled={additionalServices.hat?.quantity === maxQuantities.hat}
          >
            +
          </button>
        </div>
      </div>

      <div className="service-item">
        <div className="service-info">
          <label htmlFor="sheets-quantity">
            Простынь (+{getServicePrice("sheets")} ₽)
            {getFreeServiceCount(
              "sheets",
              additionalServices.sheets?.quantity || 0
            ) > 0 && (
              <span className="free-gift">
                {" "}
                (+
                {getFreeServiceCount(
                  "sheets",
                  additionalServices.sheets?.quantity || 0
                )}{" "}
                в подарок)
              </span>
            )}
          </label>
        </div>
        <div className="service-quantity">
          <button
            onClick={() => changeQuantity("sheets", -1)}
            type="button"
            aria-label="Уменьшить количество простыней"
            disabled={additionalServices.sheets?.quantity === 0}
          >
            -
          </button>
          <input
            id="sheets-quantity"
            type="number"
            min="0"
            max={maxQuantities.sheets}
            value={additionalServices.sheets?.quantity || 0}
            onChange={(e) =>
              handleQuantityChange("sheets", parseInt(e.target.value))
            }
            className="service-quantity-input"
            aria-label="Количество простыней"
          />
          <button
            onClick={() => changeQuantity("sheets", 1)}
            type="button"
            aria-label="Увеличить количество простыней"
            disabled={
              additionalServices.sheets?.quantity === maxQuantities.sheets
            }
          >
            +
          </button>
        </div>
      </div>
    </section>
  );
}
