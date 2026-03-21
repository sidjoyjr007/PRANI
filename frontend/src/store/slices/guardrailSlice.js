import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import guardrailService from '../../services/guardrailService'

export const fetchGuardrails = createAsyncThunk(
  'guardrails/fetchAll',
  async (_, thunkAPI) => {
    try {
      return await guardrailService.getGuardrails()
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.detail || error.message)
    }
  }
)

export const createGuardrail = createAsyncThunk(
  'guardrails/create',
  async (guardrailData, thunkAPI) => {
    try {
      return await guardrailService.createGuardrail(guardrailData)
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.detail || error.message)
    }
  }
)

export const fetchGuardrailById = createAsyncThunk(
  'guardrails/fetchById',
  async (id, thunkAPI) => {
    try {
      return await guardrailService.getGuardrailById(id)
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.detail || error.message)
    }
  }
)

export const updateGuardrail = createAsyncThunk(
  'guardrails/update',
  async ({ id, guardrailData }, thunkAPI) => {
    try {
      return await guardrailService.updateGuardrail(id, guardrailData)
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.detail || error.message)
    }
  }
)

export const deleteGuardrail = createAsyncThunk(
  'guardrails/delete',
  async (id, thunkAPI) => {
    try {
      await guardrailService.deleteGuardrail(id)
      return id
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.detail || error.message)
    }
  }
)

const guardrailSlice = createSlice({
  name: 'guardrails',
  initialState: {
    items: [],
    isLoading: false,
    isSaving: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchGuardrails.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchGuardrails.fulfilled, (state, action) => {
        state.isLoading = false
        state.items = action.payload
      })
      .addCase(fetchGuardrails.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      .addCase(createGuardrail.pending, (state) => {
        state.isSaving = true
        state.error = null
      })
      .addCase(createGuardrail.fulfilled, (state, action) => {
        state.isSaving = false
        state.items.push(action.payload)
      })
      .addCase(createGuardrail.rejected, (state, action) => {
        state.isSaving = false
        state.error = action.payload
      })
      .addCase(fetchGuardrailById.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchGuardrailById.fulfilled, (state) => {
        state.isLoading = false
      })
      .addCase(fetchGuardrailById.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      .addCase(updateGuardrail.pending, (state) => {
        state.isSaving = true
        state.error = null
      })
      .addCase(updateGuardrail.fulfilled, (state, action) => {
        state.isSaving = false
        state.items = state.items.map(item => item.id === action.payload.id ? action.payload : item)
      })
      .addCase(updateGuardrail.rejected, (state, action) => {
        state.isSaving = false
        state.error = action.payload
      })
      .addCase(deleteGuardrail.pending, (state) => {
        state.isSaving = true
        state.error = null
      })
      .addCase(deleteGuardrail.fulfilled, (state, action) => {
        state.isSaving = false
        state.items = state.items.filter(item => item.id !== action.payload)
      })
      .addCase(deleteGuardrail.rejected, (state, action) => {
        state.isSaving = false
        state.error = action.payload
      })
  },
})

export default guardrailSlice.reducer
