import React, { useState } from "react"
import { useTheme } from "@/context/ThemeContext"
import { useNavigate } from "react-router-dom"
import { useDispatch } from "react-redux"
import DeleteResourceDialog from "@/components/DeleteResourceDialog"
import { deleteMCP, syncMCP } from "@/store/slices/mcpSlice"
import ResourceCard from "@/components/ui/ResourceCard"
import { Server, Database, FileText, Globe, Trash2, Play, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react"

export default function MCPServerCard({ server, addToast }) {
  const theme = useTheme()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const handleDeleteClick = (e) => {
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
    navigate(`/test-mcp-server/${server.id}`)
  }

  const handleSync = (e) => {
    if (!server?.id) return
    addToast("Info", `Attempting to sync ${server.name}...`, "info")
    dispatch(syncMCP(server.id))
      .unwrap()
      .then((payload) => {
        if (payload?.sync_status === "FAILED") {
          addToast("Error", `MCP Server "${server.name}" failed to sync: ${payload.sync_error || "Check configuration."}`, "error")
        } else {
          addToast("Success", `MCP Server "${server.name}" synced successfully.`, "success")
        }
      })
      .catch((error) => addToast("Error", typeof error === 'string' ? error : "Failed to sync MCP", "error"))
  }

  if (!server) return null

  const badges = []
  if (server.sync_status === "SYNCED") {
    badges.push({ label: "Connected", variant: "success", icon: CheckCircle2 })
  } else if (server.sync_status === "PENDING") {
    badges.push({ label: "Syncing", variant: "outline", icon: RefreshCw })
  } else if (server.sync_status === "FAILED") {
    badges.push({ label: "Failed", variant: "destructive", icon: AlertCircle })
  }

  const actions = [
    {
      icon: Play,
      title: "Test Connection",
      color: theme.colors.primary[600],
      onClick: handleTest
    },
    {
      icon: Trash2,
      title: "Delete Server",
      color: theme.colors.destructive[600],
      onClick: handleDeleteClick
    }
  ]

  if (server.sync_status === "FAILED") {
    actions.unshift({
      icon: RefreshCw,
      title: "Retry Sync",
      color: theme.colors.warning[600],
      onClick: handleSync
    })
  }

  return (
    <div key={server.id}>
      <ResourceCard
        title={server.name}
        subtitle={server.url?.toLowerCase()}
        icon={Server}
        badges={badges}
        actions={actions}
        onClick={() => navigate(`/edit-mcp-server/${server.id}`)}
      />

      <DeleteResourceDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleConfirmDelete}
        title="Delete MCP Server"
        resourceName={server.name}
        confirmationKeyword="DELETE"
      />
    </div>
  )
}
