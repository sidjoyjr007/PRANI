import { useState, useRef, useEffect, useCallback } from "react"
import { useTheme } from "@/context/ThemeContext"
import { Button } from "@/components/ui/button"
import { Text } from "@/components/ui/text"
import { Combobox, ComboboxTrigger, ComboboxContent, ComboboxItem, ComboboxSearch } from "@/components/ui/combobox"
import {
    Send, User, Bot, Check, X, ChevronDown,
    Terminal, Cpu, ChevronRight, ChevronDown as ChevronDownIcon,
    AlertTriangle, Zap, Clock
} from "lucide-react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

// ─── Markdown Renderer ───────────────────────────────────────────────────────
function MarkdownContent({ content, theme }) {
    return (
        <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
                p: ({ children }) => (
                    <p style={{ margin: "0 0 8px 0", lineHeight: 1.65, color: theme.colors.foreground }}>{children}</p>
                ),
                code: ({ inline, className, children }) => {
                    if (inline) {
                        return (
                            <code style={{
                                backgroundColor: theme.colors.neutral[800],
                                color: theme.colors.primary[300],
                                padding: "2px 6px",
                                borderRadius: "4px",
                                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                                fontSize: "0.85em",
                            }}>{children}</code>
                        )
                    }
                    return (
                        <pre style={{
                            backgroundColor: theme.colors.neutral[900],
                            border: `1px solid ${theme.colors.border}`,
                            borderRadius: "8px",
                            padding: "12px 16px",
                            overflowX: "auto",
                            margin: "10px 0",
                            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                            fontSize: "0.82em",
                            lineHeight: 1.6,
                        }}>
                            <code style={{ color: theme.colors.neutral[200] }}>{children}</code>
                        </pre>
                    )
                },
                ul: ({ children }) => (
                    <ul style={{ margin: "6px 0", paddingLeft: "20px", color: theme.colors.foreground }}>{children}</ul>
                ),
                ol: ({ children }) => (
                    <ol style={{ margin: "6px 0", paddingLeft: "20px", color: theme.colors.foreground }}>{children}</ol>
                ),
                li: ({ children }) => (
                    <li style={{ marginBottom: "4px", lineHeight: 1.6 }}>{children}</li>
                ),
                h1: ({ children }) => (
                    <h1 style={{ fontSize: "1.2em", fontWeight: 700, margin: "12px 0 6px", color: theme.colors.foreground }}>{children}</h1>
                ),
                h2: ({ children }) => (
                    <h2 style={{ fontSize: "1.1em", fontWeight: 600, margin: "10px 0 4px", color: theme.colors.foreground }}>{children}</h2>
                ),
                h3: ({ children }) => (
                    <h3 style={{ fontSize: "1em", fontWeight: 600, margin: "8px 0 4px", color: theme.colors.muted_foreground }}>{children}</h3>
                ),
                blockquote: ({ children }) => (
                    <blockquote style={{
                        borderLeft: `3px solid ${theme.colors.primary[500]}`,
                        paddingLeft: "12px",
                        margin: "8px 0",
                        color: theme.colors.muted_foreground,
                        fontStyle: "italic"
                    }}>{children}</blockquote>
                ),
                a: ({ href, children }) => (
                    <a href={href} target="_blank" rel="noopener noreferrer"
                        style={{ color: theme.colors.primary[400], textDecoration: "underline" }}>
                        {children}
                    </a>
                ),
                strong: ({ children }) => (
                    <strong style={{ fontWeight: 600, color: theme.colors.foreground }}>{children}</strong>
                ),
                table: ({ children }) => (
                    <div style={{ overflowX: "auto", margin: "10px 0" }}>
                        <table style={{ borderCollapse: "collapse", width: "100%", fontSize: "0.9em" }}>
                            {children}
                        </table>
                    </div>
                ),
                th: ({ children }) => (
                    <th style={{
                        border: `1px solid ${theme.colors.border}`,
                        padding: "6px 12px",
                        backgroundColor: theme.colors.neutral[800],
                        textAlign: "left",
                        fontWeight: 600
                    }}>{children}</th>
                ),
                td: ({ children }) => (
                    <td style={{
                        border: `1px solid ${theme.colors.border}`,
                        padding: "6px 12px"
                    }}>{children}</td>
                ),
            }}
        >
            {content}
        </ReactMarkdown>
    )
}

