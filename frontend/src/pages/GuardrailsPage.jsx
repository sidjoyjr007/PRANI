import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { fetchGuardrails } from "@/store/slices/guardrailSlice"
import { useTheme } from "@/context/ThemeContext"
import Layout from "@/components/Layout"
import PageHeader from "@/components/PageHeader"
import GuardrailCard from "@/components/GuardrailCard"
import { Button } from "@/components/ui/button"
import { Text } from "@/components/ui/text"
import { Plus, Search, Shield, Loader2, X } from "lucide-react"
import { Toast, ToastContainer } from "@/components/ui/toast"

export default function GuardrailsPage() {
  const theme = useTheme()
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const { items: guardrails, isLoading } = useSelector((state) => state.guardrails)

  const [searchQuery, setSearchQuery] = useState("")
  const [isSearchExpanded, setIsSearchExpanded] = useState(false)

  // Toast State
  const [toasts, setToasts] = useState([])
  const addToast = (title, description, variant = "info") => {
    const id = Date.now().toString()
    setToasts((prev) => [...prev, { id, title, description, variant }])
    setTimeout(() => removeToast(id), 5000)
  }
  const removeToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id))

  const handleDeleteFeedback = (id, success, error) => {
    if (success) {
      addToast("Success", "Guardrail deleted successfully", "success")
    } else {
      addToast("Error", error || "Failed to delete guardrail", "error")
    }
  }

  useEffect(() => {
    dispatch(fetchGuardrails())
  }, [dispatch])

  const guardrailsList = Array.isArray(guardrails) ? guardrails : []

  const filteredGuardrails = guardrailsList.filter(g => 
    g.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (g.description && g.description.toLowerCase().includes(searchQuery.toLowerCase()))
  )

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
          marginBottom: theme.spacing[8],
          gap: theme.spacing[4]
        }}>
          <PageHeader 
            title="Safety Guardrails" 
            subtitle="Configure input and output filters to protect your agents"
            icon={Shield}
          />
          
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: theme.spacing[3],
            marginTop: theme.spacing[2],
          }}>
            {/* Expandable Search */}
            <div style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              height: "40px",
            }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                width: isSearchExpanded ? "320px" : "40px",
                height: "40px",
                borderRadius: "12px",
                backgroundColor: isSearchExpanded ? "rgba(255, 255, 255, 0.9)" : "rgba(255, 255, 255, 0.5)",
                backdropFilter: "blur(8px)",
                border: `${theme.borderWidth.sm} solid ${isSearchExpanded ? theme.colors.primary[300] : theme.colors.border}`,
                boxShadow: isSearchExpanded ? "0 4px 12px rgba(0, 0, 0, 0.05)" : "none",
                overflow: "hidden"
              }}>
                <button
                  onClick={() => setIsSearchExpanded(!isSearchExpanded)}
                  style={{
                    width: "40px",
                    height: "40px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: isSearchExpanded || searchQuery ? theme.colors.primary[600] : theme.colors.foreground,
                  }}
                >
                  <Search size={18} strokeWidth={2.5} />
                </button>

                {isSearchExpanded && (
                  <>
                    <input
                      autoFocus
                      placeholder="Search guardrails..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onBlur={() => !searchQuery && setIsSearchExpanded(false)}
                      style={{
                        flex: 1,
                        background: "none",
                        border: "none",
                        outline: "none",
                        padding: "0 12px 0 0",
                        fontSize: theme.typography.fontSize.sm,
                        color: theme.colors.foreground,
                        fontWeight: 500
                      }}
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        style={{ background: "none", border: "none", cursor: "pointer", padding: "0 12px", display: "flex", alignItems: "center" }}
                      >
                        <X size={14} />
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>

            <Button
              variant="primary"
              size="md"
              leadingIcon={Plus}
              onClick={() => navigate('/create-guardrail')}
            >
              Create Guardrail
            </Button>
          </div>
        </div>

        <div>
          {isLoading && guardrailsList.length === 0 ? (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
              <Loader2 className="w-10 h-10 animate-spin" style={{ color: theme.colors.primary[500] }} />
            </div>
          ) : filteredGuardrails.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGuardrails.map((g) => (
                <GuardrailCard 
                  key={g.id} 
                  guardrail={g} 
                  onEdit={(id) => navigate(`/edit-guardrail/${id}`)}
                  onDelete={handleDeleteFeedback}
                />
              ))}
            </div>
          ) : (
            <div style={{ 
              padding: theme.spacing[12], 
              textAlign: "center", 
              border: `${theme.borderWidth.sm} solid ${theme.colors.border}`,
              borderRadius: theme.borderRadius.lg,
              backgroundColor: "#FFFFFF",
            }}>
              <div style={{
                width: "64px",
                height: "64px",
                borderRadius: "16px",
                backgroundColor: theme.colors.primary[50],
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px auto",
                border: `1px solid ${theme.colors.primary[100]}`
              }}>
                <Shield className="w-8 h-8 text-primary-500" style={{ color: theme.colors.primary[500] }} />
              </div>
              <h3 style={{ marginBottom: theme.spacing[2], color: theme.colors.foreground, fontSize: theme.typography.fontSize.xl, fontWeight: 700 }}>
                No Guardrails Found
              </h3>
              <p style={{ color: theme.colors.muted_foreground, maxWidth: "400px", margin: "0 auto 24px auto", fontSize: theme.typography.fontSize.sm }}>
                {searchQuery ? `No guardrails match "${searchQuery}".` : "You haven't created any guardrails yet."}
              </p>
              {!searchQuery && (
                <Button variant="primary" size="md" leadingIcon={Plus} onClick={() => navigate("/create-guardrail")}>
                  Create Your First Guardrail
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
