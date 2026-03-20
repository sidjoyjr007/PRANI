import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useTheme } from "@/context/ThemeContext"
import { 
  Terminal, 
  CheckCircle2, 
  XCircle, 
  Loader2,
  Clock,
  ChevronLeft,
  RefreshCw,
  Download,
  AlertCircle,
  Play,
  ChevronRight,
  Activity,
  History
} from "lucide-react"
import Layout from "@/components/Layout"
import PageHeader from "@/components/PageHeader"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Text } from "@/components/ui/text"
import { deploymentService } from "@/services/deploymentService"
import { cn } from "@/lib/utils"

export default function DeploymentRunsPage() {
  const { deploymentId } = useParams()
  const theme = useTheme()
  const navigate = useNavigate()
  
  const [runs, setRuns] = useState([])
  const [selectedRunId, setSelectedRunId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const statusConfig = {
    COMPLETED: { color: theme.colors.success[500], bg: theme.colors.success[50], label: "Success", icon: CheckCircle2 },
    RUNNING: { color: theme.colors.primary[500], bg: theme.colors.primary[50], label: "Running", icon: Loader2 },
    PENDING: { color: theme.colors.neutral[400], bg: theme.colors.neutral[50], label: "Pending", icon: Clock },
    FAILED: { color: theme.colors.destructive, bg: "rgba(239, 68, 68, 0.1)", label: "Failed", icon: XCircle },
  }

  useEffect(() => {
    fetchRuns()
  }, [deploymentId])

  const fetchRuns = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await deploymentService.listDeploymentRuns(deploymentId)
      setRuns(data)
      if (data.length > 0 && !selectedRunId) {
        setSelectedRunId(data[0].id)
      }
    } catch (err) {
      console.error("Failed to load runs:", err)
      setError("Failed to load execution history.")
    } finally {
      setLoading(false)
    }
  }

  const selectedRun = runs.find(r => r.id === selectedRunId)

  const handleDownloadLogs = (run) => {
    const blob = new Blob([run.logs], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `run-${run.id.split('-')[0]}-logs.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <Layout>
      <div style={{ 
        display: "flex", 
        flexDirection: "column", 
        height: "calc(100vh - 64px)", // Assuming header is 64px
        backgroundColor: theme.colors.background 
      }}>
        {/* Header Area */}
        <div style={{ 
          padding: `${theme.spacing[4]} ${theme.spacing[8]}`,
          borderBottom: `1px solid ${theme.colors.border}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: theme.colors.card
        }}>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              leadingIcon={ChevronLeft}
              onClick={() => navigate('/deployments')}
              className="text-muted-foreground hover:text-foreground"
            >
              Back
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                <History className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 style={{ fontSize: theme.typography.fontSize.lg, fontWeight: "700", color: theme.colors.foreground, margin: 0 }}>
                  Execution History
                </h1>
                <p style={{ fontSize: "11px", color: theme.colors.muted_foreground, margin: 0 }}>
                  Deployment ID: <span className="font-mono">{deploymentId.slice(0, 8)}...</span>
                </p>
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            leadingIcon={RefreshCw}
            onClick={fetchRuns}
            disabled={loading}
          >
            Refresh
          </Button>
        </div>

        {/* Content Area - Flex Sidebar Layout */}
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          
          {/* Sidebar: List of Runs */}
          <div style={{ 
            width: "320px", 
            borderRight: `1px solid ${theme.colors.border}`,
            display: "flex",
            flexDirection: "column",
            backgroundColor: "rgba(0,0,0,0.02)"
          }}>
            <div style={{ padding: theme.spacing[4], borderBottom: `1px solid ${theme.colors.border}`, backgroundColor: theme.colors.card }}>
              <Text variant="small" style={{ fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em", color: theme.colors.muted_foreground }}>
                Run History ({runs.length})
              </Text>
            </div>
            
            <div style={{ flex: 1, overflowY: "auto", padding: theme.spacing[3] }} className="space-y-2">
              {loading && runs.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center gap-3 text-muted-foreground">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span className="text-xs">Loading history...</span>
                </div>
              ) : runs.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  <Activity className="w-8 h-8 mx-auto mb-2 opacity-20" />
                  <p className="text-xs">No runs recorded yet.</p>
                </div>
              ) : (
                runs.map((run) => {
                  const config = statusConfig[run.status] || statusConfig.PENDING
                  const isSelected = selectedRunId === run.id
                  const StatusIcon = config.icon
                  
                  return (
                    <div
                      key={run.id}
                      onClick={() => setSelectedRunId(run.id)}
                      style={{
                        padding: theme.spacing[3],
                        borderRadius: theme.borderRadius.md,
                        cursor: "pointer",
                        backgroundColor: isSelected ? theme.colors.primary[500] + "10" : "transparent",
                        border: `1px solid ${isSelected ? theme.colors.primary[500] + "30" : "transparent"}`,
                        transition: "all 0.2s ease",
                        display: "flex",
                        alignItems: "center",
                        gap: theme.spacing[3],
                        position: "relative"
                      }}
                      className="group"
                    >
                      {isSelected && (
                         <div style={{ position: "absolute", left: "-2px", top: "20%", bottom: "20%", width: "4px", backgroundColor: theme.colors.primary[500], borderRadius: "0 4px 4px 0" }} />
                      )}
                      
                      <div style={{ 
                        width: "32px", 
                        height: "32px", 
                        borderRadius: "8px", 
                        backgroundColor: isSelected ? theme.colors.primary[500] + "20" : theme.colors.neutral[100],
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: isSelected ? theme.colors.primary[500] : theme.colors.neutral[500]
                      }}>
                        <StatusIcon className={cn("w-4 h-4", run.status === "RUNNING" && "animate-spin")} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 overflow-hidden">
                           <Text variant="small" style={{ fontWeight: "600", color: theme.colors.foreground }} className="truncate">
                             Run {run.id.slice(0, 8)}
                           </Text>
                           <span style={{ fontSize: "9px", color: theme.colors.muted_foreground }}>
                             {new Date(run.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                           </span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                           <span style={{ 
                             width: "6px", 
                             height: "6px", 
                             borderRadius: "full", 
                             backgroundColor: config.color 
                           }} />
                           <span style={{ fontSize: "10px", color: theme.colors.muted_foreground }}>
                             {config.label}
                           </span>
                        </div>
                      </div>
                      <ChevronRight className={cn("w-4 h-4 text-muted-foreground/30 transition-transform", isSelected && "text-primary translate-x-1")} />
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* Main: Log Details */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", backgroundColor: theme.colors.card }}>
            {selectedRun ? (
              <>
                <div style={{ 
                  padding: `${theme.spacing[4]} ${theme.spacing[6]}`, 
                  borderBottom: `1px solid ${theme.colors.border}`,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}>
                  <div className="flex items-center gap-4">
                    <Badge variant={statusConfig[selectedRun.status]?.bg ? "outline" : "neutral"} style={{ 
                      backgroundColor: statusConfig[selectedRun.status]?.bg,
                      color: statusConfig[selectedRun.status]?.color,
                      borderColor: statusConfig[selectedRun.status]?.color + "30"
                    }}>
                      {selectedRun.status}
                    </Badge>
                    <div className="flex flex-col">
                      <Text variant="small" style={{ fontWeight: "600", color: theme.colors.foreground }}>
                        Execution Details
                      </Text>
                      <Text variant="small" style={{ color: theme.colors.muted_foreground, fontSize: "10px" }}>
                        Started: {new Date(selectedRun.created_at).toLocaleString()}
                      </Text>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    leadingIcon={Download}
                    onClick={() => handleDownloadLogs(selectedRun)}
                  >
                    Download Logs
                  </Button>
                </div>
                
                <div style={{ flex: 1, overflowY: "auto", position: "relative" }}>
                   {selectedRun.run_input && (
                     <div style={{ padding: theme.spacing[6], backgroundColor: "rgba(0,0,0,0.02)", borderBottom: `1px solid ${theme.colors.border}` }}>
                        <Text variant="small" style={{ fontWeight: "700", textTransform: "uppercase", fontSize: "10px", color: theme.colors.muted_foreground, display: "block", marginBottom: theme.spacing[2] }}>
                          Run Input
                        </Text>
                        <div style={{ 
                          padding: theme.spacing[4], 
                          borderRadius: theme.borderRadius.sm, 
                          backgroundColor: theme.colors.card, 
                          border: `1px solid ${theme.colors.border}`,
                          fontSize: theme.typography.fontSize.sm,
                          color: theme.colors.foreground,
                          fontFamily: "inherit"
                        }}>
                          {selectedRun.run_input}
                        </div>
                     </div>
                   )}
                   
                   <div style={{ padding: theme.spacing[6] }}>
                     <div className="flex items-center gap-2 mb-4">
                        <Terminal className="w-4 h-4 text-primary" />
                        <Text style={{ fontWeight: "700", color: theme.colors.foreground }}>Raw Console Output</Text>
                     </div>
                     
                     <div style={{ 
                       backgroundColor: "#0f172a", 
                       borderRadius: theme.borderRadius.md, 
                       padding: theme.spacing[6],
                       fontFamily: "'Fira Code', 'Courier New', monospace",
                       fontSize: "13px",
                       lineHeight: "1.6",
                       color: "#e2e8f0",
                       minHeight: "400px",
                       boxShadow: "inset 0 2px 4px rgba(0,0,0,0.3)",
                       border: "1px solid #1e293b",
                       whiteSpace: "pre-wrap",
                       wordBreak: "break-all"
                     }}>
                       {selectedRun.logs ? (
                         selectedRun.logs.split('\n').map((line, i) => (
                           <div key={i} className="flex gap-4 group">
                             <span className="text-slate-600 select-none text-right w-8 inline-block opacity-50 group-hover:opacity-100 transition-opacity">
                               {i + 1}
                             </span>
                             <span className={cn(
                               line.includes("[ERROR]") && "text-red-400",
                               line.includes("[TOOL_OUTPUT]") && "text-blue-300",
                               line.includes("[THOUGHT]") && "text-emerald-400 italic",
                               line.includes("[STATUS]") && "text-amber-300"
                             )}>
                               {line}
                             </span>
                           </div>
                         ))
                       ) : (
                         <div className="flex flex-col items-center justify-center h-full opacity-30 mt-20">
                            <Terminal className="w-12 h-12 mb-4" />
                            <p>No log data available for this run</p>
                         </div>
                       )}
                     </div>
                   </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground opacity-40">
                <Terminal className="w-16 h-16 mb-4" />
                <p>Select a run from the history to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}
