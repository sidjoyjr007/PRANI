import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
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
import { ChevronLeft, Play } from "lucide-react"

const TOOL_CONFIGS = {
  1: {
    name: "Web Search",
    description: "Search the internet for real-time information and web resources",
    inputs: [
      { id: "query", label: "Search Query", type: "text", placeholder: "Enter search query..." },
      { id: "numResults", label: "Number of Results", type: "number", placeholder: "10", defaultValue: "10" },
    ],
  },
  2: {
    name: "Code Executor",
    description: "Execute and run code snippets in multiple programming languages",
    inputs: [
      { id: "language", label: "Programming Language", type: "select", options: ["JavaScript", "Python", "Java", "C++"], defaultValue: "JavaScript" },
      { id: "code", label: "Code", type: "textarea", placeholder: "Enter your code here..." },
    ],
  },
  3: {
    name: "File Manager",
    description: "Manage and manipulate files with advanced operations",
    inputs: [
      { id: "filePath", label: "File Path", type: "text", placeholder: "/path/to/file" },
      { id: "operation", label: "Operation", type: "select", options: ["Read", "Write", "Delete", "Copy"], defaultValue: "Read" },
    ],
  },
  4: {
    name: "API Caller",
    description: "Make HTTP requests to APIs and handle responses",
    inputs: [
      { id: "url", label: "API URL", type: "text", placeholder: "https://api.example.com/endpoint" },
      { id: "method", label: "HTTP Method", type: "select", options: ["GET", "POST", "PUT", "DELETE"], defaultValue: "GET" },
      { id: "payload", label: "Request Body", type: "textarea", placeholder: "{}" },
    ],
  },
}

export default function ToolTestPage() {
  const theme = useTheme()
  const navigate = useNavigate()
  const { toolId } = useParams()
  
  const toolConfig = TOOL_CONFIGS[toolId] || TOOL_CONFIGS[1]
  const [inputs, setInputs] = useState({})
  const [result, setResult] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleInputChange = (inputId, value) => {
    setInputs(prev => ({ ...prev, [inputId]: value }))
  }

  const handleTest = async () => {
    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      // Simulate API call with delay
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Mock successful result
      const mockResult = {
        status: "success",
        message: "Tool executed successfully",
        data: {
          executedAt: new Date().toISOString(),
          inputs: inputs,
          output: `Sample output from ${toolConfig.name}\n\nInput parameters:\n${JSON.stringify(inputs, null, 2)}`,
        },
      }
      setResult(mockResult)
    } catch (err) {
      setError(err.message || "An error occurred while executing the tool")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Layout>
      <Container>
        {/* Page Header with Back Button and Divider */}
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
            onClick={() => navigate("/tools")}
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
            Test {toolConfig.name}
          </h1>
          <div style={{ width: "fit-content" }} />
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: theme.spacing[6],
          marginBottom: theme.spacing[8],
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
              {toolConfig.inputs.map((inputConfig) => (
                <div key={inputConfig.id} style={{ display: "flex", flexDirection: "column", gap: theme.spacing[2] }}>
                  <label style={{
                    display: "block",
                    fontSize: theme.typography.fontSize.sm,
                    fontWeight: theme.typography.fontWeight.semibold,
                    color: theme.colors.foreground,
                    marginBottom: theme.spacing[1],
                  }}>
                    {inputConfig.label}
                  </label>
                  
                  {inputConfig.type === "text" || inputConfig.type === "number" ? (
                    <Input
                      type={inputConfig.type}
                      placeholder={inputConfig.placeholder}
                      value={inputs[inputConfig.id] || inputConfig.defaultValue || ""}
                      onChange={(e) => handleInputChange(inputConfig.id, e.target.value)}
                    />
                  ) : inputConfig.type === "textarea" ? (
                    <Textarea
                      placeholder={inputConfig.placeholder}
                      value={inputs[inputConfig.id] || inputConfig.defaultValue || ""}
                      onChange={(e) => handleInputChange(inputConfig.id, e.target.value)}
                      rows={4}
                    />
                  ) : inputConfig.type === "select" ? (
                    <select
                      value={inputs[inputConfig.id] || inputConfig.defaultValue || ""}
                      onChange={(e) => handleInputChange(inputConfig.id, e.target.value)}
                      style={{
                        padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
                        borderRadius: theme.borderRadius.md,
                        border: `${theme.borderWidth.sm} solid ${theme.colors.border}`,
                        backgroundColor: theme.colors.card,
                        color: theme.colors.foreground,
                        fontSize: theme.typography.fontSize.sm,
                        fontFamily: "inherit",
                        cursor: "pointer",
                        transition: theme.transitions.default,
                      }}
                    >
                      {inputConfig.options.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  ) : null}
                </div>
              ))}

              <Separator />

              <Button
                variant="primary"
                size="md"
                leadingIcon={Play}
                onClick={handleTest}
                disabled={isLoading}
                style={{
                  width: "100%",
                }}
              >
                {isLoading ? "Testing..." : "Test Tool"}
              </Button>
            </div>
          </Card>

          {/* Test Results Card - Terminal Style */}
          <Card
            style={{
              padding: theme.spacing[6],
              border: `${theme.borderWidth.sm} solid ${theme.colors.neutral[800]}`,
              borderRadius: theme.borderRadius.md,
              backgroundColor: "#0f172a",
              fontFamily: '"Fira Code", "Courier New", monospace',
              color: "#e2e8f0",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
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
              {isLoading ? (
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
              ) : error ? (
                <div style={{
                  padding: theme.spacing[3],
                  color: "#f87171",
                  fontSize: theme.typography.fontSize.xs,
                  lineHeight: 1.6,
                }}>
                  <span style={{ fontWeight: "bold" }}>✕ ERROR:</span> {error}
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
                    overflow: "auto",
                    display: "flex",
                    flexDirection: "column",
                  }}>
                    {result.data.output.split("\n").map((line, index) => (
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
