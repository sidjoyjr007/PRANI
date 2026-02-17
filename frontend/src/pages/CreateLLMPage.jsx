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
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { ChevronLeft, Check, Eye, EyeOff } from "lucide-react"

// Provider and model mapping
const PROVIDER_MODELS = {
  OpenAI: ["gpt-4", "gpt-4-turbo", "gpt-3.5-turbo", "gpt-3.5"],
  Anthropic: ["claude-3-opus", "claude-3-sonnet", "claude-2"],
  Gemini: ["gemini-pro", "gemini-1.5-pro"],
  HuggingFace: ["mistral-7b", "llama-2-70b", "neural-chat-7b"],
}

const PROVIDERS = Object.keys(PROVIDER_MODELS)
const AUTH_TYPES = ["param", "header", "Bearer"]

// Mock data for editing
const MOCK_LLMS = [
  {
    id: 1,
    name: "Production GPT-4",
    description: "Production GPT-4 configuration",
    provider: "OpenAI",
    model: "gpt-4",
    apiKey: "sk-...",
    authType: "Bearer",
  },
  {
    id: 2,
    name: "Claude Opus",
    description: "Claude Opus configuration",
    provider: "Anthropic",
    model: "claude-3-opus",
    apiKey: "sk-ant-...",
    authType: "Bearer",
  },
]

