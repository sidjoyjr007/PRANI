import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { llmService } from '@/services/llmService'

export const fetchLLMs = createAsyncThunk(
    'llms/fetchLLMs',
    async ({ page = 1, size = 10, search = "" }, { rejectWithValue }) => {
        try {
            const response = await llmService.listLLMs({ page, size, search })
            return response
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to fetch LLMs')
        }
    }
)

export const fetchLLMById = createAsyncThunk(
    'llms/fetchLLMById',
    async (llmId, { rejectWithValue }) => {
        try {
            const llm = await llmService.getLLM(llmId)
            return llm
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to fetch LLM')
        }
    }
)

export const createLLM = createAsyncThunk(
    'llms/createLLM',
    async (llmData, { rejectWithValue }) => {
        try {
            const response = await llmService.createLLM(llmData)
            return response
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to create LLM')
        }
    }
)

export const updateLLM = createAsyncThunk(
    'llms/updateLLM',
    async ({ id, llmData }, { rejectWithValue }) => {
        try {
            const response = await llmService.updateLLM(id, llmData)
            return response
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to update LLM')
        }
    }
)

export const deleteLLM = createAsyncThunk(
    'llms/deleteLLM',
    async (id, { rejectWithValue }) => {
        try {
            await llmService.deleteLLM(id)
            return id
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Failed to delete LLM')
        }
    }
)

const initialState = {
    items: [],
    total: 0,
    page: 1,
    size: 10,
    currentLLM: null,
    isLoading: false,
    isSaving: false,
    error: null,
}

const llmSlice = createSlice({
    name: 'llms',
    initialState,
    reducers: {
        clearCurrentLLM: (state) => {
            state.currentLLM = null
        },
        setPage: (state, action) => {
            state.page = action.payload
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch LLMs List
            .addCase(fetchLLMs.pending, (state) => {
                state.isLoading = true
                state.error = null
            })
            .addCase(fetchLLMs.fulfilled, (state, action) => {
                state.isLoading = false
                state.items = action.payload.items
                state.total = action.payload.total
                state.page = action.payload.page
                state.size = action.payload.size
            })
            .addCase(fetchLLMs.rejected, (state, action) => {
                state.isLoading = false
                state.error = action.payload
            })

            // Fetch Single LLM
            .addCase(fetchLLMById.pending, (state) => {
                state.isLoading = true
                state.error = null
                state.currentLLM = null
            })
            .addCase(fetchLLMById.fulfilled, (state, action) => {
                state.isLoading = false
                state.currentLLM = action.payload
            })
            .addCase(fetchLLMById.rejected, (state, action) => {
                state.isLoading = false
                state.error = action.payload
            })

            // Create LLM
            .addCase(createLLM.pending, (state) => {
                state.isSaving = true
                state.error = null
            })
            .addCase(createLLM.fulfilled, (state) => {
                state.isSaving = false
            })
            .addCase(createLLM.rejected, (state, action) => {
                state.isSaving = false
                state.error = action.payload
            })

            // Update LLM
            .addCase(updateLLM.pending, (state) => {
                state.isSaving = true
                state.error = null
            })
            .addCase(updateLLM.fulfilled, (state) => {
                state.isSaving = false
            })
            .addCase(updateLLM.rejected, (state, action) => {
                state.isSaving = false
                state.error = action.payload
            })

            // Delete LLM
            .addCase(deleteLLM.fulfilled, (state, action) => {
                state.items = state.items.filter(item => item.id !== action.payload)
                state.total -= 1
                if (state.currentLLM && state.currentLLM.id === action.payload) {
                    state.currentLLM = null
                }
            })
            .addCase(deleteLLM.rejected, (state, action) => {
                state.error = action.payload
            })
    },
})

export const { clearCurrentLLM, setPage } = llmSlice.actions
export default llmSlice.reducer
