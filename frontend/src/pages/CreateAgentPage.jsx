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
import { CommandPalette } from "@/components/ui/command-palette"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { ChevronLeft, Check, Info, Wrench, Server, Settings, Shield } from "lucide-react"
import { Toast, ToastContainer } from "@/components/ui/toast"

import { fetchTools } from "@/store/slices/toolSlice"
import { fetchMCPs } from "@/store/slices/mcpSlice"
import { fetchLLMs } from "@/store/slices/llmSlice"
import { fetchGuardrails } from "@/store/slices/guardrailSlice"
import guardrailService from "@/services/guardrailService"
import { createAgent, updateAgent, fetchAgent, clearCurrentAgent } from "@/store/slices/agentSlice"

export default function CreateAgentPage() {
  const theme = useTheme()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { agentId } = useParams()

  const { items: tools } = useSelector((state) => state.tools)
  const { items: mcpServers } = useSelector((state) => state.mcps)
  const { items: llms } = useSelector((state) => state.llms)
  const { items: guardrails, isLoading: isGuardrailsLoading } = useSelector((state) => state.guardrails)
  
  const guardrailsList = Array.isArray(guardrails) ? guardrails : []
  const { currentAgent, isSaving } = useSelector((state) => state.agents)

  const [agentData, setAgentData] = useState({
    name: "",
    instructions: "",
    toolIds: [],
    mcpServerIds: [],
    guardrailIds: [],
    humanInLoop: false,
    llmId: null,
  })

  const [originalData, setOriginalData] = useState(null)
  const [isLoading, setIsLoading] = useState(!!agentId)

  // Command Palette State
  const [isToolPaletteOpen, setIsToolPaletteOpen] = useState(false)
  const [isServerPaletteOpen, setIsServerPaletteOpen] = useState(false)
  const [isGuardrailPaletteOpen, setIsGuardrailPaletteOpen] = useState(false)

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
    dispatch(fetchGuardrails())
  }, [dispatch])

  // Fetch Agent if editing
  useEffect(() => {
    if (agentId) {
      dispatch(fetchAgent(agentId))
        .unwrap()
        .then((agent) => {
          const mapped = {
            name: agent.name || "",
            instructions: agent.instructions || "",
            toolIds: agent.tool_ids || [],
            mcpServerIds: agent.mcp_server_ids || [],
            guardrailIds: (agent.guardrails || []).map(g => g.id),
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
    const trimmedName = (agentData.name || "").trim()

    if (!trimmedName || trimmedName.length < 3) {
      addToast("Validation Error", "Agent name must be at least 3 characters.", "error")
      return false
    }

    // Strict Name Validation (allow spaces, hyphens, underscores)
    const nameRegex = /^[A-Za-z0-9 _-]+$/
    if (!nameRegex.test(trimmedName)) {
      addToast(
        "Invalid Name Format",
        "Name can only contain letters, numbers, spaces, hyphens, and underscores",
        "error"
      )
      return false
    }

    // Word count validation
    const instructionsWordCount = agentData.instructions ? agentData.instructions.trim().split(/\s+/).filter(Boolean).length : 0
    if (instructionsWordCount > 250) {
      addToast("Validation Error", "Agent instructions cannot exceed 250 words.", "error")
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
      if (agentData.instructions !== originalData.instructions) payload.instructions = agentData.instructions
      if (agentData.humanInLoop !== originalData.humanInLoop) payload.human_in_loop = agentData.humanInLoop
      if (JSON.stringify([...agentData.toolIds].sort()) !== JSON.stringify([...originalData.toolIds].sort())) {
        payload.tool_ids = agentData.toolIds
      }
      if (JSON.stringify([...agentData.mcpServerIds].sort()) !== JSON.stringify([...originalData.mcpServerIds].sort())) {
        payload.mcp_server_ids = agentData.mcpServerIds
      }

      // Check Guardrails change
      const guardrailsChanged = JSON.stringify([...agentData.guardrailIds].sort()) !== JSON.stringify([...originalData.guardrailIds].sort())

      // Compare LLM ID
      const origLlm = originalData.llmId || null
      const currLlm = agentData.llmId || null
      if (currLlm !== origLlm) {
        payload.llm_id = currLlm
      }

      // If no changes (including guardrails), inform user
      if (Object.keys(payload).length === 0 && !guardrailsChanged) {
        addToast("Info", "No changes detected.", "info")
        return
      }
    } else {
      // CREATE: Send full payload
      payload = {
        name: agentData.name,
        instructions: agentData.instructions,
        tool_ids: agentData.toolIds,
        mcp_server_ids: agentData.mcpServerIds,
        human_in_loop: agentData.humanInLoop,
        llm_id: agentData.llmId,
        is_active: true
      }
    }

    try {
      let savedAgentId = agentId;

      if (agentId) {
        if (Object.keys(payload).length > 0) {
           await dispatch(updateAgent({ id: agentId, agentData: payload })).unwrap()
        }
      } else {
        const newAgent = await dispatch(createAgent(payload)).unwrap()
        savedAgentId = newAgent.id
      }

      // Sync Guardrails manually using the bulk endpoint
      const currentGuardrails = agentData.guardrailIds
      await guardrailService.syncAgentGuardrails(savedAgentId, currentGuardrails).catch(err => {
        console.error("Failed to sync guardrails:", err)
        addToast("Sync Info", "Agent saved, but some guardrails failed to link.", "warning")
      })

      addToast("Success", agentId ? "Agent updated successfully!" : "Agent created successfully!", "success")
      
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

      {/* Action-Centric Sticky Header */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 40,
          backgroundColor: `${theme.colors.card}f2`,
          backdropFilter: "blur(12px)",
          borderBottom: `${theme.borderWidth.sm} solid ${theme.colors.neutral[200]}`,
          padding: `${theme.spacing[3]} 0`,
          width: "100%",
        }}
      >
        <div style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: `0 ${theme.spacing[8]}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          height: "36px"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: theme.spacing[3] }}>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate("/agents")} 
              style={{ 
                width: "32px", 
                height: "32px", 
                borderRadius: "8px", 
                padding: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: `${theme.borderWidth.sm} solid ${theme.colors.neutral[300]}`,
                color: theme.colors.foreground
              }}
            >
              <ChevronLeft size={20} strokeWidth={2.5} />
            </Button>
            <div style={{ width: "1px", height: "14px", backgroundColor: theme.colors.neutral[300] }} />
            <Text weight="semibold" style={{ fontSize: "14px", color: theme.colors.foreground, margin: 0 }}>
              {agentId ? "Edit Agent" : "Create Agent"}
            </Text>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: theme.spacing[2] }}>
            <Button variant="ghost" size="sm" onClick={() => navigate("/agents")} style={{ height: "32px", fontSize: "13px", color: theme.colors.muted_foreground }}>
              Discard
            </Button>
            <Button 
              variant="primary" 
              size="sm" 
              leadingIcon={Check} 
              onClick={handleSave} 
              disabled={isSaving || isLoading} 
              style={{ height: "32px", fontSize: "13px", padding: `0 ${theme.spacing[4]}` }}
            >
              {isSaving ? (agentId ? "Updating..." : "Saving...") : (agentId ? "Save Changes" : "Create Agent")}
            </Button>
          </div>
        </div>
      </div>

      <Container padding={8}>
        {isLoading ? (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px", color: theme.colors.muted_foreground }}>
            <p>Loading agent data...</p>
          </div>
        ) : (
          <>
            {/* Main Content Area */}
              {/* Polished Dashboard Form Card */}
              <Card style={{ padding: 0, border: `${theme.borderWidth.sm} solid ${theme.colors.neutral[200]}`, borderRadius: theme.borderRadius.xl, backgroundColor: theme.colors.card, overflow: "hidden", boxShadow: "none", marginBottom: theme.spacing[12] }}>
                
                {/* Agent Information */}
                <div style={{ padding: theme.spacing[8] }}>
                  <div style={{ display: "flex", alignItems: "center", gap: theme.spacing[2], marginBottom: theme.spacing[6] }}>
                    <div style={{ width: "24px", height: "24px", borderRadius: "6px", backgroundColor: theme.colors.primary.DEFAULT + "08", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Info size={14} style={{ color: theme.colors.primary.DEFAULT }} />
                    </div>
                    <Text weight="semibold" style={{ fontSize: "14px", color: theme.colors.foreground, margin: 0 }}>Agent Information</Text>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: theme.spacing[8], marginBottom: theme.spacing[6] }}>
                    <div>
                      <label style={{ display: "block", fontSize: "11px", fontWeight: "600", color: theme.colors.neutral[500], textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: theme.spacing[2] }}>
                        Name
                      </label>
                      <Input placeholder="e.g. Research Analyst" value={agentData.name} onChange={(e) => setAgentData({ ...agentData, name: e.target.value })} maxLength={30} />
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: "11px", fontWeight: "600", color: theme.colors.neutral[500], textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: theme.spacing[2] }}>
                        LLM Model
                      </label>
                      <Select value={agentData.llmId || ""} onValueChange={(value) => setAgentData({ ...agentData, llmId: value || null })}>
                        <SelectTrigger size="md">
                          {selectedLLM ? selectedLLM.name : "Select a model"}
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {llms.map(llm => (
                            <SelectItem key={llm.id} value={llm.id}>{llm.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div style={{ marginBottom: 0 }}>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: "600", color: theme.colors.neutral[500], textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: theme.spacing[2] }}>
                      Instructions
                    </label>
                    <Textarea 
                      placeholder="Describe the agent's persona and core objectives..." 
                      value={agentData.instructions} 
                      onChange={(e) => setAgentData({ ...agentData, instructions: e.target.value })} 
                      rows={6} 
                    />
                    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: theme.spacing[2] }}>
                      <Text size="xs" variant={(agentData.instructions ? agentData.instructions.trim().split(/\s+/).filter(Boolean).length : 0) > 250 ? "destructive" : "muted"}>
                        {agentData.instructions ? agentData.instructions.trim().split(/\s+/).filter(Boolean).length : 0} / 250 words
                      </Text>
                    </div>
                  </div>
                </div>

                <div style={{ borderTop: `${theme.borderWidth.sm} solid ${theme.colors.neutral[100]}`, margin: `0 ${theme.spacing[8]}` }} />

                {/* Tools */}
                <div style={{ padding: theme.spacing[8] }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: theme.spacing[6] }}>
                    <div style={{ display: "flex", alignItems: "center", gap: theme.spacing[2] }}>
                      <div style={{ width: "24px", height: "24px", borderRadius: "6px", backgroundColor: theme.colors.primary.DEFAULT + "08", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Wrench size={14} style={{ color: theme.colors.primary.DEFAULT }} />
                      </div>
                      <Text weight="semibold" style={{ fontSize: "14px", color: theme.colors.foreground, margin: 0 }}>Tools</Text>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault()
                        setIsToolPaletteOpen(true)
                      }}
                      style={{ fontSize: "11px", height: "26px", padding: `0 ${theme.spacing[3]}`, color: theme.colors.neutral[600] }}
                    >
                      Add Tools
                    </Button>
                  </div>

                  {agentData.toolIds.length > 0 ? (
                    <Chips
                      items={agentData.toolIds.map(id => ({
                        id: id,
                        label: tools.find(t => t.id === id)?.name || "Loading..."
                      }))}
                      variant="primary"
                      size="sm"
                      onRemove={(id) => {
                        setAgentData({
                          ...agentData,
                          toolIds: agentData.toolIds.filter(toolId => toolId !== id)
                        })
                      }}
                    />
                  ) : (
                    <div style={{ padding: theme.spacing[4], border: `${theme.borderWidth.sm} dashed ${theme.colors.neutral[100]}`, borderRadius: theme.borderRadius.md, textAlign: "center" }}>
                      <Text style={{ fontSize: "12px" }} variant="muted">No tools configured.</Text>
                    </div>
                  )}
                </div>

                <div style={{ borderTop: `${theme.borderWidth.sm} solid ${theme.colors.neutral[100]}`, margin: `0 ${theme.spacing[8]}` }} />

                {/* MCP Servers */}
                <div style={{ padding: theme.spacing[8] }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: theme.spacing[6] }}>
                    <div style={{ display: "flex", alignItems: "center", gap: theme.spacing[2] }}>
                      <div style={{ width: "24px", height: "24px", borderRadius: "6px", backgroundColor: theme.colors.primary.DEFAULT + "08", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Server size={14} style={{ color: theme.colors.primary.DEFAULT }} />
                      </div>
                      <Text weight="semibold" style={{ fontSize: "14px", color: theme.colors.foreground, margin: 0 }}>MCP Servers</Text>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault()
                        setIsServerPaletteOpen(true)
                      }}
                      style={{ fontSize: "11px", height: "26px", padding: `0 ${theme.spacing[3]}`, color: theme.colors.neutral[600] }}
                    >
                      Add Servers
                    </Button>
                  </div>

                  {agentData.mcpServerIds.length > 0 ? (
                    <Chips
                      items={agentData.mcpServerIds.map(id => ({
                        id: id,
                        label: mcpServers.find(s => s.id === id)?.name || "Loading..."
                      }))}
                      variant="primary"
                      size="sm"
                      onRemove={(id) => {
                        setAgentData({
                          ...agentData,
                          mcpServerIds: agentData.mcpServerIds.filter(serverId => serverId !== id)
                        })
                      }}
                    />
                  ) : (
                    <div style={{ padding: theme.spacing[4], border: `${theme.borderWidth.sm} dashed ${theme.colors.neutral[100]}`, borderRadius: theme.borderRadius.md, textAlign: "center" }}>
                      <Text style={{ fontSize: "12px" }} variant="muted">No external knowledge systems connected.</Text>
                    </div>
                  )}
                </div>

                <div style={{ borderTop: `${theme.borderWidth.sm} solid ${theme.colors.neutral[100]}`, margin: `0 ${theme.spacing[8]}` }} />

                {/* Guardrails */}
                <div style={{ padding: theme.spacing[8] }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: theme.spacing[6] }}>
                    <div style={{ display: "flex", alignItems: "center", gap: theme.spacing[2] }}>
                      <div style={{ width: "24px", height: "24px", borderRadius: "6px", backgroundColor: theme.colors.primary.DEFAULT + "08", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Shield size={14} style={{ color: theme.colors.primary.DEFAULT }} />
                      </div>
                      <Text weight="semibold" style={{ fontSize: "14px", color: theme.colors.foreground, margin: 0 }}>Safety Guardrails</Text>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault()
                        setIsGuardrailPaletteOpen(true)
                      }}
                      style={{ fontSize: "11px", height: "26px", padding: `0 ${theme.spacing[3]}`, color: theme.colors.neutral[600] }}
                    >
                      Add Guardrails
                    </Button>
                  </div>

                  {agentData.guardrailIds.length > 0 ? (
                    <Chips
                      items={agentData.guardrailIds.map(id => ({
                        id: id,
                        label: guardrailsList.find(g => g.id === id)?.name || "Loading..."
                      }))}
                      variant="primary"
                      size="sm"
                      onRemove={(id) => {
                        setAgentData({
                          ...agentData,
                          guardrailIds: agentData.guardrailIds.filter(gid => gid !== id)
                        })
                      }}
                    />
                  ) : (
                    <div style={{ padding: theme.spacing[4], border: `${theme.borderWidth.sm} dashed ${theme.colors.neutral[100]}`, borderRadius: theme.borderRadius.md, textAlign: "center" }}>
                      <Text style={{ fontSize: "12px" }} variant="muted">No security guardrails enabled.</Text>
                    </div>
                  )}
                </div>

                <div style={{ borderTop: `${theme.borderWidth.sm} solid ${theme.colors.neutral[100]}`, margin: `0 ${theme.spacing[8]}` }} />

                {/* Settings */}
                <div style={{ padding: theme.spacing[8] }}>
                  <div style={{ display: "flex", alignItems: "center", gap: theme.spacing[2], marginBottom: theme.spacing[6] }}>
                    <div style={{ width: "24px", height: "24px", borderRadius: "6px", backgroundColor: theme.colors.primary.DEFAULT + "08", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Settings size={14} style={{ color: theme.colors.primary.DEFAULT }} />
                    </div>
                    <Text weight="semibold" style={{ fontSize: "14px", color: theme.colors.foreground, margin: 0 }}>Settings</Text>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: theme.spacing[4], borderRadius: theme.borderRadius.lg, border: `${theme.borderWidth.sm} solid ${theme.colors.neutral[200]}`, backgroundColor: theme.colors.neutral[50] + "88" }}>
                    <div>
                      <Text weight="semibold" style={{ fontSize: "13px", color: theme.colors.foreground, margin: 0 }}>Mandatory human approval</Text>
                      <Text style={{ fontSize: "12px", margin: `${theme.spacing[1]} 0 0 0` }} variant="muted">Agent must wait for confirmation before performing actions.</Text>
                    </div>
                    <Toggle pressed={agentData.humanInLoop} onPressedChange={(checked) => setAgentData({ ...agentData, humanInLoop: checked })} size="sm" />
                  </div>
                </div>
              </Card>
          </>
        )}
      </Container>

      {/* Render Command Palettes at the root level to escape CSS positioning traps */}
      {agentData && (
        <>
          <CommandPalette
            isOpen={isToolPaletteOpen}
            onClose={() => setIsToolPaletteOpen(false)}
            title="Add Tools"
            description="Search and select tools to equip this agent with."
            placeholder="Search available tools..."
            items={tools.map(t => ({ id: t.id, label: t.name, description: t.description }))}
            selectedIds={agentData.toolIds}
            onSelect={(id) => setAgentData(prev => ({ ...prev, toolIds: [...prev.toolIds, id] }))}
            onDeselect={(id) => setAgentData(prev => ({ ...prev, toolIds: prev.toolIds.filter(tid => tid !== id) }))}
            emptyMessage="No available tools found."
          />

          <CommandPalette
            isOpen={isServerPaletteOpen}
            onClose={() => setIsServerPaletteOpen(false)}
            title="Add MCP Servers"
            description="Select MCP servers to provide access to external systems."
            placeholder="Search available servers..."
            items={mcpServers.map(s => ({ id: s.id, label: s.name }))}
            selectedIds={agentData.mcpServerIds}
            onSelect={(id) => setAgentData(prev => ({ ...prev, mcpServerIds: [...prev.mcpServerIds, id] }))}
            onDeselect={(id) => setAgentData(prev => ({ ...prev, mcpServerIds: prev.mcpServerIds.filter(sid => sid !== id) }))}
            emptyMessage="No available MCP servers found."
          />

          <CommandPalette
            isOpen={isGuardrailPaletteOpen}
            onClose={() => setIsGuardrailPaletteOpen(false)}
            title="Add Guardrails"
            description="Select guardrails to attach to this agent."
            placeholder="Search available guardrails..."
            items={guardrailsList.map(g => ({ id: g.id, label: g.name, description: `${g.type} - ${g.action}` }))}
            selectedIds={agentData.guardrailIds}
            onSelect={(id) => setAgentData(prev => ({ ...prev, guardrailIds: [...prev.guardrailIds, id] }))}
            onDeselect={(id) => setAgentData(prev => ({ ...prev, guardrailIds: prev.guardrailIds.filter(gid => gid !== id) }))}
            emptyMessage="No available guardrails found."
          />
        </>
      )}
    </Layout>
  )
}
