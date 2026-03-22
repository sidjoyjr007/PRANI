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

export const fetchPlan = createAsyncThunk("conversations/fetchPlan", async (conversationId) => {
    const response = await apiClient.get(`/conversations/${conversationId}/state`)
    return { conversationId, plan: response.data.plan, agent_state: response.data.agent_state }
})

export const sendMessage = createAsyncThunk("conversations/sendMessage", async ({ conversationId, role, content }) => {
    const response = await apiClient.post(`/conversations/${conversationId}/messages`, { role, content })
    return response.data
})

export const abortExecution = createAsyncThunk("conversations/abort", async (conversationId) => {
    const response = await apiClient.post(`/conversations/${conversationId}/abort`)
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
        // Refresh Resilience: If tool calls exist in history but have no status, they are 'completed'
        tool_calls = (content.tool_calls || []).map(tc => {
            const tcName = tc.name || (tc.function ? tc.function.name : "unknown");
            const tcArgs = tc.args || (tc.function ? tc.function.arguments : "{}");
            return {
                ...tc,
                name: tcName,
                args: tcArgs,
                status: tc.status || 'completed'
            };
        });
        status = content.status || "";
    }

    return {
        ...msg,
        sender: role === 'user' ? 'user' : 'bot',
        text,
        thoughts,
        tool_calls,
        status,
        run_id: msg.run_id || msg.metadata?.run_id || null,
        error: msg.error || null
    };
};

