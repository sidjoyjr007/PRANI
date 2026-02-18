import apiClient from "./api"

export const agentService = {
    // List agents with pagination and search
    listAgents: async ({ page = 1, size = 10, search = "" }) => {
        const params = { page, size }
        if (search) params.search = search

        const response = await apiClient.get("/agents/", { params })
        return response.data
    },

    // Get a single agent
    getAgent: async (id) => {
        const response = await apiClient.get(`/agents/${id}`)
        return response.data
    },

    // Create a new agent
    createAgent: async (agentData) => {
        const response = await apiClient.post("/agents/", agentData)
        return response.data
    },

    // Update an agent (PATCH - only changed fields)
    updateAgent: async (id, agentData) => {
        const response = await apiClient.patch(`/agents/${id}`, agentData)
        return response.data
    },

    // Delete an agent
    deleteAgent: async (id) => {
        await apiClient.delete(`/agents/${id}`)
    },
}
