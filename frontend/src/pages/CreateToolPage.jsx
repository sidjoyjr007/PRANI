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
import { Checkbox } from "@/components/ui/checkbox"
import { Chips } from "@/components/ui/chips"
import { Combobox, ComboboxTrigger, ComboboxContent, ComboboxItem, ComboboxSearch } from "@/components/ui/combobox"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Dialog, DialogTrigger, DialogPortal, DialogOverlay, DialogContent, DialogClose } from "@/components/ui/dialog"
import { ChevronLeft, Check, Plus, Trash2, Eye, EyeOff, Settings, X } from "lucide-react"

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

  const [toolData, setToolData] = useState({
    id: null,
    name: "",
    description: "",
    inputFields: [],
    code: "",
    environmentVariables: [],
    categories: [],
  })

  const [isLoading, setIsLoading] = useState(!!toolId)
  const [isSaving, setIsSaving] = useState(false)
  const [errors, setErrors] = useState({})
  const [showEnvModal, setShowEnvModal] = useState(false)
  const [envVisibility, setEnvVisibility] = useState({})

  useEffect(() => {
    if (toolId) {
      const tool = MOCK_TOOLS.find(t => t.id === parseInt(toolId))
      if (tool) {
        setToolData(tool)
        const visibility = {}
        tool.environmentVariables?.forEach(env => {
          visibility[env.id] = false
        })
        setEnvVisibility(visibility)
      } else {
        alert("Tool not found")
        navigate("/tools")
      }
      setIsLoading(false)
    }
  }, [toolId, navigate])

  const validateToolData = () => {
    const newErrors = {}
    if (!toolData.name || toolData.name.trim().length < 3) {
      newErrors.name = "Tool name must be at least 3 characters"
    }
    if (!toolData.description || toolData.description.trim().length < 10) {
      newErrors.description = "Description must be at least 10 characters"
    }
    if (!toolData.code || toolData.code.trim().length < 50) {
      newErrors.code = "Code must be at least 50 characters"
    }
    if (!toolData.code.includes("def execute_tool(inputs)")) {
      newErrors.code = "Code must contain 'def execute_tool(inputs):' function"
    }
    if (toolData.inputFields.length > 0) {
      toolData.inputFields.forEach((field, idx) => {
        if (!field.name || !field.name.trim()) {
          newErrors[`inputField_${idx}_name`] = "Field name is required"
        }
      })
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validateToolData()) {
      alert("Please fix the validation errors")
      return
    }
    setIsSaving(true)
    try {
      console.log(toolData.id ? "Tool updated:" : "Tool created:", toolData)
      alert(toolData.id ? "Tool updated successfully!" : "Tool created successfully!")
      navigate("/tools")
    } catch (error) {
      console.error("Error saving tool:", error)
      alert("Error saving tool. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  const toggleEnvVisibility = (envId) => {
    setEnvVisibility(prev => ({ ...prev, [envId]: !prev[envId] }))
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
                    placeholder="e.g., Web Search, Code Executor"
                    value={toolData.name || ""}
                    onChange={(e) => setToolData({ ...toolData, name: e.target.value })}
                    maxLength={100}
                  />
                  <p style={{
                    fontSize: theme.typography.fontSize.xs,
                    color: theme.colors.muted_foreground,
                    margin: `${theme.spacing[2]} 0 0 0`,
                  }}>
                    {toolData.name?.length || 0}/100 characters
                  </p>
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
                  />
                  <p style={{
                    fontSize: theme.typography.fontSize.xs,
                    color: theme.colors.muted_foreground,
                    margin: `${theme.spacing[2]} 0 0 0`,
                  }}>
                    {toolData.description?.length || 0}/500 characters
                  </p>
                </div>
              </Card>

              {/* Tool Categories Card */}
              <Card style={{
                padding: theme.spacing[6],
                border: `${theme.borderWidth.sm} solid ${theme.colors.neutral[200]}`,
                borderRadius: theme.borderRadius.md,
                backgroundColor: theme.colors.card,
              }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: theme.spacing[4], gap: theme.spacing[4] }}>
                  <Text as="h3" size="lg" variant="label">
                    Tool Categories ({toolData.categories?.length || 0})
                  </Text>

                  {/* Add Category Button */}
                  <div style={{ width: "fit-content" }}>
                    <Combobox 
                      value="" 
                      onValueChange={(category) => {
                        if (category && !toolData.categories?.includes(category)) {
                          setToolData({
                            ...toolData,
                            categories: [...(toolData.categories || []), category]
                          })
                        } else if (category && toolData.categories?.includes(category)) {
                          // Deselect if already selected
                          setToolData({
                            ...toolData,
                            categories: toolData.categories.filter(c => c !== category)
                          })
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
                            document.querySelector('[data-combobox-trigger="categories"]')?.click()
                          }}
                        >
                          + Add Category
                        </Button>
                        <div style={{ display: "none" }}>
                          <ComboboxTrigger data-combobox-trigger="categories">
                            Select category
                          </ComboboxTrigger>
                        </div>
                      </div>
                      <ComboboxContent>
                        <ComboboxSearch placeholder="Search categories..." />
                        {["READ", "WRITE", "DELETE", "UPDATE"].map((category) => (
                          <ComboboxItem key={category} value={category} searchableText={category}>
                            <div style={{ display: "flex", alignItems: "center", gap: theme.spacing[2] }}>
                              {toolData.categories?.includes(category) && <Check size={14} style={{ color: theme.colors.primary[600] }} />}
                              {category}
                            </div>
                          </ComboboxItem>
                        ))}
                      </ComboboxContent>
                    </Combobox>
                  </div>
                </div>

                {/* Selected Categories Display */}
                {toolData.categories && toolData.categories.length > 0 && (
                  <div>
                    <Chips
                      items={toolData.categories.map(cat => ({
                        id: cat,
                        label: cat
                      }))}
                      variant="primary"
                      size="md"
                      onRemove={(cat) => {
                        setToolData({
                          ...toolData,
                          categories: toolData.categories.filter(c => c !== cat)
                        })
                      }}
                    />
                  </div>
                )}
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
                                newFields[idx].name = e.target.value
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
                                newFields[idx].description = e.target.value
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
                              newFields[idx].dataType = value
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
                                newFields[idx].defaultValue = e.target.value
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
                              newFields[idx].required = e.target.checked
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
                      alert("Maximum 20 input fields allowed")
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
                    <Text as="h3" size="lg" variant="label">
                      Python Code
                    </Text>
                    <Text as="p" size="sm" variant="body" style={{ color: theme.colors.muted_foreground, marginTop: theme.spacing[1] }}>
                      Must include a "def execute_tool(inputs):" function
                    </Text>
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

            {/* Environment Variables Modal using Dialog Component */}
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
                        Add sensitive configuration variables
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
                        { id: Date.now(), key: "", value: "", isPassword: true }
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
    </Layout>
  )
}
