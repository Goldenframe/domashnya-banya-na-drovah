import { z } from "zod";

const numeric = z.union([z.number(), z.string()]);
const nonNegative = (value) => String(value).trim() !== "" && Number.isFinite(Number(value)) && Number(value) >= 0;

export const discountSchema = z.object({
  description: z.string().trim().min(1, "Введите описание акции."),
  discountType: z.enum(["discount", "discount_service", "free"]),
  timeDiscountType: z.enum(["no_time_limit", "time_limit"]),
  startTime: z.string().min(1, "Выберите время начала."),
  endTime: z.string().min(1, "Выберите время окончания."),
  selectedDates: z.array(z.string()),
  discountPercentage: numeric,
  additionalServices: z.record(z.string(), z.object({ selected: z.boolean() })),
  servicePrices: z.record(z.string(), numeric),
  freeServiceCounts: z.record(z.string(), numeric),
  minServiceCounts: z.record(z.string(), numeric),
}).superRefine((values, ctx) => {
  if (values.startTime && values.endTime && values.endTime <= values.startTime) {
    ctx.addIssue({ code: "custom", path: ["endTime"], message: "Время окончания должно быть после времени начала." });
  }
  if (values.discountType === "discount" &&
      (!nonNegative(values.discountPercentage) || Number(values.discountPercentage) > 100)) {
    ctx.addIssue({ code: "custom", path: ["discountPercentage"], message: "Введите процент скидки от 0 до 100." });
  }
  const numericFields = values.discountType === "discount_service" ? ["servicePrices"]
    : values.discountType === "free" ? ["freeServiceCounts", "minServiceCounts"] : [];
  for (const field of numericFields) {
    if (Object.values(values[field]).some((value) => !nonNegative(value))) {
      ctx.addIssue({ code: "custom", path: [field], message: "Цена и количество должны быть неотрицательными числами." });
    }
  }
});
