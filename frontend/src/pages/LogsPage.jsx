import { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { useTheme } from "@/context/ThemeContext"
import Layout from "@/components/Layout"
import Container from "@/components/Container"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Text } from "@/components/ui/text"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { ChevronLeft, Search, Download, Copy, Check } from "lucide-react"

// Mock logs data
const MOCK_LOGS = [
  {
    id: 1,
    timestamp: "14:35:42.123",
    level: "INFO",
    source: "Agent Execution",
    message: "Agent started processing request",
  },
  {
    id: 2,
    timestamp: "14:35:43.456",
    level: "DEBUG",
    source: "Tool Handler",
    message: "Loading tool: Web Search",
  },
  {
    id: 3,
    timestamp: "14:35:44.789",
    level: "INFO",
    source: "Execution Engine",
    message: "Executing tool: Web Search with query 'latest AI trends'",
  },
  {
    id: 4,
    timestamp: "14:35:46.012",
    level: "INFO",
    source: "API Handler",
    message: "Web Search API call completed - Results: 15 items found",
  },
  {
    id: 5,
    timestamp: "14:35:47.345",
    level: "DEBUG",
    source: "Response Parser",
    message: "Parsing API response - Extracted 15 search results",
  },
  {
    id: 6,
    timestamp: "14:35:48.678",
    level: "INFO",
    source: "Agent Execution",
    message: "Processing results with LLM Model: gpt-4",
  },
  {
    id: 7,
    timestamp: "14:35:50.901",
    level: "INFO",
    source: "LLM Handler",
    message: "LLM response received - Generated summary of 5 key findings",
  },
  {
    id: 8,
    timestamp: "14:35:51.234",
    level: "INFO",
    source: "Agent Execution",
    message: "Agent completed successfully - Execution time: 8.891s",
  },
  {
    id: 9,
    timestamp: "14:35:45.500",
    level: "WARN",
    source: "Cache Manager",
    message: "Cache miss detected - Fetching fresh data from source",
  },
  {
    id: 10,
    timestamp: "14:35:49.800",
    level: "ERROR",
    source: "Validation Engine",
    message: "Validation warning encountered - Some fields require attention",
  },
]

const LOG_LEVELS = ["ALL", "DEBUG", "INFO", "WARN", "ERROR"]

// Get ANSI-style color for log level
const getLevelColor = (level) => {
  switch (level) {
    case "DEBUG":
      return { color: "#7c8dcc", symbol: "DEBUG" } // blue
    case "INFO":
      return { color: "#4ade80", symbol: "INFO " } // green
    case "WARN":
      return { color: "#facc15", symbol: "WARN " } // yellow
    case "ERROR":
      return { color: "#f87171", symbol: "ERROR" } // red
    default:
      return { color: "#7c8dcc", symbol: "DEBUG" }
  }
}

