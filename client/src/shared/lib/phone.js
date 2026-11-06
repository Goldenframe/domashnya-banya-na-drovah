import { z } from "zod";

export function cleanPhoneNumber(value) {
  const digits = value.replace(/\D/g, "");
  return digits.length === 10 ? "7" + digits : digits;
}

export const phoneSchema = z.string().refine(
  (value) => cleanPhoneNumber(value).length === 11,
  "Введите корректный номер телефона."
);

export const verificationCodeSchema = z.string().regex(/^\d{4}$/, "Введите 4 цифры кода.");
