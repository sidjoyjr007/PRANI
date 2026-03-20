import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { fetchAgents, setPage } from "@/store/slices/agentSlice"
import { useTheme } from "@/context/ThemeContext"
import Layout from "@/components/Layout"
import Container from "@/components/Container"
import PageHeader from "@/components/PageHeader"
import CardGrid from "@/components/CardGrid"
import AgentCard from "@/components/AgentCard"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationEllipsis,
} from "@/components/ui/pagination"
import { Plus, Search, Bot } from "lucide-react"
import useDebounce from "@/hooks/useDebounce"
import { Empty } from "@/components/ui/empty"
import { Toast, ToastContainer } from "@/components/ui/toast"
import { Spinner } from "@/components/ui/spinner"

export default function AgentsPage() {
  const theme = useTheme()
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const { items: agents, total: totalAgents, page: currentPage, size: itemsPerPage, isLoading } = useSelector((state) => state.agents)

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
    dispatch(fetchAgents({
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

  const totalPages = Math.ceil(totalAgents / itemsPerPage)

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value)
  }

  // Generate pagination buttons (matching ToolsPage pattern)
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
            onClick={() => dispatch(setPage(i))}
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
          <PaginationLink onClick={() => dispatch(setPage(totalPages))}>
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      )
    }

    return buttons
  }

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

      <Container>
        {/* Header with Title and Search */}
        <div style={{ marginBottom: theme.spacing[8] }}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: theme.spacing[4],
            marginBottom: theme.spacing[6],
          }}>
            <div style={{ flex: 1 }}>
              <PageHeader
                title="Agents"
                subtitle="Create and manage intelligent agents"
              />
            </div>
            <Button
              variant="primary"
              size="md"
              leadingIcon={Plus}
              style={{ marginTop: theme.spacing[2], whiteSpace: "nowrap" }}
              onClick={() => navigate("/create-agent")}
            >
              Create
            </Button>
          </div>

          {/* Search Box */}
          <div style={{
            maxWidth: "500px",
            position: "relative"
          }}>
            <Input
              placeholder="Search agents..."
              value={searchQuery}
              onChange={handleSearchChange}
              leadingIcon={Search}
              trailingIcon={isLoading && agents.length > 0 ? Spinner : undefined}
            />
          </div>
        </div>

        {isLoading && agents.length === 0 ? (
          <div style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "400px"
          }}>
            <Spinner size="lg" variant="primary" />
          </div>
        ) : agents.length > 0 ? (
          <div style={{
            opacity: isLoading ? 0.6 : 1,
            transition: "opacity 0.2s ease-in-out"
          }}>
            <CardGrid
              items={agents}
              columns={3}
              gap={6}
              renderCard={(agent) => (
                <AgentCard 
                    agent={agent} 
                    addToast={addToast} 
                />
              )}
            />

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
          <Empty
            icon={Bot}
            title="No agents found"
            description={
              searchQuery
                ? `No agents match your search "${searchQuery}".`
                : "You haven't created any agents yet. Get started by creating your first intelligent agent."
            }
            action={
              <Button
                variant="primary"
                size="md"
                leadingIcon={Plus}
                onClick={() => navigate("/create-agent")}
              >
                Create Agent
              </Button>
            }
          />
        )}
      </Container>
    </Layout>
  )
}
