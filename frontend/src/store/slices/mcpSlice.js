import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { mcpService } from '@/services/mcpService'

export const fetchMCPs = createAsyncThunk(
    'mcps/fetchMCPs',
    async ({ page = 1, size = 10, search = "" }, { rejectWithValue }) => {
        try {
            const response = await mcpService.listMCPs({ page, size, search })
            return response
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to fetch MCP Servers')
        }
    }
)

export const fetchMCPById = createAsyncThunk(
    'mcps/fetchMCPById',
    async (mcpId, { rejectWithValue }) => {
        try {
            const mcp = await mcpService.getMCP(mcpId)
            return mcp
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to fetch MCP Server')
        }
    }
)

export const createMCP = createAsyncThunk(
    'mcps/createMCP',
    async (mcpData, { rejectWithValue }) => {
        try {
            const response = await mcpService.createMCP(mcpData)
            return response
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to create MCP Server')
        }
    }
)

export const updateMCP = createAsyncThunk(
    'mcps/updateMCP',
    async ({ id, mcpData }, { rejectWithValue }) => {
        try {
            const response = await mcpService.updateMCP(id, mcpData)
            return response
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to update MCP Server')
        }
    }
)

export const deleteMCP = createAsyncThunk(
    'mcps/deleteMCP',
    async (id, { rejectWithValue }) => {
        try {
            await mcpService.deleteMCP(id)
            return id
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to delete MCP Server')
        }
    }
)

export const syncMCP = createAsyncThunk(
    'mcps/syncMCP',
    async (id, { rejectWithValue }) => {
        try {
            const response = await mcpService.syncMCP(id)
            return response
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to sync MCP Server')
        }
    }
)

const initialState = {
    items: [],
    total: 0,
    page: 1,
    size: 10,
    currentMCP: null,
    isLoading: false,
    isSaving: false,
    error: null,
}

const mcpSlice = createSlice({
    name: 'mcps',
    initialState,
    reducers: {
        clearCurrentMCP: (state) => {
            state.currentMCP = null
        },
        setPage: (state, action) => {
            state.page = action.payload
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch MCPs List
            .addCase(fetchMCPs.pending, (state) => {
                state.isLoading = true
                state.error = null
            })
            .addCase(fetchMCPs.fulfilled, (state, action) => {
                state.isLoading = false
                state.items = action.payload.items
                state.total = action.payload.total
                state.page = action.payload.page
                state.size = action.payload.size
            })
            .addCase(fetchMCPs.rejected, (state, action) => {
                state.isLoading = false
                state.error = action.payload
            })

            // Fetch Single MCP
            .addCase(fetchMCPById.pending, (state) => {
                state.isLoading = true
                state.error = null
                state.currentMCP = null
            })
            .addCase(fetchMCPById.fulfilled, (state, action) => {
                state.isLoading = false
                state.currentMCP = action.payload
            })
            .addCase(fetchMCPById.rejected, (state, action) => {
                state.isLoading = false
                state.error = action.payload
            })

            // Create MCP
            .addCase(createMCP.pending, (state) => {
                state.isSaving = true
                state.error = null
            })
            .addCase(createMCP.fulfilled, (state) => {
                state.isSaving = false
            })
            .addCase(createMCP.rejected, (state, action) => {
                state.isSaving = false
                state.error = action.payload
            })

            // Update MCP
            .addCase(updateMCP.pending, (state) => {
                state.isSaving = true
                state.error = null
            })
            .addCase(updateMCP.fulfilled, (state) => {
                state.isSaving = false
            })
            .addCase(updateMCP.rejected, (state, action) => {
                state.isSaving = false
                state.error = action.payload
            })

            // Delete MCP
            .addCase(deleteMCP.fulfilled, (state, action) => {
                state.items = state.items.filter(item => item.id !== action.payload)
                state.total -= 1
                if (state.currentMCP && state.currentMCP.id === action.payload) {
                    state.currentMCP = null
                }
            })
            .addCase(deleteMCP.rejected, (state, action) => {
                state.error = action.payload
            })
            
            // Sync MCP
            .addCase(syncMCP.pending, (state) => {
                state.isSaving = true
                state.error = null
            })
            .addCase(syncMCP.fulfilled, (state, action) => {
                state.isSaving = false
                const updatedMCP = action.payload
                // Update in list
                const idx = state.items.findIndex(item => item.id === updatedMCP.id)
                if (idx !== -1) {
                    state.items[idx] = updatedMCP
                }
                // Update current
                if (state.currentMCP && state.currentMCP.id === updatedMCP.id) {
                    state.currentMCP = updatedMCP
                }
            })
            .addCase(syncMCP.rejected, (state, action) => {
                state.isSaving = false
                state.error = action.payload
            })
    },
})

export const { clearCurrentMCP, setPage } = mcpSlice.actions
export default mcpSlice.reducer
