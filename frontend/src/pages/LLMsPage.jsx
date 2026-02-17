import { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { useTheme } from "@/context/ThemeContext"
import Layout from "@/components/Layout"
import Container from "@/components/Container"
import PageHeader from "@/components/PageHeader"
import CardGrid from "@/components/CardGrid"
import LLMCard from "@/components/LLMCard"
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
 */
const fuzzySearch = (query, text) => {
  if (!query) return true
  const lowerQuery = query.toLowerCase()
  const lowerText = text.toLowerCase()
  return lowerText.includes(lowerQuery)
}

// Mock LLM data
const MOCK_LLMS = [
  {
    id: 1,
    name: "Production GPT-4",
    provider: "OpenAI",
    model: "gpt-4",
    authType: "Bearer",
  },
  {
    id: 2,
    name: "Claude Opus",
    provider: "Anthropic",
    model: "claude-3-opus",
    authType: "Bearer",
  },
  {
    id: 3,
    name: "Gemini Pro",
    provider: "Gemini",
    model: "gemini-pro",
    authType: "Param",
  },
  {
    id: 4,
    name: "Anthropic Sonnet",
    provider: "Anthropic",
    model: "claude-3-sonnet",
    authType: "Bearer",
  },
  {
    id: 5,
    name: "GPT-3.5 Turbo",
    provider: "OpenAI",
    model: "gpt-3.5-turbo",
    authType: "Bearer",
  },
  {
    id: 6,
    name: "Mistral 7B",
    provider: "HuggingFace",
    model: "mistral-7b",
    authType: "Header",
  },
  {
    id: 7,
    name: "Gemini 1.5 Pro",
    provider: "Gemini",
    model: "gemini-1.5-pro",
    authType: "Param",
  },
  {
    id: 8,
    name: "Llama 2 70B",
    provider: "HuggingFace",
    model: "llama-2-70b",
    authType: "Header",
  },
]

const PROVIDERS = ["OpenAI", "Anthropic", "Gemini", "HuggingFace"]

export default function LLMsPage() {
  const theme = useTheme()
  const navigate = useNavigate()

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedProviders, setSelectedProviders] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 6

  // Filter LLMs based on search and provider
  const filteredLLMs = useMemo(() => {
    return MOCK_LLMS.filter(llm => {
      const matchesSearch = fuzzySearch(searchQuery, `${llm.name} ${llm.model}`)
      const matchesProvider = selectedProviders.length === 0 || 
        selectedProviders.includes(llm.provider)
      return matchesSearch && matchesProvider
    })
  }, [searchQuery, selectedProviders])

  // Calculate pagination
  const totalPages = Math.ceil(filteredLLMs.length / itemsPerPage)
  const paginatedLLMs = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredLLMs.slice(startIndex, endIndex)
  }, [filteredLLMs, currentPage])

  // Handle search change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value)
    setCurrentPage(1)
  }

  // Handle provider selection
  const handleProviderToggle = (provider) => {
    setSelectedProviders(prev => {
      const isSelected = prev.includes(provider)
      if (isSelected) {
        return prev.filter(p => p !== provider)
      } else {
        return [...prev, provider]
      }
    })
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
                title="LLM Configurations"
                subtitle="Create and manage LLM provider configurations"
              />
            </div>
            <Button
              variant="primary"
              size="md"
              leadingIcon={Plus}
              style={{ marginTop: theme.spacing[2], whiteSpace: "nowrap" }}
              onClick={() => navigate("/create-llm")}
            >
              Create
            </Button>
          </div>

          {/* Search Box */}
          <div style={{ maxWidth: "500px", marginBottom: theme.spacing[6] }}>
            <Input
              placeholder="Search LLMs..."
              value={searchQuery}
              onChange={handleSearchChange}
              leadingIcon={Search}
            />
          </div>

          {/* Provider Filter */}
          <div style={{ marginBottom: theme.spacing[6] }}>
            <div style={{ marginBottom: theme.spacing[3] }}>
              <span
                style={{
                  fontSize: theme.typography.fontSize.sm,
                  fontWeight: theme.typography.fontWeight.semibold,
                  color: theme.colors.muted_foreground,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Filter by Provider
              </span>
            </div>
            <div style={{ display: "flex", gap: theme.spacing[2], flexWrap: "wrap" }}>
              {PROVIDERS.map(provider => (
                <Chips
                  key={provider}
                  onClick={() => handleProviderToggle(provider)}
                  onRemove={() => handleProviderToggle(provider)}
                  variant={selectedProviders.includes(provider) ? "primary" : "outline"}
                  style={{
                    cursor: "pointer",
                    display: "flex",
                    gap: theme.spacing[1],
                    alignItems: "center",
                  }}
                >
                  {selectedProviders.includes(provider) && (
                    <Check size={14} />
                  )}
                  {provider}
                </Chips>
              ))}
            </div>
          </div>
        </div>

        {/* LLMs Grid */}
        {paginatedLLMs.length > 0 ? (
          <>
            <CardGrid 
              items={paginatedLLMs}
              columns={3} 
              gap={6}
              renderCard={(llm) => <LLMCard llm={llm} />}
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
              No LLM configurations found matching your search.
            </p>
          </div>
        )}
      </Container>
    </Layout>
  )
}
