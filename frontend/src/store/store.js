import { configureStore } from '@reduxjs/toolkit'
import toolReducer from './slices/toolSlice'
import authReducer from './slices/authSlice'
import llmReducer from './slices/llmSlice'
import mcpReducer from './slices/mcpSlice'
import agentReducer from './slices/agentSlice'
import conversationReducer from './slices/conversationSlice'

export const store = configureStore({
    reducer: {
        tools: toolReducer,
        auth: authReducer,
        llms: llmReducer,
        mcps: mcpReducer,
        agents: agentReducer,
        conversations: conversationReducer,
    },
})
