import React from "react"
import { useTheme } from "@/context/ThemeContext"
import { useNavigate } from "react-router-dom"
import { Card } from "@/components/ui/card"
import { Text } from "@/components/ui/text"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Trash2, Play } from "lucide-react"

export default function LLMCard({ llm }) {
  const theme = useTheme()
  const navigate = useNavigate()
  const [showActions, setShowActions] = React.useState(false)

  const handleDelete = (e) => {
    e.stopPropagation()
    // TODO: Implement delete functionality
    console.log("Delete LLM:", llm.id)
  }

  const handleTest = (e) => {
    e.stopPropagation()
    // TODO: Implement test functionality
    console.log("Test LLM:", llm.id)
  }

  if (!llm) return null

  // Provider color mapping
  const getProviderColor = (provider) => {
    const colors = {
      OpenAI: "secondary",
      Anthropic: "secondary",
      Gemini: "secondary",
      HuggingFace: "secondary",
    }
    return colors[provider] || "secondary"
  }

  return (
    <Card
      variant="default"
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        padding: theme.spacing[6],
        gap: theme.spacing[4],
        transition: `all ${theme.transitions.normal}`,
        cursor: "pointer",
        border: `${theme.borderWidth.sm} solid ${theme.colors.border}`,
        borderRadius: theme.borderRadius.md,
        backgroundColor: theme.colors.card,
        boxShadow: `0 1px 3px 0 ${theme.colors.shadow}20`,
        position: "relative",
      }}
      onClick={() => navigate(`/edit-llm/${llm.id}`)}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = theme.shadows.lg
        e.currentTarget.style.transform = "translateY(-2px)"
        setShowActions(true)
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = `0 1px 3px 0 ${theme.colors.shadow}20`
        e.currentTarget.style.transform = "translateY(0)"
        setShowActions(false)
      }}
    >
      {/* Action Buttons - Visible on Hover */}
      {showActions && (
        <div
          style={{
            position: "absolute",
            top: theme.spacing[4],
            right: theme.spacing[4],
            display: "flex",
            gap: theme.spacing[2],
            zIndex: 10,
          }}
        >
          {/* Test Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleTest}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: theme.spacing[2],
              color: theme.colors.primary[600],
            }}
            title="Test LLM"
          >
            <Play size={18} />
          </Button>

          {/* Delete Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: theme.spacing[2],
              color: theme.colors.destructive[600],
            }}
            title="Delete LLM"
          >
            <Trash2 size={18} />
          </Button>
        </div>
      )}

      {/* LLM Name */}
      <Text
        as="h3"
        variant="label"
        size="md"
        style={{
          margin: 0,
          color: theme.colors.foreground,
          fontWeight: theme.typography.fontWeight.semibold,
        }}
      >
        {llm.name}
      </Text>

      {/* Provider Badge */}
      <Badge
        variant="outline"
        color={getProviderColor(llm.provider)}
        size="sm"
        pill
        style={{
          alignSelf: "flex-start",
        }}
      >
        {llm.provider}
      </Badge>

      {/* Model Name */}
      <Text
        as="p"
        variant="body"
        size="sm"
        style={{
          margin: 0,
          color: theme.colors.muted_foreground,
          flex: 1,
          lineHeight: theme.typography.lineHeight.relaxed,
        }}
      >
        {llm.model}
      </Text>
    </Card>
  )
}
