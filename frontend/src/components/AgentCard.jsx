import React, { useState } from "react"
import { useTheme } from "@/context/ThemeContext"
import { useNavigate } from "react-router-dom"
import { useDispatch } from "react-redux"
import DeleteResourceDialog from "@/components/DeleteResourceDialog"
import { deleteAgent } from "@/store/slices/agentSlice"
import ResourceCard from "@/components/ui/ResourceCard"
import { Bot, Trash2, MessageSquare, Wrench, Server } from "lucide-react"

export default function AgentCard({ agent, addToast }) {
  const theme = useTheme()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const handleDeleteClick = (e) => {
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

  // Capabilities as badges (limited to 3)
  const maxCapabilities = 3
  const rawCapabilities = agent.capabilities || []
  const displayedCapabilities = rawCapabilities.slice(0, maxCapabilities)
  const remainingCount = Math.max(0, rawCapabilities.length - maxCapabilities)

  const toolCount = agent.tool_ids?.length || 0
  const serverCount = agent.mcp_server_ids?.length || 0

  const badges = displayedCapabilities.map(cap => ({
    label: cap,
    variant: "subtle",
    color: "primary"
  }))

  if (remainingCount > 0) {
    badges.push({
      label: `+${remainingCount}`,
      variant: "outline",
      color: "primary"
    })
  }

  const stats = [
    { icon: Wrench, value: toolCount },
    { icon: Server, value: serverCount }
  ]

  const actions = [
    {
      icon: MessageSquare,
      title: "Chat with Agent",
      color: theme.colors.primary[600],
      onClick: (e) => navigate("/work", { state: { agentId: agent.id } })
    },
    {
      icon: Trash2,
      title: "Delete Agent",
      color: theme.colors.destructive[600],
      onClick: handleDeleteClick
    }
  ]

  return (
    <>
      <ResourceCard
        title={agent.name}
        icon={Bot}
        badges={badges}
        stats={stats}
        actions={actions}
        onClick={() => navigate(`/edit-agent/${agent.id}`)}
      />

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
