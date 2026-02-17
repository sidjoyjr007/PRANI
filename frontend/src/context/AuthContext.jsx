import { createContext, useContext, useEffect, useRef } from "react"
import { useDispatch, useSelector } from "react-redux"
import {
  login as loginAction,
  signup as signupAction,
  logout as logoutAction,
  fetchCurrentUser,
  verifyEmail as verifyEmailAction,
  forgotPassword as forgotPasswordAction,
  resetPassword as resetPasswordAction,
  sendVerificationEmail as sendVerificationEmailAction
} from "@/store/slices/authSlice"

// Need to access authAPI for verifyEmailDev if it's not in slice? 
// Actually verifyEmailDev is dev only, can keep it here or add to slice. 
// For consistency, let's assume we might need to add it to slice or just call API directly here if it's simple.
import { authAPI } from "@/services/api"

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const dispatch = useDispatch()
  const { user, isAuthenticated, isLoading, isCheckingAuth, error, successMessage } = useSelector((state) => state.auth)

  const hasCheckedAuth = useRef(false)

  // Check if user is already logged in on mount
  useEffect(() => {
    if (hasCheckedAuth.current) return
    hasCheckedAuth.current = true

    dispatch(fetchCurrentUser())
  }, [dispatch])

  const login = async (email, password) => {
    try {
      const resultAction = await dispatch(loginAction({ email, password }))
      if (loginAction.fulfilled.match(resultAction)) {
        return { success: true, message: "Logged in successfully" }
      } else {
        return { success: false, message: resultAction.payload || "Login failed" }
      }
    } catch (err) {
      return { success: false, message: "Login failed" }
    }
  }

  const signup = async (name, email, password) => {
    const resultAction = await dispatch(signupAction({ name, email, password }))
    if (signupAction.fulfilled.match(resultAction)) {
      return { success: true, message: resultAction.payload }
    } else {
      return { success: false, message: resultAction.payload || "Signup failed" }
    }
  }

  const logout = async () => {
    await dispatch(logoutAction())
    return { success: true }
  }

  const verifyEmail = async (token) => {
    const resultAction = await dispatch(verifyEmailAction(token))
    if (verifyEmailAction.fulfilled.match(resultAction)) {
      return { success: true, message: resultAction.payload.message }
    } else {
      return { success: false, message: resultAction.payload || "Verification failed" }
    }
  }

  // Keep dev helper here or add to slice. Slice is cleaner but this is dev only.
  const verifyEmailDev = async (email) => {
    try {
      // Direct API call since it's dev tool, or could dispatch verifyEmail action if it supported email
      // But verifyEmail action expects token. 
      // Let's just call API and manually update state if needed, or better, 
      // since verifyEmailDev returns user, we can manually check auth again.
      const response = await authAPI.verifyEmailDev(email)
      // We can create a manual action to set user, OR just refetch.
      dispatch(fetchCurrentUser())
      return { success: true, message: response.data.message }
    } catch (err) {
      return { success: false, message: err.response?.data?.detail || "Verification failed" }
    }
  }

  const sendVerificationEmail = async (email) => {
    const resultAction = await dispatch(sendVerificationEmailAction(email))
    if (sendVerificationEmailAction.fulfilled.match(resultAction)) {
      return { success: true, message: resultAction.payload }
    } else {
      return { success: false, message: resultAction.payload || "Failed to send email" }
    }
  }

  const forgotPassword = async (email) => {
    const resultAction = await dispatch(forgotPasswordAction(email))
    if (forgotPasswordAction.fulfilled.match(resultAction)) {
      return { success: true, message: resultAction.payload }
    } else {
      return { success: false, message: resultAction.payload || "Request failed" }
    }
  }

  const resetPassword = async (token, newPassword) => {
    const resultAction = await dispatch(resetPasswordAction({ token, newPassword }))
    if (resetPasswordAction.fulfilled.match(resultAction)) {
      return { success: true, message: resultAction.payload }
    } else {
      return { success: false, message: resultAction.payload || "Reset failed" }
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        isCheckingAuth,
        error,
        signup,
        login,
        logout,
        verifyEmail,
        verifyEmailDev,
        sendVerificationEmail,
        forgotPassword,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
