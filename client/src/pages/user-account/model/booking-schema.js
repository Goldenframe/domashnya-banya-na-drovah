import { z } from "zod";

const required = "Пожалуйста, выберите дату и время.";
const services = z.record(z.string(), z.object({
  selected: z.boolean(),
  quantity: z.number(),
}));

export const bookingSchema = z.object({
  bookingDate: z.string().min(1, required),
  startTime: z.string().min(1, required),
  endTime: z.string().min(1, required),
  additionalServices: services,
  additionalServicesQuantity: z.record(z.string(), z.number()),
}).refine(({ bookingDate, startTime, endTime }) =>
  new Date(bookingDate + "T" + endTime) > new Date(bookingDate + "T" + startTime),
  { path: ["endTime"], message: "Время окончания должно быть после времени начала." }
);
