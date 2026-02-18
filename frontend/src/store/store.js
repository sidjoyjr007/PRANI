import { configureStore } from '@reduxjs/toolkit'
import toolReducer from './slices/toolSlice'
import authReducer from './slices/authSlice'
import llmReducer from './slices/llmSlice'
import mcpReducer from './slices/mcpSlice'

export const store = configureStore({
    reducer: {
        tools: toolReducer,
        auth: authReducer,
        llms: llmReducer,
        mcps: mcpReducer,
    },
})
