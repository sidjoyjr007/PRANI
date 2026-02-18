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
import { deleteLLM } from "@/store/slices/llmSlice"

export default function LLMCard({ llm, addToast }) {
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
    e.stopPropagation()
    navigate(`/test-llm/${llm.id}`)
  }

  if (!llm) return null

  // Provider color mapping
  const getProviderColor = (provider) => {
    const colors = {
      OpenAI: "secondary",
      Anthropic: "secondary",
      Gemini: "secondary",
      HuggingFace: "secondary",
    }
    return colors[provider] || "secondary"
  }

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
          border: `${theme.borderWidth.sm} solid ${theme.colors.border}`,
          borderRadius: theme.borderRadius.md,
          backgroundColor: theme.colors.card,
          boxShadow: `0 1px 3px 0 ${theme.colors.shadow}20`,
          position: "relative",
        }}
        onClick={() => navigate(`/edit-llm/${llm.id}`)}
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
            {/* Test Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleTest}
              style={{
                padding: theme.spacing[2],
                color: theme.colors.primary[600],
              }}
              title="Test LLM"
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
              title="Delete LLM"
            >
              <Trash2 size={18} />
            </Button>
          </div>
        )}

        {/* LLM Name */}
        <Text
          as="h3"
          variant="label"
          size="md"
          style={{
            margin: 0,
            color: theme.colors.foreground,
            fontWeight: theme.typography.fontWeight.semibold,
          }}
        >
          {llm.name}
        </Text>

        {/* Provider Badge */}
        <Badge
          variant="outline"
          color={getProviderColor(llm.provider)}
          size="sm"
          pill
          style={{
            alignSelf: "flex-start",
          }}
        >
          {llm.provider}
        </Badge>

        {/* Model Name */}
        <Text
          as="p"
          variant="body"
          size="sm"
          style={{
            margin: 0,
            color: theme.colors.muted_foreground,
            flex: 1,
            lineHeight: theme.typography.lineHeight.relaxed,
          }}
        >
          {llm.model}
        </Text>
      </Card>

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
