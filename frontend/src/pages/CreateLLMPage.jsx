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
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { ChevronLeft, Check, Plus, Trash2, Eye, EyeOff, Settings, X, Globe, Info } from "lucide-react"
import { Toast, ToastContainer } from "@/components/ui/toast"
import { fetchLLMById, createLLM, updateLLM, clearCurrentLLM } from "@/store/slices/llmSlice"

const PROVIDERS = ["OpenAI", "Anthropic", "Gemini", "HuggingFace", "Mistral", "Cohere", "Other"]

export default function CreateLLMPage() {
  const theme = useTheme()
  const navigate = useNavigate()
  const { llmId } = useParams()
  const isEditMode = !!llmId

  /* Redux Hooks */
  const dispatch = useDispatch()
  const { currentLLM, isSaving } = useSelector((state) => state.llms)

  // Form state
  const [llmData, setLLMData] = useState({
    name: "",
    provider: "",
    model: "",
    headers: "{\n  \"Authorization\": \"Bearer {{env.API_KEY}}\"\n}",
    environmentVariables: []
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

  // Load existing LLM if editing
  useEffect(() => {
    if (llmId) {
      dispatch(fetchLLMById(llmId))
        .unwrap()
        .then((data) => {
          const envVars = (data.environmentVariables || []).map((ev, idx) => ({
            ...ev,
            id: Date.now() + idx,
            isExisting: true
          }))

          const mapped = {
            name: data.name || "",
            provider: data.provider || "",
            model: data.model || "",
            headers: data.headers || "{}",
            environmentVariables: envVars
          }

          setLLMData(mapped)
          setOriginalData(JSON.parse(JSON.stringify(mapped))) // Deep copy for diff

          const visibility = {}
          envVars.forEach(env => visibility[env.id] = false)
          setEnvVisibility(visibility)
          setIsLoading(false)
        })
        .catch((err) => {
          console.error("Failed to fetch LLM:", err)
          addToast("Error", "Failed to load LLM configuration", "error")
          navigate("/llms")
        })
    } else {
      // Clear current LLM in redux when creating new
      dispatch(clearCurrentLLM())
      setIsLoading(false)
    }
  }, [llmId, dispatch, navigate])

  // Helper to validate JSON
  const isValidJson = (str) => {
    try {
      JSON.parse(str)
      return true
    } catch (e) {
      return false
    }
  }

  const handleSave = async () => {
    // Validation
    const trimmedName = llmData.name.trim()
    if (!trimmedName || trimmedName.length < 3 || trimmedName.length > 30) {
      addToast("Validation Error", "LLM Name must be between 3 and 30 characters.", "destructive")
      return
    }

    const nameRegex = /^[A-Za-z0-9 _-]+$/
    if (!nameRegex.test(trimmedName)) {
      addToast(
        "Invalid Name Format",
        "Name can only contain letters, numbers, spaces, hyphens, and underscores",
        "destructive"
      )
      return
    }

    if (!llmData.provider) {
      addToast("Validation Error", "Provider is required", "destructive")
      return
    }
    if (!llmData.model.trim()) {
      addToast("Validation Error", "Model Name is required", "destructive")
      return
    }
    if (!isValidJson(llmData.headers)) {
      addToast("Validation Error", "Headers must be valid JSON", "destructive")
      return
    }

    let payload = {}

    if (isEditMode && originalData) {
      // UPDATE: Only send changed fields (diff-based like Tools page)
      if (llmData.name !== originalData.name) payload.name = llmData.name
      if (llmData.provider !== originalData.provider) payload.provider = llmData.provider
      if (llmData.model !== originalData.model) payload.model = llmData.model
      if (llmData.headers !== originalData.headers) payload.headers = llmData.headers

      // Compare env vars (by keys)
      const currentEnvKeys = llmData.environmentVariables.map(e => e.key).sort()
      const originalEnvKeys = originalData.environmentVariables.map(e => e.key).sort()
      if (JSON.stringify(currentEnvKeys) !== JSON.stringify(originalEnvKeys)) {
        payload.environmentVariables = llmData.environmentVariables.map(e => ({
          key: e.key,
          value: e.isExisting ? undefined : e.value,
        })).filter(e => e.key) // Only pass if key is set
      }

      // Include new env var values (secrets for newly added vars)
      const newEnvVars = llmData.environmentVariables.filter(e => !e.isExisting && e.key && e.value)
      if (newEnvVars.length > 0 && !payload.environmentVariables) {
        payload.environmentVariables = llmData.environmentVariables.map(e => ({
          key: e.key,
          value: e.isExisting ? undefined : e.value,
        })).filter(e => e.key)
      }

      if (Object.keys(payload).length === 0) {
        addToast("Info", "No changes detected.", "info")
        return
      }
    } else {
      // CREATE: Send full payload
      payload = {
        name: llmData.name,
        provider: llmData.provider,
        model: llmData.model,
        headers: llmData.headers,
        environmentVariables: llmData.environmentVariables.map(e => ({
          key: e.key,
          value: e.value,
        })).filter(e => e.key)
      }
    }

    try {
      if (isEditMode) {
        await dispatch(updateLLM({ id: llmId, llmData: payload })).unwrap()
        addToast("Success", "LLM updated successfully!", "success")
      } else {
        await dispatch(createLLM(payload)).unwrap()
        addToast("Success", "LLM created successfully!", "success")
      }
      // Delay navigation slightly to show success toast
      setTimeout(() => navigate("/llms"), 1000)
    } catch (error) {
      console.error("Error saving LLM:", error)
      const errorMsg = typeof error === 'string' ? error : (error.detail || "Error saving LLM")
      addToast("Error", errorMsg, "error")
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
            <p>Loading LLM data...</p>
          </div>
        </Container>
      </Layout>
    )
  }

  return (
    <Layout>
      {/* Toast Notifications */}
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
              onClick={() => navigate("/llms")} 
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
              {llmId ? "Edit LLM" : "Create LLM"}
            </Text>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: theme.spacing[2] }}>
            <Button variant="ghost" size="sm" onClick={() => navigate("/llms")} style={{ height: "32px", fontSize: "13px", color: theme.colors.muted_foreground }}>
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
              {isSaving ? (llmId ? "Updating..." : "Saving...") : (llmId ? "Save LLM" : "Create LLM")}
            </Button>
          </div>
        </div>
      </div>

      <Container maxWidth="1280px" style={{ paddingTop: theme.spacing[12], paddingBottom: theme.spacing[24], backgroundColor: "transparent" }}>
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px', color: theme.colors.muted_foreground }}>
            <p>Loading LLM data...</p>
          </div>
        ) : (
          <>
            <div style={{ 
              display: "flex", 
              flexDirection: "column", 
              gap: theme.spacing[8], 
              marginBottom: theme.spacing[12] 
            }}>
              {/* Unified Dashboard LLM Card */}
              <Card style={{ padding: 0, border: `${theme.borderWidth.sm} solid ${theme.colors.neutral[200]}`, borderRadius: theme.borderRadius.xl, backgroundColor: theme.colors.card, overflow: "hidden", boxShadow: "none" }}>
                
                {/* LLM Information */}
                <div style={{ padding: theme.spacing[8] }}>
                  <div style={{ display: "flex", alignItems: "center", gap: theme.spacing[2], marginBottom: theme.spacing[6] }}>
                    <div style={{ width: "24px", height: "24px", borderRadius: "6px", backgroundColor: theme.colors.primary.DEFAULT + "08", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Info size={14} style={{ color: theme.colors.primary.DEFAULT }} />
                    </div>
                    <Text weight="semibold" style={{ fontSize: "14px", color: theme.colors.foreground, margin: 0 }}>LLM Information</Text>
                  </div>

                  <div style={{ marginBottom: theme.spacing[6] }}>
                    <label style={{ display: "block", fontSize: "10px", fontWeight: "700", color: theme.colors.neutral[500], textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: theme.spacing[1.5] }}>
                      LLM Name *
                    </label>
                    <Input placeholder="e.g. Production GPT-4" value={llmData.name} onChange={(e) => setLLMData({ ...llmData, name: e.target.value })} maxLength={30} />
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginTop: theme.spacing[2] }}>
                      <Text size="xs" variant="muted" style={{ display: "block", fontSize: "11px" }}>
                        Only use letters, numbers, spaces, hyphens, and underscores
                      </Text>
                      <p style={{
                        fontSize: "11px",
                        color: theme.colors.muted_foreground,
                        margin: 0,
                      }}>
                        {llmData.name?.length || 0}/30 characters
                      </p>
                    </div>
                  </div>
                </div>

                <div style={{ borderTop: `${theme.borderWidth.sm} solid ${theme.colors.neutral[100]}`, margin: `0 ${theme.spacing[8]}` }} />

                {/* Provider & Model */}
                <div style={{ padding: theme.spacing[8] }}>
                  <div style={{ display: "flex", alignItems: "center", gap: theme.spacing[2], marginBottom: theme.spacing[6] }}>
                    <div style={{ width: "24px", height: "24px", borderRadius: "6px", backgroundColor: theme.colors.primary.DEFAULT + "08", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Settings size={14} style={{ color: theme.colors.primary.DEFAULT }} />
                    </div>
                    <Text weight="semibold" style={{ fontSize: "14px", color: theme.colors.foreground, margin: 0 }}>Provider & Model</Text>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: "1fr 1fr", gap: theme.spacing[6] }}>
                    <div>
                      <label style={{ display: "block", fontSize: "10px", fontWeight: "700", color: theme.colors.neutral[500], textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: theme.spacing[1.5] }}>Provider *</label>
                      <Select value={llmData.provider} onValueChange={(val) => setLLMData({ ...llmData, provider: val })}>
                        <SelectTrigger size="md"><SelectValue placeholder="Select Provider" /></SelectTrigger>
                        <SelectContent>
                          {PROVIDERS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: "10px", fontWeight: "700", color: theme.colors.neutral[500], textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: theme.spacing[1.5] }}>Model Name *</label>
                      <Input placeholder="e.g., gpt-4, claude-3-opus" value={llmData.model} onChange={(e) => setLLMData({ ...llmData, model: e.target.value })} />
                    </div>
                  </div>
                </div>

                <div style={{ borderTop: `${theme.borderWidth.sm} solid ${theme.colors.neutral[100]}`, margin: `0 ${theme.spacing[8]}` }} />

                {/* Headers & Env Vars */}
                <div style={{ padding: theme.spacing[8] }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing[6] }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing[2] }}>
                      <div style={{ width: "24px", height: "24px", borderRadius: "6px", backgroundColor: theme.colors.primary.DEFAULT + "08", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Globe size={14} style={{ color: theme.colors.primary.DEFAULT }} />
                      </div>
                      <Text weight="semibold" style={{ fontSize: "14px", color: theme.colors.foreground, margin: 0 }}>Headers Configuration</Text>
                    </div>
                    <Button variant="outline" size="sm" leadingIcon={Settings} onClick={() => setShowEnvModal(true)} style={{ fontSize: "11px", height: "26px", color: theme.colors.neutral[600] }}>
                      Environment Variables
                    </Button>
                  </div>

                  <div style={{ marginBottom: theme.spacing[4], padding: theme.spacing[4], backgroundColor: theme.colors.primary.DEFAULT + "05", borderRadius: theme.borderRadius.lg, border: `${theme.borderWidth.sm} solid ${theme.colors.primary.DEFAULT}15` }}>
                    <Text style={{ fontSize: "12px", lineHeight: 1.5, color: theme.colors.primary[800] }}>
                      Use <code>{"{{env.KEY}}"}</code> to reference environment variables securely.<br />
                      Example: <code>{`"Authorization": "Bearer {{env.OPENAI_API_KEY}}"`}</code>
                    </Text>
                  </div>

                  <div style={{ height: "250px", border: `${theme.borderWidth.sm} solid ${theme.colors.neutral[200]}`, borderRadius: theme.borderRadius.lg, overflow: "hidden" }}>
                    <Editor
                      height="100%"
                      defaultLanguage="json"
                      value={llmData.headers}
                      onChange={(value) => setLLMData({ ...llmData, headers: value || "" })}
                      theme={theme.isDark ? "vs-dark" : "vs"}
                      options={{ minimap: { enabled: false }, fontSize: 13, scrollBeyondLastLine: false }}
                    />
                  </div>
                </div>
              </Card>
            </div>
          </>
        )}
      </Container>

        {/* Environment Variables Modal */}
        {showEnvModal && (
          <div style={{
            position: "fixed",
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex", justifyContent: "center", alignItems: "center",
            zIndex: 1000,
          }}>
            <Card style={{
              padding: theme.spacing[6],
              borderRadius: theme.borderRadius.lg,
              backgroundColor: theme.colors.card,
              maxWidth: "600px", width: "90%",
              maxHeight: "80vh", overflow: "auto",
              border: `${theme.borderWidth.sm} solid ${theme.colors.neutral[200]}`,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: theme.spacing[6] }}>
                <div>
                  <h2 style={{ fontSize: theme.typography.fontSize.lg, fontWeight: theme.typography.fontWeight.semibold, color: theme.colors.foreground, margin: 0 }}>
                    Environment Variables
                  </h2>
                  <p style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.muted_foreground, marginTop: theme.spacing[1], margin: 0 }}>
                    {isEditMode
                      ? "Existing variables are read-only. You can delete them or add new ones."
                      : <>Add sensitive configuration variables. Use <code>{"{{env.KEY}}"}</code> to access them.</>
                    }
                  </p>
                </div>
                <button onClick={() => setShowEnvModal(false)} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", color: theme.colors.muted_foreground }}>
                  <X size={24} />
                </button>
              </div>

              {llmData.environmentVariables && llmData.environmentVariables.length > 0 && (
                <div style={{ marginBottom: theme.spacing[6] }}>
                  {llmData.environmentVariables.map((envVar, idx) => (
                    <div key={envVar.id || idx} style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: theme.spacing[3],
                      marginBottom: theme.spacing[4],
                      padding: theme.spacing[4],
                      border: `${theme.borderWidth.sm} solid ${theme.colors.neutral[200]}`,
                      borderRadius: theme.borderRadius.sm,
                      backgroundColor: envVar.isExisting ? theme.colors.neutral[100] : theme.colors.neutral[50],
                    }}>
                      <div style={{ display: "flex", gap: theme.spacing[3] }}>
                        <div style={{ flex: 1 }}>
                          <label style={{ display: "block", fontSize: theme.typography.fontSize.xs, fontWeight: theme.typography.fontWeight.semibold, color: theme.colors.foreground, marginBottom: theme.spacing[1] }}>Key</label>
                          <Input
                            placeholder="e.g., API_KEY"
                            value={envVar.key || ""}
                            onChange={(e) => {
                              const newVars = [...llmData.environmentVariables]
                              newVars[idx].key = e.target.value.toUpperCase()
                              setLLMData({ ...llmData, environmentVariables: newVars })
                            }}
                            disabled={envVar.isExisting}
                          />
                        </div>

                        <div style={{ flex: 1 }}>
                          <label style={{ display: "block", fontSize: theme.typography.fontSize.xs, fontWeight: theme.typography.fontWeight.semibold, color: theme.colors.foreground, marginBottom: theme.spacing[1] }}>Value</label>
                          <div style={{ position: "relative" }}>
                            <Input
                              placeholder={envVar.isExisting ? "••••••••••••" : "Enter value"}
                              type={envVisibility[envVar.id] ? "text" : "password"}
                              value={envVar.isExisting ? "****************" : (envVar.value || "")}
                              onChange={(e) => {
                                if (envVar.isExisting) return
                                const newVars = [...llmData.environmentVariables]
                                newVars[idx].value = e.target.value
                                setLLMData({ ...llmData, environmentVariables: newVars })
                              }}
                              disabled={envVar.isExisting}
                            />
                            {!envVar.isExisting && (
                              <button
                                onClick={() => toggleEnvVisibility(envVar.id)}
                                style={{ position: "absolute", right: theme.spacing[3], top: "50%", transform: "translateY(-50%)", background: "none", border: "none", padding: 0, cursor: "pointer", color: theme.colors.muted_foreground, display: "flex", alignItems: "center", justifyContent: "center" }}
                                type="button"
                              >
                                {envVisibility[envVar.id] ? <EyeOff size={18} /> : <Eye size={18} />}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: "flex", justifyContent: "flex-end" }}>
                        <Button variant="destructive" size="sm" leadingIcon={Trash2} onClick={() => {
                          const newVars = llmData.environmentVariables.filter((_, i) => i !== idx)
                          setLLMData({ ...llmData, environmentVariables: newVars })
                        }}>
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <Button variant="outline" size="md" leadingIcon={Plus} onClick={() => {
                const newVars = [...(llmData.environmentVariables || []), { id: Date.now(), key: "", value: "", isPassword: true, isExisting: false }]
                if (newVars.length <= 20) setLLMData({ ...llmData, environmentVariables: newVars })
                else addToast("Limit Exceeded", "Maximum 20 environment variables allowed", "destructive")
              }} style={{ marginBottom: theme.spacing[6], width: "100%" }}>
                Add Environment Variable
              </Button>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: theme.spacing[3], paddingTop: theme.spacing[4], borderTop: `${theme.borderWidth.sm} solid ${theme.colors.neutral[200]}` }}>
                <Button variant="outline" size="md" onClick={() => setShowEnvModal(false)}>Close</Button>
              </div>
            </Card>
          </div>
        )}
    </Layout>
  )
}
