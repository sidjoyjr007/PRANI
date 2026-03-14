import React, { useState } from "react"
import { useTheme } from "@/context/ThemeContext"
import { useNavigate } from "react-router-dom"
import { useDispatch } from "react-redux"
import DeleteResourceDialog from "@/components/DeleteResourceDialog"
import { deleteLLM } from "@/store/slices/llmSlice"
import ResourceCard from "@/components/ui/ResourceCard"
import { Brain, Trash2, Play, Sparkles } from "lucide-react"

export default function LLMCard({ llm, addToast }) {
  const theme = useTheme()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const handleDeleteClick = (e) => {
    setShowDeleteDialog(true)
  }

  const handleConfirmDelete = () => {
    dispatch(deleteLLM(llm.id))
      .unwrap()
      .then(() => {
        if (addToast) addToast("Success", `LLM "${llm.name}" deleted successfully.`, "success")
      })
      .catch((error) => {
        const errorMsg = typeof error === 'string' ? error : (error.detail || "Failed to delete LLM")
        if (addToast) addToast("Error", errorMsg, "error")
      })
    setShowDeleteDialog(false)
  }

  const handleTest = (e) => {
    navigate(`/test-llm/${llm.id}`)
  }

  if (!llm) return null

  const badges = [
    { label: llm.provider, variant: "filled", color: "secondary", icon: Sparkles }
  ]

  const actions = [
    {
      icon: Play,
      title: "Test LLM",
      color: theme.colors.primary[600],
      onClick: handleTest
    },
    {
      icon: Trash2,
      title: "Delete LLM",
      color: theme.colors.destructive[600],
      onClick: handleDeleteClick
    }
  ]

  return (
    <>
      <ResourceCard
        title={llm.name}
        subtitle={llm.model}
        icon={Brain}
        badges={badges}
        actions={actions}
        onClick={() => navigate(`/edit-llm/${llm.id}`)}
      />

      <DeleteResourceDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleConfirmDelete}
        title="Delete LLM"
        resourceName={llm.name}
        confirmationKeyword="DELETE"
      />
    </>
  )
}
