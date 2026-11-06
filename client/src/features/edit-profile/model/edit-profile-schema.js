import { z } from "zod";
import { phoneSchema, verificationCodeSchema } from "@/shared/lib/phone.js";

const names = z.object({
  firstName: z.string().regex(/^[А-Яа-яЁё]+$/, "Имя должно содержать только русские буквы."),
  lastName: z.string().regex(/^[А-Яа-яЁё]+$/, "Фамилия должна содержать только русские буквы."),
});

export const requestPhoneChangeSchema = names.extend({ phoneNumber: phoneSchema });
export const verifyPhoneChangeSchema = requestPhoneChangeSchema.extend({
  verificationCode: verificationCodeSchema,
});

export const editProfileSchema = names.extend({
  phoneNumber: z.string(),
  currentPassword: z.string(),
  newPassword: z.string(),
  confirmPassword: z.string(),
}).superRefine(({ newPassword, currentPassword, confirmPassword }, ctx) => {
  if (!newPassword) return;
  if (!currentPassword) {
    ctx.addIssue({ code: "custom", path: ["currentPassword"], message: "Пожалуйста, введите текущий пароль." });
  }
  if (newPassword !== confirmPassword) {
    ctx.addIssue({ code: "custom", path: ["confirmPassword"], message: "Пароли не совпадают." });
  }
});
