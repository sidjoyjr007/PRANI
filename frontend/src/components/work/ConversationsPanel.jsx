import { useState } from "react"
import { useTheme } from "@/context/ThemeContext"
import { Button } from "@/components/ui/button"
import { Text } from "@/components/ui/text"
import { Plus, Edit, Trash, MessageSquare } from "lucide-react"
import { Empty } from "@/components/ui/empty"
import DeleteResourceDialog from "@/components/DeleteResourceDialog"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

export default function ConversationsPanel({
    conversations,
    activeConversation,
    onSelectConversation,
    onNewConversation,
    onDeleteConversation,
    onRenameConversation,
    selectedAgentId
}) {
    const theme = useTheme()
    const [hoveredConversationId, setHoveredConversationId] = useState(null)

    // Dialog State
    const [deleteId, setDeleteId] = useState(null)
    const [renameId, setRenameId] = useState(null)
    const [renameValue, setRenameValue] = useState("")

    const hasAgentSelected = !!selectedAgentId

    const handleRenameSubmit = () => {
        if (renameId && renameValue.trim()) {
            onRenameConversation(renameId, renameValue.trim())
            setRenameId(null)
            setRenameValue("")
        }
    }

    const conversationToDelete = conversations.find(c => c.id === deleteId)

    return (
        <div
            style={{
                width: "300px",
                borderRight: `${theme.borderWidth.sm} solid ${theme.colors.border}`,
                display: "flex",
                flexDirection: "column",
                backgroundColor: theme.colors.card,
                padding: theme.spacing[6],
            }}
        >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: theme.spacing[6] }}>
                <Text as="h3" variant="label" size="md" style={{ margin: 0 }}>Conversations</Text>
                <Button
                    variant="primary"
                    size="sm"
                    disabled={!hasAgentSelected}
                    onClick={onNewConversation}
                    style={{ width: "32px", height: "32px", padding: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                    <Plus size={16} />
                </Button>
            </div>

            <div style={{ flex: 1, overflow: "auto", display: "flex", flexDirection: "column", gap: theme.spacing[2], height: "100%" }}>
                {!hasAgentSelected ? (
                    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Empty
                            icon={MessageSquare}
                            title="No Selection"
                            description="Select an agent to view conversations"
                            variant="subtle"
                            size="sm"
                        />
                    </div>
                ) : conversations.length === 0 ? (
                    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Empty
                            icon={MessageSquare}
                            title="No Conversations"
                            description="Start a new chat to begin"
                            variant="subtle"
                            size="sm"
                        />
                    </div>
                ) : (
                    conversations.map((conv) => {
                        const isHovered = hoveredConversationId === conv.id
                        return (
                            <div
                                key={conv.id}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    padding: `${theme.spacing[3]} 0`,
                                    backgroundColor: activeConversation === conv.id ? theme.colors.primary[600] : "transparent",
                                    borderRadius: theme.borderRadius.md,
                                    cursor: "pointer",
                                    transition: theme.transitions.normal,
                                    position: "relative", // For absolute positioning if needed, but flex works well
                                }}
                                onMouseEnter={(e) => {
                                    setHoveredConversationId(conv.id)
                                    if (activeConversation !== conv.id) {
                                        e.currentTarget.style.backgroundColor = theme.colors.neutral[100]
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    setHoveredConversationId(null)
                                    if (activeConversation !== conv.id) {
                                        e.currentTarget.style.backgroundColor = "transparent"
                                    }
                                }}
                            >
                                <button
                                    onClick={() => onSelectConversation(conv.id)}
                                    style={{
                                        flex: 1,
                                        background: "none",
                                        border: "none",
                                        cursor: "pointer",
                                        textAlign: "left",
                                        padding: `0 ${theme.spacing[4]}`,
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                        marginRight: isHovered ? "60px" : "0", // Make space for buttons
                                        transition: "margin-right 0.2s",
                                    }}
                                >
                                    <Text as="div" variant="body" size="sm" style={{ fontWeight: theme.typography.fontWeight.medium, margin: 0, color: activeConversation === conv.id ? theme.colors.white : theme.colors.foreground }}>
                                        {conv.title}
                                    </Text>
                                </button>

                                {/* Action Buttons - Visible on Hover */}
                                {isHovered && (
                                    <div style={{
                                        position: "absolute",
                                        right: theme.spacing[2],
                                        top: "50%",
                                        transform: "translateY(-50%)",
                                        display: "flex",
                                        gap: theme.spacing[1],
                                    }}>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                setRenameId(conv.id)
                                                setRenameValue(conv.title)
                                            }}
                                            style={{
                                                background: "none",
                                                border: "none",
                                                cursor: "pointer",
                                                color: activeConversation === conv.id ? theme.colors.white : theme.colors.muted_foreground,
                                                padding: "4px",
                                                display: "flex",
                                                alignItems: "center",
                                                opacity: 0.8,
                                            }}
                                            title="Rename"
                                        >
                                            <Edit size={14} />
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                setDeleteId(conv.id)
                                            }}
                                            style={{
                                                background: "none",
                                                border: "none",
                                                cursor: "pointer",
                                                color: activeConversation === conv.id ? theme.colors.white : theme.colors.destructive,
                                                padding: "4px",
                                                display: "flex",
                                                alignItems: "center",
                                                opacity: 0.8,
                                            }}
                                            title="Delete"
                                        >
                                            <Trash size={14} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        )
                    })
                )}
            </div>

            {/* Delete Confirmation Dialog */}
            <DeleteResourceDialog
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={() => {
                    onDeleteConversation(deleteId)
                    setDeleteId(null)
                }}
                title="Delete Conversation"
                resourceName={conversationToDelete?.title || "Conversation"}
                confirmationKeyword="DELETE"
                description={
                    <>
                        Are you sure you want to delete this conversation? This will permanently remove all message history.
                        <br />
                        Type <strong>DELETE</strong> to confirm.
                    </>
                }
            />

            {/* Rename Dialog */}
            <Dialog open={!!renameId} onOpenChange={() => setRenameId(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Rename Conversation</DialogTitle>
                    </DialogHeader>
                    <div style={{ padding: `${theme.spacing[4]} 0` }}>
                        <Input
                            value={renameValue}
                            onChange={(e) => setRenameValue(e.target.value)}
                            placeholder="Enter new name"
                            autoFocus
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setRenameId(null)}>Cancel</Button>
                        <Button variant="primary" onClick={handleRenameSubmit}>Save</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
