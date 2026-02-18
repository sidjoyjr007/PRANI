import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { agentService } from '@/services/agentService';

// Async thunks
export const fetchAgents = createAsyncThunk(
    'agents/fetchAgents',
    async ({ page = 1, size = 10, search = '' } = {}, { rejectWithValue }) => {
        try {
            const response = await agentService.listAgents({ page, size, search })
            return response
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to fetch agents');
        }
    }
);

export const fetchAgent = createAsyncThunk(
    'agents/fetchAgent',
    async (id, { rejectWithValue }) => {
        try {
            const response = await agentService.getAgent(id)
            return response
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to fetch agent');
        }
    }
);

export const createAgent = createAsyncThunk(
    'agents/createAgent',
    async (agentData, { rejectWithValue }) => {
        try {
            const response = await agentService.createAgent(agentData)
            return response
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to create agent');
        }
    }
);

export const updateAgent = createAsyncThunk(
    'agents/updateAgent',
    async ({ id, agentData }, { rejectWithValue }) => {
        try {
            const response = await agentService.updateAgent(id, agentData)
            return response
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to update agent');
        }
    }
);

export const deleteAgent = createAsyncThunk(
    'agents/deleteAgent',
    async (id, { rejectWithValue }) => {
        try {
            await agentService.deleteAgent(id)
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to delete agent');
        }
    }
);

const initialState = {
    items: [],
    total: 0,
    page: 1,
    size: 10,
    currentAgent: null,
    isLoading: false,
    isSaving: false,
    error: null,
};

const agentSlice = createSlice({
    name: 'agents',
    initialState,
    reducers: {
        clearCurrentAgent: (state) => {
            state.currentAgent = null;
        },
        setPage: (state, action) => {
            state.page = action.payload;
        },
        setSearchQuery: (state, action) => {
            state.searchQuery = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Agents List
            .addCase(fetchAgents.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchAgents.fulfilled, (state, action) => {
                state.isLoading = false;
                state.items = action.payload.items;
                state.total = action.payload.total;
                state.page = action.payload.page;
                state.size = action.payload.size;
            })
            .addCase(fetchAgents.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })

            // Fetch Single Agent
            .addCase(fetchAgent.pending, (state) => {
                state.isLoading = true;
                state.error = null;
                state.currentAgent = null;
            })
            .addCase(fetchAgent.fulfilled, (state, action) => {
                state.isLoading = false;
                state.currentAgent = action.payload;
            })
            .addCase(fetchAgent.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })

            // Create Agent
            .addCase(createAgent.pending, (state) => {
                state.isSaving = true;
                state.error = null;
            })
            .addCase(createAgent.fulfilled, (state) => {
                state.isSaving = false;
            })
            .addCase(createAgent.rejected, (state, action) => {
                state.isSaving = false;
                state.error = action.payload;
            })

            // Update Agent
            .addCase(updateAgent.pending, (state) => {
                state.isSaving = true;
                state.error = null;
            })
            .addCase(updateAgent.fulfilled, (state) => {
                state.isSaving = false;
            })
            .addCase(updateAgent.rejected, (state, action) => {
                state.isSaving = false;
                state.error = action.payload;
            })

            // Delete Agent
            .addCase(deleteAgent.fulfilled, (state, action) => {
                state.items = state.items.filter(item => item.id !== action.payload);
                state.total -= 1;
                if (state.currentAgent && state.currentAgent.id === action.payload) {
                    state.currentAgent = null;
                }
            })
            .addCase(deleteAgent.rejected, (state, action) => {
                state.error = action.payload;
            });
    },
});

export const { clearCurrentAgent, setPage, setSearchQuery } = agentSlice.actions;
export default agentSlice.reducer;
