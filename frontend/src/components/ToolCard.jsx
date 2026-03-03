import React, { useState } from "react"
import { useTheme } from "@/context/ThemeContext"
import { useNavigate } from "react-router-dom"
import { useDispatch } from "react-redux"
import { Card } from "@/components/ui/card"
import { Text } from "@/components/ui/text"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Trash2, Play } from "lucide-react"
import DeleteResourceDialog from "@/components/DeleteResourceDialog"
import { deleteTool } from "@/store/slices/toolSlice"

export default function ToolCard({ tool, addToast }) {
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
    dispatch(deleteTool(tool.id))
      .unwrap()
      .then(() => {
        if (addToast) addToast("Success", `Tool "${tool.name}" deleted successfully.`, "success")
      })
      .catch((error) => {
        const errorMsg = typeof error === 'string' ? error : (error.detail || "Failed to delete tool")
        if (addToast) addToast("Error", errorMsg, "error")
      })
    setShowDeleteDialog(false)
  }

  const handleTest = (e) => {
    e.stopPropagation()
    // Navigate to tool test page
    navigate(`/test-tool/${tool.id}`)
  }

  if (!tool) return null

  return (
    <>
      <Card
        variant="default"
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          height: "100%",
          padding: theme.spacing[6],
          transition: `all ${theme.transitions.normal}`,
          cursor: "pointer",
          border: `1px solid ${theme.colors.neutral[200]}`,
          borderRadius: theme.borderRadius.lg,
          backgroundColor: theme.colors.card,
          boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
          position: "relative",
          justifyContent: "flex-start",
          minHeight: "120px"
        }}
        onClick={() => navigate(`/edit-tool/${tool.id}`)}
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
            {/* Test Button - Keeping it just in case */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleTest}
              style={{
                padding: theme.spacing[2],
                color: theme.colors.primary[600],
              }}
              title="Test Tool"
            >
              <Play size={18} />
            </Button>

            {/* Delete Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDeleteClick}
              style={{
                color: theme.colors.destructive[600],
                padding: theme.spacing[2]
              }}
              title="Delete Tool"
            >
              <Trash2 size={18} />
            </Button>
          </div>
        )}

        {/* Tool Name */}
        <h3 style={{
          fontSize: theme.typography.fontSize.xl,
          fontWeight: theme.typography.fontWeight.bold,
          color: theme.colors.foreground,
          margin: 0,
          marginBottom: theme.spacing[2]
        }}>
          {tool.name}
        </h3>

        {/* Tool Description */}
        <p style={{
          fontSize: theme.typography.fontSize.base,
          color: theme.colors.muted_foreground,
          margin: 0,
          marginBottom: theme.spacing[6],
          lineHeight: 1.6,
          maxWidth: "80%", // prevent text from hitting buttons on small screens
          display: "-webkit-box",
          WebkitLineClamp: 3,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}>
          {tool.description}
        </p>

        {/* Tool Categories */}
        {tool.categories && tool.categories.length > 0 ? (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: theme.spacing[2],
              marginTop: "auto",
            }}
          >
            {tool.categories.slice(0, 3).map((category, idx) => (
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
                {category}
              </span>
            ))}
            {tool.categories.length > 3 && (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "4px 12px",
                  borderRadius: "9999px",
                  fontSize: "11px",
                  fontWeight: theme.typography.fontWeight.bold,
                  backgroundColor: theme.colors.neutral[100],
                  border: `1px solid ${theme.colors.neutral[300]}`,
                  color: theme.colors.neutral[700],
                }}
              >
                +{tool.categories.length - 3}
              </span>
            )}
          </div>
        ) : (
          <div style={{ marginTop: "auto" }}></div>
        )}
      </Card>

      <DeleteResourceDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Tool"
        resourceName={tool.name}
        confirmationKeyword="DELETE"
      />
    </>
  )
}