const conversationSlice = createSlice({
    name: "conversations",
    initialState: {
        list: [],
        messages: [],
        currentPlan: null,
        agentState: "IDLE",
        currentConversationId: null,
        loading: false,
        error: null,
    },
    reducers: {
        setCurrentConversationId: (state, action) => {
            state.currentConversationId = action.payload
            state.messages = []
            state.currentPlan = null
            state.agentState = "IDLE"
        },
        clearMessages: (state) => {
            state.messages = []
        },
        addMessage: (state, action) => {
            // Optimistically add message
            state.messages.push(transformMessage(action.payload))
        },
        handleAgentEvent: (state, action) => {
            const { type, content, metadata, id, run_id } = action.payload;
            const messages = state.messages;
            let lastMsg = messages[messages.length - 1];

            // --- Turn Separation / Merging Logic ---
            // We create a NEW bot message ONLY if:
            // 1. There is no last message.
            // 2. The last message is from the user.
            // 3. The incoming event has a DIFFERENT run_id than the last bot message.
            //    This is CRITICAL for separate approval phases in back-to-back tool calls.

            const isBotToBotSameRun = lastMsg && lastMsg.sender === 'bot' && (!run_id || lastMsg.run_id === run_id);
            const isNewTurn = !lastMsg || lastMsg.sender !== 'bot' || !isBotToBotSameRun;

            if (isNewTurn) {
                lastMsg = {
                    id: id || Date.now().toString(),
                    sender: 'bot',
                    text: '',
                    thoughts: [],
                    tool_calls: [],
                    run_id: run_id,
                    created_at: new Date().toISOString()
                };
                messages.push(lastMsg);
            }

            // Always sync the run_id if provided
            if (run_id && !lastMsg.run_id) {
                lastMsg.run_id = run_id;
            }

            switch (type) {
                case 'status':
                    if (content) {
                        lastMsg.status = content;
                    }
                    break;
                case 'message':
                    if (content) {
                        // Clear transient status immediately
                        lastMsg.status = "";

                        // Content Interceptor: Final safety check for JSON leaks in the frontend
                        if (content.trim().startsWith('{') || content.trim().startsWith('[')) {
                            lastMsg.text = "";
                            lastMsg.thoughts.push(`[System Trace] Blocked JSON leak: ${content.substring(0, 50)}...`);
                        } else {
                            lastMsg.text = content.trim();
                        }
                    }
                    break;
                case 'message_chunk':
                    // Chunks are additive, but we strip mirror artifacts
                    if (!content.includes('"tool_calls"') && !content.includes('{"')) {
                        lastMsg.text += content;
                        // Clear transient status once we start streaming real content
                        lastMsg.status = "";
                    }
                    break;
                case 'thought_start':
                    lastMsg.thoughts = lastMsg.thoughts || [];
                    lastMsg.thoughts.push(content || "");
                    break;
                case 'thought':
                    if (content) {
                        lastMsg.thoughts = lastMsg.thoughts || [];
                        // If the last thought is what we just received, don't double-push
                        if (lastMsg.thoughts.length > 0 && lastMsg.thoughts[lastMsg.thoughts.length - 1] === content) {
                            // already synced via chunks
                        } else {
                            lastMsg.thoughts.push(content);
                        }
                    }
                    break;
                case 'thought_chunk':
                    // Chunks are additive
                    lastMsg.thoughts = lastMsg.thoughts || [];
                    if (lastMsg.thoughts.length === 0) {
                        lastMsg.thoughts.push(content);
                    } else if (lastMsg.thoughts[lastMsg.thoughts.length - 1] === "Thinking...") {
                        lastMsg.thoughts[lastMsg.thoughts.length - 1] = content;
                    } else {
                        lastMsg.thoughts[lastMsg.thoughts.length - 1] += content;
                    }
                    break;
                case 'tool_start':
                    lastMsg.tool_calls = lastMsg.tool_calls || [];
                    lastMsg.tool_calls.push({
                        name: metadata.tool,
                        args: metadata.args || "{}",
                        status: 'running',
                        output: null
                    });
                    break;
                case 'tool_output':
                    if (lastMsg.tool_calls && lastMsg.tool_calls.length > 0) {
                        // Find the corresponding tool call by name (most recent if multiple)
                        const toolCall = [...lastMsg.tool_calls].reverse().find(tc => tc.name === metadata.tool);
                        if (toolCall) {
                            toolCall.status = metadata?.is_error ? 'error' : 'completed';
                            toolCall.output = content;
                        }
                    } else if (lastMsg && !lastMsg.tool_calls) {
                        // Emergency fallback for out-of-order events
                        lastMsg.tool_calls = [{ name: metadata.tool, status: metadata?.is_error ? 'error' : 'completed', output: content }];
                    }
                    break;
                case 'approval_required':
                    lastMsg.approval_required = true;
                    lastMsg.pending_tool_calls = metadata.tool_calls;
                    break;
                case 'error':
                    lastMsg.error = content;
                    lastMsg.status = 'Aborted/Error';
                    // clear any transient progress
                    if (!lastMsg.text) {
                        lastMsg.thoughts = [];
                        lastMsg.tool_calls = [];
                    }
                    state.currentPlan = null; // Clear plan on error/abort
                    break;
                case 'plan':
                    if (content !== undefined && typeof content === 'string') {
                        state.currentPlan = content;
                    } else if (metadata && metadata.plan) {
                        if (metadata.plan.version === 'v1_markdown') {
                            state.currentPlan = metadata.plan.content;
                        } else {
                            state.currentPlan = metadata.plan;
                        }
                    }
                    break;
                case 'loop_complete':
                    // Clear any lingering status (Thinking, Working, etc.)
                    lastMsg.status = "";
                    state.currentPlan = null; // Clear plan on completion
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
                    const rawMessages = action.payload.messages;
                    
                    // Create a lookup for tool_call_id -> { display, is_error, output }
                    const toolMetaMap = {};
                    rawMessages.forEach(m => {
                        if (m.role === 'tool' && m.content) {
                            const tcId = m.content.tool_call_id || m.tool_call_id;
                            if (tcId) {
                                const outputStr = m.content.text || (typeof m.content === 'string' ? m.content : JSON.stringify(m.content));
                                const is_error = m.content.is_error === true || outputStr.startsWith("Error");
                                const display = m.content.display !== false;
                                toolMetaMap[tcId] = { display, is_error, output: outputStr };
                            }
                        }
                    });

                    state.messages = rawMessages.map(msg => {
                        const transformed = transformMessage(msg);
                        if (transformed.tool_calls) {
                            transformed.tool_calls = transformed.tool_calls.map(tc => {
                                const meta = toolMetaMap[tc.id];
                                if (meta) {
                                    return { 
                                        ...tc, 
                                        display: meta.display,
                                        status: meta.is_error ? 'error' : (tc.status || 'completed'),
                                        output: meta.is_error ? meta.output : (tc.output || null)
                                    };
                                }
                                return tc;
                            });
                        }
                        return transformed;
                    });
                }
            })

            // Send Message
            .addCase(sendMessage.fulfilled, (state, action) => {
                // Remove the optimistic message or replace it with the real one
                // For simplicity, let's just push the transformed real one
                state.messages.push(transformMessage(action.payload))
            })

            // Fetch Plan / State
            .addCase(fetchPlan.fulfilled, (state, action) => {
                if (state.currentConversationId === action.payload.conversationId) {
                    const planData = action.payload.plan;
                    if (planData && planData.version === 'v1_markdown') {
                        state.currentPlan = planData.content;
                    } else {
                        state.currentPlan = planData;
                    }
                    state.agentState = action.payload.agent_state;

                    // Optimistically set message state if awaiting approval
                    if (action.payload.agent_state === "AWAITING_APPROVAL" && state.messages.length > 0) {
                        const last = state.messages[state.messages.length - 1];
                        if (last.sender === 'bot') {
                            last.approval_required = true;
                        }
                    }
                }
            })
    },
})

export const { setCurrentConversationId, clearMessages, addMessage, handleAgentEvent } = conversationSlice.actions
export default conversationSlice.reducer
