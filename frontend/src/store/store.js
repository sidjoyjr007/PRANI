import { configureStore } from '@reduxjs/toolkit'
import toolReducer from './slices/toolSlice'
import authReducer from './slices/authSlice'
import llmReducer from './slices/llmSlice'

export const store = configureStore({
    reducer: {
        tools: toolReducer,
        auth: authReducer,
        llms: llmReducer,
    },
})