// ─── Thinking / Reasoning Block ───────────────────────────────────────────────
function ThinkingBlock({ thoughts, theme }) {
    const [isOpen, setIsOpen] = useState(false)
    if (!thoughts || thoughts.length === 0) return null

    return (
        <div style={{ marginBottom: "8px" }}>
            <button
                onClick={() => setIsOpen(o => !o)}
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "4px 8px",
                    color: theme.colors.muted_foreground,
                    fontSize: "0.78em",
                    fontStyle: "italic",
                    transition: "all 0.15s",
                    backgroundColor: theme.colors.neutral[800],
                    borderRadius: "4px",
                }}
            >
                {isOpen ? <ChevronDownIcon size={13} /> : <ChevronRight size={13} />}
                <span>Agent Reasoning</span>
            </button>
            {isOpen && (
                <div style={{
                    marginTop: "6px",
                    borderLeft: `2px solid ${theme.colors.primary[500]}`,
                    paddingLeft: "12px",
                    color: theme.colors.muted_foreground,
                    fontSize: "0.82em",
                    fontStyle: "italic",
                    lineHeight: 1.6,
                    backgroundColor: "rgba(0,0,0,0.1)",
                    padding: "8px 12px",
                    borderRadius: "0 4px 4px 0",
                }}>
                    {thoughts.map((t, i) => <div key={i} style={{ marginBottom: "6px" }}>{t}</div>)}
                </div>
            )}
        </div>
    )
}

function StatusIndicator({ status, theme }) {
    if (!status) return null

    return (
        <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "4px 10px",
            backgroundColor: theme.colors.neutral[800],
            borderRadius: "16px",
            fontSize: "0.75em",
            color: theme.colors.primary[300],
            marginBottom: "10px",
            border: `1px solid ${theme.colors.neutral[700]}`,
        }}>
            <div style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                backgroundColor: theme.colors.primary[400],
                animation: "pulse 1.5s infinite"
            }} />
            <span style={{ fontWeight: 500 }}>{status}</span>
        </div>
    )
}

