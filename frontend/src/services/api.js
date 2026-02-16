import axios from "axios"

const API_BASE_URL = "http://localhost:8000/api"

// Create axios instance with credentials
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
})

// Add response interceptor to handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // If the error is 401 and we haven't already tried to refresh
    // AND this is not a login/signup/refresh request (avoid infinite loops)
    const isAuthRequest = originalRequest.url?.includes('/auth/login') || 
                         originalRequest.url?.includes('/auth/signup') ||
                         originalRequest.url?.includes('/auth/refresh') ||
                         originalRequest.url?.includes('/auth/me')
    
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthRequest) {
      originalRequest._retry = true

      try {
        // Try to refresh the token
        await authAPI.refreshToken()
        // Retry the original request
        return apiClient(originalRequest)
      } catch (refreshError) {
        // If refresh fails, the user will be redirected to login by ProtectedRoute
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export const authAPI = {
  signup: (name, email, password) =>
    apiClient.post("/auth/signup", { name, email, password }),

  login: (email, password) =>
    apiClient.post("/auth/login", { email, password }),

  logout: () => apiClient.post("/auth/logout"),

  getCurrentUser: () => apiClient.get("/auth/me"),

  verifyEmail: (token) =>
    apiClient.post("/auth/verify-email", { token }),

  verifyEmailDev: (email) =>
    apiClient.post(`/auth/verify-email-dev?email=${email}`),

  sendVerificationEmail: (email) =>
    apiClient.post("/auth/send-verification-email", { email }),

  forgotPassword: (email) =>
    apiClient.post("/auth/forgot-password", { email }),

  resetPassword: (token, newPassword) =>
    apiClient.post("/auth/reset-password", { token, new_password: newPassword }),

  refreshToken: () => apiClient.post("/auth/refresh"),
}

export default apiClient
