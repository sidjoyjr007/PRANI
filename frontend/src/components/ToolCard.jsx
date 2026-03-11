import React, { useState } from "react"
import { useTheme } from "@/context/ThemeContext"
import { useNavigate } from "react-router-dom"
import { useDispatch } from "react-redux"
import { Card } from "@/components/ui/card"
import { Text } from "@/components/ui/text"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Trash2, Play, RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react"
import DeleteResourceDialog from "@/components/DeleteResourceDialog"
import { deleteTool, syncTool } from "@/store/slices/toolSlice"

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

  const handleSync = (e) => {
    e.stopPropagation()
    if (!tool?.id) return

    addToast("Info", `Attempting to sync ${tool.name}...`, "info")
    dispatch(syncTool(tool.id))
      .unwrap()
      .then((payload) => {
        if (payload?.sync_status === "FAILED") {
          const errorMsg = payload.sync_error || "Sync failed. Check the server logs."
          addToast("Error", `Tool "${tool.name}" failed to sync: ${errorMsg}`, "error")
        } else {
          addToast("Success", `Tool "${tool.name}" synced successfully.`, "success")
        }
      })
      .catch((error) => {
        const errorMsg = typeof error === 'string' ? error : (error.detail || "Failed to sync tool")
        addToast("Error", errorMsg, "error")
      })
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
            {/* Sync Button */}
            {tool.sync_status === "FAILED" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSync}
                style={{
                  padding: theme.spacing[2],
                  color: theme.colors.warning[600],
                }}
                title="Retry Sync"
              >
                <RefreshCw size={18} />
              </Button>
            )}

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

        {/* Sync Status Badge */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: theme.spacing[4], gap: theme.spacing[2] }}>
          {tool.sync_status === "SYNCED" && (
            <Badge variant="success" style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <CheckCircle2 size={12} /> Indexed
            </Badge>
          )}

          {tool.sync_status === "PENDING" && (
            <Badge variant="outline" style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <RefreshCw size={12} className="animate-spin" /> Syncing...
            </Badge>
          )}

          {tool.sync_status === "FAILED" && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <Badge variant="destructive" style={{ display: "flex", alignItems: "center", gap: "4px", width: 'fit-content' }}>
                <AlertCircle size={12} /> Sync Failed
              </Badge>
              {tool.sync_error && (
                <Text size="xs" style={{ color: theme.colors.destructive[500], fontSize: '0.7rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }} title={tool.sync_error}>
                  {tool.sync_error}
                </Text>
              )}
            </div>
          )}
        </div>

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

        <div style={{ marginTop: "auto" }}></div>
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
