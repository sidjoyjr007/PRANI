import React, { useState } from "react"
import { useTheme } from "@/context/ThemeContext"
import { useNavigate } from "react-router-dom"
import { useDispatch } from "react-redux"
import { Card } from "@/components/ui/card"
import { Text } from "@/components/ui/text"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trash2, Play, Server, Database, FileText, Globe, RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react"
import DeleteResourceDialog from "@/components/DeleteResourceDialog"
import { deleteMCP, syncMCP } from "@/store/slices/mcpSlice"

export default function MCPServerCard({ server, addToast }) {
  const theme = useTheme()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [showActions, setShowActions] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const handleDeleteClick = (e) => {
    e.stopPropagation()
    setShowDeleteDialog(true)
  }

  const handleConfirmDelete = () => {
    dispatch(deleteMCP(server.id))
      .unwrap()
      .then(() => {
        if (addToast) addToast("Success", `MCP Server "${server.name}" deleted successfully.`, "success")
      })
      .catch((error) => {
        const errorMsg = typeof error === 'string' ? error : (error.detail || "Failed to delete MCP Server")
        if (addToast) addToast("Error", errorMsg, "error")
      })
    setShowDeleteDialog(false)
  }

  const handleTest = (e) => {
    e.stopPropagation()
    navigate(`/test-mcp-server/${server.id}`)
  }

  const handleSync = (e) => {
    e.stopPropagation()
    if (!server?.id) return

    // Create an optimisitic updating state locally or just dispatch
    addToast("Info", `Attempting to sync ${server.name}...`, "info")
    dispatch(syncMCP(server.id))
      .unwrap()
      .then((payload) => {
        if (payload?.sync_status === "FAILED") {
          const errorMsg = payload.sync_error || "Sync failed. Check the server configuration."
          addToast("Error", `MCP Server "${server.name}" failed to sync: ${errorMsg}`, "error")
        } else {
          addToast("Success", `MCP Server "${server.name}" synced successfully.`, "success")
        }
      })
      .catch((error) => {
        const errorMsg = typeof error === 'string' ? error : (error.detail || "Failed to sync MCP Server")
        addToast("Error", errorMsg, "error")
      })
  }

  if (!server) return null

  // Determine icon based on URL/Name/Description hints
  const getIcon = () => {
    const lowerName = server.name.toLowerCase()
    const lowerUrl = server.url.toLowerCase()

    if (lowerUrl.includes("postgres") || lowerName.includes("db") || lowerName.includes("data")) return Database
    if (lowerUrl.includes("redis")) return Database
    if (lowerName.includes("file") || lowerName.includes("fs")) return FileText
    return Server
  }

  const ServerIcon = getIcon()

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
            {/* Sync Button */}
            {server.sync_status === "FAILED" && (
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

            {/* Test Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleTest}
              style={{
                padding: theme.spacing[2],
                color: theme.colors.primary[600],
              }}
              title="Test Connection"
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
                padding: theme.spacing[2],
              }}
              title="Delete Server"
            >
              <Trash2 size={18} />
            </Button>
          </div>
        )}

        <h3
          style={{
            margin: 0,
            fontSize: theme.typography.fontSize.md, // ensuring consistency
            color: theme.colors.foreground,
            fontWeight: theme.typography.fontWeight.semibold,
            paddingRight: `calc(3 * ${theme.spacing[10]} + ${theme.spacing[4]})`, // Space for 3 buttons + container offset
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            width: "100%",
          }}
          title={server.name}
        >
          {server.name}
        </h3>

        {/* Sync Status Badge */}
        <div style={{ display: 'flex', alignItems: 'center', marginTop: theme.spacing[2], gap: theme.spacing[2] }}>
          {server.sync_status === "SYNCED" && (
            <Badge variant="success" style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <CheckCircle2 size={12} /> Connected & Indexed
            </Badge>
          )}

          {server.sync_status === "PENDING" && (
            <Badge variant="outline" style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <RefreshCw size={12} className="animate-spin" /> Syncing...
            </Badge>
          )}

          {server.sync_status === "FAILED" && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <Badge variant="destructive" style={{ display: "flex", alignItems: "center", gap: "4px", width: 'fit-content' }}>
                <AlertCircle size={12} /> Sync Failed
              </Badge>
              {server.sync_error && (
                <Text size="xs" style={{ color: theme.colors.destructive[500], fontSize: '0.7rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }} title={server.sync_error}>
                  {server.sync_error}
                </Text>
              )}
            </div>
          )}
        </div>

        {/* Server Description */}


        {/* Server URL */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: theme.spacing[1],
            marginTop: "auto",
            paddingTop: theme.spacing[4],
            borderTop: `${theme.borderWidth.sm} solid ${theme.colors.border}`
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
              display: "flex",
              alignItems: "center",
              gap: theme.spacing[1]
            }}
          >
            <Globe size={12} /> URL
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
              backgroundColor: theme.colors.neutral[50], // subtle bg for url
              padding: theme.spacing[1],
              borderRadius: theme.borderRadius.sm
            }}
          >
            {server.url}
          </Text>
        </div>
      </Card>

      <DeleteResourceDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleConfirmDelete}
        title="Delete MCP Server"
        resourceName={server.name}
        confirmationKeyword="DELETE"
      />
    </>
  )
}
