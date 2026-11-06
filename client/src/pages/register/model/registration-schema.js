import { z } from "zod";
import { phoneSchema, verificationCodeSchema } from "@/shared/lib/phone.js";

const registrationFields = z.object({
  firstName: z.string().min(1, "Введите имя."),
  lastName: z.string().min(1, "Введите фамилию."),
  password: z.string().min(1, "Введите пароль."),
  confirmPassword: z.string().min(1, "Повторите пароль."),
  phoneNumber: phoneSchema,
});

const passwordsMatch = ({ password, confirmPassword }) => password === confirmPassword;
const mismatch = { path: ["confirmPassword"], message: "Пароли не совпадают!" };

export const registrationSchema = registrationFields.refine(passwordsMatch, mismatch);
export const registrationVerificationSchema = registrationFields.extend({
  verificationCode: verificationCodeSchema,
}).refine(passwordsMatch, mismatch);
