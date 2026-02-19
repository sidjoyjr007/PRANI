import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import apiClient from "@/services/api"

// Async Thunks
export const fetchConversations = createAsyncThunk("conversations/fetchAll", async () => {
    const response = await apiClient.get("/conversations")
    return response.data
})

export const createConversation = createAsyncThunk("conversations/create", async ({ title, agent_id }) => {
    const response = await apiClient.post("/conversations", { title, agent_id })
    return response.data
})

export const updateConversation = createAsyncThunk("conversations/update", async ({ id, title, agent_id }) => {
    const response = await apiClient.patch(`/conversations/${id}`, { title, agent_id })
    return response.data
})

export const deleteConversation = createAsyncThunk("conversations/delete", async (id) => {
    await apiClient.delete(`/conversations/${id}`)
    return id
})

export const fetchMessages = createAsyncThunk("conversations/fetchMessages", async (conversationId) => {
    const response = await apiClient.get(`/conversations/${conversationId}/messages`)
    return { conversationId, messages: response.data }
})

export const sendMessage = createAsyncThunk("conversations/sendMessage", async ({ conversationId, role, content }) => {
    const response = await apiClient.post(`/conversations/${conversationId}/messages`, { role, content })
    return response.data
})

const conversationSlice = createSlice({
    name: "conversations",
    initialState: {
        list: [],
        messages: [],
        currentConversationId: null,
        loading: false,
        error: null,
    },
    reducers: {
        setCurrentConversationId: (state, action) => {
            state.currentConversationId = action.payload
            state.messages = []
        },
        clearMessages: (state) => {
            state.messages = []
        },
        addMessage: (state, action) => {
            // Optimistically add message
            state.messages.push(action.payload)
        },
        updateStreamingMessage: (state, action) => {
            // Payload: { content: string, role: string }
            // Assumes the last message is the one being streamed if role matches, 
            // or creates a new one if last message is from user.
            const lastMsg = state.messages[state.messages.length - 1]
            if (lastMsg && lastMsg.role === action.payload.role) {
                // Append content
                lastMsg.content += action.payload.content
            } else {
                // New message
                state.messages.push({
                    role: action.payload.role,
                    content: action.payload.content,
                    created_at: new Date().toISOString() // temporary
                })
            }
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Conversations
            .addCase(fetchConversations.pending, (state) => {
                state.loading = true
            })
            .addCase(fetchConversations.fulfilled, (state, action) => {
                state.loading = false
                state.list = action.payload
            })
            .addCase(fetchConversations.rejected, (state, action) => {
                state.loading = false
                state.error = action.error.message
            })

            // Create Conversation
            .addCase(createConversation.fulfilled, (state, action) => {
                state.list.unshift(action.payload)
                state.currentConversationId = action.payload.id
            })

            // Update Conversation
            .addCase(updateConversation.fulfilled, (state, action) => {
                const index = state.list.findIndex(c => c.id === action.payload.id)
                if (index !== -1) {
                    state.list[index] = action.payload
                }
            })

            // Delete Conversation
            .addCase(deleteConversation.fulfilled, (state, action) => {
                state.list = state.list.filter(c => c.id !== action.payload)
                if (state.currentConversationId === action.payload) {
                    state.currentConversationId = null
                    state.messages = []
                }
            })

            // Fetch Messages
            .addCase(fetchMessages.fulfilled, (state, action) => {
                if (state.currentConversationId === action.payload.conversationId) {
                    state.messages = action.payload.messages
                }
            })

            // Send Message
            .addCase(sendMessage.fulfilled, (state, action) => {
                state.messages.push(action.payload)
                // Update conversation list item updated_at? 
                // We'd ideally need to re-fetch or optimistically update the list order
            })
    },
})

export const { setCurrentConversationId, clearMessages, addMessage, updateStreamingMessage } = conversationSlice.actions
export default conversationSlice.reducer
