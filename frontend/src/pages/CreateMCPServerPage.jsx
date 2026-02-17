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

// Mock MCP Servers data for editing
const MOCK_MCP_SERVERS = [
  {
    id: 1,
    name: "File System Server",
    description: "Access and manage files from the file system",
    url: "http://localhost:3001",
    hasAuth: true,
    authType: "header",
    headerName: "X-API-Key",
    headerValue: "sk-file-system-key-123",
  },
  {
    id: 2,
    name: "Database Server",
    description: "Query and manage database operations seamlessly",
    url: "http://db.example.com:5432",
    hasAuth: true,
    authType: "bearer",
    bearerToken: "bearer-token-database-456",
  },
  {
    id: 3,
    name: "Public MCP Server",
    description: "Public MCP server without authentication required",
    url: "https://public.example.com/mcp",
    hasAuth: false,
  },
]

const AUTH_TYPES = ["header", "bearer"]

export default function CreateMCPServerPage() {
  const theme = useTheme()
  const navigate = useNavigate()
  const { serverId } = useParams()

  const [mcpData, setMcpData] = useState({
    name: "",
    description: "",
    url: "",
    hasAuth: false,
    authType: "header",
    headerName: "",
    headerValue: "",
    bearerToken: "",
  })

  const [isLoading, setIsLoading] = useState(!!serverId)
  const [isSaving, setIsSaving] = useState(false)
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)

  // Load server data if editing
  useEffect(() => {
    if (serverId) {
      const server = MOCK_MCP_SERVERS.find(s => s.id === parseInt(serverId))
      if (server) {
        setMcpData(server)
      } else {
        alert("MCP Server not found")
        navigate("/mcp-servers")
      }
      setIsLoading(false)
    }
  }, [serverId, navigate])

  // Validation logic
  const validateForm = () => {
    const newErrors = {}

    if (!mcpData.name || mcpData.name.trim().length < 3) {
      newErrors.name = "MCP server name must be at least 3 characters"
    }

    if (!mcpData.description || mcpData.description.trim().length < 10) {
      newErrors.description = "Description must be at least 10 characters"
    }

    if (!mcpData.url) {
      newErrors.url = "URL is required"
    } else if (!/^https?:\/\/|^redis:\/\/|^postgresql:\/\//.test(mcpData.url)) {
      newErrors.url = "URL must start with http://, https://, redis://, or postgresql://"
    }

    // Validate authentication fields if auth is enabled
    if (mcpData.hasAuth) {
      if (!mcpData.authType) {
        newErrors.authType = "Authentication type is required"
      }

      if (mcpData.authType === "header") {
        if (!mcpData.headerName) {
          newErrors.headerName = "Header name is required"
        }
        if (!mcpData.headerValue) {
          newErrors.headerValue = "Header value is required"
        }
      }

      if (mcpData.authType === "bearer") {
        if (!mcpData.bearerToken) {
          newErrors.bearerToken = "Bearer token is required"
        }
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle save
  const handleSave = async () => {
    if (!validateForm()) {
      return
    }

    setIsSaving(true)
    try {
      console.log(serverId ? "MCP Server updated:" : "MCP Server created:", mcpData)
      alert(serverId ? "MCP Server updated successfully!" : "MCP Server created successfully!")
      navigate("/mcp-servers")
    } catch (error) {
      console.error("Error saving MCP server:", error)
      alert("Error saving MCP server. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

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
            <p>Loading MCP server data...</p>
          </div>
        </Container>
      </Layout>
    )
  }

  return (
    <Layout>
      <Container>
        {/* Header */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: theme.spacing[8],
          paddingBottom: theme.spacing[4],
          borderBottom: `${theme.borderWidth.sm} solid ${theme.colors.neutral[200]}`,
        }}>
          <Button variant="outline" size="md" leadingIcon={ChevronLeft} onClick={() => navigate("/mcp-servers")}>
            Back
          </Button>
          <h1 style={{
            fontSize: theme.typography.fontSize.xl2,
            fontWeight: theme.typography.fontWeight.bold,
            color: theme.colors.foreground,
            margin: 0,
          }}>
            {serverId ? "Edit MCP Server" : "Create MCP Server"}
          </h1>
          <Button
            variant="primary"
            size="md"
            leadingIcon={Check}
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (serverId ? "Updating..." : "Saving...") : (serverId ? "Update Server" : "Save Server")}
          </Button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing[8], marginBottom: theme.spacing[8] }}>
          {/* Section 1: Basic Information */}
          <Card style={{
            padding: theme.spacing[6],
            border: `${theme.borderWidth.sm} solid ${theme.colors.neutral[200]}`,
            borderRadius: theme.borderRadius.md,
            backgroundColor: theme.colors.card,
          }}>
            <Text as="h3" size="lg" variant="label" style={{ marginBottom: theme.spacing[6] }}>
              Basic Information
            </Text>

            <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing[6] }}>
              {/* Name Field */}
              <div>
                <label style={{
                  display: "block",
                  fontSize: theme.typography.fontSize.sm,
                  fontWeight: theme.typography.fontWeight.semibold,
                  color: theme.colors.foreground,
                  marginBottom: theme.spacing[2],
                }}>
                  MCP Server Name *
                </label>
                <Input
                  placeholder="e.g., File System Server"
                  value={mcpData.name}
                  onChange={(e) => {
                    setMcpData({ ...mcpData, name: e.target.value })
                    setErrors(prev => ({ ...prev, name: "" }))
                  }}
                  disabled={isSaving}
                  error={errors.name}
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

              {/* Description Field */}
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
                  placeholder="Describe the purpose and capabilities of this MCP server"
                  value={mcpData.description}
                  onChange={(e) => {
                    setMcpData({ ...mcpData, description: e.target.value })
                    setErrors(prev => ({ ...prev, description: "" }))
                  }}
                  disabled={isSaving}
                  rows={4}
                  error={errors.description}
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
            </div>
          </Card>

          {/* Section 2: Configuration */}
          <Card style={{
            padding: theme.spacing[6],
            border: `${theme.borderWidth.sm} solid ${theme.colors.neutral[200]}`,
            borderRadius: theme.borderRadius.md,
            backgroundColor: theme.colors.card,
          }}>
            <Text as="h3" size="lg" variant="label" style={{ marginBottom: theme.spacing[6] }}>
              Configuration
            </Text>

            <div>
              <label style={{
                display: "block",
                fontSize: theme.typography.fontSize.sm,
                fontWeight: theme.typography.fontWeight.semibold,
                color: theme.colors.foreground,
                marginBottom: theme.spacing[2],
              }}>
                Server URL *
              </label>
              <Input
                placeholder="e.g., http://localhost:3001 or https://api.example.com"
                value={mcpData.url}
                onChange={(e) => {
                  setMcpData({ ...mcpData, url: e.target.value })
                  setErrors(prev => ({ ...prev, url: "" }))
                }}
                disabled={isSaving}
                error={errors.url}
              />
              {errors.url && (
                <p style={{
                  fontSize: theme.typography.fontSize.xs,
                  color: theme.colors.destructive[600],
                  margin: `${theme.spacing[2]} 0 0 0`,
                }}>
                  {errors.url}
                </p>
              )}
            </div>
          </Card>

          {/* Section 3: Authentication */}
          <Card style={{
            padding: theme.spacing[6],
            border: `${theme.borderWidth.sm} solid ${theme.colors.neutral[200]}`,
            borderRadius: theme.borderRadius.md,
            backgroundColor: theme.colors.card,
          }}>
            <Text as="h3" size="lg" variant="label" style={{ marginBottom: theme.spacing[6] }}>
              Authentication
            </Text>

            {/* Authentication Checkbox */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: theme.spacing[3],
              marginBottom: theme.spacing[6],
            }}>
              <Checkbox
                checked={mcpData.hasAuth || false}
                onChange={(e) => {
                  setMcpData({
                    ...mcpData,
                    hasAuth: e.target.checked,
                    headerValue: e.target.checked ? mcpData.headerValue : "",
                    bearerToken: e.target.checked ? mcpData.bearerToken : "",
                  })
                  setErrors(prev => ({ ...prev, authType: "", headerName: "", headerValue: "", bearerToken: "" }))
                }}
                disabled={isSaving}
              />
              <label style={{
                fontSize: theme.typography.fontSize.sm,
                fontWeight: theme.typography.fontWeight.semibold,
                color: theme.colors.foreground,
                cursor: isSaving ? "not-allowed" : "pointer",
              }}>
                Configure Authentication
              </label>
            </div>

            {/* Conditional Authentication Fields */}
            {mcpData.hasAuth && (
              <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing[6] }}>
                {/* Authentication Type */}
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
                    value={mcpData.authType}
                    onValueChange={(authType) => {
                      setMcpData({ ...mcpData, authType })
                      setErrors(prev => ({ ...prev, authType: "" }))
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
                  {errors.authType && (
                    <p style={{
                      fontSize: theme.typography.fontSize.xs,
                      color: theme.colors.destructive[600],
                      margin: `${theme.spacing[2]} 0 0 0`,
                    }}>
                      {errors.authType}
                    </p>
                  )}
                </div>

                {/* Header Authentication */}
                {mcpData.authType === "header" && (
                  <>
                    {/* Header Name */}
                    <div>
                      <label style={{
                        display: "block",
                        fontSize: theme.typography.fontSize.sm,
                        fontWeight: theme.typography.fontWeight.semibold,
                        color: theme.colors.foreground,
                        marginBottom: theme.spacing[2],
                      }}>
                        Header Name *
                      </label>
                      <Input
                        placeholder="e.g., X-API-Key or Authorization"
                        value={mcpData.headerName}
                        onChange={(e) => {
                          setMcpData({ ...mcpData, headerName: e.target.value })
                          setErrors(prev => ({ ...prev, headerName: "" }))
                        }}
                        disabled={isSaving}
                        error={errors.headerName}
                      />
                      {errors.headerName && (
                        <p style={{
                          fontSize: theme.typography.fontSize.xs,
                          color: theme.colors.destructive[600],
                          margin: `${theme.spacing[2]} 0 0 0`,
                        }}>
                          {errors.headerName}
                        </p>
                      )}
                    </div>

                    {/* Header Value */}
                    <div>
                      <label style={{
                        display: "block",
                        fontSize: theme.typography.fontSize.sm,
                        fontWeight: theme.typography.fontWeight.semibold,
                        color: theme.colors.foreground,
                        marginBottom: theme.spacing[2],
                      }}>
                        Header Value *
                      </label>
                      <div style={{
                        position: "relative",
                        display: "flex",
                        alignItems: "center",
                      }}>
                        <input
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter header value"
                          value={mcpData.headerValue || ""}
                          onChange={(e) => {
                            setMcpData({ ...mcpData, headerValue: e.target.value })
                            setErrors(prev => ({ ...prev, headerValue: "" }))
                          }}
                          disabled={isSaving}
                          style={{
                            width: "100%",
                            padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
                            paddingRight: theme.spacing[12],
                            fontSize: theme.typography.fontSize.sm,
                            border: errors.headerValue ? `${theme.borderWidth.sm} solid ${theme.colors.destructive[600]}` : `${theme.borderWidth.sm} solid ${theme.colors.neutral[200]}`,
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
                          title={showPassword ? "Hide value" : "Show value"}
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </Button>
                      </div>
                      {errors.headerValue && (
                        <p style={{
                          fontSize: theme.typography.fontSize.xs,
                          color: theme.colors.destructive[600],
                          margin: `${theme.spacing[2]} 0 0 0`,
                        }}>
                          {errors.headerValue}
                        </p>
                      )}
                    </div>
                  </>
                )}

                {/* Bearer Authentication */}
                {mcpData.authType === "bearer" && (
                  <div>
                    <label style={{
                      display: "block",
                      fontSize: theme.typography.fontSize.sm,
                      fontWeight: theme.typography.fontWeight.semibold,
                      color: theme.colors.foreground,
                      marginBottom: theme.spacing[2],
                    }}>
                      Bearer Token *
                    </label>
                    <div style={{
                      position: "relative",
                      display: "flex",
                      alignItems: "center",
                    }}>
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter bearer token"
                        value={mcpData.bearerToken || ""}
                        onChange={(e) => {
                          setMcpData({ ...mcpData, bearerToken: e.target.value })
                          setErrors(prev => ({ ...prev, bearerToken: "" }))
                        }}
                        disabled={isSaving}
                        style={{
                          width: "100%",
                          padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
                          paddingRight: theme.spacing[12],
                          fontSize: theme.typography.fontSize.sm,
                          border: errors.bearerToken ? `${theme.borderWidth.sm} solid ${theme.colors.destructive[600]}` : `${theme.borderWidth.sm} solid ${theme.colors.neutral[200]}`,
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
                    {errors.bearerToken && (
                      <p style={{
                        fontSize: theme.typography.fontSize.xs,
                        color: theme.colors.destructive[600],
                        margin: `${theme.spacing[2]} 0 0 0`,
                      }}>
                        {errors.bearerToken}
                      </p>
                    )}
                  </div>
                )}
              </div>
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
          <Button variant="outline" size="md" onClick={() => navigate("/mcp-servers")}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="md"
            leadingIcon={Check}
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (serverId ? "Updating..." : "Saving...") : (serverId ? "Update Server" : "Save Server")}
          </Button>
        </div>
      </Container>
    </Layout>
  )
}
