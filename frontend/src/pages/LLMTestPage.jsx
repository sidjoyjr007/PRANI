import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useTheme } from "@/context/ThemeContext"
import Layout from "@/components/Layout"
import Container from "@/components/Container"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Text } from "@/components/ui/text"
import { ChevronLeft, Play, Loader2 } from "lucide-react"
import { llmService } from "@/services/llmService"
import { Toast, ToastContainer } from "@/components/ui/toast"
import { Alert } from "@/components/ui/alert"

export default function LLMTestPage() {
    const theme = useTheme()
    const navigate = useNavigate()
    const { llmId } = useParams()

    const [llm, setLlm] = useState(null)
    const [loading, setLoading] = useState(true)
    const [prompt, setPrompt] = useState("Hello, are you working?")
    const [isTesting, setIsTesting] = useState(false)
    const [testResult, setTestResult] = useState(null)
    const [error, setError] = useState(null)

    // Toast State
    const [toasts, setToasts] = useState([])
    const addToast = (title, description, variant = "info") => {
        const id = Date.now().toString()
        setToasts((prev) => [...prev, { id, title, description, variant }])
        setTimeout(() => removeToast(id), 5000)
    }
    const removeToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id))

    useEffect(() => {
        const fetchLLM = async () => {
            try {
                const data = await llmService.getLLM(llmId)
                setLlm(data)
            } catch (err) {
                console.error("Failed to load LLM:", err)
                setError("Failed to load LLM configuration.")
                addToast("Error", "Failed to load LLM configuration.", "destructive")
            } finally {
                setLoading(false)
            }
        }
        if (llmId) {
            fetchLLM()
        }
    }, [llmId])

    const handleTest = async () => {
        if (!llm) return

        setIsTesting(true)
        setTestResult(null)
        setTestError(null)

        try {
            const payload = {
                llm_id: llm.id,
                provider: llm.provider,
                model: llm.model,
                headers: llm.headers, // These might be masked but backend likely handles it if we pass ID
                environmentVariables: llm.environmentVariables, // Same here
                prompt: prompt
            }

            // We should use the testLLM endpoint. 
            // Note: If values are masked in 'llm', passing them back might be an issue if backend expects raw values or correct references.
            // However, the 'testLLM' endpoint in backend allows 'llm_id'. If 'llm_id' is present, it fetches the LLM from DB (with secrets) and decrypts them.
            // So passing llm_id is crucial and sufficient for existing LLMs. We don't need to pass headers/envVars if they are already in DB, 
            // unless we want to override them (which we aren't doing here).
            // Actually, looking at backend `test_llm` logic: if `llm_id` is provided, it uses it. `request` body also has fields.
            // Let's rely on `llm_id`.

            const result = await llmService.testLLM(payload)
            setTestResult(result)

            if (!result.success) {
                const errorMsg = typeof result.error === 'string'
                    ? result.error
                    : (result.error?.error?.message || result.error?.message || JSON.stringify(result.error) || "Unknown error")
                addToast("Test Failed", errorMsg, "destructive")
            } else {
                addToast("Success", "Test completed successfully", "success")
            }

        } catch (err) {
            console.error(err)
            const msg = err.response?.data?.detail || err.message || "Test execution failed"
            setTestResult({ success: false, error: msg })
            addToast("Error", msg, "destructive")
        } finally {
            setIsTesting(false)
        }
    }

    // Separate error state for test execution specifically to show in UI if needed
    const [testError, setTestError] = useState(null)


    if (loading) {
        return (
            <Layout>
                <Container>
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>Loading...</div>
                </Container>
            </Layout>
        )
    }

    if (error || !llm) {
        const errorMessage = typeof error === 'string' ? error : (error?.message || error?.detail || "LLM not found")
        return (
            <Layout>
                <Container>
                    <Alert variant="destructive">{errorMessage}</Alert>
                    <Button variant="outline" onClick={() => navigate("/llms")} style={{ marginTop: theme.spacing[4] }}>Back to LLMs</Button>
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
                            Test LLM: {llm.name}
                        </Text>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: theme.spacing[2] }}>
                        <Button variant="ghost" size="sm" onClick={() => navigate("/llms")} style={{ height: "32px", fontSize: "13px", color: theme.colors.muted_foreground }}>
                            Discard
                        </Button>
                        <Button
                            variant="primary"
                            size="sm"
                            leadingIcon={isTesting ? Loader2 : Play}
                            onClick={handleTest}
                            disabled={isTesting}
                            style={{ height: "32px", fontSize: "13px", padding: `0 ${theme.spacing[4]}` }}
                        >
                            {isTesting ? "Testing..." : "Run Test"}
                        </Button>
                    </div>
                </div>
            </div>

            <Container style={{ maxWidth: "1280px", margin: "0 auto", padding: `0 ${theme.spacing[8]}` }}>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: theme.spacing[6], alignItems: "start" }}>

                    {/* Input Section */}
                    <Card style={{ padding: theme.spacing[6], backgroundColor: theme.colors.card, border: `${theme.borderWidth.sm} solid ${theme.colors.neutral[200]}`, borderRadius: theme.borderRadius.md }}>
                        <Text as="h3" size="lg" variant="label" style={{ marginBottom: theme.spacing[6] }}>Test Parameters</Text>

                        <div style={{ marginBottom: theme.spacing[6] }}>
                            <label style={{ display: "block", fontSize: theme.typography.fontSize.sm, fontWeight: theme.typography.fontWeight.semibold, marginBottom: theme.spacing[2], color: theme.colors.foreground }}>
                                Prompt
                            </label>
                            <Textarea
                                placeholder="Enter a prompt to test..."
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                rows={6}
                            />
                        </div>

                        <Button
                            variant="primary"
                            size="md"
                            leadingIcon={isTesting ? Loader2 : Play}
                            disabled={isTesting}
                            onClick={handleTest}
                            style={{ width: "100%" }}
                        >
                            {isTesting ? "Testing..." : "Run Test"}
                        </Button>
                    </Card>

                    {/* Results Section - Terminal Style */}
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
                        <div style={{ display: "flex", gap: theme.spacing[2], marginBottom: theme.spacing[4], borderBottom: `1px solid ${theme.colors.neutral[800]}`, paddingBottom: theme.spacing[4] }}>
                            <div style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: "#ef4444" }} />
                            <div style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: "#eab308" }} />
                            <div style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: "#22c55e" }} />
                        </div>

                        <div style={{ flex: 1, overflow: "auto" }}>
                            {isTesting ? (
                                <div style={{ color: "#64748b", textAlign: "center", marginTop: theme.spacing[8] }}>Processing request...</div>
                            ) : testResult ? (
                                <div>
                                    <div style={{
                                        padding: `${theme.spacing[2]} 0`,
                                        borderBottom: `1px solid ${theme.colors.neutral[900]}`,
                                        marginBottom: theme.spacing[4],
                                        color: testResult.success ? "#22c55e" : "#f87171",
                                        fontWeight: "bold",
                                        fontSize: theme.typography.fontSize.sm
                                    }}>
                                        [{testResult.success ? "SUCCESS" : "ERROR"}] {testResult.success ? "Response received" : "Request failed"}
                                    </div>
                                    <pre style={{ margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-word", fontSize: theme.typography.fontSize.xs, lineHeight: 1.5, color: "#e2e8f0" }}>
                                        {testResult.success
                                            ? (typeof testResult.data === 'string' ? testResult.data : JSON.stringify(testResult.data, null, 2))
                                            : (typeof testResult.error === 'string' ? testResult.error : JSON.stringify(testResult.error || testResult, null, 2))
                                        }
                                    </pre>
                                </div>
                            ) : (
                                <div style={{ color: "#64748b", textAlign: "center", marginTop: theme.spacing[12], fontSize: theme.typography.fontSize.sm }}>
                                    Ready to test. Enter a prompt and click Run.
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            </Container>
        </Layout>
    )
}
