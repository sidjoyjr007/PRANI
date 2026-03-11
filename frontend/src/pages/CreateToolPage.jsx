import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
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
import { Checkbox } from "@/components/ui/checkbox"
import { Chips } from "@/components/ui/chips"
import { Combobox, ComboboxTrigger, ComboboxContent, ComboboxItem, ComboboxSearch } from "@/components/ui/combobox"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Dialog, DialogTrigger, DialogPortal, DialogOverlay, DialogContent, DialogClose } from "@/components/ui/dialog"
import { ChevronLeft, Check, Plus, Trash2, Eye, EyeOff, Settings, X, Globe, Lock } from "lucide-react"
import { toolService } from "@/services/toolService"
import { useDispatch, useSelector } from "react-redux"
import { fetchToolById, createTool, updateTool, clearCurrentTool } from "@/store/slices/toolSlice"
import { Toast, ToastContainer } from "@/components/ui/toast"

const MOCK_TOOLS = [
  {
    id: 1,
    name: "Web Search",
    description: "Search the internet for real-time information and web resources",
    inputFields: [
      { id: 1, name: "query", description: "Search query", dataType: "str", defaultValue: "example", required: true }
    ],
    code: `def execute_tool(inputs):\n    query = inputs.get('query', '')\n    return {"result": f"Search results for {query}"}`,
    environmentVariables: [
      { id: 1, key: "API_KEY", value: "secret123", isPassword: true }
    ]
  },
]

