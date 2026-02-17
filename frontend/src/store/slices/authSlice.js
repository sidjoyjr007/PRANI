import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { authAPI } from '@/services/api'

// Async Thunks

export const fetchCurrentUser = createAsyncThunk(
    'auth/fetchCurrentUser',
    async (_, { rejectWithValue }) => {
        try {
            const response = await authAPI.getCurrentUser()
            return response.data.user
        } catch (error) {
            // 401 is expected if not logged in
            return rejectWithValue(error.response?.data || 'Not authenticated')
        }
    }
)

export const login = createAsyncThunk(
    'auth/login',
    async ({ email, password }, { rejectWithValue }) => {
        try {
            const response = await authAPI.login(email, password)
            return response.data.user
        } catch (error) {
            return rejectWithValue(error.response?.data?.detail || 'Login failed')
        }
    }
)

export const signup = createAsyncThunk(
    'auth/signup',
    async ({ name, email, password }, { rejectWithValue }) => {
        try {
            const response = await authAPI.signup(name, email, password)
            return response.data.message
        } catch (error) {
            return rejectWithValue(error.response?.data?.detail || 'Signup failed')
        }
    }
)

export const logout = createAsyncThunk(
    'auth/logout',
    async (_, { rejectWithValue }) => {
        try {
            await authAPI.logout()
            return
        } catch (error) {
            return rejectWithValue(error.response?.data?.detail || 'Logout failed')
        }
    }
)

export const verifyEmail = createAsyncThunk(
    'auth/verifyEmail',
    async (token, { rejectWithValue }) => {
        try {
            const response = await authAPI.verifyEmail(token)
            return { user: response.data.user, message: response.data.message }
        } catch (error) {
            return rejectWithValue(error.response?.data?.detail || 'Verification failed')
        }
    }
)

export const forgotPassword = createAsyncThunk(
    'auth/forgotPassword',
    async (email, { rejectWithValue }) => {
        try {
            const response = await authAPI.forgotPassword(email)
            return response.data.message
        } catch (error) {
            return rejectWithValue(error.response?.data?.detail || 'Request failed')
        }
    }
)

export const resetPassword = createAsyncThunk(
    'auth/resetPassword',
    async ({ token, newPassword }, { rejectWithValue }) => {
        try {
            const response = await authAPI.resetPassword(token, newPassword)
            return response.data.message
        } catch (error) {
            return rejectWithValue(error.response?.data?.detail || 'Reset failed')
        }
    }
)

export const sendVerificationEmail = createAsyncThunk(
    'auth/sendVerificationEmail',
    async (email, { rejectWithValue }) => {
        try {
            const response = await authAPI.sendVerificationEmail(email)
            return response.data.message
        } catch (error) {
            return rejectWithValue(error.response?.data?.detail || 'Failed to send email')
        }
    }
)

const initialState = {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    isCheckingAuth: true, // For initial load
    error: null,
    successMessage: null,
}

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null
        },
        clearSuccess: (state) => {
            state.successMessage = null
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Current User
            .addCase(fetchCurrentUser.pending, (state) => {
                state.isCheckingAuth = true
            })
            .addCase(fetchCurrentUser.fulfilled, (state, action) => {
                state.user = action.payload
                state.isAuthenticated = true
                state.isCheckingAuth = false
            })
            .addCase(fetchCurrentUser.rejected, (state) => {
                state.user = null
                state.isAuthenticated = false
                state.isCheckingAuth = false
            })

            // Login
            .addCase(login.pending, (state) => {
                state.isLoading = true
                state.error = null
            })
            .addCase(login.fulfilled, (state, action) => {
                state.isLoading = false
                state.user = action.payload
                state.isAuthenticated = true
                state.error = null
            })
            .addCase(login.rejected, (state, action) => {
                state.isLoading = false
                state.error = action.payload
                state.isAuthenticated = false
            })

            // Signup
            .addCase(signup.pending, (state) => {
                state.isLoading = true
                state.error = null
                state.successMessage = null
            })
            .addCase(signup.fulfilled, (state, action) => {
                state.isLoading = false
                state.successMessage = action.payload
                state.error = null
            })
            .addCase(signup.rejected, (state, action) => {
                state.isLoading = false
                state.error = action.payload
            })

            // Logout
            .addCase(logout.fulfilled, (state) => {
                state.user = null
                state.isAuthenticated = false
            })

            // Verify Email
            .addCase(verifyEmail.pending, (state) => {
                state.isLoading = true
                state.error = null
            })
            .addCase(verifyEmail.fulfilled, (state, action) => {
                state.isLoading = false
                state.user = action.payload.user
                state.isAuthenticated = true
                state.successMessage = action.payload.message
            })
            .addCase(verifyEmail.rejected, (state, action) => {
                state.isLoading = false
                state.error = action.payload
            })

            // Forgot Password
            .addCase(forgotPassword.pending, (state) => {
                state.isLoading = true
                state.error = null
                state.successMessage = null
            })
            .addCase(forgotPassword.fulfilled, (state, action) => {
                state.isLoading = false
                state.successMessage = action.payload
            })
            .addCase(forgotPassword.rejected, (state, action) => {
                state.isLoading = false
                state.error = action.payload
            })

            // Reset Password
            .addCase(resetPassword.pending, (state) => {
                state.isLoading = true
                state.error = null
                state.successMessage = null
            })
            .addCase(resetPassword.fulfilled, (state, action) => {
                state.isLoading = false
                state.successMessage = action.payload
            })
            .addCase(resetPassword.rejected, (state, action) => {
                state.isLoading = false
                state.error = action.payload
            })

            // Send Verification Email
            .addCase(sendVerificationEmail.pending, (state) => {
                state.isLoading = true
                state.error = null
                state.successMessage = null
            })
            .addCase(sendVerificationEmail.fulfilled, (state, action) => {
                state.isLoading = false
                state.successMessage = action.payload
            })
            .addCase(sendVerificationEmail.rejected, (state, action) => {
                state.isLoading = false
                state.error = action.payload
            })
    },
})

export const { clearError, clearSuccess } = authSlice.actions
export default authSlice.reducer
