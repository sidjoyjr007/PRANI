import React, { useState } from "react"
import { useTheme } from "@/context/ThemeContext"
import { useNavigate } from "react-router-dom"
import { useDispatch } from "react-redux"
import DeleteResourceDialog from "@/components/DeleteResourceDialog"
import { deleteAgent } from "@/store/slices/agentSlice"
import ResourceCard from "@/components/ui/ResourceCard"
import { Bot, Trash2, MessageSquare, Wrench, Server, Brain } from "lucide-react"

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

  const toolNames = agent.tool_names || [];
  const mcpNames = agent.mcp_server_names || [];
  const llmName = agent.llm_name;

  const badges = [];

  // Tools Badges (up to 2, then +count)
  const maxTools = 2;
  const displayedTools = toolNames.slice(0, maxTools);
  const remainingTools = Math.max(0, toolNames.length - maxTools);

  displayedTools.forEach(name => {
    badges.push({
      label: name,
      variant: "subtle",
      color: "secondary",
      icon: Wrench
    });
  });

  if (remainingTools > 0) {
    badges.push({
      label: `+${remainingTools}`,
      variant: "outline",
      color: "secondary"
    });
  }

  // MCP Badges (up to 2, then +count)
  const maxMCPs = 2;
  const displayedMCPs = mcpNames.slice(0, maxMCPs);
  const remainingMCPs = Math.max(0, mcpNames.length - maxMCPs);

  displayedMCPs.forEach(name => {
    badges.push({
      label: name,
      variant: "subtle",
      color: "neutral",
      icon: Server
    });
  });

  if (remainingMCPs > 0) {
    badges.push({
      label: `+${remainingMCPs}`,
      variant: "outline",
      color: "neutral"
    });
  }


  const actions = [
    {
      icon: MessageSquare,
      title: "Chat with Agent",
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
    <div key={agent.id}>
      <ResourceCard
        title={agent.name}
        subtitle={
          llmName ? (
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Brain size={12} style={{ opacity: 0.8 }} />
              {llmName}
            </div>
          ) : "No Model Assigned"
        }
        description={agent.instructions}
        icon={Bot}
        badges={badges}
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
    </div>
  )
}
