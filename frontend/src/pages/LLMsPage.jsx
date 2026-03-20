
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { fetchLLMs, setPage } from "@/store/slices/llmSlice"
import { useTheme } from "@/context/ThemeContext"
import Layout from "@/components/Layout"
import PageHeader from "@/components/PageHeader"
import LLMCard from "@/components/LLMCard"
import { Button } from "@/components/ui/button"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationEllipsis
} from "@/components/ui/pagination"
import { Search, Bot, Loader2, X, Settings, Plus } from "lucide-react"
import useDebounce from "@/hooks/useDebounce"
import { Toast, ToastContainer } from "@/components/ui/toast"

export default function LLMsPage() {
  const theme = useTheme()
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const { items: llms, total: totalItems, page: currentPage, size: itemsPerPage, isLoading } = useSelector((state) => state.llms)

  const [searchQuery, setSearchQuery] = useState("")
  const debouncedSearchQuery = useDebounce(searchQuery, 500)

  // Toast State
  const [toasts, setToasts] = useState([])
  const addToast = (title, description, variant = "info") => {
    const id = Date.now().toString()
    setToasts((prev) => [...prev, { id, title, description, variant }])
    setTimeout(() => removeToast(id), 5000)
  }
  const removeToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id))

  useEffect(() => {
    dispatch(fetchLLMs({
      page: currentPage,
      size: itemsPerPage,
      search: debouncedSearchQuery
    }))
  }, [dispatch, currentPage, itemsPerPage, debouncedSearchQuery])

  useEffect(() => {
    if (currentPage !== 1) {
      dispatch(setPage(1))
    }
  }, [debouncedSearchQuery])

  const totalPages = Math.ceil(totalItems / itemsPerPage)

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value)
  }

  /* Pagination Logic */
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
          <PaginationLink onClick={() => dispatch(setPage(1))}>1</PaginationLink>
        </PaginationItem>
      )
      if (startPage > 2) {
        buttons.push(<PaginationItem key="ellipsis-start"><PaginationEllipsis /></PaginationItem>)
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <PaginationItem key={i}>
          <PaginationLink onClick={() => dispatch(setPage(i))} isActive={currentPage === i}>{i}</PaginationLink>
        </PaginationItem>
      )
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        buttons.push(<PaginationItem key="ellipsis-end"><PaginationEllipsis /></PaginationItem>)
      }
      buttons.push(
        <PaginationItem key="last">
          <PaginationLink onClick={() => dispatch(setPage(totalPages))}>{totalPages}</PaginationLink>
        </PaginationItem>
      )
    }
    return buttons
  }

  const [isSearchExpanded, setIsSearchExpanded] = useState(false)
  
  return (
    <Layout>
      {/* Toast Notifications */}
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
            title="LLM Configurations" 
            subtitle="Create and manage LLM provider configurations"
            icon={Bot}
          />
          
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: theme.spacing[3],
            marginTop: theme.spacing[2],
          }}>
            {/* Expandable Search - Premium Glass Style */}
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
                overflow: "hidden",
                position: "relative"
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
                    flexShrink: 0,
                    zIndex: 2
                  }}
                  title="Search LLMs"
                >
                  <Search size={18} strokeWidth={2.5} />
                </button>

                {isSearchExpanded && (
                  <>
                    <input
                      autoFocus
                      placeholder="Search LLMs..."
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
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: theme.colors.muted_foreground,
                          padding: "0 12px",
                          display: "flex",
                          alignItems: "center"
                        }}
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
              leadingIcon={Settings}
              style={{ whiteSpace: "nowrap", height: "40px" }}
              onClick={() => navigate('/create-llm')}
            >
              Configure LLM
            </Button>
          </div>
        </div>

        {isLoading && llms.length === 0 ? (
          <div style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "400px"
          }}>
            <Loader2 className="w-10 h-10 animate-spin" style={{ color: theme.colors.primary[500] }} />
          </div>
        ) : llms.length > 0 ? (
          <div style={{
            opacity: isLoading ? 0.6 : 1,
            transition: "opacity 0.2s ease-in-out"
          }}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {llms.map((llm) => (
                <LLMCard key={llm.id} llm={llm} addToast={addToast} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ marginTop: theme.spacing[8] }}>
                <Pagination centered>
                  <PaginationContent>
                    {/* Previous Button */}
                    <PaginationItem>
                      <PaginationLink
                        onClick={() => dispatch(setPage(Math.max(1, currentPage - 1)))}
                        disabled={currentPage === 1}
                      >
                        ← Previous
                      </PaginationLink>
                    </PaginationItem>

                    {/* Page Numbers */}
                    {getPaginationButtons()}

                    {/* Next Button */}
                    <PaginationItem>
                      <PaginationLink
                        onClick={() => dispatch(setPage(Math.min(totalPages, currentPage + 1)))}
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
        ) : (
          <div style={{ 
            padding: theme.spacing[12], 
            textAlign: "center", 
            border: `${theme.borderWidth.sm} solid ${theme.colors.border}`,
            borderRadius: theme.borderRadius.lg,
            backgroundColor: "#FFFFFF",
            boxShadow: theme.shadows.sm,
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
              <Bot className="w-8 h-8 text-primary-500" style={{ color: theme.colors.primary[500] }} />
            </div>
            <h3 style={{ 
              marginBottom: theme.spacing[2], 
              color: theme.colors.foreground,
              fontSize: theme.typography.fontSize.xl,
              fontWeight: 700 
            }}>
              No LLM Configurations Found
            </h3>
            <p style={{ 
              color: theme.colors.muted_foreground, 
              maxWidth: "400px", 
              margin: "0 auto 24px auto",
              fontSize: theme.typography.fontSize.sm
            }}>
              {searchQuery
                ? `No LLM configurations match your search "${searchQuery}".`
                : "You haven't added any LLM configurations yet. Get started by adding your first LLM."}
            </p>
            {!searchQuery && (
              <Button
                variant="primary"
                size="md"
                leadingIcon={Plus}
                onClick={() => navigate("/create-llm")}
              >
                Create Your First LLM
              </Button>
            )}
          </div>
        )}
      </div>
    </Layout>
  )
}