export default function LogsPage() {
  const theme = useTheme()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedLevel, setSelectedLevel] = useState("ALL")
  const [copiedId, setCopiedId] = useState(null)

  // Filter logs based on search and level
  const filteredLogs = useMemo(() => {
    return MOCK_LOGS.filter(log => {
      const matchesSearch = !searchQuery ||
        log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.source.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesLevel = selectedLevel === "ALL" || log.level === selectedLevel

      return matchesSearch && matchesLevel
    })
  }, [searchQuery, selectedLevel])

  // Copy log to clipboard
  const copyToClipboard = (log) => {
    const logLine = `[${log.timestamp}] [${log.level}] ${log.source}: ${log.message}`
    navigator.clipboard.writeText(logLine)
    setCopiedId(log.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  // Download logs as text
  const handleDownloadLogs = () => {
    const logsText = filteredLogs
      .map(log => `[${log.timestamp}] [${log.level}] ${log.source}: ${log.message}`)
      .join("\n")

    const element = document.createElement("a")
    element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(logsText))
    element.setAttribute("download", `logs-${new Date().toISOString().split("T")[0]}.txt`)
    element.style.display = "none"
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  return (
    <Layout>
      <Container>
        {/* Header */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: theme.spacing[6],
          paddingBottom: theme.spacing[4],
          borderBottom: `${theme.borderWidth.sm} solid ${theme.colors.neutral[200]}`,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: theme.spacing[4] }}>
            <Button
              variant="outline"
              size="md"
              leadingIcon={ChevronLeft}
              onClick={() => navigate("/work")}
            >
              Back
            </Button>
            <div>
              <h1 style={{
                fontSize: theme.typography.fontSize.xl2,
                fontWeight: theme.typography.fontWeight.bold,
                color: theme.colors.foreground,
                margin: 0,
              }}>
                Execution Logs
              </h1>
            </div>
          </div>
        </div>

        {/* Terminal View */}
        <Card
          style={{
            padding: theme.spacing[6],
            border: `${theme.borderWidth.sm} solid ${theme.colors.neutral[800]}`,
            borderRadius: theme.borderRadius.md,
            backgroundColor: "#0f172a", // Dark blue-black like terminal
            fontFamily: '"Fira Code", "Courier New", monospace',
            color: "#e2e8f0",
            overflow: "hidden",
            minHeight: "600px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Terminal Header - Window Controls + Search/Filter */}
          <div style={{
            display: "flex",
            flexDirection: "column",
            gap: theme.spacing[3],
            marginBottom: theme.spacing[4],
          }}>
            {/* Window Controls - Top Line */}
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

            {/* Controls Container - Bottom Line */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: theme.spacing[3],
              paddingBottom: theme.spacing[4],
              borderBottom: `${theme.borderWidth.sm} solid ${theme.colors.neutral[800]}`,
              justifyContent: "flex-end",
            }}>
              {/* Search Input */}
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: theme.spacing[2],
                backgroundColor: "#1e293b",
                border: `${theme.borderWidth.sm} solid ${theme.colors.neutral[800]}`,
                borderRadius: theme.borderRadius.sm,
                padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
                width: "300px",
              }}>
                <Search size={16} style={{ color: "#64748b", flexShrink: 0 }} />
                <input
                  type="text"
                  placeholder="Search logs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    flex: 1,
                    backgroundColor: "transparent",
                    border: "none",
                    color: "#e2e8f0",
                    fontSize: theme.typography.fontSize.xs,
                    outline: "none",
                    fontFamily: '"Fira Code", "Courier New", monospace',
                    padding: 0,
                  }}
                />
              </div>

              {/* Level Filter */}
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: theme.spacing[2],
                backgroundColor: "#1e293b",
                border: `${theme.borderWidth.sm} solid ${theme.colors.neutral[800]}`,
                borderRadius: theme.borderRadius.sm,
                padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
                minWidth: "150px",
              }}>
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  style={{
                    flex: 1,
                    backgroundColor: "transparent",
                    border: "none",
                    color: "#e2e8f0",
                    fontSize: theme.typography.fontSize.xs,
                    outline: "none",
                    fontFamily: '"Fira Code", "Courier New", monospace',
                    cursor: "pointer",
                  }}
                >
                  {LOG_LEVELS.map(level => (
                    <option key={level} value={level} style={{ backgroundColor: "#0f172a", color: "#e2e8f0" }}>
                      {level}
                    </option>
                  ))}
                </select>
              </div>

              {/* Download Button */}
              <Button
                variant="ghost"
                size="sm"
                leadingIcon={Download}
                onClick={handleDownloadLogs}
                style={{
                  color: "#64748b",
                  padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
                  fontSize: theme.typography.fontSize.xs,
                  backgroundColor: "#1e293b",
                  border: `${theme.borderWidth.sm} solid ${theme.colors.neutral[800]}`,
                  flexShrink: 0,
                }}
                title="Download logs"
              >
                Download
              </Button>
            </div>
          </div>

          {/* Logs Container */}
          {filteredLogs.length > 0 ? (
            <div
              style={{
                flex: 1,
                overflow: "auto",
                display: "flex",
                flexDirection: "column",
                gap: 0,
              }}
            >
              {filteredLogs.map((log, index) => {
                const levelStyle = getLevelColor(log.level)
                const isLast = index === filteredLogs.length - 1

                return (
                  <div
                    key={log.id}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: theme.spacing[3],
                      paddingBottom: isLast ? 0 : theme.spacing[2],
                      borderBottom: isLast ? "none" : `${theme.borderWidth.sm} solid ${theme.colors.neutral[900]}`,
                      cursor: "pointer",
                      transition: `background-color ${theme.transitions.normal}`,
                      padding: `${theme.spacing[2]} ${theme.spacing[0]}`,
                      paddingRight: theme.spacing[3],
                      marginRight: "-" + theme.spacing[3],
                      marginLeft: "-" + theme.spacing[3],
                      paddingLeft: theme.spacing[3],
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#1e293b20"
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent"
                    }}
                  >
                    {/* Line Number */}
                    <span style={{
                      color: "#475569",
                      fontSize: theme.typography.fontSize.xs,
                      minWidth: "40px",
                      textAlign: "right",
                      userSelect: "none",
                    }}>
                      {String(index + 1).padStart(4, " ")}
                    </span>

                    {/* Log Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: theme.spacing[2],
                        marginBottom: theme.spacing[1],
                        flexWrap: "wrap",
                      }}>
                        {/* Timestamp */}
                        <span style={{
                          color: "#64748b",
                          fontSize: theme.typography.fontSize.xs,
                        }}>
                          {log.timestamp}
                        </span>

                        {/* Level Badge */}
                        <span style={{
                          color: levelStyle.color,
                          fontSize: theme.typography.fontSize.xs,
                          fontWeight: "bold",
                          letterSpacing: "1px",
                        }}>
                          [{levelStyle.symbol}]
                        </span>

                        {/* Source */}
                        <span style={{
                          color: "#60a5fa",
                          fontSize: theme.typography.fontSize.xs,
                        }}>
                          {log.source}
                        </span>
                      </div>

                      {/* Message */}
                      <div style={{
                        color: "#e2e8f0",
                        fontSize: theme.typography.fontSize.sm,
                        fontFamily: '"Fira Code", "Courier New", monospace',
                        wordBreak: "break-word",
                        whiteSpace: "pre-wrap",
                        lineHeight: "1.5",
                      }}>
                        {log.message}
                      </div>
                    </div>

                    {/* Copy Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        copyToClipboard(log)
                      }}
                      style={{
                        padding: theme.spacing[1],
                        minWidth: "unset",
                        color: copiedId === log.id ? "#22c55e" : "#64748b",
                        flexShrink: 0,
                      }}
                      title={copiedId === log.id ? "Copied!" : "Copy log line"}
                    >
                      {copiedId === log.id ? <Check size={16} /> : <Copy size={16} />}
                    </Button>
                  </div>
                )
              })}
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flex: 1,
                color: "#64748b",
              }}
            >
              <span style={{ fontSize: theme.typography.fontSize.sm }}>
                No logs found matching your filters
              </span>
            </div>
          )}

          {/* Terminal Footer */}
          <div
            style={{
              marginTop: theme.spacing[4],
              paddingTop: theme.spacing[4],
              borderTop: `${theme.borderWidth.sm} solid ${theme.colors.neutral[800]}`,
              color: "#64748b",
              fontSize: theme.typography.fontSize.xs,
            }}
          >
            <span>Total logs: {filteredLogs.length}</span>
          </div>
        </Card>
      </Container>
    </Layout>
  )
}
