import React from "react"
import { useTheme } from "@/context/ThemeContext"
import { useNavigate } from "react-router-dom"
import { Card } from "@/components/ui/card"
import { Text } from "@/components/ui/text"
import { Button } from "@/components/ui/button"
import { Trash2, Play } from "lucide-react"

/**
 * MCPServerCard Component
 * Displays MCP server information with test and delete actions
 */
export default function MCPServerCard({ server }) {
  const theme = useTheme()
  const navigate = useNavigate()
  const [showActions, setShowActions] = React.useState(false)

  const handleDelete = (e) => {
    e.stopPropagation()
    // TODO: Implement delete functionality
    console.log("Delete MCP server:", server.id)
  }

  const handleTest = (e) => {
    e.stopPropagation()
    // TODO: Implement test functionality
    console.log("Test MCP server:", server.id)
  }

  if (!server) return null

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
      onClick={() => navigate(`/edit-mcp-server/${server.id}`)}
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
            title="Test MCP Server"
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
            title="Delete MCP Server"
          >
            <Trash2 size={18} />
          </Button>
        </div>
      )}

      {/* Server Name */}
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
        {server.name}
      </Text>

      {/* Server Description */}
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
        {server.description}
      </Text>

      {/* Server URL */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: theme.spacing[1],
          marginTop: theme.spacing[2],
        }}
      >
        <Text
          as="p"
          variant="body"
          size="xs"
          style={{
            margin: 0,
            color: theme.colors.muted_foreground,
            fontWeight: theme.typography.fontWeight.semibold,
          }}
        >
          URL
        </Text>
        <Text
          as="p"
          variant="body"
          size="xs"
          style={{
            margin: 0,
            color: theme.colors.foreground,
            fontFamily: "monospace",
            wordBreak: "break-all",
          }}
        >
          {server.url}
        </Text>
      </div>
    </Card>
  )
}
