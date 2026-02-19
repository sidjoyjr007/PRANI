import { useState } from "react"
import { useTheme } from "@/context/ThemeContext"
import { Button } from "@/components/ui/button"
import { Text } from "@/components/ui/text"
import { Dropdown, DropdownTrigger, DropdownContent, DropdownItem, DropdownSeparator } from "@/components/ui/dropdown"
import { Plus, MoreHorizontal, Edit, Trash, MessageSquare } from "lucide-react"
import { Empty } from "@/components/ui/empty"

export default function ConversationsPanel({
    conversations,
    activeConversation,
    setActiveConversation,
    setConversations,
    selectedAgentId
}) {
    const theme = useTheme()
    const [hoveredConversationId, setHoveredConversationId] = useState(null)

    const hasAgentSelected = !!selectedAgentId

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
                                    onClick={() => setActiveConversation(conv.id)}
                                    style={{
                                        flex: 1,
                                        background: "none",
                                        border: "none",
                                        cursor: "pointer",
                                        textAlign: "left",
                                        padding: `0 ${theme.spacing[4]}`,
                                    }}
                                >
                                    <Text as="div" variant="body" size="sm" style={{ fontWeight: theme.typography.fontWeight.medium, margin: 0, color: activeConversation === conv.id ? theme.colors.white : theme.colors.foreground }}>
                                        {conv.title}
                                    </Text>
                                </button>

                                {/* Dropdown Menu - Only visible on hover */}
                                {isHovered && (
                                    <Dropdown>
                                        <DropdownTrigger asChild>
                                            <button
                                                style={{
                                                    background: "none",
                                                    border: "none",
                                                    cursor: "pointer",
                                                    padding: `0 ${theme.spacing[4]}`,
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    color: activeConversation === conv.id ? theme.colors.white : theme.colors.foreground,
                                                }}
                                            >
                                                <MoreHorizontal size={16} />
                                            </button>
                                        </DropdownTrigger>
                                        <DropdownContent align="end">
                                            <DropdownItem
                                                leadingIcon={Edit}
                                                onClick={() => console.log("Rename:", conv.title)}
                                            >
                                                Rename
                                            </DropdownItem>
                                            <DropdownSeparator />
                                            <DropdownItem
                                                variant="destructive"
                                                leadingIcon={Trash}
                                                onClick={() => {
                                                    setConversations(conversations.filter(c => c.id !== conv.id))
                                                    if (activeConversation === conv.id) {
                                                        setActiveConversation(null)
                                                    }
                                                }}
                                            >
                                                Delete
                                            </DropdownItem>
                                        </DropdownContent>
                                    </Dropdown>
                                )}
                            </div>
                        )
                    })
                )}
            </div>
        </div>
    )
}