export default function CreateToolPage() {
  const theme = useTheme()
  const navigate = useNavigate()
  const { toolId } = useParams()

  /* Redux Hooks */
  const dispatch = useDispatch()
  const { currentTool, isSaving } = useSelector((state) => state.tools)

  /* Local State */
  const [toolData, setToolData] = useState({
    id: null,
    name: "",
    description: "",
    inputFields: [],
    code: "",
    environmentVariables: [],
    categories: [],
  })
  const [originalData, setOriginalData] = useState(null)

  const [isLoading, setIsLoading] = useState(!!toolId)
  const [showEnvModal, setShowEnvModal] = useState(false)
  const [envVisibility, setEnvVisibility] = useState({})

  // Toast State
  const [toasts, setToasts] = useState([])

  const addToast = (title, description, variant = "info") => {
    const id = Date.now().toString()
    setToasts((prev) => [...prev, { id, title, description, variant }])

    // Auto remove after 5 seconds matching Toast component default
    setTimeout(() => {
      removeToast(id)
    }, 5000)
  }

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  // Load tool data when editing
  useEffect(() => {
    if (toolId) {
      dispatch(fetchToolById(toolId))
        .unwrap()
        .then((tool) => {
          // Map backend schema to frontend state
          const mappedTool = {
            id: tool.id,
            name: tool.name,
            description: tool.description,
            code: tool.code,
            categories: tool.categories || [],
            // Map input fields (type -> dataType)
            inputFields: (tool.input_fields || []).map((f, idx) => ({
              id: idx,
              name: f.name,
              description: f.description,
              dataType: f.type,
              defaultValue: f.default,
              required: f.required
            })),
            // Map env variables (env_var_defs -> list of keys)
            environmentVariables: (tool.env_var_defs || []).map((e, idx) => ({
              id: idx,
              key: e.name,
              value: "****************", // Dummy mask for visual
              description: e.description,
              isPassword: true,
              isExisting: true
            }))
          }
          setToolData(mappedTool)
          setOriginalData(JSON.parse(JSON.stringify(mappedTool))) // Deep copy
          // Initialize visibility
          const visibility = {}
          mappedTool.environmentVariables.forEach(env => {
            visibility[env.id] = false
          })
          setEnvVisibility(visibility)
          setIsLoading(false)
        })
        .catch((err) => {
          console.error("Failed to fetch tool:", err)
          addToast("Error", "Failed to load tool data", "error")
          navigate("/tools")
        })
    } else {
      // Clear current tool in redux when creating new
      dispatch(clearCurrentTool())
      setIsLoading(false)
    }
  }, [toolId, dispatch, navigate])

  const validateToolData = () => {
    const trimmedName = (toolData.name || "").trim()
    const trimmedDescription = (toolData.description || "").trim()

    // 1. Name Required and Length
    if (!trimmedName || trimmedName.length < 3 || trimmedName.length > 30) {
      addToast("Validation Error", "Tool name must be between 3 and 30 characters.", "error")
      return false
    }

    // 2. Strict Name Validation (letters, numbers, spaces, hyphens, underscores)
    const nameRegex = /^[A-Za-z0-9 _-]+$/
    if (!nameRegex.test(trimmedName)) {
      addToast(
        "Invalid Name Format",
        "Name can only contain letters, numbers, spaces, hyphens, and underscores",
        "error"
      )
      return false
    }

    // 3. Description Required
    if (!trimmedDescription || trimmedDescription.length < 10) {
      addToast("Validation Error", "Description must be at least 10 characters.", "error")
      return false
    }

    const descriptionWordCount = trimmedDescription.split(/\s+/).filter(Boolean).length
    if (descriptionWordCount > 50) {
      addToast("Validation Error", "Description cannot exceed 50 words.", "error")
      return false
    }

    // 4. Code Required
    if (!toolData.code || !toolData.code.trim()) {
      addToast("Validation Error", "Python code is required.", "error")
      return false
    }
    if (toolData.code && !toolData.code.includes("def execute_tool")) {
      addToast("Validation Error", "Code must contain 'def execute_tool' function definition.", "error")
      return false
    }

    // 5. Input Fields Validation
    if (toolData.inputFields.length > 0) {
      for (let idx = 0; idx < toolData.inputFields.length; idx++) {
        const field = toolData.inputFields[idx]
        if (!field.name || !field.name.trim()) {
          addToast("Validation Error", `Input Field #${idx + 1}: Name is required.`, "error")
          return false
        }
        if (!field.description || !field.description.trim()) {
          addToast("Validation Error", `Input Field #${idx + 1} (${field.name || 'Unnamed'}): Description is required.`, "error")
          return false
        }
        if (!field.dataType) {
          addToast("Validation Error", `Input Field #${idx + 1} (${field.name || 'Unnamed'}): Data type is required.`, "error")
          return false
        }
      }
    }

    // 6. Env Variables Validation
    if (toolData.environmentVariables.length > 0) {
      const keys = new Set()
      for (let idx = 0; idx < toolData.environmentVariables.length; idx++) {
        const env = toolData.environmentVariables[idx]

        // 6a. Empty key check
        if (!env.key || !env.key.trim()) {
          addToast("Validation Error", `Env Variable #${idx + 1}: Key cannot be empty.`, "error")
          return false
        }

        // 6b. Duplicate key check
        const trimmedKey = env.key.trim()
        if (keys.has(trimmedKey)) {
          addToast("Validation Error", `Env Variable '${trimmedKey}': Duplicate keys are not allowed.`, "error")
          return false
        }
        keys.add(trimmedKey)

        // 6c. Empty value check (required for both NEW and EXISTING variables based on instructions)
        const isValueMissing = !env.value || !env.value.trim()
        if (isValueMissing) {
          addToast("Validation Error", `Env Variable '${trimmedKey}': Value cannot be empty.`, "error")
          return false
        }
      }
    }

    return true
  }

  const handleSave = async () => {
    if (!validateToolData()) {
      return
    }

    const unformattedName = (toolData.name || "").trim()
    const trimmedDescription = (toolData.description || "").trim()

    let payload = {}

    // Prepare common structures
    const inputFieldsMapped = toolData.inputFields.map(f => ({
      name: f.name,
      type: f.dataType,
      description: f.description,
      default: f.defaultValue,
      required: f.required
    }))

    const envVarDefsMapped = toolData.environmentVariables.map(e => ({
      name: e.key,
      description: e.description || "Required environment variable",
      required: true
    }))

    const secretsMapped = toolData.environmentVariables.reduce((acc, curr) => {
      if (curr.value && curr.value.trim() !== "") {
        // If it's the mask and it's an existing variable, SKIP it (don't update secret)
        if (curr.value === "****************" && curr.isExisting) {
          return acc
        }
        acc[curr.key] = curr.value
      }
      return acc
    }, {})

    const isEditing = !!toolData.id && !!originalData;

    if (isEditing) {
      // Delta generation
      if (unformattedName !== originalData.name) payload.name = unformattedName
      if (trimmedDescription !== originalData.description) payload.description = trimmedDescription
      if (toolData.code !== originalData.code) payload.code = toolData.code

      // Compare categories
      const originalCategories = originalData.categories || []
      const currentCategories = toolData.categories || []
      if (JSON.stringify(currentCategories) !== JSON.stringify(originalCategories)) {
        payload.categories = currentCategories
      }

      // Compare Input Fields
      const originalInputs = originalData.inputFields.map(f => ({
        name: f.name, type: f.dataType, description: f.description, default: f.defaultValue, required: f.required
      }))
      if (JSON.stringify(inputFieldsMapped) !== JSON.stringify(originalInputs)) {
        payload.input_fields = inputFieldsMapped
      }

      // Compare Env Var Defs
      const originalEnvDefs = originalData.environmentVariables.map(e => ({
        name: e.key, description: e.description || "Required environment variable", required: true
      }))
      if (JSON.stringify(envVarDefsMapped) !== JSON.stringify(originalEnvDefs)) {
        payload.env_var_defs = envVarDefsMapped
      }

      // Secrets: Always include if we have new values
      if (Object.keys(secretsMapped).length > 0) {
        payload.secrets = secretsMapped
      }

      if (Object.keys(payload).length === 0) {
        addToast("Info", "No changes detected.", "info")
        return
      }

    } else {
      // CREATE: Send full payload
      payload = {
        name: unformattedName,
        description: trimmedDescription,
        code: toolData.code || "def execute_tool():\n    pass",
        categories: toolData.categories || [],
        input_fields: inputFieldsMapped,
        env_var_defs: envVarDefsMapped,
        is_public: !!toolData.is_public,
        secrets: secretsMapped
      }
    }

    try {
      if (toolData.id) {
        await dispatch(updateTool({ id: toolData.id, toolData: payload })).unwrap()
        addToast("Success", "Tool updated successfully!", "success")
      } else {
        await dispatch(createTool(payload)).unwrap()
        addToast("Success", "Tool created successfully!", "success")
      }
      // Delay navigation slightly to show success toast
      setTimeout(() => navigate("/tools"), 1000)
    } catch (error) {
      console.error("Error saving tool:", error)
      let errorMsg = "Error saving tool"
      if (typeof error === 'string') {
        errorMsg = error
      } else if (error && error.detail) {
        if (Array.isArray(error.detail)) {
          errorMsg = error.detail.map(e => e.msg).join(", ")
        } else {
          errorMsg = String(error.detail)
        }
      } else if (error && error.message) {
        errorMsg = error.message
      }
      addToast("Validation Error", errorMsg, "error")
    }
  }

  const toggleEnvVisibility = (envId) => {
    setEnvVisibility(prev => ({ ...prev, [envId]: !prev[envId] }))
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

      <Container>
        {isLoading ? (
          <div style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "400px",
            color: theme.colors.muted_foreground
          }}>
            <p>Loading tool data...</p>
          </div>
        ) : (
          <>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: theme.spacing[8],
              paddingBottom: theme.spacing[4],
              borderBottom: `${theme.borderWidth.sm} solid ${theme.colors.neutral[200]}`,
            }}>
              <Button variant="outline" size="md" leadingIcon={ChevronLeft} onClick={() => navigate("/tools")}>
                Back
              </Button>
              <h1 style={{
                fontSize: theme.typography.fontSize.xl2,
                fontWeight: theme.typography.fontWeight.bold,
                color: theme.colors.foreground,
                margin: 0,
                flex: 1,
                textAlign: "center",
              }}>
                {toolData.id ? "Edit Tool" : "Create New Tool"}
              </h1>
              <Button variant="primary" size="md" leadingIcon={Check} onClick={handleSave} disabled={isSaving}>
                {isSaving ? (toolData.id ? "Updating..." : "Saving...") : (toolData.id ? "Update" : "Save")}
              </Button>
            </div>

            <div style={{
              display: "flex",
              flexDirection: "column",
              gap: theme.spacing[8],
              marginBottom: theme.spacing[8],
            }}>
              {/* Tool Information Card */}
              <Card style={{
                padding: theme.spacing[6],
                border: `${theme.borderWidth.sm} solid ${theme.colors.neutral[200]}`,
                borderRadius: theme.borderRadius.md,
                backgroundColor: theme.colors.card,
              }}>
                <Text as="h3" size="lg" variant="label" style={{ marginBottom: theme.spacing[6] }}>
                  Tool Information
                </Text>
                <div style={{ marginBottom: theme.spacing[6] }}>
                  <label style={{
                    display: "block",
                    fontSize: theme.typography.fontSize.sm,
                    fontWeight: theme.typography.fontWeight.semibold,
                    color: theme.colors.foreground,
                    marginBottom: theme.spacing[2],
                  }}>
                    Tool Name *
                  </label>
                  <Input
                    placeholder="e.g., web_search, code_executor"
                    value={toolData.name || ""}
                    onChange={(e) => setToolData({ ...toolData, name: e.target.value })}
                    maxLength={30}
                  />
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginTop: theme.spacing[2] }}>
                    <Text size="xs" variant="muted" style={{ display: "block" }}>
                      Only use letters, numbers, spaces, hyphens, and underscores
                    </Text>
                    <p style={{
                      fontSize: theme.typography.fontSize.xs,
                      color: theme.colors.muted_foreground,
                      margin: 0,
                    }}>
                      {toolData.name?.length || 0}/30 characters
                    </p>
                  </div>
                </div>
                <div>
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
                    placeholder="Describe what your tool does"
                    value={toolData.description || ""}
                    onChange={(e) => setToolData({ ...toolData, description: e.target.value })}
                    rows={3}
                    showCharCount={false}
                  />
                  <p style={{
                    fontSize: theme.typography.fontSize.xs,
                    color: ((toolData.description || "").trim().split(/\s+/).filter(Boolean).length) > 50 ? theme.colors.destructive[600] : theme.colors.muted_foreground,
                    margin: `${theme.spacing[2]} 0 0 0`,
                  }}>
                    {(toolData.description || "").trim().split(/\s+/).filter(Boolean).length}/50 words
                  </p>
                </div>

              </Card>

              {/* Input Fields Card */}
              <Card style={{
                padding: theme.spacing[6],
                border: `${theme.borderWidth.sm} solid ${theme.colors.neutral[200]}`,
                borderRadius: theme.borderRadius.md,
                backgroundColor: theme.colors.card,
              }}>
                <div style={{ marginBottom: theme.spacing[6] }}>
                  <Text as="h3" size="lg" variant="label">
                    Input Fields ({toolData.inputFields?.length || 0})
                  </Text>
                  <Text as="p" size="sm" variant="body" style={{ color: theme.colors.muted_foreground, marginTop: theme.spacing[1] }}>
                    Define the input parameters for your tool
                  </Text>
                </div>

                {toolData.inputFields && toolData.inputFields.length > 0 && (
                  <div style={{ marginBottom: theme.spacing[6] }}>
                    {toolData.inputFields.map((field, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: theme.spacing[4],
                          marginBottom: theme.spacing[4],
                          padding: theme.spacing[4],
                          border: `${theme.borderWidth.sm} solid ${theme.colors.neutral[200]}`,
                          borderRadius: theme.borderRadius.sm,
                          backgroundColor: theme.colors.neutral[50],
                        }}
                      >
                        {/* Row 1: Name and Description */}
                        <div style={{ display: "flex", gap: theme.spacing[3] }}>
                          <div style={{ flex: 1 }}>
                            <label style={{
                              display: "block",
                              fontSize: theme.typography.fontSize.xs,
                              fontWeight: theme.typography.fontWeight.semibold,
                              color: theme.colors.foreground,
                              marginBottom: theme.spacing[1],
                            }}>
                              Field Name
                            </label>
                            <Input
                              placeholder="e.g., query"
                              value={field.name || ""}
                              onChange={(e) => {
                                const newFields = [...toolData.inputFields]
                                newFields[idx] = { ...newFields[idx], name: e.target.value }
                                setToolData({ ...toolData, inputFields: newFields })
                              }}
                            />
                          </div>
                          <div style={{ flex: 1 }}>
                            <label style={{
                              display: "block",
                              fontSize: theme.typography.fontSize.xs,
                              fontWeight: theme.typography.fontWeight.semibold,
                              color: theme.colors.foreground,
                              marginBottom: theme.spacing[1],
                            }}>
                              Description
                            </label>
                            <Input
                              placeholder="Field description"
                              value={field.description || ""}
                              onChange={(e) => {
                                const newFields = [...toolData.inputFields]
                                newFields[idx] = { ...newFields[idx], description: e.target.value }
                                setToolData({ ...toolData, inputFields: newFields })
                              }}
                            />
                          </div>
                        </div>

                        {/* Row 2: Type and Default Value */}
                        <div style={{ display: "flex", gap: theme.spacing[3] }}>
                          <div style={{ flex: 1 }}>
                            <label style={{
                              display: "block",
                              fontSize: theme.typography.fontSize.xs,
                              fontWeight: theme.typography.fontWeight.semibold,
                              color: theme.colors.foreground,
                              marginBottom: theme.spacing[1],
                            }}>
                              Data Type
                            </label>
                            <Select value={field.dataType || "str"} onValueChange={(value) => {
                              const newFields = [...toolData.inputFields]
                              newFields[idx] = { ...newFields[idx], dataType: value }
                              setToolData({ ...toolData, inputFields: newFields })
                            }}>
                              <SelectTrigger size="lg">
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="str">String</SelectItem>
                                <SelectItem value="int">Integer</SelectItem>
                                <SelectItem value="float">Float</SelectItem>
                                <SelectItem value="bool">Boolean</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div style={{ flex: 1 }}>
                            <label style={{
                              display: "block",
                              fontSize: theme.typography.fontSize.xs,
                              fontWeight: theme.typography.fontWeight.semibold,
                              color: theme.colors.foreground,
                              marginBottom: theme.spacing[1],
                            }}>
                              Default Value
                            </label>
                            <Input
                              placeholder="Default value"
                              value={field.defaultValue || ""}
                              onChange={(e) => {
                                const newFields = [...toolData.inputFields]
                                newFields[idx] = { ...newFields[idx], defaultValue: e.target.value }
                                setToolData({ ...toolData, inputFields: newFields })
                              }}
                            />
                          </div>
                        </div>

                        {/* Row 3: Required Checkbox */}
                        <div>
                          <Checkbox
                            checked={field.required || false}
                            onChange={(e) => {
                              const newFields = [...toolData.inputFields]
                              newFields[idx] = { ...newFields[idx], required: e.target.checked }
                              setToolData({ ...toolData, inputFields: newFields })
                            }}
                            label="Required"
                            size="md"
                          />
                        </div>

                        {/* Row 4: Remove Button */}
                        <div style={{ display: "flex", justifyContent: "flex-end" }}>
                          <Button
                            variant="destructive"
                            size="sm"
                            leadingIcon={Trash2}
                            onClick={() => {
                              const newFields = toolData.inputFields.filter((_, i) => i !== idx)
                              setToolData({ ...toolData, inputFields: newFields })
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
                    const newFields = [
                      ...(toolData.inputFields || []),
                      { id: Date.now(), name: "", description: "", dataType: "str", defaultValue: "", required: false }
                    ]
                    if (newFields.length <= 20) {
                      setToolData({ ...toolData, inputFields: newFields })
                    } else {
                      addToast("Limit Reached", "Maximum 20 input fields allowed", "warning")
                    }
                  }}
                >
                  Add Input Field
                </Button>
              </Card>

              {/* Code Editor Card */}
              <Card style={{
                padding: theme.spacing[6],
                border: `${theme.borderWidth.sm} solid ${theme.colors.neutral[200]}`,
                borderRadius: theme.borderRadius.md,
                backgroundColor: theme.colors.card,
              }}>
                <div style={{ marginBottom: theme.spacing[6], display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <h3 style={{
                      fontSize: theme.typography.fontSize.lg,
                      fontWeight: theme.typography.fontWeight.semibold,
                      color: theme.colors.foreground,
                      margin: 0,
                    }}>
                      Python Code
                    </h3>

                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    leadingIcon={Settings}
                    onClick={() => setShowEnvModal(true)}
                  >
                    Env Variables
                  </Button>
                </div>

                <div style={{ marginBottom: theme.spacing[4] }}>
                  <div style={{
                    padding: theme.spacing[4],
                    backgroundColor: theme.colors.primary[50],
                    border: `1px solid ${theme.colors.primary[200]}`,
                    borderRadius: theme.borderRadius.md,
                  }}>
                    <p style={{
                      fontSize: theme.typography.fontSize.sm,
                      color: theme.colors.primary[900],
                      margin: 0,
                      lineHeight: 1.5,
                    }}>
                      <strong>Required Function:</strong> Your code MUST define a function named <code>def execute_tool(inputs):</code> which accepts dictionary inputs and returns a result.
                      <br />
                      <strong>Environment Variables:</strong> Access environment variables defined below using the syntax <code>{"{{env.VARIABLE_NAME}}"}</code> within your code string.
                      <br />
                      <em>Example:</em> <code>api_key = "{"{{env.API_KEY}}"}"</code>
                    </p>
                  </div>
                </div>
                <label style={{
                  display: "block",
                  fontSize: theme.typography.fontSize.sm,
                  fontWeight: theme.typography.fontWeight.semibold,
                  color: theme.colors.foreground,
                  marginBottom: theme.spacing[2],
                }}>
                  Code *
                </label>
                <div style={{
                  border: `2px solid ${theme.colors.neutral[300]}`,
                  borderRadius: theme.borderRadius.md,
                  overflow: "hidden",
                }}>
                  <Editor
                    height="500px"
                    defaultLanguage="python"
                    value={toolData.code || ""}
                    onChange={(value) => setToolData({ ...toolData, code: value || "" })}
                    theme={theme.isDark ? "vs-dark" : "vs"}
                    options={{
                      minimap: { enabled: false },
                      fontSize: 13,
                      fontFamily: "'Monaco', 'Courier New', monospace",
                      lineHeight: 1.5,
                      letterSpacing: 0.5,
                      tabSize: 4,
                      wordWrap: "on",
                      scrollBeyondLastLine: false,
                      renderLineHighlight: "none",
                      padding: {
                        top: 12,
                        bottom: 12,
                      },
                      scrollbar: {
                        vertical: "auto",
                        horizontal: "auto",
                      },
                    }}
                  />
                </div>
              </Card>
            </div>

            {/* Footer Section */}
            <div style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: theme.spacing[3],
              paddingTop: theme.spacing[6],
              borderTop: `${theme.borderWidth.sm} solid ${theme.colors.neutral[200]}`,
            }}>
              <Button variant="outline" size="md" onClick={() => navigate("/tools")}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="md"
                leadingIcon={Check}
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? (toolData.id ? "Updating..." : "Saving...") : (toolData.id ? "Update Tool" : "Save Tool")}
              </Button>
            </div>
          </>
        )}
      </Container>

      {/* Environment Variables Modal */}
      {showEnvModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000,
        }}>
          <Card style={{
            padding: theme.spacing[6],
            borderRadius: theme.borderRadius.lg,
            backgroundColor: theme.colors.card,
            maxWidth: "600px",
            width: "90%",
            maxHeight: "80vh",
            overflow: "auto",
            border: `${theme.borderWidth.sm} solid ${theme.colors.neutral[200]}`,
          }}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: theme.spacing[6],
            }}>
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
                  Add sensitive configuration variables. Use <code>{"{{env.KEY}}"}</code> to access them in your code.
                </p>
              </div>
              <button
                onClick={() => setShowEnvModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                  color: theme.colors.muted_foreground,
                }}
              >
                <X size={24} />
              </button>
            </div>

            {toolData.environmentVariables && toolData.environmentVariables.length > 0 && (
              <div style={{ marginBottom: theme.spacing[6] }}>
                {toolData.environmentVariables.map((envVar, idx) => (
                  <div key={idx} style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: theme.spacing[3],
                    marginBottom: theme.spacing[4],
                    padding: theme.spacing[4],
                    border: `${theme.borderWidth.sm} solid ${theme.colors.neutral[200]}`,
                    borderRadius: theme.borderRadius.sm,
                    backgroundColor: theme.colors.neutral[50],
                  }}>
                    {/* Key and Value Inputs Side by Side */}
                    <div style={{
                      display: "flex",
                      gap: theme.spacing[3],
                    }}>
                      {/* Key Input */}
                      <div style={{ flex: 1 }}>
                        <label style={{
                          display: "block",
                          fontSize: theme.typography.fontSize.xs,
                          fontWeight: theme.typography.fontWeight.semibold,
                          color: theme.colors.foreground,
                          marginBottom: theme.spacing[1],
                        }}>
                          Key
                        </label>
                        <Input
                          placeholder="e.g., API_KEY"
                          value={envVar.key || ""}
                          onChange={(e) => {
                            const newVars = [...toolData.environmentVariables]
                            newVars[idx].key = e.target.value
                            setToolData({ ...toolData, environmentVariables: newVars })
                          }}
                          disabled={envVar.isExisting}
                        />
                      </div>

                      {/* Value Input with Eye Icon */}
                      <div style={{ flex: 1 }}>
                        <label style={{
                          display: "block",
                          fontSize: theme.typography.fontSize.xs,
                          fontWeight: theme.typography.fontWeight.semibold,
                          color: theme.colors.foreground,
                          marginBottom: theme.spacing[1],
                        }}>
                          Value
                        </label>
                        <div style={{ position: "relative" }}>
                          <Input
                            placeholder="Environment variable value"
                            type={envVisibility[envVar.id] ? "text" : "password"}
                            value={envVar.value || ""}
                            onChange={(e) => {
                              const newVars = [...toolData.environmentVariables]
                              newVars[idx].value = e.target.value
                              setToolData({ ...toolData, environmentVariables: newVars })
                            }}
                            disabled={envVar.isExisting}
                          />
                          <button
                            onClick={() => toggleEnvVisibility(envVar.id)}
                            style={{
                              position: "absolute",
                              right: theme.spacing[3],
                              top: "50%",
                              transform: "translateY(-50%)",
                              background: "none",
                              border: "none",
                              padding: 0,
                              cursor: "pointer",
                              color: theme.colors.muted_foreground,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                            type="button"
                          >
                            {envVisibility[envVar.id] ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Remove Button */}
                    <div style={{ display: "flex", justifyContent: "flex-end" }}>
                      <Button
                        variant="destructive"
                        size="sm"
                        leadingIcon={Trash2}
                        onClick={() => {
                          const newVars = toolData.environmentVariables.filter((_, i) => i !== idx)
                          setToolData({ ...toolData, environmentVariables: newVars })
                          const newVisibility = { ...envVisibility }
                          delete newVisibility[envVar.id]
                          setEnvVisibility(newVisibility)
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
                  ...(toolData.environmentVariables || []),
                  { id: Date.now(), key: "", value: "", isPassword: true, isExisting: false }
                ]
                if (newVars.length <= 20) {
                  setToolData({ ...toolData, environmentVariables: newVars })
                } else {
                  alert("Maximum 20 environment variables allowed")
                }
              }}
              style={{ marginBottom: theme.spacing[6], width: "100%" }}
            >
              Add Environment Variable
            </Button>

            <div style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: theme.spacing[3],
              paddingTop: theme.spacing[4],
              borderTop: `${theme.borderWidth.sm} solid ${theme.colors.neutral[200]}`,
            }}>
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

