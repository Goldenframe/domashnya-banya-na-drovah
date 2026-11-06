import { z } from "zod";
import { phoneSchema } from "@/shared/lib/phone.js";

export const loginSchema = z.object({
  phone: phoneSchema,
  password: z.string().min(1, "Введите пароль."),
});