// ─── Tool Call Card ───────────────────────────────────────────────────────────
function ToolCallCard({ tool, theme }) {
    const [isOpen, setIsOpen] = useState(false)
    const statusColor = tool.status === "completed"
        ? theme.colors.success?.DEFAULT || "#22c55e"
        : tool.status === "error"
            ? theme.colors.destructive || "#ef4444"
            : theme.colors.muted_foreground

    const statusDot = tool.status === "completed" ? "●" : tool.status === "error" ? "✗" : "○"

    return (
        <div style={{
            border: `1px solid ${theme.colors.neutral[700]}`,
            borderRadius: "8px",
            overflow: "hidden",
            fontSize: "0.82em",
            backgroundColor: theme.colors.neutral[900],
            marginBottom: "4px",
        }}>
            <button
                onClick={() => setIsOpen(o => !o)}
                style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "7px 12px",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: theme.colors.foreground,
                    gap: "8px",
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Terminal size={12} style={{ color: theme.colors.primary[400] }} />
                    <span style={{ fontFamily: "monospace", color: theme.colors.primary[300], fontWeight: 600 }}>
                        {tool.name}
                    </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ color: statusColor, fontSize: "0.9em" }}>{statusDot} {tool.status || "pending"}</span>
                    {isOpen ? <ChevronDownIcon size={12} /> : <ChevronRight size={12} />}
                </div>
            </button>

            {isOpen && (
                <div style={{ borderTop: `1px solid ${theme.colors.neutral[700]}`, padding: "10px 12px" }}>
                    {/* Args */}
                    <div style={{ marginBottom: "8px" }}>
                        <div style={{ color: theme.colors.muted_foreground, fontSize: "0.9em", marginBottom: "4px" }}>
                            Input
                        </div>
                        <pre style={{
                            backgroundColor: theme.colors.neutral[800],
                            borderRadius: "6px",
                            padding: "8px",
                            overflowX: "auto",
                            margin: 0,
                            color: theme.colors.neutral[200],
                            fontFamily: "monospace",
                            fontSize: "0.88em",
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-all"
                        }}>
                            {(() => {
                                try {
                                    const a = typeof tool.args === "string" ? JSON.parse(tool.args) : tool.args
                                    return JSON.stringify(a, null, 2)
                                } catch { return String(tool.args || "{}") }
                            })()}
                        </pre>
                    </div>
                    {/* Output */}
                    {tool.output && (
                        <div>
                            <div style={{ color: theme.colors.muted_foreground, fontSize: "0.9em", marginBottom: "4px" }}>
                                Output
                            </div>
                            <pre style={{
                                backgroundColor: theme.colors.neutral[800],
                                borderRadius: "6px",
                                padding: "8px",
                                overflowX: "auto",
                                margin: 0,
                                color: theme.colors.neutral[200],
                                fontFamily: "monospace",
                                fontSize: "0.88em",
                                whiteSpace: "pre-wrap",
                                maxHeight: "200px",
                                overflow: "auto",
                                wordBreak: "break-all"
                            }}>
                                {typeof tool.output === "string" ? tool.output : JSON.stringify(tool.output, null, 2)}
                            </pre>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

// ─── Approval Card ────────────────────────────────────────────────────────────
function ApprovalCard({ msg, onApprove, onReject, theme }) {
    return (
        <div style={{
            border: `1px solid ${theme.colors.neutral[600]}`,
            borderRadius: "10px",
            overflow: "hidden",
            marginTop: "8px",
            backgroundColor: theme.colors.neutral[900],
        }}>
            {/* Header */}
            <div style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 14px",
                backgroundColor: theme.colors.neutral[800],
                borderBottom: `1px solid ${theme.colors.neutral[700]}`,
            }}>
                <AlertTriangle size={14} style={{ color: theme.colors.neutral[400] }} />
                <span style={{
                    fontSize: "0.82em",
                    fontWeight: 600,
                    color: theme.colors.neutral[200],
                    textTransform: "uppercase",
                    letterSpacing: "0.05em"
                }}>
                    Awaiting Approval
                </span>
            </div>

            {/* Tool calls list */}
            <div style={{ padding: "10px 14px" }}>
                <div style={{ fontSize: "0.8em", color: theme.colors.muted_foreground, marginBottom: "8px" }}>
                    The agent wants to run:
                </div>
                {msg.pending_tool_calls?.map((tool, idx) => (
                    <div key={idx} style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "8px",
                        marginBottom: "6px",
                        padding: "7px 10px",
                        backgroundColor: theme.colors.neutral[800],
                        borderRadius: "6px",
                        fontFamily: "monospace",
                        fontSize: "0.82em",
                    }}>
                        <Zap size={12} style={{ color: theme.colors.primary[400], marginTop: "2px", flexShrink: 0 }} />
                        <div>
                            <span style={{ color: theme.colors.primary[300], fontWeight: 600 }}>
                                {tool.function?.name || tool.name}
                            </span>
                            <span style={{ color: theme.colors.neutral[400] }}>
                                ({(() => {
                                    try {
                                        const a = tool.function?.arguments || tool.args || "{}"
                                        return JSON.stringify(typeof a === "string" ? JSON.parse(a) : a)
                                    } catch { return String(tool.function?.arguments || tool.args || "") }
                                })()})
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Action Buttons */}
            <div style={{
                display: "flex",
                gap: "8px",
                padding: "10px 14px",
                borderTop: `1px solid ${theme.colors.neutral[700]}`,
                backgroundColor: theme.colors.neutral[850] || theme.colors.neutral[800],
            }}>
                <button
                    onClick={onApprove}
                    style={{
                        display: "flex", alignItems: "center", gap: "6px",
                        padding: "7px 16px",
                        backgroundColor: theme.colors.neutral[700],
                        color: theme.colors.foreground,
                        border: `1px solid ${theme.colors.neutral[600]}`,
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontSize: "0.82em",
                        fontWeight: 500,
                        transition: "all 0.15s",
                    }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = theme.colors.neutral[600]}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = theme.colors.neutral[700]}
                >
                    <Check size={13} /> Approve &amp; Run
                </button>
                <button
                    onClick={onReject}
                    style={{
                        display: "flex", alignItems: "center", gap: "6px",
                        padding: "7px 16px",
                        backgroundColor: "transparent",
                        color: theme.colors.muted_foreground,
                        border: `1px solid ${theme.colors.neutral[700]}`,
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontSize: "0.82em",
                        fontWeight: 500,
                        transition: "all 0.15s",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = theme.colors.destructive; e.currentTarget.style.color = theme.colors.destructive }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = theme.colors.neutral[700]; e.currentTarget.style.color = theme.colors.muted_foreground }}
                >
                    <X size={13} /> Reject
                </button>
            </div>
        </div>
    )
}

