import { useState } from "react"
import * as yup from "yup"

// Reusable field validation schemas
export const fieldSchemas = {
  name: yup.string().min(2, "Name must be at least 2 characters").max(50, "Name must not exceed 50 characters").required("Name is required"),

  email: yup.string().email("Please enter a valid email address").required("Email is required"),

  password: yup.string().min(6, "Password must be at least 6 characters").max(128, "Password is too long").required("Password is required"),

  confirmPassword: yup.string().oneOf([yup.ref("password"), null], "Passwords must match").required("Please confirm your password"),
}

// Create custom validation schema from field array
export function createValidationSchema(fields) {
  const schemaObject = {}
  fields.forEach((field) => {
    if (fieldSchemas[field]) {
      schemaObject[field] = fieldSchemas[field]
    }
  })
  return yup.object().shape(schemaObject)
}

// Hook for password visibility toggle
export function usePasswordVisibility() {
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false)

  const togglePasswordVisibility = () => setPasswordVisible(!passwordVisible)
  const toggleConfirmPasswordVisibility = () => setConfirmPasswordVisible(!confirmPasswordVisible)

  return {
    passwordVisible,
    confirmPasswordVisible,
    togglePasswordVisibility,
    toggleConfirmPasswordVisibility,
  }
}
