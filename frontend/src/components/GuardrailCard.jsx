import React, { useState } from "react"
import { useTheme } from "@/context/ThemeContext"
import { Shield, Brain, Search, Ban, AlertTriangle, PenTool, Trash2 } from "lucide-react"
import ResourceCard from "@/components/ui/ResourceCard"
import DeleteResourceDialog from "@/components/DeleteResourceDialog"
import { useDispatch } from "react-redux"
import { deleteGuardrail } from "@/store/slices/guardrailSlice"

export default function GuardrailCard({ guardrail, onEdit, onDelete }) {
  const theme = useTheme()
  const dispatch = useDispatch()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  if (!guardrail) return null

  const getMechanismIcon = (mechanism) => {
    switch (mechanism?.toLowerCase()) {
      case 'regex': return Search
      case 'llm_judge': return Brain
      default: return Shield
    }
  }

  const getMechanismLabel = (mechanism) => {
    switch (mechanism?.toLowerCase()) {
      case 'regex': return 'Regex'
      case 'llm_judge': return 'LLM Judge'
      default: return mechanism?.toUpperCase()
    }
  }

  const getActionIcon = (action) => {
    switch (action?.toLowerCase()) {
      case 'block': return Ban
      case 'warn': return AlertTriangle
      case 'modify': return PenTool
      default: return AlertTriangle
    }
  }

  const handleDeleteClick = (e) => {
    setShowDeleteDialog(true)
  }

  const handleConfirmDelete = () => {
    dispatch(deleteGuardrail(guardrail.id))
      .unwrap()
      .then(() => {
        if (onDelete) onDelete(guardrail.id, true)
      })
      .catch((error) => {
        console.error("Failed to delete guardrail:", error)
        if (onDelete) onDelete(guardrail.id, false, error)
      })
    setShowDeleteDialog(false)
  }

  const badges = [
    {
      label: getMechanismLabel(guardrail.mechanism),
      variant: "subtle",
      color: guardrail.mechanism?.toLowerCase() === 'regex' ? "primary" : "secondary",
      icon: getMechanismIcon(guardrail.mechanism)
    },
    {
      label: guardrail.action?.toUpperCase(),
      variant: "outline",
      color: guardrail.action?.toLowerCase() === 'block' ? "destructive" : "warning",
      icon: getActionIcon(guardrail.action)
    }
  ]

  const actions = [
    {
      icon: Trash2,
      title: "Delete Guardrail",
      color: theme.colors.destructive[600],
      onClick: handleDeleteClick
    }
  ]

  return (
    <div key={guardrail.id}>
      <ResourceCard
        title={guardrail.name}
        subtitle={guardrail.type?.toUpperCase()}
        description={guardrail.description}
        icon={Shield}
        badges={badges}
        actions={actions}
        onClick={() => onEdit && onEdit(guardrail.id)}
      />

      <DeleteResourceDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Guardrail"
        resourceName={guardrail.name}
        confirmationKeyword="DELETE"
      />
    </div>
  )
}