// ─── Resolved Approval Badge ──────────────────────────────────────────────────
function ApprovalBadge({ decision, theme }) {
    const isApproved = decision === "approved"
    return (
        <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
            padding: "4px 10px",
            borderRadius: "6px",
            fontSize: "0.78em",
            marginTop: "6px",
            backgroundColor: isApproved
                ? (theme.colors.success?.subtle || "rgba(34,197,94,0.1)")
                : "rgba(239,68,68,0.08)",
            border: `1px solid ${isApproved ? (theme.colors.success?.DEFAULT || "#22c55e") : theme.colors.destructive}`,
            color: isApproved ? (theme.colors.success?.DEFAULT || "#22c55e") : theme.colors.destructive,
        }}>
            {isApproved ? <Check size={11} /> : <X size={11} />}
            {isApproved ? "Approved — running..." : "Rejected"}
        </div>
    )
}

// ─── Message Row ──────────────────────────────────────────────────────────────
function MessageRow({ msg, onApprove, onReject, approvalDecisions, theme }) {
    const isUser = msg.sender === "user"
    const decision = approvalDecisions[msg.id]

    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            gap: "2px",
            maxWidth: isUser ? "75%" : "90%",
            alignSelf: isUser ? "flex-end" : "flex-start",
        }}>
            {/* Sender label for bot */}
            {!isUser && (
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    marginBottom: "4px",
                }}>
                    <div style={{
                        width: "20px", height: "20px",
                        borderRadius: "50%",
                        backgroundColor: theme.colors.neutral[700],
                        display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                        <Cpu size={11} style={{ color: theme.colors.neutral[300] }} />
                    </div>
                    <span style={{ fontSize: "0.75em", color: theme.colors.muted_foreground, fontWeight: 500 }}>
                        Prani
                    </span>
                </div>
            )}

            {/* Thinking & Status */}
            {!isUser && (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                    <StatusIndicator status={msg.status} theme={theme} />
                    <ThinkingBlock thoughts={msg.thoughts} theme={theme} />
                </div>
            )}

            {/* Tool Calls */}
            {!isUser && msg.tool_calls?.length > 0 && (
                <div style={{ marginBottom: "6px" }}>
                    {msg.tool_calls.map((t, i) => <ToolCallCard key={i} tool={t} theme={theme} />)}
                </div>
            )}

            {/* Main message */}
            {(msg.text || msg.error) && (
                <div style={{ display: "flex", alignItems: "flex-end", gap: "10px", flexDirection: isUser ? "row-reverse" : "row" }}>
                    {/* User avatar on the right */}
                    {isUser && (
                        <div style={{
                            width: "36px", height: "36px", borderRadius: "50%",
                            backgroundColor: theme.colors.primary[600],
                            display: "flex", alignItems: "center", justifyContent: "center",
                            flexShrink: 0,
                        }}>
                            <User size={18} style={{ color: theme.colors.white }} />
                        </div>
                    )}
                    <div style={{
                        backgroundColor: isUser ? theme.colors.primary[600] : "transparent",
                        border: isUser ? `${theme.borderWidth.sm} solid ${theme.colors.primary[700]}` : "none",
                        color: isUser ? theme.colors.white : theme.colors.foreground,
                        padding: isUser ? `${theme.spacing[3]} ${theme.spacing[4]}` : "1px 0",
                        borderRadius: theme.borderRadius.lg,
                        wordBreak: "break-word",
                        overflowWrap: "anywhere",
                        lineHeight: 1.65,
                        boxShadow: isUser ? theme.shadows.lg : "none",
                        transition: `all ${theme.transitions.normal}`,
                        fontSize: "0.9em",
                        maxWidth: isUser ? "75%" : "100%",
                    }}>
                        {isUser ? (
                            <span style={{ whiteSpace: "pre-wrap" }}>{msg.text}</span>
                        ) : (
                            msg.text ? <MarkdownContent content={msg.text} theme={theme} /> : null
                        )}
                        {msg.error && (
                            <div style={{
                                marginTop: msg.text ? "8px" : "0", padding: "6px 10px",
                                backgroundColor: "rgba(239,68,68,0.08)",
                                border: `1px solid ${theme.colors.destructive}`,
                                borderRadius: "6px",
                                color: theme.colors.destructive, fontSize: "0.85em",
                            }}>
                                {msg.error}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Approval */}
            {!isUser && msg.approval_required && (
                decision ? (
                    <ApprovalBadge decision={decision} theme={theme} />
                ) : (
                    <ApprovalCard
                        msg={msg}
                        theme={theme}
                        onApprove={() => onApprove(msg)}
                        onReject={() => onReject(msg)}
                    />
                )
            )}
        </div>
    )
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState({ theme }) {
    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            gap: "12px",
            color: theme.colors.muted_foreground,
            userSelect: "none",
        }}>
            <div style={{
                width: "44px", height: "44px",
                borderRadius: "12px",
                backgroundColor: theme.colors.neutral[800],
                display: "flex", alignItems: "center", justifyContent: "center",
                border: `1px solid ${theme.colors.border}`,
            }}>
                <Cpu size={20} style={{ color: theme.colors.neutral[500] }} />
            </div>
            <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "0.9em", fontWeight: 500, color: theme.colors.foreground, marginBottom: "4px" }}>
                    Start a conversation
                </div>
                <div style={{ fontSize: "0.78em" }}>
                    Select an agent and type a message below
                </div>
            </div>
        </div>
    )
}

