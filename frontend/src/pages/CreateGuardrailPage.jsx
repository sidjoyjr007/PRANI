import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { useTheme } from "@/context/ThemeContext"
import Layout from "@/components/Layout"
import Container from "@/components/Container"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Text } from "@/components/ui/text"
import { Card } from "@/components/ui/card"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { ChevronLeft, Check, Shield, Code, Zap, Loader2 } from "lucide-react"
import { Toast, ToastContainer } from "@/components/ui/toast"
import { createGuardrail, fetchGuardrailById, updateGuardrail } from "@/store/slices/guardrailSlice"

export default function CreateGuardrailPage() {
  const theme = useTheme()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { shieldId } = useParams()

  const { isSaving, isLoading } = useSelector((state) => state.guardrails)

  const [guardrailData, setGuardrailData] = useState({
    name: "",
    description: "",
    type: "output",
    mechanism: "regex",
    action: "block",
    logic: "",
    config: {},
    is_active: true
  })

  // Toast State
  const [toasts, setToasts] = useState([])
  const addToast = (title, description, variant = "info") => {
    const id = Date.now().toString()
    setToasts((prev) => [...prev, { id, title, description, variant }])
    setTimeout(() => removeToast(id), 5000)
  }
  const removeToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id))

  // Fetch guardrail on mount if editing
  useEffect(() => {
    if (shieldId) {
      console.log("Fetching guardrail for ID:", shieldId)
      dispatch(fetchGuardrailById(shieldId))
        .unwrap()
        .then((data) => {
          console.log("Fetched guardrail data:", data)
          setGuardrailData({
            name: data.name || "",
            description: data.description || "",
            type: data.type || "input",
            mechanism: data.mechanism || "regex",
            action: data.action || "block",
            logic: data.logic || "",
            config: data.config || {},
            is_active: data.is_active ?? true
          })
        })
        .catch((err) => {
          console.error("Failed to fetch guardrail:", err)
          addToast("Error", "Failed to load guardrail details", "error")
          navigate("/guardrails")
        })
    }
  }, [shieldId, dispatch, navigate])

  const validateData = () => {
    if (!guardrailData.name.trim() || guardrailData.name.length < 3) {
      addToast("Validation Error", "Name must be at least 3 characters.", "error")
      return false
    }
    if (!guardrailData.logic.trim()) {
      addToast("Validation Error", "Guardrail logic is required.", "error")
      return false
    }
    return true
  }

  const handleSave = async () => {
    if (!validateData()) return

    try {
      if (shieldId) {
        await dispatch(updateGuardrail({ id: shieldId, guardrailData })).unwrap()
        addToast("Success", "Guardrail updated successfully!", "success")
        setTimeout(() => navigate("/guardrails"), 1000)
      } else {
        await dispatch(createGuardrail(guardrailData)).unwrap()
        addToast("Success", "Guardrail created successfully!", "success")
        setTimeout(() => navigate("/guardrails"), 1000)
      }
    } catch (error) {
      console.error("Error saving guardrail:", error)
      addToast("Error", typeof error === 'string' ? error : "Error saving guardrail", "error")
    }
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
          maxWidth: "1280px", margin: "0 auto", padding: `0 ${theme.spacing[8]}`,
          display: "flex", justifyContent: "space-between", alignItems: "center", height: "36px"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: theme.spacing[3] }}>
            <Button 
              variant="outline" size="sm" onClick={() => navigate("/guardrails")} 
              style={{ width: "32px", height: "32px", borderRadius: "8px", padding: 0, display: "flex", alignItems: "center", justifyContent: "center", border: `${theme.borderWidth.sm} solid ${theme.colors.neutral[300]}`, color: theme.colors.foreground }}
            >
              <ChevronLeft size={20} strokeWidth={2.5} />
            </Button>
            <div style={{ width: "1px", height: "14px", backgroundColor: theme.colors.neutral[300] }} />
            <Text weight="semibold" style={{ fontSize: "14px", color: theme.colors.foreground, margin: 0 }}>
              {shieldId ? "Edit Guardrail" : "Create Guardrail"}
            </Text>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: theme.spacing[2] }}>
            <Button variant="ghost" size="sm" onClick={() => navigate("/guardrails")} style={{ height: "32px", fontSize: "13px", color: theme.colors.muted_foreground }}>
              Discard
            </Button>
            <Button 
              variant="primary" size="sm" leadingIcon={Check} onClick={handleSave} disabled={isSaving} 
              style={{ height: "32px", fontSize: "13px", padding: `0 ${theme.spacing[4]}` }}
            >
              {isSaving ? "Saving..." : "Save Guardrail"}
            </Button>
          </div>
        </div>
      </div>

      <Container maxWidth="1280px" style={{ paddingTop: theme.spacing[12], paddingBottom: theme.spacing[24], backgroundColor: "transparent" }}>
        {isLoading ? (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px", color: theme.colors.muted_foreground }}>
             <Loader2 size={32} className="animate-spin mr-3" />
             <p>Loading guardrail details...</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing[8], marginBottom: theme.spacing[12] }}>
          
          <Card style={{ padding: 0, border: `${theme.borderWidth.sm} solid ${theme.colors.neutral[200]}`, borderRadius: theme.borderRadius.xl, backgroundColor: theme.colors.card, overflow: "hidden", boxShadow: "none" }}>
            
            {/* General Info */}
            <div style={{ padding: theme.spacing[8] }}>
              <div style={{ display: "flex", alignItems: "center", gap: theme.spacing[2], marginBottom: theme.spacing[6] }}>
                <div style={{ width: "24px", height: "24px", borderRadius: "6px", backgroundColor: theme.colors.primary.DEFAULT + "08", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Shield size={14} style={{ color: theme.colors.primary.DEFAULT }} />
                </div>
                <Text weight="semibold" style={{ fontSize: "14px", color: theme.colors.foreground, margin: 0 }}>Core Settings</Text>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: theme.spacing[8], marginBottom: theme.spacing[6] }}>
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: "600", color: theme.colors.neutral[500], textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: theme.spacing[2] }}>
                    Rule Name
                  </label>
                  <Input
                    placeholder="e.g. Block Emojis"
                    value={guardrailData.name}
                    onChange={(e) => setGuardrailData({ ...guardrailData, name: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ marginBottom: theme.spacing[6] }}>
                <label style={{ display: "block", fontSize: "11px", fontWeight: "600", color: theme.colors.neutral[500], textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: theme.spacing[2] }}>
                  Description
                </label>
                <Textarea
                  placeholder="What does this rule protect against?"
                  value={guardrailData.description}
                  onChange={(e) => setGuardrailData({ ...guardrailData, description: e.target.value })}
                  rows={2}
                />
              </div>

              {/* Toggles */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: theme.spacing[8] }}>
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: "600", color: theme.colors.neutral[500], textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: theme.spacing[2] }}>
                    Type (When to run)
                  </label>
                  <Select value={guardrailData.type} onValueChange={(v) => setGuardrailData({...guardrailData, type: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="output">Output (After LLM)</SelectItem>
                      <SelectItem value="execution">Execution (Tools/Servers)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: "600", color: theme.colors.neutral[500], textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: theme.spacing[2] }}>
                    Mechanism (How to run)
                  </label>
                  <Select value={guardrailData.mechanism} onValueChange={(v) => setGuardrailData({...guardrailData, mechanism: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="regex">Regex Pattern Match</SelectItem>
                      <SelectItem value="llm_judge">LLM-as-a-Judge</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: "600", color: theme.colors.neutral[500], textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: theme.spacing[2] }}>
                    Action (If triggered)
                  </label>
                  <Select value={guardrailData.action} onValueChange={(v) => setGuardrailData({...guardrailData, action: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="block">Block entirely</SelectItem>
                      <SelectItem value="warn">Warn and proceed</SelectItem>
                      <SelectItem value="modify">Ask agent to modify</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div style={{ borderTop: `${theme.borderWidth.sm} solid ${theme.colors.neutral[100]}`, margin: `0 ${theme.spacing[8]}` }} />

            {/* Logic */}
            <div style={{ padding: theme.spacing[8] }}>
              <div style={{ display: "flex", alignItems: "center", gap: theme.spacing[2], marginBottom: theme.spacing[6] }}>
                <div style={{ width: "24px", height: "24px", borderRadius: "6px", backgroundColor: theme.colors.primary.DEFAULT + "08", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Code size={14} style={{ color: theme.colors.primary.DEFAULT }} />
                </div>
                <Text weight="semibold" style={{ fontSize: "14px", color: theme.colors.foreground, margin: 0 }}>Guardrail Logic</Text>
              </div>

              <div style={{ marginBottom: theme.spacing[6] }}>
                <label style={{ display: "block", fontSize: "11px", fontWeight: "600", color: theme.colors.neutral[500], textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: theme.spacing[2] }}>
                  {guardrailData.mechanism === "REGEX" ? "Regular Expression Pattern" : "Evaluation Prompt for Judge"}
                </label>
                <Textarea
                  placeholder={guardrailData.mechanism === "REGEX" ? "^.*(secret).*$\n^.*(password).*$\n(one pattern per line)" : "Ensure the agent does not output any PII. Look for SSNs."}
                  value={guardrailData.logic}
                  onChange={(e) => setGuardrailData({ ...guardrailData, logic: e.target.value })}
                  rows={6}
                />
              </div>
            </div>
          </Card>
        </div>
      )}
      </Container>
    </Layout>
  )
}
