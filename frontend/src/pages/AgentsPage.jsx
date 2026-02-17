import { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
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
import { Plus, Search } from "lucide-react"

// Mock agents data
const MOCK_AGENTS = [
  {
    id: 1,
    name: "Research Agent",
    description: "Handles research tasks and data analysis with multiple tools",
    capabilities: ["research", "analysis", "documentation"],
    toolIds: [1, 5],
    mcpServerIds: [1],
    humanInLoop: true,
    llmConfig: "gpt-4",
  },
  {
    id: 2,
    name: "Developer Agent",
    description: "Writes and executes code with debugging capabilities",
    capabilities: ["code", "execution", "debugging"],
    toolIds: [2, 4],
    mcpServerIds: [3],
    humanInLoop: false,
    llmConfig: "gpt-4",
  },
  {
    id: 3,
    name: "Data Processing Agent",
    description: "Processes and analyzes large datasets",
    capabilities: ["data", "processing", "analysis"],
    toolIds: [5, 3],
    mcpServerIds: [2],
    humanInLoop: false,
    llmConfig: "gpt-3.5",
  },
  {
    id: 4,
    name: "Content Creator Agent",
    description: "Creates and manages content across platforms",
    capabilities: ["content", "writing", "management"],
    toolIds: [1, 8],
    mcpServerIds: [1, 2],
    humanInLoop: true,
    llmConfig: "claude-2",
  },
  {
    id: 5,
    name: "API Integration Agent",
    description: "Handles API calls and integrations",
    capabilities: ["api", "integration", "networking"],
    toolIds: [4, 9],
    mcpServerIds: [3],
    humanInLoop: false,
    llmConfig: "gpt-4",
  },
  {
    id: 6,
    name: "File Management Agent",
    description: "Manages files and documents efficiently",
    capabilities: ["file", "management", "organization"],
    toolIds: [3, 7],
    mcpServerIds: [2],
    humanInLoop: false,
    llmConfig: "gpt-3.5",
  },
]

// Fuzzy search helper
const fuzzySearch = (query, text) => {
  if (!query) return true
  const lowerQuery = query.toLowerCase()
  const lowerText = text.toLowerCase()
  return lowerText.includes(lowerQuery)
}

export default function AgentsPage() {
  const theme = useTheme()
  const navigate = useNavigate()

  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 6

  // Filter agents based on search
  const filteredAgents = useMemo(() => {
    return MOCK_AGENTS.filter(agent =>
      fuzzySearch(searchQuery, `${agent.name} ${agent.description}`)
    )
  }, [searchQuery])

  // Calculate pagination
  const totalPages = Math.ceil(filteredAgents.length / itemsPerPage)
  const paginatedAgents = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredAgents.slice(startIndex, endIndex)
  }, [filteredAgents, currentPage])

  // Reset to page 1 when search changes
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value)
    setCurrentPage(1)
  }

  // Generate pagination buttons
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

  return (
    <Layout>
      <Container>
        {/* Header with Title and Search */}
        <div style={{ marginBottom: theme.spacing[8] }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: theme.spacing[4],
              marginBottom: theme.spacing[6],
            }}
          >
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
          <div style={{ maxWidth: "500px" }}>
            <Input
              placeholder="Search agents..."
              value={searchQuery}
              onChange={handleSearchChange}
              leadingIcon={Search}
            />
          </div>
        </div>

        {/* Agents Grid */}
        {paginatedAgents.length > 0 ? (
          <>
            <CardGrid 
              items={paginatedAgents}
              columns={3} 
              gap={6}
              renderCard={(agent) => <AgentCard agent={agent} />}
            />

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ marginTop: theme.spacing[8] }}>
                <Pagination centered>
                  <PaginationContent>
                    {/* Previous Button */}
                    <PaginationItem>
                      <PaginationLink
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
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
                        onClick={() =>
                          setCurrentPage(Math.min(totalPages, currentPage + 1))
                        }
                        disabled={currentPage === totalPages}
                      >
                        Next →
                      </PaginationLink>
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        ) : (
          <div
            style={{
              textAlign: "center",
              padding: theme.spacing[12],
              color: theme.colors.muted_foreground,
            }}
          >
            <p style={{ fontSize: theme.typography.fontSize.lg }}>
              No agents found matching your search.
            </p>
          </div>
        )}
      </Container>
    </Layout>
  )
}