// ─── Main ChatPanel ───────────────────────────────────────────────────────────
export default function ChatPanel({
    messages,
    currentPlan,
    setMessages,
    inputValue,
    setInputValue,
    handleSendMessage,
    selectedAgentId,
    setSelectedAgentId,
    agents,
    streamingIndex,
    isScrolledToBottom,
    setIsScrolledToBottom,
    scrollToBottom,
    onApprove,
    onAbort,
    isStreaming,
}) {
    console.log("ChatPanel Render - currentPlan:", currentPlan)
    const theme = useTheme()
    const messagesEndRef = useRef(null)
    const messagesContainerRef = useRef(null)
    const [approvalDecisions, setApprovalDecisions] = useState({})
    const [isFocused, setIsFocused] = useState(false)

    const [isPlanExpanded, setIsPlanExpanded] = useState(true)

    // Auto-scroll
    useEffect(() => {
        if (isScrolledToBottom) {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
        }
    }, [messages, isScrolledToBottom])

    const handleScroll = () => {
        if (!messagesContainerRef.current) return
        const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current
        setIsScrolledToBottom(scrollHeight - scrollTop - clientHeight < 100)
    }

    const handleApproveMsg = useCallback((msg) => {
        setApprovalDecisions(prev => ({ ...prev, [msg.id]: "approved" }))
        onApprove(msg.pending_tool_calls)
    }, [onApprove])

    const handleRejectMsg = useCallback((msg) => {
        setApprovalDecisions(prev => ({ ...prev, [msg.id]: "rejected" }))
    }, [])

    const selectedAgent = agents.find(a => a.id === selectedAgentId)

    return (
        <div style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            backgroundColor: theme.colors.background,
            height: "100%",
            overflow: "hidden",
        }}>
            {/* Plan Area - Only show while streaming */}
            {isStreaming && (() => {
                let safeSubtasks = [];
                if (currentPlan) {
                    const planObj = currentPlan.plan || currentPlan;
                    if (planObj.subtasks && planObj.execution_order && Array.isArray(planObj.execution_order)) {
                        safeSubtasks = planObj.execution_order.map(id => planObj.subtasks[id]).filter(Boolean);
                    } else if (Array.isArray(planObj.subtasks)) {
                        safeSubtasks = planObj.subtasks;
                    } else if (planObj.subtasks && typeof planObj.subtasks === 'object') {
                        safeSubtasks = Object.values(planObj.subtasks);
                    }
                }

                if (safeSubtasks.length === 0) return null;

                return (
                    <div style={{
                        margin: "20px 40px 0 40px",
                        padding: "16px 20px",
                        backgroundColor: theme.colors.neutral[900],
                        borderRadius: "12px",
                        border: `1px solid ${theme.colors.neutral[800]}`,
                        boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                        maxHeight: isPlanExpanded ? "40%" : "auto",
                        overflowY: isPlanExpanded ? "auto" : "hidden",
                        flexShrink: 0,
                        transition: "all 0.3s ease",
                        zIndex: 10
                    }} className="hover-scrollbar">
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                cursor: "pointer",
                                userSelect: "none"
                            }}
                            onClick={() => setIsPlanExpanded(!isPlanExpanded)}
                        >
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <div style={{
                                    width: "28px", height: "28px", borderRadius: "8px",
                                    backgroundColor: theme.colors.primary[900], color: theme.colors.primary[400],
                                    display: "flex", alignItems: "center", justifyContent: "center"
                                }}>
                                    <Check size={16} strokeWidth={2.5} />
                                </div>
                                <div>
                                    <div style={{ fontSize: "0.9em", fontWeight: 600, color: theme.colors.neutral[200], letterSpacing: "0.02em" }}>Execution Plan</div>
                                    <div style={{ fontSize: "0.75em", color: theme.colors.muted_foreground, marginTop: "2px" }}>
                                        {safeSubtasks.filter(s => s.status === 'COMPLETED' || s.status === 'SUCCESS').length} of {safeSubtasks.length} steps completed
                                    </div>
                                </div>
                            </div>

                            <div style={{
                                marginLeft: "auto",
                                width: "28px", height: "28px", borderRadius: "50%",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                backgroundColor: isPlanExpanded ? theme.colors.neutral[800] : "transparent",
                                color: isPlanExpanded ? theme.colors.foreground : theme.colors.muted_foreground,
                                transition: "all 0.2s"
                            }}>
                                {isPlanExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                            </div>
                        </div>

                        {isPlanExpanded && (
                            <div style={{ display: "flex", flexDirection: "column", gap: "2px", marginTop: "16px", marginLeft: "4px" }}>
                                {safeSubtasks.map((st, i) => {
                                    const isDone = st.status === "COMPLETED" || st.status === "SUCCESS";
                                    const isActive = st.status === "IN_PROGRESS";
                                    const isPending = st.status === "PENDING";

                                    return (
                                        <div key={st.id || i} style={{
                                            display: "flex", alignItems: "flex-start", gap: "14px",
                                            fontSize: "0.85em", color: theme.colors.foreground,
                                            padding: "10px 12px",
                                            backgroundColor: isActive ? theme.colors.neutral[800] : "transparent",
                                            borderRadius: "8px",
                                            transition: "all 0.2s ease",
                                            opacity: isPending ? 0.5 : 1,
                                        }}>
                                            <div style={{
                                                display: "flex", alignItems: "center", justifyContent: "center",
                                                width: "20px", height: "20px", borderRadius: "50%",
                                                backgroundColor: isDone ? (theme.colors.success?.DEFAULT || "#22c55e") :
                                                    isActive ? theme.colors.primary[500] : theme.colors.neutral[800],
                                                border: (!isDone && !isActive) ? `1px solid ${theme.colors.neutral[600]}` : "none",
                                                color: theme.colors.white,
                                                flexShrink: 0,
                                                marginTop: "1px",
                                                boxShadow: isActive ? `0 0 0 3px ${theme.colors.primary[900]}` : "none"
                                            }}>
                                                {isDone && <Check size={12} strokeWidth={3} />}
                                                {isActive && <div style={{ width: "6px", height: "6px", backgroundColor: "white", borderRadius: "50%", animation: "pulse 1.5s infinite" }} />}
                                            </div>
                                            <div style={{ display: "flex", flexDirection: "column" }}>
                                                <span style={{
                                                    textDecoration: isDone ? "line-through" : "none",
                                                    color: isDone ? theme.colors.neutral[400] : (isActive ? theme.colors.neutral[100] : theme.colors.neutral[300]),
                                                    fontWeight: isActive ? 500 : 400,
                                                    lineHeight: "1.4"
                                                }}>{st.description}</span>
                                                {isActive && st.result && (
                                                    <span style={{ fontSize: "0.9em", color: theme.colors.primary[400], marginTop: "4px" }}>Executing...</span>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                );
            })()}

            {/* Messages Area */}
            <div
                ref={messagesContainerRef}
                onScroll={handleScroll}
                className="hover-scrollbar"
                style={{
                    flex: 1,
                    overflowY: "auto",
                    overflowX: "hidden",
                    padding: "24px 40px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "20px",
                }}
            >
                {messages.length === 0 ? (
                    <EmptyState theme={theme} />
                ) : (
                    messages.map((msg, idx) => (
                        <MessageRow
                            key={msg.id || idx}
                            msg={msg}
                            theme={theme}
                            onApprove={handleApproveMsg}
                            onReject={handleRejectMsg}
                            approvalDecisions={approvalDecisions}
                        />
                    ))
                )}

                {/* Streaming indicator */}
                {isStreaming && (
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", alignSelf: "flex-start" }}>
                        <div style={{
                            width: "24px", height: "24px", borderRadius: "50%",
                            backgroundColor: theme.colors.neutral[700],
                            display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                            <Cpu size={13} style={{ color: theme.colors.neutral[300] }} />
                        </div>
                        <span style={{ fontSize: "0.85em", color: theme.colors.muted_foreground, fontStyle: "italic", marginLeft: "4px" }}>
                            Understanding user query
                        </span>
                        <div style={{ display: "flex", gap: "3px", alignItems: "center", marginLeft: "2px" }}>
                            {[0, 1, 2].map(i => (
                                <span key={i} style={{
                                    width: "4px", height: "4px", borderRadius: "50%",
                                    backgroundColor: theme.colors.primary[400],
                                    animation: "pulse 1.2s ease-in-out infinite",
                                    animationDelay: `${i * 0.2}s`,
                                    display: "inline-block",
                                }} />
                            ))}
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Scroll Button */}
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
                        width: "40px", height: "40px",
                        padding: 0,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        boxShadow: theme.shadows.lg,
                        zIndex: 10,
                    }}
                >
                    <ChevronDown size={20} />
                </Button>
            )}

            {/* Input Area */}
            <div style={{ padding: `0 ${theme.spacing[6]} ${theme.spacing[6]}` }}>
                <div
                    style={{
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
                    onFocus={e => {
                        e.currentTarget.style.outline = `2px solid ${theme.colors.primary[500]}`
                        e.currentTarget.style.boxShadow = theme.shadows.lg
                    }}
                    onBlur={e => {
                        e.currentTarget.style.outline = "2px solid transparent"
                        e.currentTarget.style.boxShadow = theme.shadows.md
                    }}
                    tabIndex={0}
                >
                    <textarea
                        value={inputValue}
                        onChange={e => setInputValue(e.target.value)}
                        onKeyDown={e => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault()
                                handleSendMessage()
                            }
                        }}
                        disabled={isStreaming}
                        rows={2}
                        placeholder={isStreaming ? "Agent is working..." : "Write a message..."}
                        style={{
                            padding: `${theme.spacing[4]} ${theme.spacing[5]}`,
                            backgroundColor: "transparent",
                            color: isStreaming ? theme.colors.neutral[500] : theme.colors.foreground,
                            resize: "none",
                            border: "none",
                            outline: "none",
                            fontFamily: "inherit",
                            fontSize: theme.typography.fontSize.sm,
                            overflowY: "auto",
                            lineHeight: "1.6",
                            opacity: isStreaming ? 0.6 : 1,
                        }}
                        onInput={e => {
                            const textarea = e.target
                            textarea.style.height = "auto"
                            const newHeight = Math.min(textarea.scrollHeight, 6 * 24 + 48)
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
                        {/* Agent Selection Combobox */}
                        <div style={{ position: "relative", width: "auto", zIndex: 50, minWidth: "200px" }}>
                            <Combobox value={selectedAgentId} onValueChange={setSelectedAgentId} variant="ghost" size="md">
                                <ComboboxTrigger style={{ justifyContent: "flex-start" }}>
                                    {selectedAgent ? selectedAgent.name : "Select Agent"}
                                </ComboboxTrigger>
                                <ComboboxContent>
                                    <ComboboxSearch placeholder="Search agents..." />
                                    {agents.map(agent => (
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
                                    {agents.length === 0 && (
                                        <div style={{ padding: "8px", color: theme.colors.muted_foreground }}>No agents found</div>
                                    )}
                                </ComboboxContent>
                            </Combobox>
                        </div>

                        {/* Send / Stop Button */}
                        {isStreaming ? (
                            <Button
                                onClick={onAbort}
                                variant="destructive"
                                size="md"
                                style={{
                                    flexShrink: 0,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    width: "40px",
                                    height: "40px",
                                    padding: 0,
                                    backgroundColor: theme.colors.destructive,
                                }}
                            >
                                <X size={16} />
                            </Button>
                        ) : (
                            <Button
                                onClick={handleSendMessage}
                                disabled={!inputValue.trim() || !selectedAgentId}
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
                        )}
                    </div>
                </div>
            </div>

            {/* Pulse animation */}
            <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
      `}</style>
        </div>
    )
}
