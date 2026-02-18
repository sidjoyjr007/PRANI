import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { useTheme } from "@/context/ThemeContext"
import Layout from "@/components/Layout"
import Container from "@/components/Container"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Text } from "@/components/ui/text"
import { Card } from "@/components/ui/card"
import { Chips } from "@/components/ui/chips"
import { Toggle } from "@/components/ui/toggle"
import { Combobox, ComboboxTrigger, ComboboxContent, ComboboxItem, ComboboxSearch } from "@/components/ui/combobox"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { ChevronLeft, Check } from "lucide-react"
import CapabilitiesInput from "@/components/CapabilitiesInput"
import { Toast, ToastContainer } from "@/components/ui/toast"

import { fetchTools } from "@/store/slices/toolSlice"
import { fetchMCPs } from "@/store/slices/mcpSlice"
import { fetchLLMs } from "@/store/slices/llmSlice"
import { createAgent, updateAgent, fetchAgent, clearCurrentAgent } from "@/store/slices/agentSlice"

export default function CreateAgentPage() {
  const theme = useTheme()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { agentId } = useParams()

  const { items: tools } = useSelector((state) => state.tools)
  const { items: mcpServers } = useSelector((state) => state.mcps)
  const { items: llms } = useSelector((state) => state.llms)
  const { currentAgent, isSaving } = useSelector((state) => state.agents)

  const [agentData, setAgentData] = useState({
    name: "",
    description: "",
    capabilities: [],
    toolIds: [],
    mcpServerIds: [],
    humanInLoop: false,
    llmId: null,
  })

  const [originalData, setOriginalData] = useState(null)
  const [isLoading, setIsLoading] = useState(!!agentId)

  // Toast State
  const [toasts, setToasts] = useState([])

  const addToast = (title, description, variant = "info") => {
    const id = Date.now().toString()
    setToasts((prev) => [...prev, { id, title, description, variant }])
    setTimeout(() => removeToast(id), 5000)
  }

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  // Fetch dependencies on mount
  useEffect(() => {
    dispatch(fetchTools({ size: 100 }))
    dispatch(fetchMCPs({ size: 100 }))
    dispatch(fetchLLMs({ size: 100 }))
  }, [dispatch])

  // Fetch Agent if editing
  useEffect(() => {
    if (agentId) {
      dispatch(fetchAgent(agentId))
        .unwrap()
        .then((agent) => {
          const mapped = {
            name: agent.name || "",
            description: agent.description || "",
            capabilities: agent.capabilities || [],
            toolIds: agent.tool_ids || [],
            mcpServerIds: agent.mcp_server_ids || [],
            humanInLoop: agent.human_in_loop || false,
            llmId: agent.llm_id || null,
          }
          setAgentData(mapped)
          setOriginalData(JSON.parse(JSON.stringify(mapped))) // Deep copy
          setIsLoading(false)
        })
        .catch((err) => {
          console.error("Failed to fetch agent:", err)
          addToast("Error", "Failed to load agent data", "error")
          navigate("/agents")
        })
    } else {
      dispatch(clearCurrentAgent())
      setIsLoading(false)
    }
  }, [dispatch, agentId, navigate])

  const validateAgentData = () => {
    if (!agentData.name || agentData.name.trim().length < 3) {
      addToast("Validation Error", "Agent name must be at least 3 characters.", "error")
      return false
    }
    return true
  }

  const handleSave = async () => {
    if (!validateAgentData()) return

    let payload = {}

    if (agentId && originalData) {
      // UPDATE: Only send changed fields (like CreateToolPage)
      if (agentData.name !== originalData.name) payload.name = agentData.name
      if (agentData.description !== originalData.description) payload.description = agentData.description
      if (agentData.humanInLoop !== originalData.humanInLoop) payload.human_in_loop = agentData.humanInLoop

      // Compare arrays using JSON stringify
      if (JSON.stringify([...agentData.capabilities].sort()) !== JSON.stringify([...originalData.capabilities].sort())) {
        payload.capabilities = agentData.capabilities
      }
      if (JSON.stringify([...agentData.toolIds].sort()) !== JSON.stringify([...originalData.toolIds].sort())) {
        payload.tool_ids = agentData.toolIds
      }
      if (JSON.stringify([...agentData.mcpServerIds].sort()) !== JSON.stringify([...originalData.mcpServerIds].sort())) {
        payload.mcp_server_ids = agentData.mcpServerIds
      }

      // Compare LLM ID
      const origLlm = originalData.llmId || null
      const currLlm = agentData.llmId || null
      if (currLlm !== origLlm) {
        payload.llm_id = currLlm
      }

      // If no changes, inform user
      if (Object.keys(payload).length === 0) {
        addToast("Info", "No changes detected.", "info")
        return
      }
    } else {
      // CREATE: Send full payload
      payload = {
        name: agentData.name,
        description: agentData.description,
        capabilities: agentData.capabilities,
        tool_ids: agentData.toolIds,
        mcp_server_ids: agentData.mcpServerIds,
        human_in_loop: agentData.humanInLoop,
        llm_id: agentData.llmId,
        is_active: true
      }
    }

    try {
      if (agentId) {
        await dispatch(updateAgent({ id: agentId, agentData: payload })).unwrap()
        addToast("Success", "Agent updated successfully!", "success")
      } else {
        await dispatch(createAgent(payload)).unwrap()
        addToast("Success", "Agent created successfully!", "success")
      }
      // Delay navigation slightly to show success toast
      setTimeout(() => navigate("/agents"), 1000)
    } catch (error) {
      console.error("Error saving agent:", error)
      const errorMsg = typeof error === 'string' ? error : (error.detail || "Error saving agent")
      addToast("Error", errorMsg, "error")
    }
  }

  const selectedLLM = llms.find(llm => llm.id === agentData.llmId)

  return (
    <Layout>
      {/* Toast Container */}
      <ToastContainer position="top-center">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            title={toast.title}
            description={toast.description}
            variant={toast.variant}
            onDismiss={() => removeToast(toast.id)}
          />
        ))}
      </ToastContainer>

      <Container>
        {isLoading ? (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px", color: theme.colors.muted_foreground }}>
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
              <Button variant="outline" size="md" leadingIcon={ChevronLeft} onClick={() => navigate("/agents")}>
                Back
              </Button>
              <h1 style={{ fontSize: theme.typography.fontSize.xl2, fontWeight: theme.typography.fontWeight.bold, color: theme.colors.foreground, margin: 0, flex: 1, textAlign: "center" }}>
                {agentId ? "Edit Agent" : "Create New Agent"}
              </h1>
              <Button variant="primary" size="md" leadingIcon={Check} onClick={handleSave} disabled={isSaving}>
                {isSaving ? (agentId ? "Updating..." : "Saving...") : (agentId ? "Update" : "Save")}
              </Button>
            </div>

            {/* Main Content */}
            <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing[8], marginBottom: theme.spacing[8] }}>

              {/* Agent Information */}
              <Card style={{ padding: theme.spacing[6], border: `${theme.borderWidth.sm} solid ${theme.colors.neutral[200]}`, borderRadius: theme.borderRadius.md, backgroundColor: theme.colors.card }}>
                <Text as="h3" size="lg" variant="label" style={{ marginBottom: theme.spacing[6] }}>Agent Information</Text>

                <div style={{ marginBottom: theme.spacing[6] }}>
                  <label style={{ display: "block", fontSize: theme.typography.fontSize.sm, fontWeight: theme.typography.fontWeight.semibold, color: theme.colors.foreground, marginBottom: theme.spacing[2] }}>Agent Name *</label>
                  <Input placeholder="e.g., Research Agent" value={agentData.name} onChange={(e) => setAgentData({ ...agentData, name: e.target.value })} maxLength={100} />
                  <p style={{
                    fontSize: theme.typography.fontSize.xs,
                    color: theme.colors.muted_foreground,
                    margin: `${theme.spacing[2]} 0 0 0`,
                  }}>
                    {agentData.name?.length || 0}/100 characters
                  </p>
                </div>

                <div style={{ marginBottom: theme.spacing[6] }}>
                  <label style={{ display: "block", fontSize: theme.typography.fontSize.sm, fontWeight: theme.typography.fontWeight.semibold, color: theme.colors.foreground, marginBottom: theme.spacing[2] }}>Description</label>
                  <Textarea placeholder="Describe what this agent does" value={agentData.description} onChange={(e) => setAgentData({ ...agentData, description: e.target.value })} rows={3} />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: theme.typography.fontSize.sm, fontWeight: theme.typography.fontWeight.semibold, color: theme.colors.foreground, marginBottom: theme.spacing[2] }}>Capabilities</label>
                  <CapabilitiesInput value={agentData.capabilities} onChange={(capabilities) => setAgentData({ ...agentData, capabilities })} />
                </div>
              </Card>

              {/* Tools Selection Section */}
              <Card style={{ padding: theme.spacing[6], border: `${theme.borderWidth.sm} solid ${theme.colors.neutral[200]}`, borderRadius: theme.borderRadius.md, backgroundColor: theme.colors.card }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: theme.spacing[4], gap: theme.spacing[4] }}>
                  <Text as="h3" size="lg" variant="label">
                    Select Tools ({agentData.toolIds.length})
                  </Text>

                  <div style={{ width: "fit-content" }}>
                    <Combobox
                      value=""
                      onValueChange={(toolId) => {
                        if (toolId) {
                          if (agentData.toolIds.includes(toolId)) {
                            setAgentData({ ...agentData, toolIds: agentData.toolIds.filter(id => id !== toolId) })
                          } else {
                            setAgentData({ ...agentData, toolIds: [...agentData.toolIds, toolId] })
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
                        <div style={{ visibility: "hidden", height: 0, width: 0, overflow: "hidden" }}>
                          <ComboboxTrigger data-combobox-trigger="tools">
                            Select a tool
                          </ComboboxTrigger>
                        </div>
                      </div>
                      <ComboboxContent>
                        <ComboboxSearch placeholder="Search tools..." />
                        {tools.map((tool) => (
                          <ComboboxItem key={tool.id} value={tool.id} searchableText={tool.name}>
                            <div style={{ display: "flex", alignItems: "center", gap: theme.spacing[2], justifyContent: "space-between", width: "100%" }}>
                              <span>{tool.name}</span>
                              {agentData.toolIds.includes(tool.id) && <Check size={14} style={{ color: theme.colors.primary[600] }} />}
                            </div>
                          </ComboboxItem>
                        ))}
                        {tools.length === 0 && <div style={{ padding: '8px', color: theme.colors.muted_foreground }}>No tools found</div>}
                      </ComboboxContent>
                    </Combobox>
                  </div>
                </div>

                {agentData.toolIds.length > 0 && (
                  <div>
                    <Chips
                      items={agentData.toolIds.map(id => ({
                        id: id,
                        label: tools.find(t => t.id === id)?.name || "Loading..."
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
              <Card style={{ padding: theme.spacing[6], border: `${theme.borderWidth.sm} solid ${theme.colors.neutral[200]}`, borderRadius: theme.borderRadius.md, backgroundColor: theme.colors.card }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: theme.spacing[4], gap: theme.spacing[4] }}>
                  <Text as="h3" size="lg" variant="label">
                    Select MCP Servers ({agentData.mcpServerIds.length})
                  </Text>

                  <div style={{ width: "fit-content" }}>
                    <Combobox
                      value=""
                      onValueChange={(serverId) => {
                        if (serverId) {
                          if (agentData.mcpServerIds.includes(serverId)) {
                            setAgentData({ ...agentData, mcpServerIds: agentData.mcpServerIds.filter(id => id !== serverId) })
                          } else {
                            setAgentData({ ...agentData, mcpServerIds: [...agentData.mcpServerIds, serverId] })
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
                        <div style={{ visibility: "hidden", height: 0, width: 0, overflow: "hidden" }}>
                          <ComboboxTrigger data-combobox-trigger="servers">
                            Select a server
                          </ComboboxTrigger>
                        </div>
                      </div>
                      <ComboboxContent>
                        <ComboboxSearch placeholder="Search MCP servers..." />
                        {mcpServers.map((server) => (
                          <ComboboxItem key={server.id} value={server.id} searchableText={server.name}>
                            <div style={{ display: "flex", alignItems: "center", gap: theme.spacing[2], justifyContent: "space-between", width: "100%" }}>
                              <span>{server.name}</span>
                              {agentData.mcpServerIds.includes(server.id) && <Check size={14} style={{ color: theme.colors.primary[600] }} />}
                            </div>
                          </ComboboxItem>
                        ))}
                        {mcpServers.length === 0 && <div style={{ padding: '8px', color: theme.colors.muted_foreground }}>No servers found</div>}
                      </ComboboxContent>
                    </Combobox>
                  </div>
                </div>

                {agentData.mcpServerIds.length > 0 && (
                  <div>
                    <Chips
                      items={agentData.mcpServerIds.map(id => ({
                        id: id,
                        label: mcpServers.find(s => s.id === id)?.name || "Loading..."
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

              {/* Settings (LLM & Logic) */}
              <Card style={{ padding: theme.spacing[6], border: `${theme.borderWidth.sm} solid ${theme.colors.neutral[200]}`, borderRadius: theme.borderRadius.md, backgroundColor: theme.colors.card }}>
                <Text as="h3" size="lg" variant="label" style={{ marginBottom: theme.spacing[6] }}>Settings</Text>

                {/* Human In Loop */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: theme.spacing[6], paddingBottom: theme.spacing[6], borderBottom: `${theme.borderWidth.sm} solid ${theme.colors.neutral[200]}` }}>
                  <div>
                    <Text as="p" size="sm" variant="label" style={{ margin: 0 }}>Human in Loop</Text>
                    <Text as="p" size="xs" variant="body" style={{ margin: `${theme.spacing[1]} 0 0 0`, color: theme.colors.muted_foreground }}>Enable human approval for agent actions</Text>
                  </div>
                  <Toggle pressed={agentData.humanInLoop} onPressedChange={(checked) => setAgentData({ ...agentData, humanInLoop: checked })} size="md" />
                </div>

                {/* LLM Selection */}
                <div>
                  <label style={{ display: "block", fontSize: theme.typography.fontSize.sm, fontWeight: theme.typography.fontWeight.semibold, color: theme.colors.foreground, marginBottom: theme.spacing[2] }}>LLM Model</label>
                  <Select value={agentData.llmId || ""} onValueChange={(value) => setAgentData({ ...agentData, llmId: value || null })}>
                    <SelectTrigger size="lg">
                      {selectedLLM ? selectedLLM.name : "Select LLM Model"}
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {llms.map(llm => (
                        <SelectItem key={llm.id} value={llm.id}>{llm.name}</SelectItem>
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
                {isSaving ? (agentId ? "Updating..." : "Saving...") : (agentId ? "Update Agent" : "Save Agent")}
              </Button>
            </div>

          </>
        )}
      </Container>
    </Layout>
  )
}
