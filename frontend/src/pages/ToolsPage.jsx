import { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { useTheme } from "@/context/ThemeContext"
import Layout from "@/components/Layout"
import Container from "@/components/Container"
import PageHeader from "@/components/PageHeader"
import CardGrid from "@/components/CardGrid"
import ToolCard from "@/components/ToolCard"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Chips } from "@/components/ui/chips"
import { Combobox, ComboboxTrigger, ComboboxContent, ComboboxItem, ComboboxSearch } from "@/components/ui/combobox"
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationEllipsis 
} from "@/components/ui/pagination"
import { Plus, Search, Check } from "lucide-react"

/**
 * Fuzzy search helper
 * Checks if search query matches tool name or description
 */
const fuzzySearch = (query, text) => {
  if (!query) return true
  const lowerQuery = query.toLowerCase()
  const lowerText = text.toLowerCase()
  return lowerText.includes(lowerQuery)
}

export default function ToolsPage() {
  const theme = useTheme()
  const navigate = useNavigate()
  
  const [tools] = useState([
    {
      id: 1,
      name: "Web Search",
      description: "Search the internet for real-time information and web resources",
      categories: ["READ"],
    },
    {
      id: 2,
      name: "Code Executor",
      description: "Execute and run code snippets in multiple programming languages",
      categories: ["WRITE", "DELETE"],
    },
    {
      id: 3,
      name: "File Manager",
      description: "Manage and manipulate files with advanced operations",
      categories: ["READ", "WRITE", "DELETE"],
    },
    {
      id: 4,
      name: "API Caller",
      description: "Make HTTP requests to APIs and handle responses",
      categories: ["READ", "WRITE"],
    },
    {
      id: 5,
      name: "Data Analyzer",
      description: "Analyze, process, and visualize complex data sets",
      categories: ["READ"],
    },
    {
      id: 6,
      name: "Image Processor",
      description: "Process and manipulate images with various filters",
      categories: ["UPDATE"],
    },
    {
      id: 7,
      name: "PDF Generator",
      description: "Generate and convert documents to PDF format",
      categories: ["WRITE"],
    },
    {
      id: 8,
      name: "Email Service",
      description: "Send and manage emails programmatically",
      categories: ["WRITE"],
    },
    {
      id: 9,
      name: "Database Manager",
      description: "Query and manage database operations seamlessly",
      categories: ["READ", "WRITE", "UPDATE", "DELETE"],
    },
    {
      id: 10,
      name: "Authentication",
      description: "Handle user authentication and security operations",
      categories: ["READ", "WRITE"],
    },
  ])

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategories, setSelectedCategories] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 6

  // Filter tools based on search query and selected categories
  const filteredTools = useMemo(() => {
    return tools.filter(tool => {
      const matchesSearch = fuzzySearch(searchQuery, `${tool.name} ${tool.description}`)
      const matchesCategory = selectedCategories.length === 0 || 
        selectedCategories.some(cat => tool.categories?.includes(cat))
      return matchesSearch && matchesCategory
    })
  }, [searchQuery, selectedCategories, tools])

  // Calculate pagination
  const totalPages = Math.ceil(filteredTools.length / itemsPerPage)
  const paginatedTools = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredTools.slice(startIndex, endIndex)
  }, [filteredTools, currentPage])

  // Reset to page 1 when search query changes
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
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: theme.spacing[4],
            marginBottom: theme.spacing[6],
          }}>
            <div style={{ flex: 1 }}>
              <PageHeader
                title="Available Tools"
                subtitle="Powerful tools to enhance your productivity"
              />
            </div>
            <Button
              variant="primary"
              size="md"
              leadingIcon={Plus}
              style={{ marginTop: theme.spacing[2], whiteSpace: "nowrap" }}
              onClick={() => navigate("/create-tool")}
            >
              Create
            </Button>
          </div>

          {/* Search Box */}
          <div style={{ 
            maxWidth: "500px",
          }}>
            <Input
              placeholder="Search tools..."
              value={searchQuery}
              onChange={handleSearchChange}
              leadingIcon={Search}
            />
          </div>
        </div>

        {/* Tools Grid */}
        {paginatedTools.length > 0 ? (
          <>
            <CardGrid
              items={paginatedTools}
              columns={3}
              gap={6}
              renderCard={(tool) => <ToolCard tool={tool} />}
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
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
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
          <div style={{
            textAlign: "center",
            padding: theme.spacing[12],
            color: theme.colors.muted_foreground,
          }}>
            <p style={{ fontSize: theme.typography.fontSize.lg }}>
              No tools found matching your search.
            </p>
          </div>
        )}
      </Container>
    </Layout>
  )
}
