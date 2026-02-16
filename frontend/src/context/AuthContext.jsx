import { createContext, useContext, useState, useEffect, useRef } from "react"
import { authAPI } from "@/services/api"

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const hasCheckedAuth = useRef(false)

  // Check if user is already logged in on mount
  useEffect(() => {
    if (hasCheckedAuth.current) return
    hasCheckedAuth.current = true

    const checkAuth = async () => {
      try {
        const response = await authAPI.getCurrentUser()
        setUser(response.data.user)
        setIsAuthenticated(true)
        setError("")
      } catch (err) {
        // User is not authenticated, which is fine
        setUser(null)
        setIsAuthenticated(false)
        setError("")
      } finally {
        setIsCheckingAuth(false)
      }
    }

    checkAuth()
  }, [])

  const signup = async (name, email, password) => {
    setIsLoading(true)
    setError("")
    try {
      const response = await authAPI.signup(name, email, password)
      return { success: true, message: response.data.message }
    } catch (err) {
      const errorMessage = err.response?.data?.detail || "Signup failed"
      setError(errorMessage)
      return { success: false, message: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email, password) => {
    setIsLoading(true)
    setError("")
    try {
      const response = await authAPI.login(email, password)
      setUser(response.data.user)
      setIsAuthenticated(true)
      return { success: true, message: "Logged in successfully" }
    } catch (err) {
      const errorMessage = err.response?.data?.detail || "Login failed"
      setError(errorMessage)
      setIsAuthenticated(false)
      return { success: false, message: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    setIsLoading(true)
    try {
      await authAPI.logout()
      setUser(null)
      setIsAuthenticated(false)
      setError("")
      return { success: true }
    } catch (err) {
      return { success: false }
    } finally {
      setIsLoading(false)
    }
  }

  const verifyEmail = async (token) => {
    setIsLoading(true)
    setError("")
    try {
      const response = await authAPI.verifyEmail(token)
      setUser(response.data.user)
      setIsAuthenticated(true)
      return { success: true, message: response.data.message }
    } catch (err) {
      const errorMessage = err.response?.data?.detail || "Verification failed"
      setError(errorMessage)
      return { success: false, message: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }

  const verifyEmailDev = async (email) => {
    setIsLoading(true)
    setError("")
    try {
      const response = await authAPI.verifyEmailDev(email)
      setUser(response.data.user)
      setIsAuthenticated(true)
      return { success: true, message: response.data.message }
    } catch (err) {
      const errorMessage = err.response?.data?.detail || "Verification failed"
      setError(errorMessage)
      return { success: false, message: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }

  const sendVerificationEmail = async (email) => {
    setIsLoading(true)
    setError("")
    try {
      const response = await authAPI.sendVerificationEmail(email)
      return { success: true, message: response.data.message }
    } catch (err) {
      const errorMessage = err.response?.data?.detail || "Failed to send verification email"
      setError(errorMessage)
      return { success: false, message: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }

  const forgotPassword = async (email) => {
    setIsLoading(true)
    setError("")
    try {
      const response = await authAPI.forgotPassword(email)
      return { success: true, message: response.data.message }
    } catch (err) {
      const errorMessage = err.response?.data?.detail || "Request failed"
      setError(errorMessage)
      return { success: false, message: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }

  const resetPassword = async (token, newPassword) => {
    setIsLoading(true)
    setError("")
    try {
      const response = await authAPI.resetPassword(token, newPassword)
      return { success: true, message: response.data.message }
    } catch (err) {
      const errorMessage = err.response?.data?.detail || "Reset failed"
      setError(errorMessage)
      return { success: false, message: errorMessage }
    } finally {
      setIsLoading(false)
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
