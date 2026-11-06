import { z } from "zod";
import { phoneSchema, verificationCodeSchema } from "@/shared/lib/phone.js";

export const requestCodeSchema = z.object({ phone: phoneSchema });
export const verifyCodeSchema = requestCodeSchema.extend({ code: verificationCodeSchema });

export const resetPasswordSchema = verifyCodeSchema.extend({
  newPassword: z.string().min(8, "Пароль должен содержать минимум 8 символов."),
  confirmPassword: z.string(),
}).refine(({ newPassword, confirmPassword }) => newPassword === confirmPassword, {
  path: ["confirmPassword"],
  message: "Пароли не совпадают!",
});
