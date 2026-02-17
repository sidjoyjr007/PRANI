import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { toolService } from '@/services/toolService'

export const fetchTools = createAsyncThunk(
    'tools/fetchTools',
    async ({ page = 1, size = 10, search = "" }, { rejectWithValue }) => {
        try {
            const response = await toolService.listTools({ page, size, search })
            return response
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to fetch tools')
        }
    }
)

export const fetchToolById = createAsyncThunk(
    'tools/fetchToolById',
    async (toolId, { rejectWithValue }) => {
        try {
            const tool = await toolService.getTool(toolId)
            return tool
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to fetch tool')
        }
    }
)

export const createTool = createAsyncThunk(
    'tools/createTool',
    async (toolData, { rejectWithValue }) => {
        try {
            const response = await toolService.createTool(toolData)
            return response
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to create tool')
        }
    }
)

export const updateTool = createAsyncThunk(
    'tools/updateTool',
    async ({ id, toolData }, { rejectWithValue }) => {
        try {
            const response = await toolService.updateTool(id, toolData)
            return response
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to update tool')
        }
    }
)

export const deleteTool = createAsyncThunk(
    'tools/deleteTool',
    async (id, { rejectWithValue }) => {
        try {
            await toolService.deleteTool(id)
            return id
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to delete tool')
        }
    }
)

const initialState = {
    items: [],
    total: 0,
    page: 1,
    size: 10,
    currentTool: null,
    isLoading: false,
    isSaving: false,
    error: null,
}

const toolSlice = createSlice({
    name: 'tools',
    initialState,
    reducers: {
        clearCurrentTool: (state) => {
            state.currentTool = null
        },
        setPage: (state, action) => {
            state.page = action.payload
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Tools List
            .addCase(fetchTools.pending, (state) => {
                state.isLoading = true
                state.error = null
            })
            .addCase(fetchTools.fulfilled, (state, action) => {
                state.isLoading = false
                state.items = action.payload.items
                state.total = action.payload.total
                state.page = action.payload.page
                state.size = action.payload.size
            })
            .addCase(fetchTools.rejected, (state, action) => {
                state.isLoading = false
                state.error = action.payload
            })

            // Fetch Single Tool
            .addCase(fetchToolById.pending, (state) => {
                state.isLoading = true
                state.error = null
                state.currentTool = null
            })
            .addCase(fetchToolById.fulfilled, (state, action) => {
                state.isLoading = false
                state.currentTool = action.payload
            })
            .addCase(fetchToolById.rejected, (state, action) => {
                state.isLoading = false
                state.error = action.payload
            })

            // Create Tool
            .addCase(createTool.pending, (state) => {
                state.isSaving = true
                state.error = null
            })
            .addCase(createTool.fulfilled, (state) => {
                state.isSaving = false
            })
            .addCase(createTool.rejected, (state, action) => {
                state.isSaving = false
                state.error = action.payload
            })

            // Update Tool
            .addCase(updateTool.pending, (state) => {
                state.isSaving = true
                state.error = null
            })
            .addCase(updateTool.fulfilled, (state) => {
                state.isSaving = false
            })
            .addCase(updateTool.rejected, (state, action) => {
                state.isSaving = false
                state.error = action.payload
            })

            // Delete Tool
            .addCase(deleteTool.fulfilled, (state, action) => {
                state.items = state.items.filter(item => item.id !== action.payload)
                state.total -= 1
                if (state.currentTool && state.currentTool.id === action.payload) {
                    state.currentTool = null
                }
            })
            .addCase(deleteTool.rejected, (state, action) => {
                state.error = action.payload
            })
    },
})

export const { clearCurrentTool, setPage } = toolSlice.actions
export default toolSlice.reducer
