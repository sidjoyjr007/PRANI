import apiClient from './api'

const API_URL = '/guardrails'

const getGuardrails = async () => {
    const response = await apiClient.get(API_URL)
    return response.data
}

const createGuardrail = async (guardrailData) => {
    const response = await apiClient.post(API_URL + "/", guardrailData)
    return response.data
}

const getGuardrailById = async (id) => {
    const response = await apiClient.get(`${API_URL}/${id}`)
    return response.data
}

const updateGuardrail = async (id, guardrailData) => {
    const response = await apiClient.put(`${API_URL}/${id}`, guardrailData)
    return response.data
}

const deleteGuardrail = async (id) => {
    const response = await apiClient.delete(`${API_URL}/${id}`)
    return response.data
}

const syncAgentGuardrails = async (agentId, guardrailIds) => {
    const response = await apiClient.post(`${API_URL}/agent/${agentId}/link`, { guardrail_ids: guardrailIds })
    return response.data
}

const guardrailService = {
    getGuardrails,
    getGuardrailById,
    createGuardrail,
    updateGuardrail,
    deleteGuardrail,
    syncAgentGuardrails,
}

export default guardrailService
