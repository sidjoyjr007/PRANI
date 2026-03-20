import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useTheme } from "@/context/ThemeContext"
import { Toast, ToastContainer } from "@/components/ui/toast"
import { 
  Rocket, 
  Terminal, 
  CheckCircle2, 
  XCircle, 
  Loader2,
  Calendar,
  Webhook,
  Plus,
  Edit,
  Trash2,
  Play,
  Clock,
  ExternalLink,
  Key,
  Copy,
  RefreshCcw,
  Eye,
  EyeOff,
  ShieldCheck,
  Info,
  Search
} from "lucide-react"
import Layout from "@/components/Layout"
import PageHeader from "@/components/PageHeader"
import { authAPI } from "@/services/api"
import { Button } from "@/components/ui/button"
import { Text } from "@/components/ui/text"
import { Input } from "@/components/ui/input"
import ResourceCard from "@/components/ui/ResourceCard"
import { deploymentService } from "@/services/deploymentService"
import { agentService } from "@/services/agentService"
import { getHumanReadableCron } from "@/utils/cron"
import useDebounce from "@/hooks/useDebounce"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationEllipsis,
} from "@/components/ui/pagination"


export default function DeploymentsPage() {
  const theme = useTheme()
  const navigate = useNavigate()
  
  // State
  const [deployments, setDeployments] = useState([])
  const [agentsMap, setAgentsMap] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const [isRunningNow, setIsRunningNow] = useState(null)
  
  // API Key State
  const [hasApiKey, setHasApiKey] = useState(false)
  const [revealedKey, setRevealedKey] = useState(null)
  const [isRotating, setIsRotating] = useState(false)
  
  // Search & Pagination State
  const [searchQuery, setSearchQuery] = useState("")
  const debouncedSearchQuery = useDebounce(searchQuery, 500)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalDeployments, setTotalDeployments] = useState(0)
  const itemsPerPage = 9
  
  // Toast State
  const [toasts, setToasts] = useState([])
  const addToast = (title, description, variant = "info") => {
    const id = Date.now().toString()
    setToasts((prev) => [...prev, { id, title, description, variant }])
    setTimeout(() => removeToast(id), 5000)
  }
  const removeToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id))

  useEffect(() => {
    fetchData()
  }, [currentPage, debouncedSearchQuery])

  useEffect(() => {
    checkApiKeyStatus()
  }, [])

  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1)
    }
  }, [debouncedSearchQuery])

  const checkApiKeyStatus = async () => {
    try {
      const res = await authAPI.getApiKey()
      setHasApiKey(res.data.has_api_key)
    } catch (err) {
      console.error("Failed to check API key status", err)
    }
  }

  const handleRotateKey = async () => {
    if (hasApiKey && !window.confirm("Generating a new API key will invalidate your current one. All existing scripts using the old key will break. Continue?")) return;
    try {
      setIsRotating(true)
      const res = await authAPI.rotateApiKey()
      setRevealedKey(res.data.api_key)
      setHasApiKey(true)
      addToast("Success", "New API key generated", "success")
    } catch (err) {
      console.error("Rotate failed:", err)
      addToast("Error", "Failed to generate API key", "error")
    } finally {
      setIsRotating(false)
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    addToast("Copied", "API key copied to clipboard", "success")
  }

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const depRes = await deploymentService.listDeployments({ 
        page: currentPage, 
        size: itemsPerPage,
        search: debouncedSearchQuery
      })
      setDeployments(depRes.items)
      setTotalDeployments(depRes.total)
      
      const agRes = await agentService.listAgents({ page: 1, size: 50 })
      const map = {}
      agRes.items.forEach(ag => map[ag.id] = ag)
      setAgentsMap(map)
    } catch (err) {
      console.error("Failed to load deployments:", err)
      addToast("Error", "Failed to load deployments dashboard", "error")
    } finally {
      setIsLoading(false)
    }
  }

  const totalPages = Math.ceil(totalDeployments / itemsPerPage)

  const getPaginationButtons = () => {
    const buttons = []
    const maxButtons = 5
    let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2))
    let endPage = Math.min(totalPages, startPage + maxButtons - 1)

    if (endPage - startPage + 1 < maxButtons) {
      startPage = Math.max(1, endPage - maxButtons + 1)
    }

    if (startPage > 1) {
      buttons.push(
        <PaginationItem key="first">
          <PaginationLink onClick={() => setCurrentPage(1)}>1</PaginationLink>
        </PaginationItem>
      )
      if (startPage > 2) {
        buttons.push(
          <PaginationItem key="ellipsis-start">
            <PaginationEllipsis />
          </PaginationItem>
        )
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <PaginationItem key={i}>
          <PaginationLink
            onClick={() => setCurrentPage(i)}
            isActive={currentPage === i}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      )
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        buttons.push(
          <PaginationItem key="ellipsis-end">
            <PaginationEllipsis />
          </PaginationItem>
        )
      }
      buttons.push(
        <PaginationItem key="last">
          <PaginationLink onClick={() => setCurrentPage(totalPages)}>
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      )
    }

    return buttons
  }

  const handleDeleteDeployment = async (deploymentId) => {
    if (!window.confirm("Are you sure you want to delete this deployment? All run history will be permanently lost.")) return;
    
    try {
      await deploymentService.deleteDeployment(deploymentId)
      addToast("Success", "Deployment deleted successfully", "success")
      fetchData()
    } catch (err) {
      console.error("Delete failed:", err)
      addToast("Error", "Failed to delete deployment", "error")
    }
  }

  const handleRunNow = async (e, deploymentId) => {
    e.stopPropagation()
    try {
      setIsRunningNow(deploymentId)
      await deploymentService.triggerDeploymentNow(deploymentId)
      addToast("Run Triggered", "Agent execution has been initiated.", "success")
      setTimeout(fetchData, 2000)
    } catch (err) {
      console.error("Trigger failed:", err)
      addToast("Error", err?.response?.data?.detail || "Failed to trigger run", "error")
    } finally {
      setIsRunningNow(null)
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

      <div style={{ padding: `${theme.spacing[6]} ${theme.spacing[8]}` }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: theme.spacing[8]
        }}>
          <PageHeader 
            title="Deployments" 
            subtitle="Manage scheduled and API-triggered agent instances"
            icon={Rocket}
          />
          <Button
            variant="primary"
            size="md"
            leadingIcon={Plus}
            style={{ marginTop: theme.spacing[2], whiteSpace: "nowrap" }}
            onClick={() => navigate('/create-deployment')}
          >
            Create Deployment
          </Button>
        </div>

        {/* Global API Key Banner */}
        <div style={{
          backgroundColor: theme.colors.card,
          border: `${theme.borderWidth.sm} solid ${theme.colors.border}`,
          borderRadius: theme.borderRadius.lg,
          padding: theme.spacing[5],
          marginBottom: theme.spacing[8],
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: theme.spacing[4],
          boxShadow: theme.shadows.sm,
          position: "relative",
          overflow: "hidden"
        }}>
          <div style={{ 
            position: "absolute", 
            left: 0, 
            top: 0, 
            bottom: 0, 
            width: "4px", 
            backgroundColor: theme.colors.primary[500] 
          }} />
          
          <div style={{ display: "flex", alignItems: "center", gap: theme.spacing[4], flex: 1 }}>
            <div style={{ 
              width: "40px", 
              height: "40px", 
              borderRadius: theme.borderRadius.md, 
              backgroundColor: theme.colors.primary[50], 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center",
              flexShrink: 0
            }}>
              <Key style={{ width: "20px", height: "20px", color: theme.colors.primary[500] }} />
            </div>
            
            <div style={{ minWidth: 0 }}>
              <Text as="h4" variant="h4" style={{ marginBottom: "2px", fontSize: theme.typography.fontSize.sm, fontWeight: theme.typography.fontWeight.bold }}>
                Project API Key
              </Text>
              <Text as="p" variant="caption" style={{ color: theme.colors.muted_foreground }}>
                Use this global key to trigger any of your deployments via Webhook.
              </Text>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: theme.spacing[3] }}>
            {revealedKey ? (
              <div style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: theme.spacing[2],
                backgroundColor: theme.colors.neutral[50],
                padding: `${theme.spacing[1.5]} ${theme.spacing[3]}`,
                borderRadius: theme.borderRadius.md,
                border: `${theme.borderWidth.sm} solid ${theme.colors.neutral[200]}`,
                fontFamily: "monospace",
                fontSize: theme.typography.fontSize.sm
              }}>
                <span style={{ color: theme.colors.primary[600], fontWeight: theme.typography.fontWeight.bold }}>{revealedKey}</span>
                <Button variant="ghost" size="sm" onClick={() => copyToClipboard(revealedKey)} style={{ height: "24px", padding: "0 8px" }}>
                  <Copy size={14} />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setRevealedKey(null)} style={{ height: "24px", padding: "0 8px" }}>
                  <XCircle size={14} />
                </Button>
              </div>
            ) : hasApiKey ? (
              <div style={{ display: "flex", gap: theme.spacing[2] }}>
                <div style={{ 
                  color: theme.colors.muted_foreground, 
                  fontSize: theme.typography.fontSize.xs,
                  fontFamily: "monospace",
                  display: "flex",
                  alignItems: "center",
                  paddingRight: theme.spacing[2]
                }}>
                  ••••••••••••••••••••••••••••••••
                </div>
                <Button variant="outline" size="sm" onClick={handleRotateKey} disabled={isRotating}>
                  {isRotating ? <Loader2 size={14} className="animate-spin" /> : <RefreshCcw size={14} style={{ marginRight: "6px" }} />}
                  Rotate Key
                </Button>
              </div>
            ) : (
              <Button variant="primary" size="sm" onClick={handleRotateKey} disabled={isRotating}>
                {isRotating ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} style={{ marginRight: "6px" }} />}
                Generate API Key
              </Button>
            )}
            
            <a 
              href="https://docs.prani.com/api" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ 
                color: theme.colors.muted_foreground,
                display: "flex",
                alignItems: "center",
                fontSize: theme.typography.fontSize.xs,
                gap: "4px",
                marginLeft: theme.spacing[2],
                textDecoration: "none"
              }}
              onMouseEnter={(e) => e.target.style.color = theme.colors.primary[500]}
              onMouseLeave={(e) => e.target.style.color = theme.colors.muted_foreground}
            >
              Docs <ExternalLink size={12} />
            </a>
          </div>
        </div>

        {/* Search Bar */}
        <div style={{
          maxWidth: "400px",
          marginBottom: theme.spacing[6]
        }}>
          <Input
            placeholder="Search deployments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leadingIcon={Search}
          />
        </div>

        <div>
          {isLoading ? (
            <div className="flex items-center justify-center p-12 text-white/50">
              <Loader2 className="w-8 h-8 animate-spin mr-3" />
              Loading deployments...
            </div>
          ) : deployments.length === 0 ? (
            <div style={{ 
              padding: theme.spacing[12], 
              textAlign: "center", 
              border: `1px dashed ${theme.colors.border}`,
              borderRadius: theme.borderRadius.lg,
              backgroundColor: "rgba(255,255,255,0.02)"
            }}>
              <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4 border border-white/10">
                <Rocket className="w-8 h-8 text-white/40" />
              </div>
              <Text as="h3" variant="h3" style={{ marginBottom: theme.spacing[2], color: theme.colors.foreground }}>
                No Active Deployments
              </Text>
              <Text as="p" variant="body" style={{ color: theme.colors.muted_foreground, maxWidth: "400px", margin: "0 auto" }}>
                You haven't deployed any agents yet. Go to the Agents page and click 'Deploy Agent' to get started.
              </Text>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {deployments.map((dep) => {
                const isAPI = dep.trigger_type === "API"
                const agent = agentsMap[dep.agent_id]
                
                return (
                  <ResourceCard
                    key={dep.id}
                    title={dep.name || (agent ? agent.name : "Unnamed Deployment")}
                    subtitle={agent ? `Agent: ${agent.name}` : "Unknown Agent"}
                    description={isAPI ? "API Webhook Trigger" : getHumanReadableCron(dep.schedule_cron)}
                    icon={isAPI ? Webhook : Clock}
                    badges={[
                      { 
                        label: dep.is_active ? "Active" : "Inactive", 
                        variant: dep.is_active ? "success" : "neutral",
                        icon: dep.is_active ? CheckCircle2 : Clock
                      },
                      {
                        label: isAPI ? "Webhook" : "Scheduled",
                        variant: "subtle",
                        icon: isAPI ? Webhook : Calendar
                      }
                    ]}

                    actions={[
                      {
                        icon: isRunningNow === dep.id ? Loader2 : Play,
                        title: "Run Now",
                        onClick: (e) => handleRunNow(e, dep.id),
                        style: isRunningNow === dep.id ? { animation: 'spin 1s linear infinite' } : {}
                      },
                      {
                        icon: Terminal,
                        title: "Execution Logs",
                        onClick: (e) => {
                          e.stopPropagation()
                          navigate(`/deployments/${dep.id}/runs`)
                        }
                      },
                      {
                        icon: Trash2,
                        title: "Delete",
                        color: theme.colors.destructive,
                        onClick: (e) => {
                          e.stopPropagation()
                          handleDeleteDeployment(dep.id)
                        }
                      }
                    ]}
                    onClick={() => navigate(`/edit-deployment/${dep.id}`)}
                  />

                )
              })}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ marginTop: theme.spacing[8] }}>
            <Pagination centered>
              <PaginationContent>
                <PaginationItem>
                  <PaginationLink
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    ← Previous
                  </PaginationLink>
                </PaginationItem>
                {getPaginationButtons()}
                <PaginationItem>
                  <PaginationLink
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next →
                  </PaginationLink>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </Layout>
  )
}
