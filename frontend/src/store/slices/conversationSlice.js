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

const transformMessage = (msg) => {
    const role = msg.role;
    const content = msg.content;
    let text = "";
    let thoughts = [];
    let tool_calls = [];
    let status = "";

    if (typeof content === 'string') {
        text = content;
    } else if (content && typeof content === 'object') {
        text = content.text || "";
        thoughts = content.thoughts || [];
        tool_calls = content.tool_calls || [];
        status = content.status || "";
    }

    return {
        ...msg,
        sender: role === 'user' ? 'user' : 'bot',
        text,
        thoughts,
        tool_calls,
        status,
        error: msg.error || null
    };
};

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
            state.messages.push(transformMessage(action.payload))
        },
        handleAgentEvent: (state, action) => {
            const { type, content, metadata, id } = action.payload;
            const messages = state.messages;
            let lastMsg = messages[messages.length - 1];

            // Ensure we have a working bot message
            if (!lastMsg || lastMsg.sender !== 'bot') {
                lastMsg = {
                    sender: 'bot',
                    text: '',
                    thoughts: [],
                    tool_calls: [],
                    created_at: new Date().toISOString()
                };
                messages.push(lastMsg);
            }

            switch (type) {
                case 'status':
                    if (content) {
                        lastMsg.status = content;
                    }
                    break;
                case 'message':
                    lastMsg.text += content;
                    break;
                case 'thought_start':
                case 'thought':
                    if (content) {
                        lastMsg.thoughts = lastMsg.thoughts || [];
                        lastMsg.thoughts.push(content);
                    }
                    break;
                case 'tool_start':
                    lastMsg.tool_calls = lastMsg.tool_calls || [];
                    lastMsg.tool_calls.push({
                        name: metadata.tool,
                        args: metadata.args,
                        status: 'running',
                        output: null
                    });
                    break;
                case 'tool_output':
                    if (lastMsg.tool_calls && lastMsg.tool_calls.length > 0) {
                        const toolCall = lastMsg.tool_calls[lastMsg.tool_calls.length - 1];
                        toolCall.status = 'completed';
                        toolCall.output = content;
                    }
                    break;
                case 'approval_required':
                    lastMsg.approval_required = true;
                    lastMsg.pending_tool_calls = metadata.tool_calls;
                    break;
                case 'error':
                    lastMsg.error = content;
                    break;
                default:
                    break;
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
                    state.messages = action.payload.messages.map(transformMessage)
                }
            })

            // Send Message
            .addCase(sendMessage.fulfilled, (state, action) => {
                // Remove the optimistic message or replace it with the real one
                // For simplicity, let's just push the transformed real one
                state.messages.push(transformMessage(action.payload))
            })
    },
})

export const { setCurrentConversationId, clearMessages, addMessage, handleAgentEvent } = conversationSlice.actions
export default conversationSlice.reducer
