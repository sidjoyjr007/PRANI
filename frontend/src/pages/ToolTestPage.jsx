import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { fetchToolById } from "@/store/slices/toolSlice"
import { toolService } from "@/services/toolService"
import { useTheme } from "@/context/ThemeContext"
import Layout from "@/components/Layout"
import Container from "@/components/Container"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Text } from "@/components/ui/text"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ChevronLeft, Play, Loader2 } from "lucide-react"

export default function ToolTestPage() {
  const theme = useTheme()
  const navigate = useNavigate()
  const { toolId } = useParams()
  const dispatch = useDispatch()

  const { currentTool: tool, isLoading: isToolLoading } = useSelector((state) => state.tools)

  const [inputs, setInputs] = useState({})
  const [result, setResult] = useState(null)
  const [isTestLoading, setIsTestLoading] = useState(false)
  const [testError, setTestError] = useState(null)
  const [isOutputExpanded, setIsOutputExpanded] = useState(false)

  useEffect(() => {
    if (toolId) {
      dispatch(fetchToolById(toolId))
    }
  }, [dispatch, toolId])

  useEffect(() => {
    if (tool && tool.input_fields) {
      const defaults = {}
      tool.input_fields.forEach(field => {
        if (field.default) defaults[field.name] = field.default
      })
      setInputs(prev => ({ ...defaults, ...prev }))
    }
  }, [tool])

  const handleInputChange = (inputName, value) => {
    setInputs(prev => ({ ...prev, [inputName]: value }))
  }

  const handleTest = async () => {
    setIsTestLoading(true)
    setTestError(null)
    setResult(null)

    try {
      const response = await toolService.testTool(toolId, inputs)

      if (response.success) {
        setResult({
          status: "success",
          message: response.message,
          data: {
            executedAt: new Date().toISOString(),
            output: typeof response.result === 'object' ? JSON.stringify(response.result, null, 2) : String(response.result),
            inputs: response.input,
          },
        })
      } else {
        // Backend returned success: false
        setTestError(response.error || response.message || "Tool execution failed")
      }
    } catch (err) {
      console.error("Test error:", err)
      const msg = err.response?.data?.detail || err.message || "An error occurred while executing the tool"
      setTestError(msg)
    } finally {
      setIsTestLoading(false)
      setIsOutputExpanded(false)
    }
  }

  if (isToolLoading) {
    return (
      <Layout>
        <Container>
          <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>Loading tool...</div>
        </Container>
      </Layout>
    )
  }

  if (!tool) {
    return (
      <Layout>
        <Container>
          <div style={{ padding: '50px', textAlign: 'center' }}>Tool not found</div>
        </Container>
      </Layout>
    )
  }

  return (
    <Layout>
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
              onClick={() => navigate("/tools")}
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
              Test Tool: {tool.name}
            </Text>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: theme.spacing[2] }}>
            <Button variant="ghost" size="sm" onClick={() => navigate("/tools")} style={{ height: "32px", fontSize: "13px", color: theme.colors.muted_foreground }}>
              Discard
            </Button>
            <Button
              variant="primary"
              size="sm"
              leadingIcon={isTestLoading ? Loader2 : Play}
              onClick={handleTest}
              disabled={isTestLoading}
              style={{ height: "32px", fontSize: "13px", padding: `0 ${theme.spacing[4]}` }}
            >
              {isTestLoading ? "Testing..." : "Test Tool"}
            </Button>
          </div>
        </div>
      </div>

      <Container style={{ maxWidth: "1280px", margin: "0 auto", padding: `0 ${theme.spacing[8]}` }}>

        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: theme.spacing[6],
          marginBottom: theme.spacing[8],
          alignItems: "start",
        }}>
          {/* Tool Inputs Card */}
          <Card style={{
            padding: theme.spacing[6],
            border: `${theme.borderWidth.sm} solid ${theme.colors.neutral[200]}`,
            borderRadius: theme.borderRadius.md,
            backgroundColor: theme.colors.card,
          }}>
            <div style={{ marginBottom: theme.spacing[6] }}>
              <Text as="h3" size="lg" variant="label">
                Tool Inputs
              </Text>
              <Text as="p" size="sm" variant="body" style={{ color: theme.colors.muted_foreground, marginTop: theme.spacing[1] }}>
                Configure input parameters and test the tool
              </Text>
            </div>

            <div style={{
              display: "flex",
              flexDirection: "column",
              gap: theme.spacing[6],
            }}>
              {tool.input_fields && tool.input_fields.map((field) => (
                <div key={field.name} style={{ display: "flex", flexDirection: "column", gap: theme.spacing[2] }}>
                  <label style={{
                    display: "block",
                    fontSize: theme.typography.fontSize.sm,
                    fontWeight: theme.typography.fontWeight.semibold,
                    color: theme.colors.foreground,
                    marginBottom: theme.spacing[1],
                  }}>
                    {field.name} {field.required && <span style={{ color: theme.colors.destructive[500] }}>*</span>}
                  </label>

                  {field.type === "bool" ? (
                    <select
                      value={inputs[field.name] !== undefined ? String(inputs[field.name]) : "false"}
                      onChange={(e) => handleInputChange(field.name, e.target.value === "true")}
                      style={{
                        padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
                        borderRadius: theme.borderRadius.md,
                        border: `${theme.borderWidth.sm} solid ${theme.colors.border}`,
                        backgroundColor: theme.colors.card,
                        color: theme.colors.foreground,
                        width: "100%"
                      }}
                    >
                      <option value="true">True</option>
                      <option value="false">False</option>
                    </select>
                  ) : (
                    <Input
                      type={field.type === "int" || field.type === "float" ? "number" : "text"}
                      step={field.type === "float" ? "any" : undefined}
                      placeholder={field.description || `Enter ${field.name}...`}
                      value={inputs[field.name] || ""}
                      onChange={(e) => handleInputChange(field.name, e.target.value)}
                    />
                  )}
                  {field.description && (
                    <p style={{ fontSize: "12px", color: theme.colors.muted_foreground, margin: 0 }}>{field.description}</p>
                  )}
                </div>
              ))}

              {!tool.input_fields || tool.input_fields.length === 0 && (
                <div style={{ color: theme.colors.muted_foreground, fontStyle: "italic", textAlign: "center", padding: theme.spacing[8] }}>No input fields required.</div>
              )}
            </div>
          </Card>

          <Card
            style={{
              padding: theme.spacing[8],
              border: `1px solid #1e293b`,
              borderRadius: theme.borderRadius.xl,
              backgroundColor: "#0d1117",
              fontFamily: '"Fira Code", "JetBrains Mono", monospace',
              color: "#e2e8f0",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              minHeight: "500px",
              boxShadow: "0 10px 30px -10px rgba(0,0,0,0.5)"
            }}
          >
            {/* Terminal Header */}
            <div style={{
              display: "flex",
              flexDirection: "column",
              gap: theme.spacing[3],
              marginBottom: theme.spacing[4],
            }}>
              {/* Window Controls */}
              <div style={{
                display: "flex",
                gap: theme.spacing[2],
                alignItems: "center",
              }}>
                <div style={{
                  width: "12px",
                  height: "12px",
                  borderRadius: "50%",
                  backgroundColor: "#ef4444",
                }} />
                <div style={{
                  width: "12px",
                  height: "12px",
                  borderRadius: "50%",
                  backgroundColor: "#eab308",
                }} />
                <div style={{
                  width: "12px",
                  height: "12px",
                  borderRadius: "50%",
                  backgroundColor: "#22c55e",
                }} />
              </div>

              {/* Divider */}
              <div style={{
                paddingBottom: theme.spacing[4],
                borderBottom: `${theme.borderWidth.sm} solid ${theme.colors.neutral[800]}`,
              }} />
            </div>

            {/* Results Display */}
            <div style={{
              flex: 1,
              overflow: "auto",
              display: "flex",
              flexDirection: "column",
              gap: 0,
            }}>
              {isTestLoading ? (
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flex: 1,
                  color: "#64748b",
                  fontSize: theme.typography.fontSize.sm,
                }}>
                  Executing tool...
                </div>
              ) : testError ? (
                <div style={{
                  padding: theme.spacing[3],
                  color: "#f87171",
                  fontSize: theme.typography.fontSize.xs,
                  lineHeight: 1.6,
                }}>
                  <span style={{ fontWeight: "bold" }}>✕ ERROR:</span> {testError}
                </div>
              ) : result ? (
                <>
                  {/* Status Line */}
                  <div style={{
                    padding: `${theme.spacing[2]} 0`,
                    borderBottom: `${theme.borderWidth.sm} solid ${theme.colors.neutral[900]}`,
                    display: "flex",
                    alignItems: "center",
                    gap: theme.spacing[2],
                    fontSize: theme.typography.fontSize.xs,
                  }}>
                    <span style={{
                      color: result.status === "success" ? "#22c55e" : "#f87171",
                      fontWeight: "bold",
                    }}>
                      [{result.status.toUpperCase()}]
                    </span>
                    <span style={{ color: "#64748b" }}>
                      {result.message}
                    </span>
                  </div>

                  {/* Output Lines */}
                  <div style={{
                    flex: 1,
                    overflowY: "auto",
                    maxHeight: "350px",
                    display: "flex",
                    flexDirection: "column",
                    paddingRight: theme.spacing[2],
                  }}>
                    {(() => {
                      const allLines = String(result.data.output).split("\n");
                      const showLines = isOutputExpanded ? allLines : allLines.slice(0, 15);
                      const hasMore = allLines.length > 15;

                      return (
                        <>
                          {showLines.map((line, index) => (
                            <div
                              key={index}
                              style={{
                                display: "flex",
                                alignItems: "flex-start",
                                padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
                                transition: `background-color ${theme.transitions.normal}`,
                                cursor: "text",
                                userSelect: "text",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = "#1e293b20"
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = "transparent"
                              }}
                            >
                              {/* Line Content */}
                              <span style={{
                                color: "#e2e8f0",
                                fontSize: theme.typography.fontSize.xs,
                                fontFamily: "inherit",
                                lineHeight: 1.5,
                                letterSpacing: 0.5,
                                flex: 1,
                                whiteSpace: "pre-wrap",
                                wordBreak: "break-all",
                              }}>
                                {line}
                              </span>
                            </div>
                          ))}

                          {hasMore && (
                            <div style={{ padding: `${theme.spacing[3]}` }}>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsOutputExpanded(!isOutputExpanded)}
                                style={{ color: theme.colors.primary[300], padding: 0, height: "auto" }}
                              >
                                {isOutputExpanded ? "...Show Less" : `...Show More (${allLines.length - 15} more lines)`}
                              </Button>
                            </div>
                          )}
                        </>
                      )
                    })()}
                  </div>

                  {/* Metadata Line */}
                  <div style={{
                    paddingTop: theme.spacing[4],
                    borderTop: `${theme.borderWidth.sm} solid ${theme.colors.neutral[900]}`,
                    marginTop: theme.spacing[4],
                    fontSize: theme.typography.fontSize.xs,
                    color: "#64748b",
                  }}>
                    Executed: {new Date(result.data.executedAt).toLocaleString()}
                  </div>
                </>
              ) : (
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flex: 1,
                  color: "#64748b",
                  fontSize: theme.typography.fontSize.xs,
                  textAlign: "center",
                }}>
                  Configure inputs and click "Test Tool" to see results
                </div>
              )}
            </div>
          </Card>
        </div>
      </Container>
    </Layout>
  )
}