export default function CreateLLMPage() {
  const theme = useTheme()
  const navigate = useNavigate()
  const { llmId } = useParams()

  // Form state
  const [llmData, setLLMData] = useState({
    name: "",
    description: "",
    provider: "",
    model: "",
    apiKey: "",
    authType: "param",
    authParam: "",
    huggingFaceToken: "",
    hasApiKey: false,
  })

  // UI state
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(!!llmId)
  const [isSaving, setIsSaving] = useState(false)
  const [errors, setErrors] = useState({})

  // Load existing LLM if editing
  useEffect(() => {
    if (llmId) {
      const llm = MOCK_LLMS.find(l => l.id === parseInt(llmId))
      if (llm) {
        setLLMData({
          ...llm,
          hasApiKey: !!llm.apiKey,
        })
      } else {
        alert("LLM not found")
        navigate("/llms")
      }
      setIsLoading(false)
    }
  }, [llmId, navigate])

  // Validate form
  const validateForm = () => {
    const newErrors = {}

    if (!llmData.name || llmData.name.trim().length < 2) {
      newErrors.name = "LLM name is required"
    }

    if (!llmData.description || llmData.description.trim().length < 10) {
      newErrors.description = "Description is required"
    }

    if (!llmData.provider) {
      newErrors.provider = "Provider is required"
    }

    if (!llmData.model) {
      newErrors.model = "Model is required"
    }

    // Only validate API key/token if checkbox is checked (or HuggingFace is always required)
    if (llmData.provider === "HuggingFace") {
      if (!llmData.huggingFaceToken) {
        newErrors.huggingFaceToken = "HuggingFace token is required"
      }
    } else if (llmData.hasApiKey) {
      if (!llmData.apiKey) {
        newErrors.apiKey = "API key is required"
      }

      if (!llmData.authType) {
        newErrors.authType = "Authentication type is required"
      }

      if ((llmData.authType === "param" || llmData.authType === "header") && !llmData.authParam) {
        newErrors.authParam = `${llmData.authType === "param" ? "Parameter" : "Header"} name is required`
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle save
  const handleSave = async () => {
    if (!validateForm()) {
      alert("Please fix the validation errors")
      return
    }

    setIsSaving(true)
    try {
      console.log("Saving LLM:", llmData)
      alert("LLM saved successfully!")
      navigate("/llms")
    } catch (error) {
      alert("Error saving LLM: " + error.message)
    } finally {
      setIsSaving(false)
    }
  }

  // Handle delete
  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this LLM configuration?")) {
      return
    }

    try {
      console.log("Delete LLM:", llmId)
      navigate("/llms")
    } catch (error) {
      alert("Error deleting LLM: " + error.message)
    }
  }

  // Handle provider change
  const handleProviderChange = (newProvider) => {
    setLLMData(prev => ({
      ...prev,
      provider: newProvider,
      model: "", // Reset model when provider changes
    }))
    setErrors(prev => ({ ...prev, model: "" }))
  }

  // Get available models for current provider
  const availableModels = llmData.provider ? PROVIDER_MODELS[llmData.provider] : []

  if (isLoading) {
    return (
      <Layout>
        <Container>
          <div style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "400px",
            color: theme.colors.muted_foreground
          }}>
            <p>Loading LLM data...</p>
          </div>
        </Container>
      </Layout>
    )
  }

  return (
    <Layout>
      <Container>
        {/* Header Section */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: theme.spacing[8],
          paddingBottom: theme.spacing[4],
          borderBottom: `${theme.borderWidth.sm} solid ${theme.colors.neutral[200]}`,
        }}>
          <Button
            variant="outline"
            size="md"
            leadingIcon={ChevronLeft}
            onClick={() => navigate("/llms")}
          >
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
            {llmId ? "Edit LLM Configuration" : "Create New LLM"}
          </h1>

          <Button
            variant="primary"
            size="md"
            leadingIcon={Check}
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (llmId ? "Updating..." : "Saving...") : (llmId ? "Update" : "Save")}
          </Button>
        </div>

        {/* Main Content Sections */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: theme.spacing[8],
          marginBottom: theme.spacing[8],
        }}>
          {/* Section 1: LLM Information */}
          <Card style={{
            padding: theme.spacing[6],
            border: `${theme.borderWidth.sm} solid ${theme.colors.neutral[200]}`,
            borderRadius: theme.borderRadius.md,
            backgroundColor: theme.colors.card,
          }}>
            <Text as="h3" size="lg" variant="label" style={{ marginBottom: theme.spacing[6] }}>
              LLM Information
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
                LLM Name *
              </label>
              <Input
                placeholder="e.g., Production GPT-4"
                value={llmData.name || ""}
                onChange={(e) => {
                  setLLMData({ ...llmData, name: e.target.value })
                  setErrors(prev => ({ ...prev, name: "" }))
                }}
                disabled={isSaving}
              />
              {errors.name && (
                <p style={{
                  fontSize: theme.typography.fontSize.xs,
                  color: theme.colors.destructive[600],
                  margin: `${theme.spacing[2]} 0 0 0`,
                }}>
                  {errors.name}
                </p>
              )}
            </div>

            {/* Description */}
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
                placeholder="Describe this LLM configuration"
                value={llmData.description || ""}
                onChange={(e) => {
                  setLLMData({ ...llmData, description: e.target.value })
                  setErrors(prev => ({ ...prev, description: "" }))
                }}
                rows={3}
                disabled={isSaving}
              />
              {errors.description && (
                <p style={{
                  fontSize: theme.typography.fontSize.xs,
                  color: theme.colors.destructive[600],
                  margin: `${theme.spacing[2]} 0 0 0`,
                }}>
                  {errors.description}
                </p>
              )}
            </div>
          </Card>

          {/* Section 2: Provider & Model */}
          <Card style={{
            padding: theme.spacing[6],
            border: `${theme.borderWidth.sm} solid ${theme.colors.neutral[200]}`,
            borderRadius: theme.borderRadius.md,
            backgroundColor: theme.colors.card,
          }}>
            <Text as="h3" size="lg" variant="label" style={{ marginBottom: theme.spacing[6] }}>
              Provider & Model
            </Text>

            {/* Provider */}
            <div style={{ marginBottom: theme.spacing[6] }}>
              <label style={{
                display: "block",
                fontSize: theme.typography.fontSize.sm,
                fontWeight: theme.typography.fontWeight.semibold,
                color: theme.colors.foreground,
                marginBottom: theme.spacing[2],
              }}>
                Provider *
              </label>
              <Select
                value={llmData.provider}
                onValueChange={handleProviderChange}
              >
                <SelectTrigger disabled={isSaving}>
                  <SelectValue placeholder="Select provider" />
                </SelectTrigger>
                <SelectContent>
                  {PROVIDERS.map(provider => (
                    <SelectItem key={provider} value={provider}>
                      {provider}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.provider && (
                <p style={{
                  fontSize: theme.typography.fontSize.xs,
                  color: theme.colors.destructive[600],
                  margin: `${theme.spacing[2]} 0 0 0`,
                }}>
                  {errors.provider}
                </p>
              )}
            </div>

            {/* Model - Input for HuggingFace, Select for others */}
            <div>
              <label style={{
                display: "block",
                fontSize: theme.typography.fontSize.sm,
                fontWeight: theme.typography.fontWeight.semibold,
                color: theme.colors.foreground,
                marginBottom: theme.spacing[2],
              }}>
                Model *
              </label>
              {llmData.provider === "HuggingFace" ? (
                <Input
                  placeholder="e.g., mistral-7b, llama-2-70b"
                  value={llmData.model || ""}
                  onChange={(e) => {
                    setLLMData({ ...llmData, model: e.target.value })
                    setErrors(prev => ({ ...prev, model: "" }))
                  }}
                  disabled={isSaving}
                />
              ) : (
                <Select
                  value={llmData.model}
                  onValueChange={(model) => {
                    setLLMData({ ...llmData, model })
                    setErrors(prev => ({ ...prev, model: "" }))
                  }}
                  disabled={!llmData.provider || isSaving}
                >
                  <SelectTrigger disabled={!llmData.provider || isSaving}>
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableModels.map(model => (
                      <SelectItem key={model} value={model}>
                        {model}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {errors.model && (
                <p style={{
                  fontSize: theme.typography.fontSize.xs,
                  color: theme.colors.destructive[600],
                  margin: `${theme.spacing[2]} 0 0 0`,
                }}>
                  {errors.model}
                </p>
              )}
            </div>
          </Card>

          {/* Section 3: API Configuration & Authentication */}
          <Card style={{
            padding: theme.spacing[6],
            border: `${theme.borderWidth.sm} solid ${theme.colors.neutral[200]}`,
            borderRadius: theme.borderRadius.md,
            backgroundColor: theme.colors.card,
          }}>
            <Text as="h3" size="lg" variant="label" style={{ marginBottom: theme.spacing[6] }}>
              Authentication
            </Text>

            {llmData.provider === "HuggingFace" ? (
              // HuggingFace: Always show Token only (no Auth Type)
              <div>
                <label style={{
                  display: "block",
                  fontSize: theme.typography.fontSize.sm,
                  fontWeight: theme.typography.fontWeight.semibold,
                  color: theme.colors.foreground,
                  marginBottom: theme.spacing[2],
                }}>
                  HuggingFace Token *
                </label>
                <div style={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your HuggingFace token"
                    value={llmData.huggingFaceToken || ""}
                    onChange={(e) => {
                      setLLMData({ ...llmData, huggingFaceToken: e.target.value })
                      setErrors(prev => ({ ...prev, huggingFaceToken: "" }))
                    }}
                    disabled={isSaving}
                    style={{
                      width: "100%",
                      padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
                      paddingRight: theme.spacing[12],
                      fontSize: theme.typography.fontSize.sm,
                      border: `${theme.borderWidth.sm} solid ${theme.colors.neutral[200]}`,
                      borderRadius: theme.borderRadius.md,
                      backgroundColor: theme.colors.background,
                      color: theme.colors.foreground,
                      fontFamily: "monospace",
                      letterSpacing: "0.05em",
                    }}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isSaving}
                    style={{
                      position: "absolute",
                      right: theme.spacing[3],
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: 0,
                      color: theme.colors.muted_foreground,
                      minWidth: "unset",
                    }}
                    title={showPassword ? "Hide token" : "Show token"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </Button>
                </div>
                {errors.huggingFaceToken && (
                  <p style={{
                    fontSize: theme.typography.fontSize.xs,
                    color: theme.colors.destructive[600],
                    margin: `${theme.spacing[2]} 0 0 0`,
                  }}>
                    {errors.huggingFaceToken}
                  </p>
                )}
              </div>
            ) : (
              // Other providers: Checkbox for API Key + Auth Type
              <>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: theme.spacing[3],
                  marginBottom: theme.spacing[6],
                }}>
                  <Checkbox
                    checked={llmData.hasApiKey || false}
                    onChange={(e) => {
                      setLLMData({
                        ...llmData,
                        hasApiKey: e.target.checked,
                        apiKey: e.target.checked ? llmData.apiKey : "",
                      })
                      setErrors(prev => ({ ...prev, apiKey: "", authType: "", authParam: "" }))
                    }}
                    disabled={isSaving}
                  />
                  <label style={{
                    fontSize: theme.typography.fontSize.sm,
                    fontWeight: theme.typography.fontWeight.semibold,
                    color: theme.colors.foreground,
                    cursor: isSaving ? "not-allowed" : "pointer",
                  }}>
                    Configure API Key
                  </label>
                </div>

                {llmData.hasApiKey && (
                  <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing[6] }}>
                    <div>
                      <label style={{
                        display: "block",
                        fontSize: theme.typography.fontSize.sm,
                        fontWeight: theme.typography.fontWeight.semibold,
                        color: theme.colors.foreground,
                        marginBottom: theme.spacing[2],
                      }}>
                        API Key *
                      </label>
                      <div style={{
                        position: "relative",
                        display: "flex",
                        alignItems: "center",
                      }}>
                        <input
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your API key"
                          value={llmData.apiKey || ""}
                          onChange={(e) => {
                            setLLMData({ ...llmData, apiKey: e.target.value })
                            setErrors(prev => ({ ...prev, apiKey: "" }))
                          }}
                          disabled={isSaving}
                          style={{
                            width: "100%",
                            padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
                            paddingRight: theme.spacing[12],
                            fontSize: theme.typography.fontSize.sm,
                            border: `${theme.borderWidth.sm} solid ${theme.colors.neutral[200]}`,
                            borderRadius: theme.borderRadius.md,
                            backgroundColor: theme.colors.background,
                            color: theme.colors.foreground,
                            fontFamily: "monospace",
                            letterSpacing: "0.05em",
                          }}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={isSaving}
                          style={{
                            position: "absolute",
                            right: theme.spacing[3],
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: 0,
                            color: theme.colors.muted_foreground,
                            minWidth: "unset",
                          }}
                          title={showPassword ? "Hide API key" : "Show API key"}
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </Button>
                      </div>
                      {errors.apiKey && (
                        <p style={{
                          fontSize: theme.typography.fontSize.xs,
                          color: theme.colors.destructive[600],
                          margin: `${theme.spacing[2]} 0 0 0`,
                        }}>
                          {errors.apiKey}
                        </p>
                      )}
                    </div>

                    <div>
                      <label style={{
                        display: "block",
                        fontSize: theme.typography.fontSize.sm,
                        fontWeight: theme.typography.fontWeight.semibold,
                        color: theme.colors.foreground,
                        marginBottom: theme.spacing[2],
                      }}>
                        Authentication Type *
                      </label>
                      <Select
                        value={llmData.authType}
                        onValueChange={(authType) => {
                          setLLMData({ ...llmData, authType })
                        }}
                        disabled={isSaving}
                      >
                        <SelectTrigger disabled={isSaving}>
                          <SelectValue placeholder="Select authentication type" />
                        </SelectTrigger>
                        <SelectContent>
                          {AUTH_TYPES.map(type => (
                            <SelectItem key={type} value={type}>
                              {type.charAt(0).toUpperCase() + type.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <p style={{
                        fontSize: theme.typography.fontSize.xs,
                        color: theme.colors.muted_foreground,
                        margin: `${theme.spacing[2]} 0 0 0`,
                      }}>
                        {llmData.authType === "param" && "API key passed as query parameter"}
                        {llmData.authType === "header" && "API key passed in custom header"}
                        {llmData.authType === "Bearer" && "API key passed as Bearer token"}
                      </p>
                    </div>

                    {(llmData.authType === "param" || llmData.authType === "header") && (
                      <div>
                        <label style={{
                          display: "block",
                          fontSize: theme.typography.fontSize.sm,
                          fontWeight: theme.typography.fontWeight.semibold,
                          color: theme.colors.foreground,
                          marginBottom: theme.spacing[2],
                        }}>
                          {llmData.authType === "param" ? "Parameter Name" : "Header Name"} *
                        </label>
                        <input
                          type="text"
                          placeholder={llmData.authType === "param" ? "e.g., api_key" : "e.g., X-API-Key"}
                          value={llmData.authParam || ""}
                          onChange={(e) => {
                            setLLMData({ ...llmData, authParam: e.target.value })
                            setErrors(prev => ({ ...prev, authParam: "" }))
                          }}
                          disabled={isSaving}
                          style={{
                            width: "100%",
                            padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
                            fontSize: theme.typography.fontSize.sm,
                            border: `${theme.borderWidth.sm} solid ${theme.colors.neutral[200]}`,
                            borderRadius: theme.borderRadius.md,
                            backgroundColor: theme.colors.background,
                            color: theme.colors.foreground,
                          }}
                        />
                        {errors.authParam && (
                          <p style={{
                            fontSize: theme.typography.fontSize.xs,
                            color: theme.colors.destructive[600],
                            margin: `${theme.spacing[2]} 0 0 0`,
                          }}>
                            {errors.authParam}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
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
          <Button variant="outline" size="md" onClick={() => navigate("/llms")}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="md"
            leadingIcon={Check}
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (llmId ? "Updating..." : "Saving...") : (llmId ? "Update LLM" : "Save LLM")}
          </Button>
        </div>
      </Container>
    </Layout>
  )
}
