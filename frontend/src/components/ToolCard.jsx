import React, { useState } from "react"
import { useTheme } from "@/context/ThemeContext"
import { useNavigate } from "react-router-dom"
import { useDispatch } from "react-redux"
import DeleteResourceDialog from "@/components/DeleteResourceDialog"
import { deleteTool, syncTool } from "@/store/slices/toolSlice"
import ResourceCard from "@/components/ui/ResourceCard"
import { Wrench, Trash2, Play, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react"

export default function ToolCard({ tool, addToast }) {
  const theme = useTheme()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const handleDeleteClick = (e) => {
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
    navigate(`/test-tool/${tool.id}`)
  }

  const handleSync = (e) => {
    if (!tool?.id) return
    addToast("Info", `Attempting to sync ${tool.name}...`, "info")
    dispatch(syncTool(tool.id))
      .unwrap()
      .then((payload) => {
        if (payload?.sync_status === "FAILED") {
          addToast("Error", `Tool "${tool.name}" failed to sync: ${payload.sync_error || "Check server logs."}`, "error")
        } else {
          addToast("Success", `Tool "${tool.name}" synced successfully.`, "success")
        }
      })
      .catch((error) => addToast("Error", typeof error === 'string' ? error : "Failed to sync tool", "error"))
  }

  if (!tool) return null

  const badges = []
  if (tool.sync_status === "SYNCED") {
    badges.push({ label: "Indexed", variant: "success", icon: CheckCircle2 })
  } else if (tool.sync_status === "PENDING") {
    badges.push({ label: "Syncing", variant: "outline", icon: RefreshCw })
  } else if (tool.sync_status === "FAILED") {
    badges.push({ label: "Failed", variant: "destructive", icon: AlertCircle })
  }

  const actions = [
    {
      icon: Play,
      title: "Test Tool",
      color: theme.colors.primary[600],
      onClick: handleTest
    },
    {
      icon: Trash2,
      title: "Delete Tool",
      color: theme.colors.destructive[600],
      onClick: handleDeleteClick
    }
  ]

  if (tool.sync_status === "FAILED") {
    actions.unshift({
      icon: RefreshCw,
      title: "Retry Sync",
      color: theme.colors.warning[600],
      onClick: handleSync
    })
  }

  return (
    <>
      <ResourceCard
        title={tool.name}
        description={tool.description}
        icon={Wrench}
        badges={badges}
        actions={actions}
        onClick={() => navigate(`/edit-tool/${tool.id}`)}
      />

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
