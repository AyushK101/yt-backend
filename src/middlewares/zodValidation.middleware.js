import { z } from "zod";

const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;

const RegisterSchema = z.object({
  fullName: z.string({required_error: 'fullName is required'})
  .trim()
  .min(1,{message: 'minimum 1 char is required'})
  .max(200,{message: 'max limit is 200 characters'}),
  username: z.string({required_error: 'fullName is required'})
  .trim()
  .min(1,{message: 'minimum 1 char is required'})
  .max(200,{message: 'max limit is 200 characters'}),
  email: z.string()
  .trim()
  .email({message: 'invalid email address'}),
  password: z.string()
  .min(1, "String must have at least one character")
  .regex(specialCharRegex, "String must contain at least one special character")
  .regex(uppercaseRegex, "String must contain at least one uppercase letter")
  .regex(digitRegex, "String must contain at least one digit")
})


export { RegisterSchema, }
