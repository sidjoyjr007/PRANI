import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useTheme } from "@/context/ThemeContext"
import Layout from "@/components/Layout"
import Container from "@/components/Container"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Text } from "@/components/ui/text"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Chips } from "@/components/ui/chips"
import { Toggle } from "@/components/ui/toggle"
import { Combobox, ComboboxTrigger, ComboboxContent, ComboboxItem, ComboboxSearch } from "@/components/ui/combobox"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { ChevronLeft, Check } from "lucide-react"
import CapabilitiesInput from "@/components/CapabilitiesInput"

// Mock data
const MOCK_TOOLS = [
  { id: 1, name: "Web Search", label: "Web Search", value: 1 },
  { id: 2, name: "Code Executor", label: "Code Executor", value: 2 },
  { id: 3, name: "File Manager", label: "File Manager", value: 3 },
  { id: 4, name: "API Caller", label: "API Caller", value: 4 },
  { id: 5, name: "Data Analyzer", label: "Data Analyzer", value: 5 },
  { id: 6, name: "Image Processor", label: "Image Processor", value: 6 },
  { id: 7, name: "PDF Generator", label: "PDF Generator", value: 7 },
  { id: 8, name: "Email Service", label: "Email Service", value: 8 },
  { id: 9, name: "Database Manager", label: "Database Manager", value: 9 },
  { id: 10, name: "Authentication", label: "Authentication", value: 10 },
]

const MOCK_MCP_SERVERS = [
  { id: 1, name: "Local Server", label: "Local Server", value: 1 },
  { id: 2, name: "Cloud Server", label: "Cloud Server", value: 2 },
  { id: 3, name: "Database Server", label: "Database Server", value: 3 },
  { id: 4, name: "API Server", label: "API Server", value: 4 },
]

const LLM_MODELS = [
  { value: "gpt-4", label: "GPT-4" },
  { value: "gpt-3.5", label: "GPT-3.5 Turbo" },
  { value: "claude-2", label: "Claude 2" },
  { value: "gemini", label: "Google Gemini" },
]

// Mock agents data for editing
const MOCK_AGENTS = [
  {
    id: 1,
    name: "Research Agent",
    description: "Handles research tasks and data analysis with multiple tools",
    capabilities: ["research", "analysis", "documentation"],
    toolIds: [1, 5],
    mcpServerIds: [1],
    humanInLoop: true,
    llmConfig: "gpt-4",
  },
  {
    id: 2,
    name: "Developer Agent",
    description: "Writes and executes code with debugging capabilities",
    capabilities: ["code", "execution", "debugging"],
    toolIds: [2, 4],
    mcpServerIds: [3],
    humanInLoop: false,
    llmConfig: "gpt-4",
  },
  {
    id: 3,
    name: "Data Processing Agent",
    description: "Processes and analyzes large datasets",
    capabilities: ["data", "processing", "analysis"],
    toolIds: [5, 3],
    mcpServerIds: [2],
    humanInLoop: false,
    llmConfig: "gpt-3.5",
  },
  {
    id: 4,
    name: "Content Creator Agent",
    description: "Creates and manages content across platforms",
    capabilities: ["content", "writing", "management"],
    toolIds: [1, 8],
    mcpServerIds: [1, 2],
    humanInLoop: true,
    llmConfig: "claude-2",
  },
  {
    id: 5,
    name: "API Integration Agent",
    description: "Handles API calls and integrations",
    capabilities: ["api", "integration", "networking"],
    toolIds: [4, 9],
    mcpServerIds: [3],
    humanInLoop: false,
    llmConfig: "gpt-4",
  },
  {
    id: 6,
    name: "File Management Agent",
    description: "Manages files and documents efficiently",
    capabilities: ["file", "management", "organization"],
    toolIds: [3, 7],
    mcpServerIds: [2],
    humanInLoop: false,
    llmConfig: "gpt-3.5",
  },
]

/**
 * CreateAgentPage Component
 * Main page for creating and editing agents using existing UI components
 */
