import { useState, useRef, useEffect } from "react"
import { useTheme } from "@/context/ThemeContext"
import { Button } from "@/components/ui/button"
import { Text } from "@/components/ui/text"
import { Combobox, ComboboxTrigger, ComboboxContent, ComboboxItem, ComboboxSearch } from "@/components/ui/combobox"
import { Send, User, Bot, Check, X, ChevronDown } from "lucide-react"

export default function ChatPanel({
    messages,
    setMessages,
    inputValue,
    setInputValue,
    handleSendMessage,
    selectedAgentId,
    setSelectedAgentId,
    agents,
    streamingIndex,
    messageActions,
    isScrolledToBottom,
    setIsScrolledToBottom,
    scrollToBottom
}) {
    const theme = useTheme()
    const messagesEndRef = useRef(null)
    const messagesContainerRef = useRef(null)

    // Auto-scroll to bottom when new messages arrive (but not while streaming to avoid flicker)
    useEffect(() => {
        if (isScrolledToBottom && streamingIndex === null) {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
        }
    }, [messages, isScrolledToBottom, streamingIndex])

    // Detect scroll position
    const handleScroll = () => {
        if (!messagesContainerRef.current) return

        const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current
        const isAtBottom = scrollHeight - scrollTop - clientHeight < 100 // 100px threshold
        setIsScrolledToBottom(isAtBottom)
    }

    // Find selected agent name for button/display
    const selectedAgent = agents.find(a => a.id === selectedAgentId)

    return (
        <div
            style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                backgroundColor: theme.colors.background,
                padding: theme.spacing[6],
                overflow: "visible",
                position: "relative",
                zIndex: 1,
            }}
        >
            {/* Messages Area */}
            <div
                ref={messagesContainerRef}
                onScroll={handleScroll}
                style={{ flex: 1, overflow: "auto", marginBottom: theme.spacing[6], display: "flex", flexDirection: "column", gap: theme.spacing[4], padding: `${theme.spacing[4]} 0`, position: "relative" }}>
                {messages.length === 0 ? (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: theme.colors.muted_foreground }}>
                        Start a conversation
                    </div>
                ) : (
                    messages.map((msg, idx) => (
                        <div key={idx} style={{ display: "flex", alignItems: "flex-end", gap: theme.spacing[3], marginBottom: theme.spacing[3], justifyContent: msg.sender === "user" ? "flex-end" : "flex-start", flexDirection: msg.sender === "user" ? "row" : "row" }}>
                            {/* Avatar Icon - Bot on left, User on right */}
                            {msg.sender === "bot" && (
                                <div style={{
                                    width: "36px",
                                    height: "36px",
                                    borderRadius: "50%",
                                    backgroundColor: theme.colors.neutral[700],
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexShrink: 0,
                                }}>
                                    <Bot size={18} style={{ color: theme.colors.white }} />
                                </div>
                            )}

                            {/* Message Content */}
                            <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing[2], maxWidth: "70%", alignItems: msg.sender === "user" ? "flex-end" : "flex-start" }}>
                                {/* Message Bubble */}
                                <div
                                    style={{
                                        backgroundColor: msg.sender === "user" ? theme.colors.primary[600] : theme.colors.card,
                                        border: msg.sender === "user" ? `${theme.borderWidth.sm} solid ${theme.colors.primary[700]}` : `${theme.borderWidth.sm} solid ${theme.colors.border}`,
                                        color: msg.sender === "user" ? theme.colors.white : theme.colors.foreground,
                                        padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
                                        borderRadius: theme.borderRadius.lg,
                                        wordWrap: "break-word",
                                        whiteSpace: "pre-wrap",
                                        boxShadow: msg.sender === "user" ? theme.shadows.lg : theme.shadows.sm,
                                        transition: `all ${theme.transitions.normal}`,
                                    }}
                                >
                                    <Text as="p" size="sm" style={{ margin: 0, fontWeight: msg.sender === "user" ? theme.typography.fontWeight.medium : theme.typography.fontWeight.normal }}>
                                        {msg.text}
                                    </Text>
                                </div>

                                {/* Bot Action Buttons - Show only after streaming delay */}
                                {msg.sender === "bot" && messageActions[idx] && (
                                    <div style={{ display: "flex", gap: theme.spacing[2], animation: `fadeIn ${theme.transitions.normal}` }}>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            leadingIcon={Check}
                                            onClick={() => console.log("Approved:", msg.text)}
                                            style={{
                                                color: theme.colors.success.DEFAULT,
                                                borderColor: theme.colors.success.DEFAULT,
                                                padding: `${theme.spacing[1]} ${theme.spacing[3]}`,
                                                fontSize: theme.typography.fontSize.xs,
                                            }}
                                        >
                                            Approve
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            leadingIcon={X}
                                            onClick={() => console.log("Rejected:", msg.text)}
                                            style={{
                                                color: theme.colors.destructive,
                                                borderColor: theme.colors.destructive,
                                                padding: `${theme.spacing[1]} ${theme.spacing[3]}`,
                                                fontSize: theme.typography.fontSize.xs,
                                            }}
                                        >
                                            Reject
                                        </Button>
                                    </div>
                                )}
                            </div>

                            {/* Avatar Icon - User on right */}
                            {msg.sender === "user" && (
                                <div style={{
                                    width: "36px",
                                    height: "36px",
                                    borderRadius: "50%",
                                    backgroundColor: theme.colors.primary[600],
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexShrink: 0,
                                }}>
                                    <User size={18} style={{ color: theme.colors.white }} />
                                </div>
                            )}
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} style={{ height: 0 }} />

                {/* Scroll Down Button */}
                {!isScrolledToBottom && messages.length > 0 && (
                    <Button
                        onClick={scrollToBottom}
                        variant="primary"
                        size="sm"
                        style={{
                            position: "absolute",
                            bottom: theme.spacing[6],
                            left: "50%",
                            transform: "translateX(-50%)",
                            borderRadius: "50%",
                            width: "40px",
                            height: "40px",
                            padding: 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow: theme.shadows.lg,
                            zIndex: 10,
                        }}
                    >
                        <ChevronDown size={20} />
                    </Button>
                )}
            </div>

            {/* Input Area */}
            <div style={{
                position: "relative",
                backgroundColor: theme.colors.card,
                border: `${theme.borderWidth.sm} solid ${theme.colors.border}`,
                borderRadius: theme.borderRadius.lg,
                boxShadow: theme.shadows.md,
                outline: "2px solid transparent",
                outlineOffset: "-2px",
                transition: `all ${theme.transitions.normal}`,
                display: "flex",
                flexDirection: "column",
                maxHeight: "500px",
            }}
                onFocus={(e) => {
                    e.currentTarget.style.outline = `2px solid ${theme.colors.primary[500]}`
                    e.currentTarget.style.boxShadow = theme.shadows.lg
                }}
                onBlur={(e) => {
                    e.currentTarget.style.outline = "2px solid transparent"
                    e.currentTarget.style.boxShadow = theme.shadows.md
                }}
                tabIndex={0}
            >
                {/* Textarea - starts with 2 rows, grows to 6 rows, then scrolls */}
                <textarea
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault()
                            handleSendMessage()
                        }
                    }}
                    rows={2}
                    placeholder="Write a message..."
                    style={{
                        padding: `${theme.spacing[4]} ${theme.spacing[5]}`,
                        backgroundColor: "transparent",
                        color: theme.colors.foreground,
                        resize: "none",
                        border: "none",
                        outline: "none",
                        fontFamily: "inherit",
                        fontSize: theme.typography.fontSize.sm,
                        overflowY: "auto",
                        lineHeight: "1.6",
                    }}
                    onInput={(e) => {
                        // Auto-grow textarea up to 6 rows, then enable scrolling
                        const textarea = e.target
                        textarea.style.height = "auto"
                        const newHeight = Math.min(textarea.scrollHeight, 6 * 24 + 48) // ~24px per line, 6 rows max + padding
                        textarea.style.height = newHeight + "px"
                    }}
                />

                {/* Bottom Toolbar */}
                <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: theme.spacing[4],
                    backgroundColor: "transparent",
                    gap: theme.spacing[4],
                }}>
                    {/* Agent Selection Combobox - Fixed Width */}
                    <div style={{ position: "relative", width: "auto", zIndex: 50, minWidth: "200px" }}>
                        <Combobox value={selectedAgentId} onValueChange={setSelectedAgentId} variant="ghost" size="md">
                            <ComboboxTrigger style={{ justifyContent: "flex-start" }}>
                                {selectedAgent ? selectedAgent.name : "Select Agent"}
                            </ComboboxTrigger>
                            <ComboboxContent>
                                <ComboboxSearch placeholder="Search agents..." />
                                {agents.map((agent) => (
                                    <ComboboxItem key={agent.id} value={String(agent.id)} searchableText={`${agent.name} ${agent.description || ""}`}>
                                        <div style={{ display: "flex", flexDirection: "column" }}>
                                            <span>{agent.name}</span>
                                            {agent.description && (
                                                <span style={{ fontSize: "0.75rem", opacity: 0.6, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "200px" }}>
                                                    {agent.description}
                                                </span>
                                            )}
                                        </div>
                                    </ComboboxItem>
                                ))}
                                {agents.length === 0 && <div style={{ padding: '8px', color: theme.colors.muted_foreground }}>No agents found</div>}
                            </ComboboxContent>
                        </Combobox>
                    </div>

                    {/* Send Button */}
                    <Button
                        onClick={handleSendMessage}
                        variant="primary"
                        size="md"
                        style={{
                            flexShrink: 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: "40px",
                            height: "40px",
                            padding: 0,
                        }}
                    >
                        <Send size={16} />
                    </Button>
                </div>
            </div>
        </div>
    )
}
