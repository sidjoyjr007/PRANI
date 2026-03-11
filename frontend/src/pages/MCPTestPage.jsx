import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { useTheme } from "@/context/ThemeContext"
import Layout from "@/components/Layout"
import Container from "@/components/Container"
import { Button } from "@/components/ui/button"
import { Text } from "@/components/ui/text"
import { Card } from "@/components/ui/card"
import { ChevronLeft, Play, RefreshCw, Check, X, Server, Globe } from "lucide-react"
import { Toast, ToastContainer } from "@/components/ui/toast"
import { Spinner } from "@/components/ui/spinner"
import { fetchMCPById, clearCurrentMCP } from "@/store/slices/mcpSlice"
import { mcpService } from "@/services/mcpService"

export default function MCPTestPage() {
    const theme = useTheme()
    const navigate = useNavigate()
    const { serverId } = useParams()
    const dispatch = useDispatch()

    const { currentMCP, isLoading: isMCPLoading } = useSelector((state) => state.mcps)

    const [isTesting, setIsTesting] = useState(false)
    const [testResult, setTestResult] = useState(null)
    const [testError, setTestError] = useState(null)
    const [isToolsExpanded, setIsToolsExpanded] = useState(false)

    // Config loaded from Redux/Backend (Read-only for test)
    const [config, setConfig] = useState(null)

    // Toast State
    const [toasts, setToasts] = useState([])
    const addToast = (title, description, variant = "info") => {
        const id = Date.now().toString()
        setToasts((prev) => [...prev, { id, title, description, variant }])
        setTimeout(() => removeToast(id), 5000)
    }
    const removeToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id))

    useEffect(() => {
        if (serverId) {
            dispatch(fetchMCPById(serverId))
                .unwrap()
                .then((data) => {
                    setConfig({
                        url: data.url,
                        headers: data.headers, // Keep as is (object or string)
                        environmentVariables: data.environmentVariables || []
                    })
                })
                .catch((err) => {
                    const errorMsg = typeof err === 'string' ? err : (err.detail || "Failed to load MCP config")
                    addToast("Error", errorMsg, "error")
                })
        }

        return () => {
            dispatch(clearCurrentMCP())
        }
    }, [serverId, dispatch])

    const handleTest = async () => {
        if (!config?.url) {
            addToast("Error", "URL is missing", "destructive")
            return
        }

        setIsTesting(true)
        setTestResult(null)
        setTestError(null)

        try {
            const payload = {
                mcp_id: serverId || null,
                url: config.url,
                headers: typeof config.headers === 'string' ? config.headers : JSON.stringify(config.headers),
                environmentVariables: config.environmentVariables
            }

            const result = await mcpService.testMCP(payload)

            if (result.success) {
                setTestResult({
                    status: "success",
                    message: result.message,
                    data: {
                        executedAt: new Date().toISOString(),
                        ...result
                    }
                })
                addToast("Success", "Connection successful!", "success")
            } else {
                setTestResult({
                    status: "error", // Use error status for the terminal to style it red
                    message: "Connection Attempt Failed",
                    data: {
                        error: result.error
                    }
                })
                setTestError(typeof result.error === 'string' ? result.error : JSON.stringify(result.error))
                addToast("Test Failed", "Connection failed", "destructive")
            }
        } catch (error) {
            console.error("Test error:", error)
            const errorMsg = error.response?.data?.detail || error.message || "Test execution failed"
            setTestError(errorMsg)
            addToast("Error", "Test execution failed", "destructive")
        } finally {
            setIsTesting(false)
            setIsToolsExpanded(false)
        }
    }

    if (isMCPLoading) {
        return (
            <Layout>
                <Container>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                        <Spinner size="lg" />
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

            <Container>
                {/* Header */}
                <div style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    marginBottom: theme.spacing[8], paddingBottom: theme.spacing[4],
                    borderBottom: `${theme.borderWidth.sm} solid ${theme.colors.neutral[200]}`
                }}>
                    <Button variant="outline" size="md" leadingIcon={ChevronLeft} onClick={() => navigate("/mcp-servers")}>
                        Back
                    </Button>
                    <h1 style={{
                        fontSize: theme.typography.fontSize.xl2, fontWeight: theme.typography.fontWeight.bold,
                        color: theme.colors.foreground, margin: 0,
                        flex: 1, textAlign: "center",
                    }}>
                        Test {currentMCP?.name || "MCP Server"}
                    </h1>
                    <div style={{ width: "fit-content" }} /> {/* Spacer to center title */}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: theme.spacing[8] }}>

                    {/* Left Column: Server Info & Actions */}
                    <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing[6] }}>
                        <Card style={{ padding: theme.spacing[6], backgroundColor: theme.colors.card }}>
                            <Text as="h3" size="lg" variant="label" style={{ marginBottom: theme.spacing[4] }}>Server Details</Text>

                            <div style={{ marginBottom: theme.spacing[6] }}>
                                <label style={{ display: "block", fontSize: theme.typography.fontSize.sm, fontWeight: "bold", marginBottom: theme.spacing[2], color: theme.colors.foreground }}>URL</label>
                                <div style={{
                                    padding: theme.spacing[3],
                                    backgroundColor: theme.colors.neutral[50],
                                    border: `1px solid ${theme.colors.neutral[200]}`,
                                    borderRadius: theme.borderRadius.md,
                                    fontFamily: "monospace",
                                    fontSize: theme.typography.fontSize.sm,
                                    display: 'flex', alignItems: 'center', gap: theme.spacing[2],
                                    color: theme.colors.foreground
                                }}>
                                    <Globe size={14} className="text-muted-foreground" />
                                    <span style={{ wordBreak: 'break-all' }}>{config?.url || "Loading..."}</span>
                                </div>
                            </div>

                            <Button
                                variant="primary"
                                size="md"
                                leadingIcon={isTesting ? RefreshCw : Play}
                                onClick={handleTest}
                                disabled={isTesting || !config}
                                style={{ width: "100%" }}
                            >
                                {isTesting ? "Testing Connection..." : "Test Connection"}
                            </Button>

                            <Text size="xs" variant="muted" style={{ marginTop: theme.spacing[4], textAlign: 'center' }}>
                                This will attempt to connect to the MCP server and list available tools.
                            </Text>
                        </Card>
                    </div>

                    {/* Right Column: Terminal Output */}
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
                            minHeight: "400px"
                        }}
                    >
                        {/* Terminal Header */}
                        <div style={{
                            display: "flex", flexDirection: "column", gap: theme.spacing[3], marginBottom: theme.spacing[4],
                        }}>
                            <div style={{ display: "flex", gap: theme.spacing[2], alignItems: "center" }}>
                                <div style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: "#ef4444" }} />
                                <div style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: "#eab308" }} />
                                <div style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: "#22c55e" }} />
                            </div>
                            <div style={{ paddingBottom: theme.spacing[4], borderBottom: `${theme.borderWidth.sm} solid ${theme.colors.neutral[800]}` }} />
                        </div>

                        {/* Results Display */}
                        <div style={{ flex: 1, overflow: "auto", display: "flex", flexDirection: "column" }}>
                            {isTesting ? (
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1, color: "#64748b", fontSize: theme.typography.fontSize.sm }}>
                                    <RefreshCw className="animate-spin" size={16} style={{ marginRight: theme.spacing[2] }} />
                                    Establishing connection...
                                </div>
                            ) : testError ? (
                                <div style={{ padding: theme.spacing[3], color: "#f87171", fontSize: theme.typography.fontSize.xs, lineHeight: 1.6 }}>
                                    <span style={{ fontWeight: "bold" }}>✕ ERROR:</span> {testError}
                                </div>
                            ) : testResult ? (
                                <>
                                    {/* Status Line */}
                                    <div style={{
                                        paddingBottom: theme.spacing[4],
                                        borderBottom: `1px solid ${theme.colors.neutral[800]}`,
                                        marginBottom: theme.spacing[4],
                                        fontFamily: "monospace"
                                    }}>
                                        <div style={{ color: testResult.status === "success" ? "#22c55e" : "#f87171", fontWeight: "bold", marginBottom: theme.spacing[2] }}>
                                            [{testResult.status.toUpperCase()}] {testResult.message}
                                        </div>
                                        {testResult.data.serverInfo && (
                                            <div style={{ color: "#94a3b8", fontSize: "0.8em" }}>
                                                Server: {testResult.data.serverInfo.name} (v{testResult.data.serverInfo.version})
                                            </div>
                                        )}
                                    </div>

                                    {/* Tools List */}
                                    <div style={{ flex: 1, overflowY: "auto", maxHeight: "350px", paddingRight: theme.spacing[2] }}>
                                        <div style={{ color: "#e2e8f0", fontWeight: "bold", marginBottom: theme.spacing[3] }}>
                                            Available Tools ({testResult.data.tools?.length || 0}):
                                        </div>

                                        {testResult.data.tools && testResult.data.tools.length > 0 ? (
                                            <>
                                                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: theme.spacing[3] }}>
                                                    {(() => {
                                                        const allTools = testResult.data.tools;
                                                        const showTools = isToolsExpanded ? allTools : allTools.slice(0, 5);

                                                        return showTools.map((tool, index) => (
                                                            <li key={index} style={{
                                                                backgroundColor: "rgba(255,255,255,0.05)",
                                                                borderRadius: "4px",
                                                                padding: theme.spacing[3],
                                                                border: "1px solid rgba(255,255,255,0.1)"
                                                            }}>
                                                                <div style={{ color: theme.colors.primary[300], fontWeight: "bold", marginBottom: "4px" }}>
                                                                    {tool.name}
                                                                </div>
                                                                <div style={{ color: "#94a3b8", fontSize: "0.9em", lineHeight: 1.4 }}>
                                                                    {tool.description || "No description provided."}
                                                                </div>
                                                            </li>
                                                        ));
                                                    })()}
                                                </ul>

                                                {testResult.data.tools.length > 5 && (
                                                    <div style={{ paddingTop: theme.spacing[4], textAlign: "center" }}>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => setIsToolsExpanded(!isToolsExpanded)}
                                                            style={{ color: theme.colors.primary[300], padding: 0, height: "auto" }}
                                                        >
                                                            {isToolsExpanded ? "...Show Less" : `...Show More (${testResult.data.tools.length - 5} more tools)`}
                                                        </Button>
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <div style={{ color: "#64748b", fontStyle: "italic" }}>No tools found on this server.</div>
                                        )}
                                    </div>

                                    {/* Metadata Footer */}
                                    <div style={{
                                        marginTop: theme.spacing[4],
                                        paddingTop: theme.spacing[4],
                                        borderTop: `1px solid ${theme.colors.neutral[800]}`,
                                        fontSize: "0.75em",
                                        color: "#64748b",
                                        display: "flex",
                                        justifyContent: "space-between"
                                    }}>
                                        <span>Executed: {new Date(testResult.data.executedAt).toLocaleString()}</span>
                                    </div>
                                </>
                            ) : (
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1, color: "#64748b", fontSize: theme.typography.fontSize.xs, textAlign: "center", flexDirection: 'column', gap: theme.spacing[2] }}>
                                    <Server size={32} style={{ opacity: 0.5 }} />
                                    Click "Test Connection" to verify server status.
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            </Container>
        </Layout>
    )
}
