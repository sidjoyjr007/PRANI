import React from "react"
import { useTheme } from "@/context/ThemeContext"
import { useNavigate } from "react-router-dom"
import { Card } from "@/components/ui/card"
import { Text } from "@/components/ui/text"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"

/**
 * AgentCard Component
 * Displays agent information with tool and MCP server counts
 */
export default function AgentCard({ agent }) {
  const theme = useTheme()
  const navigate = useNavigate()
  const [showActions, setShowActions] = React.useState(false)

  const handleDelete = (e) => {
    e.stopPropagation()
    // TODO: Implement delete functionality
    console.log("Delete agent:", agent.id)
  }

  if (!agent) return null

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
      onClick={() => navigate(`/edit-agent/${agent.id}`)}
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
      {/* Delete Button - Visible on Hover */}
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
            title="Delete Agent"
          >
            <Trash2 size={18} />
          </Button>
        </div>
      )}

      {/* Agent Name */}
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
        {agent.name}
      </Text>

      {/* Agent Description */}
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
        {agent.description}
      </Text>

      {/* Agent Capabilities */}
      {agent.capabilities && agent.capabilities.length > 0 && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: theme.spacing[2],
            marginTop: theme.spacing[2],
          }}
        >
          {agent.capabilities.map((capability, idx) => (
            <Badge
              key={idx}
              variant="outline"
              color="secondary"
              size="sm"
              pill
            >
              {capability}
            </Badge>
          ))}
        </div>
      )}

      {/* Counts Section */}
      <div
        style={{
          display: "flex",
          gap: theme.spacing[4],
          paddingTop: theme.spacing[4],
          borderTop: `${theme.borderWidth.sm} solid ${theme.colors.neutral[200]}`,
        }}
      >
        {/* Tools Count */}
        <div style={{ flex: 1 }}>
          <Text
            as="p"
            size="xs"
            style={{
              margin: 0,
              color: theme.colors.muted_foreground,
              textTransform: "uppercase",
              fontSize: theme.typography.fontSize.xs,
              fontWeight: theme.typography.fontWeight.semibold,
              letterSpacing: "0.05em",
            }}
          >
            Tools
          </Text>
          <Text
            as="p"
            size="lg"
            style={{
              margin: `${theme.spacing[1]} 0 0 0`,
              color: theme.colors.foreground,
              fontWeight: theme.typography.fontWeight.bold,
              fontSize: theme.typography.fontSize.lg,
            }}
          >
            {agent.toolsCount || 0}
          </Text>
        </div>

        {/* MCP Servers Count */}
        <div style={{ flex: 1 }}>
          <Text
            as="p"
            size="xs"
            style={{
              margin: 0,
              color: theme.colors.muted_foreground,
              textTransform: "uppercase",
              fontSize: theme.typography.fontSize.xs,
              fontWeight: theme.typography.fontWeight.semibold,
              letterSpacing: "0.05em",
            }}
          >
            MCP Servers
          </Text>
          <Text
            as="p"
            size="lg"
            style={{
              margin: `${theme.spacing[1]} 0 0 0`,
              color: theme.colors.foreground,
              fontWeight: theme.typography.fontWeight.bold,
              fontSize: theme.typography.fontSize.lg,
            }}
          >
            {agent.mcpServersCount || 0}
          </Text>
        </div>
      </div>
    </Card>
  )
}