export default function CreateAgentPage() {
  const theme = useTheme()
  const navigate = useNavigate()
  const { agentId } = useParams()

  const [agentData, setAgentData] = useState({
    id: null,
    name: "",
    description: "",
    capabilities: [],
    toolIds: [],
    mcpServerIds: [],
    humanInLoop: false,
    llmConfig: "gpt-4",
  })

  const [isLoading, setIsLoading] = useState(!!agentId)
  const [isSaving, setIsSaving] = useState(false)
  const [errors, setErrors] = useState({})

  // Load agent data if editing
  useEffect(() => {
    if (agentId) {
      const agent = MOCK_AGENTS.find(a => a.id === parseInt(agentId))
      if (agent) {
        setAgentData(agent)
      } else {
        alert("Agent not found")
        navigate("/agents")
      }
      setIsLoading(false)
    }
  }, [agentId, navigate])

  // Validation function
  const validateAgentData = () => {
    const newErrors = {}

    if (!agentData.name || agentData.name.trim().length < 3) {
      newErrors.name = "Agent name must be at least 3 characters"
    }

    if (!agentData.description || agentData.description.trim().length < 10) {
      newErrors.description = "Description must be at least 10 characters"
    }

    if (!agentData.capabilities || agentData.capabilities.length === 0) {
      newErrors.capabilities = "At least one capability is required"
    }

    if (!agentData.toolIds || agentData.toolIds.length === 0) {
      newErrors.toolIds = "At least one tool is required"
    }

    if (!agentData.mcpServerIds || agentData.mcpServerIds.length === 0) {
      newErrors.mcpServerIds = "At least one MCP server is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validateAgentData()) {
      alert("Please fix the validation errors")
      return
    }

    setIsSaving(true)
    try {
      // TODO: API call to save/update agent
      // const endpoint = agentData.id ? `/api/agents/${agentData.id}` : '/api/agents'
      // const method = agentData.id ? 'PUT' : 'POST'
      // const response = await fetch(endpoint, {
      //   method: method,
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(agentData)
      // })

      // Mock success for now
      console.log(agentData.id ? "Agent updated:" : "Agent created:", agentData)
      alert(agentData.id ? "Agent updated successfully!" : "Agent created successfully!")

      // Redirect back to agents page
      navigate("/agents")
    } catch (error) {
      console.error("Error saving agent:", error)
      alert("Error saving agent. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Layout>
      <Container>
        {isLoading ? (
          <div style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "400px",
            color: theme.colors.muted_foreground
          }}>
            <p>Loading agent data...</p>
          </div>
        ) : (
          <>
            {/* Header Section */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: theme.spacing[8],
                paddingBottom: theme.spacing[4],
                borderBottom: `${theme.borderWidth.sm} solid ${theme.colors.neutral[200]}`,
              }}
            >
              {/* Back Button */}
              <Button
                variant="outline"
                size="md"
                leadingIcon={ChevronLeft}
                onClick={() => navigate("/agents")}
              >
                Back
              </Button>

              {/* Title */}
              <h1
                style={{
                  fontSize: theme.typography.fontSize.xl2,
                  fontWeight: theme.typography.fontWeight.bold,
                  color: theme.colors.foreground,
                  margin: 0,
                  flex: 1,
                  textAlign: "center",
                }}
              >
                {agentData.id ? "Edit Agent" : "Create New Agent"}
              </h1>

              {/* Save Button */}
              <Button
                variant="primary"
                size="md"
                leadingIcon={Check}
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? (agentData.id ? "Updating..." : "Saving...") : (agentData.id ? "Update" : "Save")}
              </Button>
            </div>

            {/* Main Content Sections */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: theme.spacing[8],
                marginBottom: theme.spacing[8],
              }}
            >
              {/* Agent Information Form */}
              <Card
                style={{
                  padding: theme.spacing[6],
                  border: `${theme.borderWidth.sm} solid ${theme.colors.neutral[200]}`,
                  borderRadius: theme.borderRadius.md,
                  backgroundColor: theme.colors.card,
                }}
              >
                <Text as="h3" size="lg" variant="label" style={{ marginBottom: theme.spacing[6] }}>
                  Agent Information
                </Text>

                {/* Name */}
                <div style={{ marginBottom: theme.spacing[6] }}>
                  <label style={{
                    display: "block",
                    fontSize: theme.typography.fontSize.sm,
                    fontWeight: theme.typography.fontWeight.semibold,
                    color: theme.colors.foreground,
                    marginBottom: theme.spacing[2],
                  }}>
                    Agent Name *
                  </label>
                  <Input
                    placeholder="e.g., Research Agent"
                    value={agentData.name || ""}
                    onChange={(e) => setAgentData({ ...agentData, name: e.target.value })}
                    maxLength={100}
                  />
                  <p style={{
                    fontSize: theme.typography.fontSize.xs,
                    color: theme.colors.muted_foreground,
                    margin: `${theme.spacing[2]} 0 0 0`,
                  }}>
                    {agentData.name?.length || 0}/100 characters
                  </p>
                </div>

                {/* Description */}
                <div style={{ marginBottom: theme.spacing[6] }}>
                  <label style={{
                    display: "block",
                    fontSize: theme.typography.fontSize.sm,
                    fontWeight: theme.typography.fontWeight.semibold,
                    color: theme.colors.foreground,
                    marginBottom: theme.spacing[2],
                  }}>
                    Description *
                  </label>
                  <Textarea
                    placeholder="Describe what this agent does"
                    value={agentData.description || ""}
                    onChange={(e) => setAgentData({ ...agentData, description: e.target.value })}
                    rows={3}
                  />
                  <p style={{
                    fontSize: theme.typography.fontSize.xs,
                    color: theme.colors.muted_foreground,
                    margin: `${theme.spacing[2]} 0 0 0`,
                  }}>
                    {agentData.description?.length || 0}/500 characters
                  </p>
                </div>

                {/* Capabilities */}
                <div>
                  <label style={{
                    display: "block",
                    fontSize: theme.typography.fontSize.sm,
                    fontWeight: theme.typography.fontWeight.semibold,
                    color: theme.colors.foreground,
                    marginBottom: theme.spacing[2],
                  }}>
                    Capabilities *
                  </label>
                  <CapabilitiesInput
                    value={agentData.capabilities || []}
                    onChange={(capabilities) => setAgentData({ ...agentData, capabilities })}
                  />
                </div>
              </Card>

              {/* Tools Selection Section */}
              <Card
                style={{
                  padding: theme.spacing[6],
                  border: `${theme.borderWidth.sm} solid ${theme.colors.neutral[200]}`,
                  borderRadius: theme.borderRadius.md,
                  backgroundColor: theme.colors.card,
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: theme.spacing[4], gap: theme.spacing[4] }}>
                  <Text as="h3" size="lg" variant="label">
                    Select Tools ({agentData.toolIds?.length || 0})
                  </Text>

                  {/* Tools Combobox */}
                  <div style={{ width: "fit-content" }}>
                    <Combobox 
                      value="" 
                      onValueChange={(toolId) => {
                        const id = parseInt(toolId)
                        if (id) {
                          if (agentData.toolIds?.includes(id)) {
                            // Deselect if already selected
                            setAgentData({
                              ...agentData,
                              toolIds: agentData.toolIds.filter(toolId => toolId !== id)
                            })
                          } else {
                            // Select if not selected
                            setAgentData({
                              ...agentData,
                              toolIds: [...(agentData.toolIds || []), id]
                            })
                          }
                        }
                      }} 
                      variant="default" 
                      size="md"
                      multiselect={true}
                    >
                      <div style={{ display: "contents" }}>
                        <Button
                          variant="outline"
                          size="md"
                          onClick={(e) => {
                            e.preventDefault()
                            document.querySelector('[data-combobox-trigger="tools"]')?.click()
                          }}
                        >
                          + Add Tool
                        </Button>
                        <div style={{ display: "none" }}>
                          <ComboboxTrigger data-combobox-trigger="tools">
                            Select a tool {agentData.toolIds?.length > 0 && `(${agentData.toolIds.length})`}
                          </ComboboxTrigger>
                        </div>
                      </div>
                      <ComboboxContent>
                        <ComboboxSearch placeholder="Search tools..." />
                        {MOCK_TOOLS.map((tool) => (
                          <ComboboxItem key={tool.id} value={String(tool.id)} searchableText={tool.name}>
                            <div style={{ display: "flex", alignItems: "center", gap: theme.spacing[2] }}>
                              {agentData.toolIds?.includes(tool.id) && <Check size={14} style={{ color: theme.colors.primary[600] }} />}
                              {tool.name}
                            </div>
                          </ComboboxItem>
                        ))}
                      </ComboboxContent>
                    </Combobox>
                  </div>
                </div>

                {/* Selected Tools Display */}
                {agentData.toolIds && agentData.toolIds.length > 0 && (
                  <div>
                    <Chips
                      items={agentData.toolIds.map(id => ({
                        id: id,
                        label: MOCK_TOOLS.find(t => t.id === id)?.name || `Tool ${id}`
                      }))}
                      variant="primary"
                      size="md"
                      onRemove={(id) => {
                        setAgentData({
                          ...agentData,
                          toolIds: agentData.toolIds.filter(toolId => toolId !== id)
                        })
                      }}
                    />
                  </div>
                )}
              </Card>

              {/* MCP Servers Section */}
              <Card
                style={{
                  padding: theme.spacing[6],
                  border: `${theme.borderWidth.sm} solid ${theme.colors.neutral[200]}`,
                  borderRadius: theme.borderRadius.md,
                  backgroundColor: theme.colors.card,
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: theme.spacing[4], gap: theme.spacing[4] }}>
                  <Text as="h3" size="lg" variant="label">
                    Select MCP Servers ({agentData.mcpServerIds?.length || 0})
                  </Text>

                  {/* MCP Combobox */}
                  <div style={{ width: "fit-content" }}>
                    <Combobox 
                      value="" 
                      onValueChange={(serverId) => {
                        const id = parseInt(serverId)
                        if (id) {
                          if (agentData.mcpServerIds?.includes(id)) {
                            // Deselect if already selected
                            setAgentData({
                              ...agentData,
                              mcpServerIds: agentData.mcpServerIds.filter(serverId => serverId !== id)
                            })
                          } else {
                            // Select if not selected
                            setAgentData({
                              ...agentData,
                              mcpServerIds: [...(agentData.mcpServerIds || []), id]
                            })
                          }
                        }
                      }} 
                      variant="default" 
                      size="md"
                      multiselect={true}
                    >
                      <div style={{ display: "contents" }}>
                        <Button
                          variant="outline"
                          size="md"
                          onClick={(e) => {
                            e.preventDefault()
                            document.querySelector('[data-combobox-trigger="servers"]')?.click()
                          }}
                        >
                          + Add Server
                        </Button>
                        <div style={{ display: "none" }}>
                          <ComboboxTrigger data-combobox-trigger="servers">
                            Select a server {agentData.mcpServerIds?.length > 0 && `(${agentData.mcpServerIds.length})`}
                          </ComboboxTrigger>
                        </div>
                      </div>
                      <ComboboxContent>
                        <ComboboxSearch placeholder="Search MCP servers..." />
                        {MOCK_MCP_SERVERS.map((server) => (
                          <ComboboxItem key={server.id} value={String(server.id)} searchableText={server.name}>
                            <div style={{ display: "flex", alignItems: "center", gap: theme.spacing[2] }}>
                              {agentData.mcpServerIds?.includes(server.id) && <Check size={14} style={{ color: theme.colors.primary[600] }} />}
                              {server.name}
                            </div>
                          </ComboboxItem>
                        ))}
                      </ComboboxContent>
                    </Combobox>
                  </div>
                </div>

                {/* Selected MCPs Display */}
                {agentData.mcpServerIds && agentData.mcpServerIds.length > 0 && (
                  <div>
                    <Chips
                      items={agentData.mcpServerIds.map(id => ({
                        id: id,
                        label: MOCK_MCP_SERVERS.find(s => s.id === id)?.name || `Server ${id}`
                      }))}
                      variant="primary"
                      size="md"
                      onRemove={(id) => {
                        setAgentData({
                          ...agentData,
                          mcpServerIds: agentData.mcpServerIds.filter(serverId => serverId !== id)
                        })
                      }}
                    />
                  </div>
                )}
              </Card>

              {/* Settings Section */}
              <Card
                style={{
                  padding: theme.spacing[6],
                  border: `${theme.borderWidth.sm} solid ${theme.colors.neutral[200]}`,
                  borderRadius: theme.borderRadius.md,
                  backgroundColor: theme.colors.card,
                }}
              >
                <Text as="h3" size="lg" variant="label" style={{ marginBottom: theme.spacing[6] }}>
                  Settings
                </Text>

                {/* Human in Loop Toggle */}
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingBottom: theme.spacing[6],
                  borderBottom: `${theme.borderWidth.sm} solid ${theme.colors.neutral[200]}`,
                  marginBottom: theme.spacing[6],
                }}>
                  <div>
                    <Text as="p" size="sm" variant="label" style={{ margin: 0 }}>
                      Human in Loop
                    </Text>
                    <Text as="p" size="xs" variant="body" style={{ margin: `${theme.spacing[1]} 0 0 0`, color: theme.colors.muted_foreground }}>
                      Enable human approval for agent actions
                    </Text>
                  </div>
                  <Toggle
                    pressed={agentData.humanInLoop}
                    onPressedChange={(checked) => setAgentData({ ...agentData, humanInLoop: checked })}
                    size="md"
                  />
                </div>

                {/* LLM Config */}
                <div>
                  <label style={{
                    display: "block",
                    fontSize: theme.typography.fontSize.sm,
                    fontWeight: theme.typography.fontWeight.semibold,
                    color: theme.colors.foreground,
                    marginBottom: theme.spacing[2],
                  }}>
                    LLM Configuration *
                  </label>
                  <Select 
                    value={agentData.llmConfig || "gpt-4"} 
                    onValueChange={(value) => setAgentData({ ...agentData, llmConfig: value })}
                  >
                    <SelectTrigger size="lg">
                      <SelectValue placeholder="Select LLM Model" />
                    </SelectTrigger>
                    <SelectContent>
                      {LLM_MODELS.map(model => (
                        <SelectItem key={model.value} value={model.value}>
                          {model.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </Card>
            </div>

            {/* Footer Section */}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: theme.spacing[3],
                paddingTop: theme.spacing[6],
                borderTop: `${theme.borderWidth.sm} solid ${theme.colors.neutral[200]}`,
              }}
            >
              <Button variant="outline" size="md" onClick={() => navigate("/agents")}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="md"
                leadingIcon={Check}
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? (agentData.id ? "Updating..." : "Saving...") : (agentData.id ? "Update Agent" : "Save Agent")}
              </Button>
            </div>
          </>
        )}
      </Container>
    </Layout>
  )
}
