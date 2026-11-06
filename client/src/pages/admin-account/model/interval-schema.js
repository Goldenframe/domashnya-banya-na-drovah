import { z } from "zod";

const date = z.iso.date();
const required = "Выберите время начала и окончания.";
export const intervalSchema = z.object({
  bookingDateStart: z.string(),
  bookingDateEnd: z.string(),
  startTime: z.string().min(1, required),
  endTime: z.string().min(1, required),
  dateSelectionMethod: z.enum(["individual", "range"]),
  selectedDates: z.array(date),
}).superRefine((values, ctx) => {
  const { dateSelectionMethod, selectedDates, bookingDateStart, bookingDateEnd, startTime, endTime } = values;
  if (dateSelectionMethod === "individual" && selectedDates.length === 0) {
    ctx.addIssue({ code: "custom", path: ["selectedDates"], message: "Выберите хотя бы одну дату." });
  }
  if (dateSelectionMethod === "range" && (!date.safeParse(bookingDateStart).success ||
    !date.safeParse(bookingDateEnd).success || bookingDateEnd < bookingDateStart)) {
    ctx.addIssue({ code: "custom", path: ["bookingDateEnd"], message: "Выберите корректный диапазон дат." });
  }
  if (startTime && endTime && endTime <= startTime) {
    ctx.addIssue({ code: "custom", path: ["endTime"], message: "Время окончания должно быть после времени начала." });
  }
});
