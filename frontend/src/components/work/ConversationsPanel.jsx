import { useState } from "react"
import { useTheme } from "@/context/ThemeContext"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Text } from "@/components/ui/text"
import { Plus, Edit, Trash, MessageSquare, Logs, MoreVertical } from "lucide-react"
import { Dropdown, DropdownTrigger, DropdownContent, DropdownItem } from "@/components/ui/dropdown"
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
    const navigate = useNavigate()
    const [hoveredConversationId, setHoveredConversationId] = useState(null)
    const [openDropdownId, setOpenDropdownId] = useState(null) // Added for z-index

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
                <Text as="label" variant="helper" size="xs" style={{ margin: 0, textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: "700", color: theme.colors.foreground }}>Conversations</Text>
                <Button
                    variant="ghost"
                    size="sm"
                    disabled={!hasAgentSelected}
                    onClick={onNewConversation}
                    style={{ width: "28px", height: "28px", padding: 0, display: "flex", alignItems: "center", justifyContent: "center", color: theme.colors.muted_foreground }}
                >
                    <Plus size={16} />
                </Button>
            </div>

            <div className="hover-scrollbar" style={{ flex: 1, overflowY: "auto", overflowX: "hidden", display: "flex", flexDirection: "column", gap: theme.spacing[2], height: "100%", paddingRight: "0px", width: "100%" }}>
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
                                    padding: theme.spacing[1],
                                    width: "100%",
                                    boxSizing: "border-box",
                                    backgroundColor: activeConversation === conv.id
                                        ? theme.colors.primary[50]
                                        : isHovered
                                            ? theme.colors.neutral[50]
                                            : "transparent",
                                    borderRadius: theme.borderRadius.md,
                                    cursor: "pointer",
                                    transition: theme.transitions.fast,
                                    position: "relative",
                                    zIndex: (isHovered || openDropdownId === conv.id) ? 10 : 1,
                                }}
                                onMouseEnter={() => setHoveredConversationId(conv.id)}
                                onMouseLeave={() => setHoveredConversationId(null)}
                            >
                                <button
                                    onClick={() => onSelectConversation(conv.id)}
                                    style={{
                                        flex: 1,
                                        background: "none",
                                        border: "none",
                                        cursor: "pointer",
                                        textAlign: "left",
                                        padding: theme.spacing[2],
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                        transition: "color 0.2s",
                                    }}
                                >
                                    <Text as="div" variant="body" size="xs" style={{ fontWeight: activeConversation === conv.id ? theme.typography.fontWeight.semibold : theme.typography.fontWeight.medium, margin: 0, color: activeConversation === conv.id ? theme.colors.foreground : theme.colors.muted_foreground }}>
                                        {conv.title}
                                    </Text>
                                </button>

                                {/* Action Dropdown */}
                                <div style={{ width: "32px", display: "flex", justifyContent: "center", marginRight: theme.spacing[2] }}>
                                    <Dropdown onOpenChange={(isOpen) => setOpenDropdownId(isOpen ? conv.id : null)}>
                                        <DropdownTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    e.preventDefault()
                                                }}
                                                onMouseDown={(e) => {
                                                    e.stopPropagation()
                                                }}
                                                style={{
                                                    padding: theme.spacing[1],
                                                    borderRadius: theme.borderRadius.sm,
                                                    color: theme.colors.muted_foreground,
                                                    backgroundColor: (isHovered || openDropdownId === conv.id || activeConversation === conv.id) ? (activeConversation === conv.id ? theme.colors.neutral[100] : theme.colors.neutral[50]) : "transparent",
                                                    opacity: (isHovered || openDropdownId === conv.id || activeConversation === conv.id) ? 1 : 0,
                                                    pointerEvents: (isHovered || openDropdownId === conv.id || activeConversation === conv.id) ? "auto" : "none",
                                                }}
                                            >
                                                <MoreVertical size={16} />
                                            </Button>
                                        </DropdownTrigger>
                                        <DropdownContent align="end" style={{ zIndex: 100 }}>
                                            <DropdownItem
                                                leadingIcon={Logs}
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    const params = new URLSearchParams()
                                                    params.set("session", conv.id)
                                                    if (selectedAgentId) params.set("agent", selectedAgentId)
                                                    navigate(`/logs?${params.toString()}`)
                                                }}
                                            >
                                                View Logs
                                            </DropdownItem>
                                            <DropdownItem
                                                leadingIcon={Edit}
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    setRenameId(conv.id)
                                                    setRenameValue(conv.title)
                                                }}
                                            >
                                                Rename
                                            </DropdownItem>
                                            <DropdownItem
                                                variant="destructive"
                                                leadingIcon={Trash}
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    setDeleteId(conv.id)
                                                }}
                                            >
                                                Delete
                                            </DropdownItem>
                                        </DropdownContent>
                                    </Dropdown>
                                </div>
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
