import { configureStore } from '@reduxjs/toolkit'
import toolReducer from './slices/toolSlice' // Adjust path if necessary
import authReducer from './slices/authSlice'

export const store = configureStore({
    reducer: {
        tools: toolReducer,
        auth: authReducer,
    },
})
