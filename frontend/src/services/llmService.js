import apiClient from "./api"

export const llmService = {
    // List LLMs with pagination and search
    listLLMs: async ({ page = 1, size = 10, search = "" }) => {
        const params = { page, size }
        if (search) params.search = search

        const response = await apiClient.get("/llms/", { params })
        return response.data
    },

    // Get a single LLM
    getLLM: async (id) => {
        const response = await apiClient.get(`/llms/${id}`)
        return response.data
    },

    // Create a new LLM
    createLLM: async (llmData) => {
        const response = await apiClient.post("/llms/", llmData)
        return response.data
    },

    // Update an LLM
    updateLLM: async (id, llmData) => {
        const response = await apiClient.put(`/llms/${id}`, llmData)
        return response.data
    },

    // Delete an LLM
    deleteLLM: async (id) => {
        await apiClient.delete(`/llms/${id}`)
    },

    // Test LLM connection
    testLLM: async (testData) => {
        const response = await apiClient.post("/llms/test", testData)
        return response.data
    }
}
