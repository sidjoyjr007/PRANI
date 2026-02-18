import apiClient from "./api"

export const mcpService = {
    // List MCPs with pagination and search
    listMCPs: async ({ page = 1, size = 10, search = "" }) => {
        const params = { page, size }
        if (search) params.search = search

        const response = await apiClient.get("/mcp-servers/", { params })
        return response.data
    },

    // Get a single MCP
    getMCP: async (id) => {
        const response = await apiClient.get(`/mcp-servers/${id}`)
        return response.data
    },

    // Create a new MCP
    createMCP: async (mcpData) => {
        const response = await apiClient.post("/mcp-servers/", mcpData)
        return response.data
    },

    // Update an MCP
    updateMCP: async (id, mcpData) => {
        const response = await apiClient.put(`/mcp-servers/${id}`, mcpData)
        return response.data
    },

    // Delete an MCP
    deleteMCP: async (id) => {
        await apiClient.delete(`/mcp-servers/${id}`)
    },

    // Test MCP connection
    testMCP: async (testData) => {
        const response = await apiClient.post("/mcp-servers/test", testData)
        return response.data
    }
}
