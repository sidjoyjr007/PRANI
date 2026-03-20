import { useState, useEffect } from "react"
import { useNavigate, useLocation, useParams } from "react-router-dom"
import { useTheme } from "@/context/ThemeContext"
import { agentService } from "@/services/agentService"
import { deploymentService } from "@/services/deploymentService"
import Layout from "@/components/Layout"
import Container from "@/components/Container"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Toast, ToastContainer } from "@/components/ui/toast"
import { Card } from "@/components/ui/card"
import { Text } from "@/components/ui/text"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { SmartScheduler } from "@/components/ui/smart-scheduler"
import { Rocket, Clock, Webhook, Play, Loader2, ChevronLeft, Check, Copy, ExternalLink, ShieldCheck, Info } from "lucide-react"

export default function CreateDeploymentPage() {
  const theme = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const { deploymentId } = useParams()
  const isEditMode = !!deploymentId
  
  const [name, setName] = useState("")
  const [agents, setAgents] = useState([])
  const [loadingAgents, setLoadingAgents] = useState(true)
  const [selectedAgentId, setSelectedAgentId] = useState("")
  const [triggerType, setTriggerType] = useState("API")
  const [scheduleCron, setScheduleCron] = useState("")
  const [defaultInput, setDefaultInput] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loadingDeployment, setLoadingDeployment] = useState(isEditMode)

  // Toast State
  const [toasts, setToasts] = useState([])
  const addToast = (title, description, variant = "info") => {
    const id = Date.now().toString()
    setToasts((prev) => [...prev, { id, title, description, variant }])
    setTimeout(() => removeToast(id), 5000)
  }
  const removeToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id))

  useEffect(() => {
    const passedAgentId = location.state?.agentId
    const loadAgentsData = async () => {
      try {
        setLoadingAgents(true)
        if (isEditMode) setLoadingDeployment(true)
        
        const res = await agentService.listAgents({ page: 1, size: 100 })
        const agentList = res.items || []
        setAgents(agentList)
        
        if (isEditMode) {
          const dep = await deploymentService.getDeployment(deploymentId)
          console.log("Fetched deployment for edit:", dep)
          setName(dep.name || "")
          setSelectedAgentId(String(dep.agent_id))
          setTriggerType(dep.trigger_type)
          setScheduleCron(dep.schedule_cron || "")
          setDefaultInput(dep.default_input || "")
        } else if (passedAgentId) {
          setSelectedAgentId(String(passedAgentId))
        } else if (agentList.length > 0) {
          setSelectedAgentId(String(agentList[0].id))
        }
      } catch (err) {
        console.error("Failed to fetch data", err)
        addToast("Error", "Failed to load deployment data", "error")
      } finally {
        setLoadingAgents(false)
        setLoadingDeployment(false)
      }
    }

    loadAgentsData()
  }, [location.state, deploymentId])

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    setHasCopiedKey(true)
    addToast("Copied", "API Key copied to clipboard", "success")
    setTimeout(() => setHasCopiedKey(false), 2000)
  }

  const handleSubmit = async (e) => {
    if (e) e.preventDefault()
    
    if (!name.trim()) {
        addToast("Validation Error", "Deployment Name is required.", "error")
        return
    }
    if (!selectedAgentId) {
        addToast("Validation Error", "Please select an Agent to deploy.", "error")
        return
    }
    if (triggerType === "SCHEDULED" && !defaultInput.trim()) {
        addToast("Validation Error", "Execution Input is required for scheduled deployments.", "error")
        return
    }
    if (triggerType === "SCHEDULED" && !scheduleCron.trim()) {
        addToast("Validation Error", "Please configure a run schedule.", "error")
        return
    }

    try {
      setIsSubmitting(true)
      const payload = {
        name: name.trim(),
        agent_id: selectedAgentId,
        trigger_type: triggerType,
        is_active: true,
        default_input: defaultInput || null,
        schedule_cron: triggerType === "SCHEDULED" ? scheduleCron : null
      }

      if (isEditMode) {
        await deploymentService.updateDeployment(deploymentId, payload)
        addToast("Success", "Deployment updated successfully!", "success")
        navigate("/deployments")
      } else {
        await deploymentService.createDeployment(payload)
        addToast("Success", "Agent deployed successfully!", "success")
        navigate("/deployments")
      }
    } catch (err) {
      console.error("Failed to process deployment:", err)
      addToast("Error", err.response?.data?.detail || err.message || "Operation failed", "error")
      setIsSubmitting(false)
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

      <Container>
        {/* Header Section */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: theme.spacing[8],
            paddingBottom: theme.spacing[4],
            borderBottom: `${theme.borderWidth.sm} solid ${theme.colors.neutral[200]}`,
          }}
        >
          <Button variant="outline" size="md" leadingIcon={ChevronLeft} onClick={() => navigate("/deployments")}>
            Back
          </Button>
          <h1 style={{ fontSize: theme.typography.fontSize.xl2, fontWeight: theme.typography.fontWeight.bold, color: theme.colors.foreground, margin: 0, flex: 1, textAlign: "center" }}>
            {isEditMode ? "Edit Deployment" : "Create Deployment"}
          </h1>
          <Button 
            variant="primary" 
            size="md" 
            leadingIcon={Check} 
            onClick={() => handleSubmit()} 
            disabled={isSubmitting || loadingAgents}
          >
            {isSubmitting ? (isEditMode ? "Saving..." : "Deploying...") : (isEditMode ? "Save Changes" : "Deploy Agent")}
          </Button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing[8], marginBottom: theme.spacing[8] }}>
          {loadingDeployment || (isEditMode && loadingAgents) ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: theme.spacing[20], gap: theme.spacing[4], backgroundColor: "rgba(255,255,255,0.02)", borderRadius: theme.borderRadius.lg, border: `1px solid ${theme.colors.border}` }}>
              <Loader2 className="animate-spin" size={40} style={{ color: theme.colors.primary[500] }} />
              <Text variant="medium" style={{ color: theme.colors.muted_foreground }}>Loading deployment details...</Text>
            </div>
          ) : (
            <form id="deployment-form" onSubmit={handleSubmit}>
            <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing[8] }}>
              
              {/* General Settings */}
              <Card style={{ 
                padding: theme.spacing[6], 
                border: `${theme.borderWidth.sm} solid ${theme.colors.neutral[200]}`, 
                borderRadius: theme.borderRadius.md, 
                backgroundColor: theme.colors.card 
              }}>
                <Text as="h3" size="lg" variant="label" style={{ marginBottom: theme.spacing[6] }}>
                  General Settings
                </Text>
                
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="deployment-name" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      Deployment Name <span style={{ color: theme.colors.destructive }}>*</span>
                    </Label>
                    <Input
                      id="deployment-name"
                      placeholder="e.g., Weekly Bitcoin Reporter"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                    <Text variant="small" style={{ color: theme.colors.muted_foreground }}>
                      A unique name to identify this specific deployment instance.
                    </Text>
                  </div>

                  <div className="space-y-2">
                    <Label>Assign Agent <span style={{ color: theme.colors.destructive }}>*</span></Label>
                    <Select 
                      key={`agent-select-${selectedAgentId}`}
                      value={selectedAgentId} 
                      onValueChange={(val) => setSelectedAgentId(String(val))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={agents.find(a => String(a.id) === selectedAgentId)?.name || "Select an Agent"} />
                      </SelectTrigger>
                      <SelectContent>
                        {agents.map((agent) => (
                          <SelectItem key={String(agent.id)} value={String(agent.id)}>
                            {agent.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                  </div>
                </div>
              </Card>

              {/* Trigger Settings */}
              <Card style={{ 
                padding: theme.spacing[6], 
                border: `${theme.borderWidth.sm} solid ${theme.colors.neutral[200]}`, 
                borderRadius: theme.borderRadius.md, 
                backgroundColor: theme.colors.card 
              }}>
                <Text as="h3" size="lg" variant="label" style={{ marginBottom: theme.spacing[6] }}>
                  Trigger Configuration
                </Text>
                
                <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing[6] }}>
                  <div className="space-y-3">
                    <Label>Trigger Method</Label>
                    <Select 
                      key={`trigger-select-${triggerType}`}
                      value={triggerType} 
                      onValueChange={setTriggerType}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={triggerType === "API" ? "API Webhook" : triggerType === "SCHEDULED" ? "Automated Schedule" : "Select trigger method"} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="API">API Webhook</SelectItem>
                        <SelectItem value="SCHEDULED">Automated Schedule</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {triggerType === "SCHEDULED" && (
                    <div className="pl-4 border-l-2 border-primary/30 ml-2 animate-in fade-in slide-in-from-top-4 duration-300">
                      <SmartScheduler 
                        onChange={setScheduleCron} 
                        initialValue={scheduleCron}
                      />
                    </div>
                  )}

                </div>
              </Card>

              {/* Execution Input */}
              <Card style={{ 
                padding: theme.spacing[6], 
                border: `${theme.borderWidth.sm} solid ${theme.colors.neutral[200]}`, 
                borderRadius: theme.borderRadius.md, 
                backgroundColor: theme.colors.card 
              }}>
                <Text as="h3" size="lg" variant="label" style={{ marginBottom: theme.spacing[6] }}>
                  Execution Input
                </Text>

                <div className="space-y-3">
                  <Label style={{ display: "block", fontSize: theme.typography.fontSize.sm, fontWeight: theme.typography.fontWeight.semibold, color: theme.colors.foreground, marginBottom: theme.spacing[2] }}>
                    {triggerType === "SCHEDULED" ? "Execution Input *" : "Execution Input (Optional)"}
                  </Label>
                   <Textarea
                    id="default-input"
                    placeholder={triggerType === "API" ? "Optional: Enter default instructions" : "Enter instructions for the agent (e.g., 'Summarize the top 5 articles from HackerNews')"}
                    value={defaultInput}
                    onChange={(e) => setDefaultInput(e.target.value)}
                    rows={4}
                  />
                </div>
                
              </Card>

            </div>

            {/* Footer Section */}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: theme.spacing[3],
                paddingTop: theme.spacing[6],
                marginTop: theme.spacing[8],
                borderTop: `${theme.borderWidth.sm} solid ${theme.colors.neutral[200]}`,
              }}
            >
              <Button type="button" variant="outline" size="md" onClick={() => navigate("/deployments")}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="md"
                leadingIcon={Check}
                disabled={isSubmitting || loadingAgents}
              >
                {isSubmitting ? (isEditMode ? "Saving..." : "Deploying...") : (isEditMode ? "Save Changes" : "Deploy Agent")}
              </Button>
            </div>
          </form>
          )}
        </div>
      </Container>
    </Layout>
  )
}
