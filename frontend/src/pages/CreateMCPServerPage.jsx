import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { useTheme } from "@/context/ThemeContext"
import Editor from "@monaco-editor/react"
import Layout from "@/components/Layout"
import Container from "@/components/Container"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Text } from "@/components/ui/text"
import { Card } from "@/components/ui/card"
import { Alert } from "@/components/ui/alert"
import { ChevronLeft, Check, Plus, Trash2, Eye, EyeOff, Settings, X, Globe, Info } from "lucide-react"
import { Toast, ToastContainer } from "@/components/ui/toast"
import { fetchMCPById, createMCP, updateMCP, clearCurrentMCP } from "@/store/slices/mcpSlice"

// Sub-component for Adding Env Var - REMOVED, logic moved to main component modal

export default function CreateMCPServerPage() {
  const theme = useTheme()
  const navigate = useNavigate()
  const { serverId } = useParams()
  const isEditMode = !!serverId

  /* Redux Hooks */
  const dispatch = useDispatch()
  const { isSaving } = useSelector((state) => state.mcps)

  // Form state
  const [mcpData, setMcpData] = useState({
    name: "",
    url: "",
    headers: "{\n  \"Authorization\": \"Bearer {{env.API_KEY}}\"\n}",
    environmentVariables: [],
    is_active: true
  })
  const [originalData, setOriginalData] = useState(null)

  // UI state
  const [isLoading, setIsLoading] = useState(isEditMode)
  const [showEnvModal, setShowEnvModal] = useState(false)
  const [envVisibility, setEnvVisibility] = useState({})

  // Toast State
  const [toasts, setToasts] = useState([])
  const addToast = (title, description, variant = "info") => {
    const id = Date.now().toString()
    setToasts((prev) => [...prev, { id, title, description, variant }])
    setTimeout(() => removeToast(id), 5000)
  }
  const removeToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id))

  // Load existing MCP if editing
  useEffect(() => {
    if (serverId) {
      dispatch(fetchMCPById(serverId))
        .unwrap()
        .then((data) => {
          const envVars = (data.environmentVariables || []).map((ev, idx) => ({
            ...ev,
            id: Date.now() + idx,
            isExisting: true
          }))

          const mapped = {
            name: data.name || "",
            url: data.url || "",
            headers: data.headers || "{}",
            environmentVariables: envVars,
            is_active: data.is_active !== undefined ? data.is_active : true
          }

          setMcpData(mapped)
          setOriginalData(JSON.parse(JSON.stringify(mapped))) // Deep copy for diff

          const visibility = {}
          envVars.forEach(env => visibility[env.id] = false)
          setEnvVisibility(visibility)
          setIsLoading(false)
        })
        .catch((err) => {
          console.error("Failed to fetch MCP:", err)
          addToast("Error", "Failed to load MCP Server configuration", "error")
          setTimeout(() => navigate("/mcp-servers"), 2000)
        })
    } else {
      dispatch(clearCurrentMCP())
      setIsLoading(false)
    }
  }, [serverId, dispatch, navigate])

  // Helper to validate JSON
  const isValidJson = (str) => {
    try {
      if (!str) return true // Empty is valid (or treat as {})
      JSON.parse(str)
      return true
    } catch (e) {
      return false
    }
  }

  const handleSave = async () => {
    // Validation
    if (!mcpData.name.trim()) {
      addToast("Validation Error", "MCP Name is required", "destructive")
      return
    }
    // Name Validation
    const trimmedName = mcpData.name.trim()
    if (!trimmedName || trimmedName.length < 3 || trimmedName.length > 30) {
      addToast("Validation Error", "Server name must be between 3 and 30 characters.", "error")
      return
    }

    // Strict Name Validation (letters, numbers, spaces, hyphens, underscores)
    const nameRegex = /^[A-Za-z0-9 _-]+$/
    if (!nameRegex.test(trimmedName)) {
      addToast(
        "Invalid Name Format",
        "Name can only contain letters, numbers, spaces, hyphens, and underscores",
        "error"
      )
      return
    }

    if (!mcpData.url.trim()) {
      addToast("Validation Error", "Server URL is required", "destructive")
      return
    }
    if (!isValidJson(mcpData.headers)) {
      addToast("Validation Error", "Headers must be valid JSON", "destructive")
      return
    }

    let payload = {}

    if (isEditMode && originalData) {
      // UPDATE: Only send changed fields (diff-based)
      if (mcpData.name !== originalData.name) payload.name = mcpData.name
      if (mcpData.url !== originalData.url) payload.url = mcpData.url
      if (mcpData.headers !== originalData.headers) payload.headers = mcpData.headers
      if (mcpData.is_active !== originalData.is_active) payload.is_active = mcpData.is_active

      // Compare env vars
      const currentEnvKeys = mcpData.environmentVariables.map(e => e.key).sort()
      const originalEnvKeys = originalData.environmentVariables.map(e => e.key).sort()

      const keysChanged = JSON.stringify(currentEnvKeys) !== JSON.stringify(originalEnvKeys)
      const valuesChanged = mcpData.environmentVariables.some(e => !e.isExisting && e.value) // Any new var added

      if (keysChanged || valuesChanged) {
        payload.environmentVariables = mcpData.environmentVariables.map(e => ({
          key: e.key,
          value: e.isExisting ? undefined : e.value
        })).filter(e => e.key)
      }

      if (Object.keys(payload).length === 0) {
        addToast("Info", "No changes detected.", "info")
        return
      }
    } else {
      // CREATE: Send full payload
      payload = {
        name: mcpData.name,
        url: mcpData.url,
        headers: mcpData.headers,
        environmentVariables: mcpData.environmentVariables.map(e => ({
          key: e.key,
          value: e.value
        })).filter(e => e.key)
      }
    }

    try {
      if (isEditMode) {
        await dispatch(updateMCP({ id: serverId, mcpData: payload })).unwrap()
        addToast("Success", "MCP Server updated successfully!", "success")
      } else {
        await dispatch(createMCP(payload)).unwrap()
        addToast("Success", "MCP Server created successfully!", "success")
      }
      setTimeout(() => navigate("/mcp-servers"), 1000)
    } catch (error) {
      console.error("Error saving MCP:", error)
      let errorMsg = "Error saving MCP Server"
      if (typeof error === 'string') {
        errorMsg = error
      } else if (error.response?.data?.detail) {
        const detail = error.response.data.detail
        if (typeof detail === 'string') {
          errorMsg = detail
        } else if (Array.isArray(detail)) {
          // FastAPI validation error
          errorMsg = detail.map(d => d.msg).join(", ")
        } else {
          errorMsg = JSON.stringify(detail)
        }
      } else if (error.message) {
        errorMsg = error.message
      }
      addToast("Error", errorMsg, "destructive")
    }
  }

  const toggleEnvVisibility = (envId) => {
    setEnvVisibility(prev => ({ ...prev, [envId]: !prev[envId] }))
  }

  if (isLoading) {
    return (
      <Layout>
        <Container>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px', color: theme.colors.muted_foreground }}>
            <p>Loading MCP data...</p>
          </div>
        </Container>
      </Layout>
    )
  }

  return (
    <Layout>
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
              onClick={() => navigate("/mcp-servers")} 
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
              {isEditMode ? "Edit MCP Server" : "Create MCP Server"}
            </Text>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: theme.spacing[2] }}>
            <Button variant="ghost" size="sm" onClick={() => navigate("/mcp-servers")} style={{ height: "32px", fontSize: "13px", color: theme.colors.muted_foreground }}>
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
              {isSaving ? (isEditMode ? "Updating..." : "Saving...") : (isEditMode ? "Save Server" : "Create Server")}
            </Button>
          </div>
        </div>
      </div>

      <Container maxWidth="1280px" style={{ paddingTop: theme.spacing[12], paddingBottom: theme.spacing[24], backgroundColor: "transparent" }}>
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px', color: theme.colors.muted_foreground }}>
            <p>Loading MCP data...</p>
          </div>
        ) : (
          <>
            <div style={{ 
              display: "flex", 
              flexDirection: "column", 
              gap: theme.spacing[8], 
              marginBottom: theme.spacing[12] 
            }}>
              {/* Unified Dashboard MCP Card */}
              <Card style={{ padding: 0, border: `${theme.borderWidth.sm} solid ${theme.colors.neutral[200]}`, borderRadius: theme.borderRadius.xl, backgroundColor: theme.colors.card, overflow: "hidden", boxShadow: "none" }}>
                
                {/* Basic Information */}
                <div style={{ padding: theme.spacing[8] }}>
                  <div style={{ display: "flex", alignItems: "center", gap: theme.spacing[2], marginBottom: theme.spacing[6] }}>
                    <div style={{ width: "24px", height: "24px", borderRadius: "6px", backgroundColor: theme.colors.primary.DEFAULT + "08", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Info size={14} style={{ color: theme.colors.primary.DEFAULT }} />
                    </div>
                    <Text weight="semibold" style={{ fontSize: "14px", color: theme.colors.foreground, margin: 0 }}>Basic Information</Text>
                  </div>

                  <div style={{ display: "grid", gap: theme.spacing[6] }}>
                    <div>
                      <label style={{ display: "block", fontSize: "10px", fontWeight: "700", color: theme.colors.neutral[500], textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: theme.spacing[1.5] }}>
                        Server Name *
                      </label>
                      <Input
                        placeholder="e.g. my_local_server"
                        value={mcpData.name}
                        onChange={(e) => setMcpData({ ...mcpData, name: e.target.value })}
                        maxLength={30}
                      />
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginTop: theme.spacing[2] }}>
                        <Text size="xs" variant="muted" style={{ display: "block", fontSize: "11px" }}>
                          Only use letters, numbers, spaces, hyphens, and underscores
                        </Text>
                        <p style={{
                          fontSize: "11px",
                          color: theme.colors.muted_foreground,
                          margin: 0,
                        }}>
                          {mcpData.name?.length || 0}/30 characters
                        </p>
                      </div>
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: "10px", fontWeight: "700", color: theme.colors.neutral[500], textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: theme.spacing[1.5] }}>
                        Server URL *
                      </label>
                      <Input
                        placeholder="e.g. http://localhost:3000/sse"
                        value={mcpData.url}
                        onChange={(e) => setMcpData({ ...mcpData, url: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div style={{ borderTop: `${theme.borderWidth.sm} solid ${theme.colors.neutral[100]}`, margin: `0 ${theme.spacing[8]}` }} />

                {/* Configuration Card */}
                <div style={{ padding: theme.spacing[8] }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: theme.spacing[6] }}>
                    <div style={{ display: "flex", alignItems: "center", gap: theme.spacing[2] }}>
                      <div style={{ width: "24px", height: "24px", borderRadius: "6px", backgroundColor: theme.colors.primary.DEFAULT + "08", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Settings size={14} style={{ color: theme.colors.primary.DEFAULT }} />
                      </div>
                      <Text weight="semibold" style={{ fontSize: "14px", color: theme.colors.foreground, margin: 0 }}>Headers Configuration</Text>
                    </div>
                    <Button variant="outline" size="sm" leadingIcon={Globe} onClick={() => setShowEnvModal(true)} style={{ fontSize: "11px", height: "26px", color: theme.colors.neutral[600] }}>
                      Environment Variables
                    </Button>
                  </div>

                  <div style={{ marginBottom: theme.spacing[4], padding: theme.spacing[4], backgroundColor: theme.colors.primary.DEFAULT + "05", borderRadius: theme.borderRadius.lg, border: `${theme.borderWidth.sm} solid ${theme.colors.primary.DEFAULT}15` }}>
                    <Text style={{ fontSize: "12px", lineHeight: 1.5, color: theme.colors.primary[800] }}>
                      Define HTTP headers in JSON format. Use <code>{"{{env.KEY}}"}</code> to access environment variables.
                    </Text>
                  </div>

                  <div style={{ height: "300px", border: `${theme.borderWidth.sm} solid ${theme.colors.neutral[200]}`, borderRadius: theme.borderRadius.lg, overflow: "hidden" }}>
                    <Editor
                      height="100%"
                      defaultLanguage="json"
                      value={mcpData.headers}
                      onChange={(value) => setMcpData({ ...mcpData, headers: value })}
                      options={{ minimap: { enabled: false }, fontSize: 13, scrollBeyondLastLine: false }}
                      theme={theme.isDark ? "vs-dark" : "vs"}
                    />
                  </div>
                </div>
              </Card>
            </div>
          </>
        )}
      </Container>


      {/* Environment Variables Modal - Full Management */}
      {showEnvModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex", justifyContent: "center", alignItems: "center",
          zIndex: 1000
        }}>
          <Card style={{
            width: "600px",
            maxHeight: "80vh",
            overflow: "auto",
            padding: theme.spacing[6],
            backgroundColor: theme.colors.background,
            boxShadow: theme.shadows.xl,
            border: `${theme.borderWidth.sm} solid ${theme.colors.neutral[200]}`,
            borderRadius: theme.borderRadius.lg
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: theme.spacing[6] }}>
              <div>
                <h2 style={{
                  fontSize: theme.typography.fontSize.lg,
                  fontWeight: theme.typography.fontWeight.semibold,
                  color: theme.colors.foreground,
                  margin: 0,
                }}>
                  Environment Variables
                </h2>
                <p style={{
                  fontSize: theme.typography.fontSize.sm,
                  color: theme.colors.muted_foreground,
                  marginTop: theme.spacing[1],
                  margin: 0,
                }}>
                  Add sensitive configuration variables. Use <code>{"{{env.KEY}}"}</code> to access them.
                </p>
              </div>
              <button
                onClick={() => setShowEnvModal(false)}
                style={{ background: "transparent", border: "none", cursor: "pointer", color: theme.colors.muted_foreground }}
              >
                <X size={24} />
              </button>
            </div>

            {mcpData.environmentVariables.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing[3], marginBottom: theme.spacing[6] }}>
                {mcpData.environmentVariables.map((env, idx) => (
                  <div key={env.id} style={{
                    display: "flex", flexDirection: "column", gap: theme.spacing[3],
                    padding: theme.spacing[4], backgroundColor: theme.colors.neutral[50],
                    borderRadius: theme.borderRadius.sm, border: `1px solid ${theme.colors.neutral[200]}`
                  }}>
                    {/* Key and Value Inputs */}
                    <div style={{ display: "flex", gap: theme.spacing[3] }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: "block", fontSize: theme.typography.fontSize.xs, fontWeight: theme.typography.fontWeight.semibold, color: theme.colors.foreground, marginBottom: theme.spacing[1] }}>Key</label>
                        <Input
                          placeholder="e.g. API_KEY"
                          value={env.key}
                          onChange={e => {
                            const newVars = [...mcpData.environmentVariables]
                            newVars[idx].key = e.target.value
                            setMcpData({ ...mcpData, environmentVariables: newVars })
                          }}
                          disabled={env.isExisting}
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: "block", fontSize: theme.typography.fontSize.xs, fontWeight: theme.typography.fontWeight.semibold, color: theme.colors.foreground, marginBottom: theme.spacing[1] }}>Value</label>
                        <div style={{ position: "relative" }}>
                          <Input
                            type={envVisibility[env.id] ? "text" : "password"}
                            placeholder="Value"
                            value={env.value}
                            onChange={e => {
                              const newVars = [...mcpData.environmentVariables]
                              newVars[idx].value = e.target.value
                              setMcpData({ ...mcpData, environmentVariables: newVars })
                            }}
                            disabled={env.isExisting}
                          />
                          {!env.isExisting && (
                            <button
                              onClick={() => toggleEnvVisibility(env.id)}
                              style={{
                                position: "absolute", right: theme.spacing[3], top: "50%", transform: "translateY(-50%)",
                                background: "none", border: "none", cursor: "pointer", padding: 0, color: theme.colors.muted_foreground, display: 'flex'
                              }}
                            >
                              {envVisibility[env.id] ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Remove Button */}
                    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: theme.spacing[2] }}>
                      <Button
                        variant="destructive"
                        size="sm"
                        leadingIcon={Trash2}
                        onClick={() => {
                          const newVars = mcpData.environmentVariables.filter((_, i) => i !== idx)
                          setMcpData({ ...mcpData, environmentVariables: newVars })
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <Button
              variant="outline"
              size="md"
              leadingIcon={Plus}
              onClick={() => {
                const newVars = [
                  ...mcpData.environmentVariables,
                  { id: Date.now(), key: "", value: "", isPassword: true, isExisting: false }
                ]
                setMcpData({ ...mcpData, environmentVariables: newVars })
              }}
              style={{ marginBottom: theme.spacing[6], width: "100%" }}
            >
              Add Environment Variable
            </Button>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: theme.spacing[3], paddingTop: theme.spacing[4], borderTop: `${theme.borderWidth.sm} solid ${theme.colors.neutral[200]}` }}>
              <Button variant="outline" size="md" onClick={() => setShowEnvModal(false)}>
                Close
              </Button>
            </div>
          </Card>
        </div>
      )}
    </Layout>
  )
}
