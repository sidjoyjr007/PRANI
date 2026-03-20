import apiClient from "./api"

export const deploymentService = {
    // List deployments with pagination
    listDeployments: async ({ page = 1, size = 10, search = "" }) => {
        const params = { page, size, search }
        const response = await apiClient.get("/deployments/", { params })
        return response.data
    },

    // Get a single deployment
    getDeployment: async (id) => {
        const response = await apiClient.get(`/deployments/${id}`)
        return response.data
    },

    // List runs for a deployment
    listDeploymentRuns: async (id) => {
        const response = await apiClient.get(`/deployments/${id}/runs`)
        return response.data
    },

    // Create a new deployment
    createDeployment: async (deploymentData) => {
        const response = await apiClient.post("/deployments/", deploymentData)
        return response.data
    },

    // Update an deployment (PATCH - only changed fields)
    updateDeployment: async (id, deploymentData) => {
        const response = await apiClient.patch(`/deployments/${id}`, deploymentData)
        return response.data
    },

    // Delete an deployment
    deleteDeployment: async (id) => {
        await apiClient.delete(`/deployments/${id}`)
    },
    
    // Trigger deployment via webhook (requires API key for API-type deployments)
    triggerDeployment: async (id, apiKey = null, runInput = null) => {
        const headers = apiKey ? { "x-api-key": apiKey } : {}
        const body = runInput ? { run_input: runInput } : {}
        const response = await apiClient.post(`/deployments/${id}/trigger`, body, { headers })
        return response.data
    },

    // Admin "Run Now" trigger - uses session auth, no API key needed
    triggerDeploymentNow: async (id, runInput = null) => {
        const body = runInput ? { run_input: runInput } : {}
        const response = await apiClient.post(`/deployments/${id}/run-now`, body)
        return response.data
    }
}
