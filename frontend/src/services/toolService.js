import apiClient from "./api"

export const toolService = {
    // List tools with pagination and search
    listTools: async ({ page = 1, size = 10, search = "" }) => {
        const params = { page, size }
        if (search) params.search = search

        const response = await apiClient.get("/tools/", { params })
        return response.data
    },

    // Get a single tool
    getTool: async (id) => {
        const response = await apiClient.get(`/tools/${id}`)
        return response.data
    },

    // Create a new tool
    createTool: async (toolData) => {
        const response = await apiClient.post("/tools/", toolData)
        return response.data
    },

    // Update a tool
    updateTool: async (id, toolData) => {
        const response = await apiClient.patch(`/tools/${id}`, toolData)
        return response.data
    },

    // Delete a tool
    deleteTool: async (id) => {
        await apiClient.delete(`/tools/${id}`)
    },

    // Save tool secret
    saveSecret: async (id, name, value) => {
        const response = await apiClient.post(`/tools/${id}/secrets`, { name, value })
        return response.data
    },

    // Test tool
    testTool: async (id, inputData) => {
        const response = await apiClient.post(`/tools/${id}/test`, { input_data: inputData })
        return response.data
    }
}
