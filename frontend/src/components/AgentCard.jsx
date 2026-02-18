import React, { useState } from "react"
import { useTheme } from "@/context/ThemeContext"
import { useNavigate } from "react-router-dom"
import { useDispatch } from "react-redux"
import { Card } from "@/components/ui/card"
import { Text } from "@/components/ui/text"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import DeleteResourceDialog from "@/components/DeleteResourceDialog"
import { deleteAgent } from "@/store/slices/agentSlice"

/**
 * AgentCard Component
 * Displays agent information with tool and MCP server counts.
 * Uses DeleteResourceDialog for safe deletion (like ToolCard).
 */
export default function AgentCard({ agent, addToast }) {
  const theme = useTheme()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [showActions, setShowActions] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const handleDeleteClick = (e) => {
    e.stopPropagation() // Prevent card click
    setShowDeleteDialog(true)
  }

  const handleConfirmDelete = () => {
    dispatch(deleteAgent(agent.id))
      .unwrap()
      .then(() => {
        if (addToast) addToast("Success", `Agent "${agent.name}" deleted successfully.`, "success")
      })
      .catch((error) => {
        const errorMsg = typeof error === 'string' ? error : (error.detail || "Failed to delete agent")
        if (addToast) addToast("Error", errorMsg, "error")
      })
    setShowDeleteDialog(false)
  }

  if (!agent) return null

  return (
    <>
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
          border: `1px solid ${theme.colors.neutral[200]}`,
          borderRadius: theme.borderRadius.lg,
          backgroundColor: theme.colors.card,
          boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
          position: "relative",
        }}
        onClick={() => navigate(`/edit-agent/${agent.id}`)}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
          e.currentTarget.style.borderColor = theme.colors.neutral[300]
          setShowActions(true)
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = "0 1px 2px 0 rgba(0, 0, 0, 0.05)"
          e.currentTarget.style.borderColor = theme.colors.neutral[200]
          setShowActions(false)
        }}
      >
        {/* Action Buttons - Visible on Hover */}
        {showActions && (
          <div
            style={{
              position: "absolute",
              top: theme.spacing[6],
              right: theme.spacing[6],
              display: "flex",
              gap: theme.spacing[2],
              zIndex: 10,
            }}
          >
            {/* Delete Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDeleteClick}
              style={{
                color: theme.colors.destructive[600],
                padding: theme.spacing[2]
              }}
              title="Delete Agent"
            >
              <Trash2 size={18} />
            </Button>
          </div>
        )}

        {/* Agent Name */}
        <h3 style={{
          fontSize: theme.typography.fontSize.xl,
          fontWeight: theme.typography.fontWeight.bold,
          color: theme.colors.foreground,
          margin: 0,
          marginBottom: theme.spacing[2]
        }}>
          {agent.name}
        </h3>

        {/* Agent Description */}
        <p style={{
          fontSize: theme.typography.fontSize.base,
          color: theme.colors.muted_foreground,
          margin: 0,
          marginBottom: theme.spacing[6],
          lineHeight: 1.6,
          flex: 1,
          maxWidth: "80%"
        }}>
          {agent.description}
        </p>

        {/* Agent Capabilities */}
        {agent.capabilities && agent.capabilities.length > 0 && (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: theme.spacing[2],
              marginBottom: theme.spacing[4],
            }}
          >
            {agent.capabilities.map((capability, idx) => (
              <span
                key={idx}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "4px 12px",
                  borderRadius: "9999px",
                  fontSize: "11px",
                  fontWeight: theme.typography.fontWeight.semibold,
                  backgroundColor: "white",
                  border: `1px solid ${theme.colors.neutral[300]}`,
                  color: theme.colors.neutral[600],
                  textTransform: "uppercase",
                  letterSpacing: "0.05em"
                }}
              >
                {capability}
              </span>
            ))}
          </div>
        )}

        {/* Counts Section */}
        <div
          style={{
            display: "flex",
            gap: theme.spacing[4],
            paddingTop: theme.spacing[4],
            borderTop: `1px solid ${theme.colors.neutral[200]}`,
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
              {agent.tool_ids?.length || 0}
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
              {agent.mcp_server_ids?.length || 0}
            </Text>
          </div>
        </div>
      </Card>

      <DeleteResourceDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Agent"
        resourceName={agent.name}
        confirmationKeyword="DELETE"
      />
    </>
  )
}
