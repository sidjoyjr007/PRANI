import { useState, useRef, useEffect, useCallback, memo, useMemo } from "react"
import { useTheme } from "@/context/ThemeContext"
import { Button } from "@/components/ui/button"
import { Text } from "@/components/ui/text"
import { Avatar } from "@/components/ui/avatar"
import { CommandPalette } from "@/components/ui/command-palette"
import {
    Send, User, Bot, Check, X, ChevronDown,
    Terminal, Cpu, ChevronRight, ChevronDown as ChevronDownIcon,
    AlertTriangle, Zap, Clock, Pause, ChevronUp, MessageSquarePlus, Lightbulb
} from "lucide-react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import logo from "@/assets/prani-logo.svg"

// ─── Markdown Renderer ───────────────────────────────────────────────────────
// ─── Markdown Renderer ───────────────────────────────────────────────────────
const MarkdownContent = memo(({ content, theme, textColor }) => {
    const baseColor = textColor || theme.colors.foreground;
    const scrubbedContent = useMemo(() => {
        if (typeof content !== 'string') return content;

        return content
            .replace(/<thinking>[\s\S]*?(?:<\/thinking>|$)/g, '')
            .replace(/```json[\s\S]*?```/g, '')
            .replace(/\{[\s\S]*?"tool_calls"[\s\S]*?\}/g, '')
            .replace(/\{[\s\S]*?"text"[\s\S]*?\}/g, '')
            .replace(/\[INTENT:[^\]]*\]\s*/g, '')
            .replace(/\[SOURCE TOOL:[^\]]*\]\s*/g, '')
            .replace(/^[\s\{\}\[\]\"\:,\\]+$/gm, '')
            .trim();
    }, [content]);

    if (!scrubbedContent) return null;

    return (
        <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
                p: ({ children }) => (
                    <p style={{ margin: "0 0 8px 0", lineHeight: 1.65, color: baseColor }}>{children}</p>
                ),
                code: ({ node, inline, className, children, ...props }) => {
                    const isBlock = className?.startsWith("language-") || String(children).includes("\n")
                    if (!isBlock) {
                        return (
                            <code style={{
                                backgroundColor: "rgba(99,102,241,0.12)",
                                color: theme.colors.primary[400],
                                padding: "1px 6px",
                                borderRadius: "4px",
                                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                                fontSize: "0.85em",
                                fontWeight: 500,
                                border: `1px solid rgba(99,102,241,0.2)`,
                                whiteSpace: "nowrap",
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
                ul: ({ className, children, ...props }) => (
                    <ul className={className} style={{
                        margin: "6px 0",
                        paddingLeft: className?.includes('contains-task-list') ? "0" : "20px",
                        color: baseColor,
                        listStyle: className?.includes('contains-task-list') ? 'none' : 'disc'
                    }} {...props}>
                        {children}
                    </ul>
                ),
                ol: ({ children }) => <ol style={{ margin: "6px 0", paddingLeft: "20px", color: baseColor }}>{children}</ol>,
                li: ({ className, children, ...props }) => (
                    <li className={className} style={{
                        marginBottom: "4px",
                        lineHeight: 1.6,
                        display: className?.includes('task-list-item') ? 'flex' : 'list-item',
                        alignItems: 'flex-start',
                        gap: '8px',
                        color: baseColor
                    }} {...props}>
                        {children}
                    </li>
                ),
                input: ({ type, checked, disabled, ...props }) => {
                    if (type === 'checkbox') {
                        return (
                            <div style={{
                                width: '16px', height: '16px', borderRadius: '4px',
                                border: `1px solid ${checked ? theme.colors.primary[500] : theme.colors.neutral[600]}`,
                                backgroundColor: checked ? theme.colors.primary[500] : 'transparent',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                marginTop: '4px', flexShrink: 0
                            }}>
                                {checked && <Check size={12} color="white" strokeWidth={3} />}
                            </div>
                        )
                    }
                    return <input type={type} checked={checked} disabled={disabled} {...props} />
                },
                h1: ({ children }) => <h1 style={{ fontSize: "1.2em", fontWeight: 700, margin: "12px 0 6px", color: baseColor }}>{children}</h1>,
                h2: ({ children }) => <h2 style={{ fontSize: "1.1em", fontWeight: 600, margin: "10px 0 4px", color: baseColor }}>{children}</h2>,
                h3: ({ children }) => <h3 style={{ fontSize: "1em", fontWeight: 600, margin: "8px 0 4px", color: theme.colors.muted_foreground }}>{children}</h3>,
                blockquote: ({ children }) => (
                    <blockquote style={{
                        borderLeft: `3px solid ${theme.colors.primary[500]}`,
                        paddingLeft: "12px",
                        margin: "8px 0",
                        color: theme.colors.muted_foreground,
                        fontStyle: "italic"
                    }}>{children}</blockquote>
                ),
                a: ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: theme.colors.primary[400], textDecoration: "underline" }}>{children}</a>,
                strong: ({ children }) => <strong style={{ fontWeight: 600, color: baseColor }}>{children}</strong>,
                table: ({ children }) => (
                    <div style={{ overflowX: "auto", margin: "10px 0" }}>
                        <table style={{ borderCollapse: "collapse", width: "100%", fontSize: "0.9em" }}>{children}</table>
                    </div>
                ),
                th: ({ children }) => <th style={{ border: `1px solid ${theme.colors.border}`, padding: "6px 12px", backgroundColor: theme.colors.neutral[800], textAlign: "left", fontWeight: 600 }}>{children}</th>,
                td: ({ children }) => <td style={{ border: `1px solid ${theme.colors.border}`, padding: "6px 12px" }}>{children}</td>,
            }}
        >
            {scrubbedContent}
        </ReactMarkdown>
    )
});

// ─── Thinking / Reasoning Block ───────────────────────────────────────────────
// ─── Thinking / Reasoning Block ───────────────────────────────────────────────
const ThinkingBlock = memo(({ thoughts, theme }) => {
    const hasMeaningfulThoughts = thoughts.some(t => t.trim().length > 0 && t !== "Thinking...");
    if (!hasMeaningfulThoughts) return null;

    return (
        <div style={{
            marginTop: "8px",
            marginBottom: "12px",
            padding: "14px 18px",
            borderRadius: "10px",
            backgroundColor: theme.colors.neutral[50] || 'rgba(0,0,0,0.02)',
            boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
            color: theme.colors.muted_foreground,
            fontSize: "0.85rem",
            lineHeight: 1.6,
            display: "flex",
            flexDirection: "column",
            gap: "8px"
        }}>
            {/* Header */}
            <div style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontWeight: 600,
                color: theme.colors.neutral[500] || '#6b7280',
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                fontSize: "0.75rem",
                userSelect: "none",
                marginBottom: "4px"
            }}>
                <Lightbulb size={14} /> Agent Reasoning
            </div>

            {/* Thoughts */}
            <div style={{
                display: "flex",
                flexDirection: "column",
                gap: "6px",
                fontFamily: "var(--font-mono, monospace)",
                opacity: 0.85
            }}>
                {thoughts.filter(t => t.trim().length > 0 && t !== "Thinking...").map((t, i) => (
                    <div key={i}>{t}</div>
                ))}
            </div>
        </div>
    );
});

const StatusIndicator = memo(({ status, theme }) => {
    if (!status || status.trim().length === 0) return null

    return (
        <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "4px 12px",
            backgroundColor: "rgba(59, 130, 246, 0.18)",
            borderRadius: "16px",
            fontSize: "0.8em",
            color: "#93c5fd",
            marginBottom: "4px",
            border: `1px solid rgba(59, 130, 246, 0.45)`,
        }}>
            <div style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                backgroundColor: "#60a5fa",
                animation: "pulse 1.5s infinite"
            }} />
            <span style={{ fontWeight: 500 }}>{status}</span>
        </div>
    )
});

// ─── Tool Call Card (V3: Clean minimal style) ───────────────────────────────
// ─── Tool Call Card (V3: Clean minimal style) ───────────────────────────────
const ToolCallCard = memo(({ tool, theme }) => {
    const isCompleted = tool.status === 'completed';
    const isRunning = tool.status === 'running';
    const isError = tool.status === 'error';

    const iconColor = isCompleted
        ? "#4ade80"
        : isError
            ? "#f87171"
            : theme.colors.primary[400] || "#60a5fa";

    return (
        <div style={{
            display: "flex",
            alignItems: "center",
            gap: "7px",
            padding: "2px 0",
            fontSize: "0.82em",
            marginBottom: "0px",
            userSelect: "none",
            color: theme.colors.neutral[400],
        }}>
            {isCompleted ? (
                <Check size={13} style={{ color: iconColor, flexShrink: 0 }} />
            ) : isError ? (
                <AlertTriangle size={13} style={{ color: iconColor, flexShrink: 0 }} />
            ) : (
                <Clock size={13} style={{ color: iconColor, flexShrink: 0, animation: "pulse 1.5s infinite" }} />
            )}
            <span style={{ fontWeight: 500, color: theme.colors.neutral[300] }}>{tool.name}</span>
            <span style={{ color: theme.colors.neutral[600], fontSize: "0.88em" }}>
                {isRunning ? "running" : isCompleted ? "done" : "error"}
            </span>
        </div>
    )
});

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
function ApprovalBadge({ decision, msg, theme }) {
    const isApproved = decision === "approved"
    const colorStr = isApproved ? (theme.colors.success?.DEFAULT || "#4ade80") : (theme.colors.destructive || "#f87171");
    
    const visibleToolCalls = (msg?.tool_calls || []).filter(t => {
        const name = t.function?.name || t.name;
        return !['add_subtasks', 'update_subtask_status', 'update_workspace', 'read_tool_results', 'search_tool_registry'].includes(name);
    });
    let toolStr = "Action";
    if (visibleToolCalls.length > 0) {
        toolStr = visibleToolCalls.map(t => t.function?.name || t.name).filter(Boolean).join(", ") || "Action";
    }
    
    return (
        <div style={{
            display: "flex",
            width: "100%",
            boxSizing: "border-box",
            alignItems: "center",
            gap: "8px",
            padding: "8px 12px",
            borderRadius: "8px",
            fontSize: "0.82em",
            fontWeight: 500,
            marginTop: "6px",
            backgroundColor: isApproved 
                ? "rgba(74, 222, 128, 0.05)" 
                : "rgba(248, 113, 113, 0.05)",
            border: `1px solid ${isApproved ? "rgba(74, 222, 128, 0.2)" : "rgba(248, 113, 113, 0.2)"}`,
            color: colorStr,
            boxShadow: `0 2px 10px ${isApproved ? "rgba(74, 222, 128, 0.05)" : "rgba(248, 113, 113, 0.05)"}`,
            backdropFilter: "blur(8px)",
        }}>
            {isApproved ? <Check size={12} strokeWidth={2.5} /> : <X size={12} strokeWidth={2.5} />}
            <span style={{ letterSpacing: "0.02em" }}>{isApproved ? "Approved" : "Rejected"} <span style={{ fontWeight: 700 }}>{toolStr}</span></span>
        </div>
    )
}

// ─── Message Row ──────────────────────────────────────────────────────────────
// ─── Message Row ──────────────────────────────────────────────────────────────
const MessageRow = memo(({ msg, showLabel, onApprove, onReject, approvalDecisions, theme }) => {
    const isUser = msg.sender === "user"
    const decision = approvalDecisions[msg.id]

    // Internal Tool Hijacking: Filter out internal workspace tools from the UI Log
    const visibleToolCalls = (msg.tool_calls || []).filter(t =>
        !['add_subtasks', 'update_subtask_status', 'update_workspace', 'read_tool_results', 'search_tool_registry'].includes(t.name)
    );

    // Optimized visibility checks
    const hasTextContent = useMemo(() => {
        const text = msg.text || "";
        const scrubbed = !isUser ? text
            .replace(/<thinking>[\s\S]*?(?:<\/thinking>|$)/g, '')
            .replace(/\[INTENT:[^\]]*\]\s*/g, '')
            .replace(/\[SOURCE TOOL:[^\]]*\]\s*/g, '')
            .replace(/[\{\}\[\]\"\:,\\]/g, '').trim() : text.trim();
        return scrubbed.length > 0 && (isUser || /[a-zA-Z0-9]/.test(scrubbed));
    }, [msg.text, isUser]);

    const hasMeaningfulThoughts = useMemo(() =>
        (msg.thoughts || []).some(t => t.trim().length > 0 && t !== "Thinking..."),
        [msg.thoughts]);

    const hasVisibleContent = showLabel || visibleToolCalls.length > 0 || hasMeaningfulThoughts || (msg.status && msg.status.trim()) || hasTextContent || msg.error || msg.approval_required;

    if (!hasVisibleContent) return null;

    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            gap: "2px",
            maxWidth: isUser ? "75%" : "100%",
            alignSelf: isUser ? "flex-end" : "flex-start",
            marginBottom: showLabel ? "6px" : "0",
        }}>
            {!isUser && showLabel && (
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <img src={logo} alt="Prani Logo" style={{ height: "16px", width: "auto", display: "block" }} />
                    </div>
                </div>
            )}

            {!isUser && (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                    <StatusIndicator status={msg.status} theme={theme} />
                    <ThinkingBlock thoughts={msg.thoughts} theme={theme} />
                </div>
            )}

            {!isUser && visibleToolCalls.length > 0 && (
                <div style={{ marginBottom: "6px" }}>
                    {visibleToolCalls.map((t, i) => <ToolCallCard key={i} tool={t} theme={theme} />)}
                </div>
            )}

            {(hasTextContent || msg.error) && (
                <div style={{
                    display: "flex",
                    alignItems: "flex-end",
                    gap: "10px",
                    flexDirection: isUser ? "row-reverse" : "row",
                    marginTop: !showLabel && !isUser ? "6px" : "0"
                }}>
                    {isUser && <div style={{ flexShrink: 0 }}><Avatar size="sm" fallback={<User size={16} />} /></div>}
                    <div style={{
                        backgroundColor: isUser ? theme.colors.neutral[100] : "transparent",
                        color: theme.colors.foreground,
                        padding: isUser ? `10px 14px` : "6px 0px",
                        borderRadius: isUser ? theme.borderRadius.lg : "0",
                        wordBreak: "break-word",
                        overflowWrap: "anywhere",
                        lineHeight: 1.6,
                        fontSize: "0.93em",
                        maxWidth: "100%",
                    }}>
                        {isUser ? (
                            <span style={{ whiteSpace: "pre-wrap" }}>{msg.text}</span>
                        ) : (
                            msg.text ? <MarkdownContent content={msg.text} theme={theme} /> : null
                        )}
                        {msg.error && (
                            <div style={{
                                marginTop: "8px", padding: "6px 10px",
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

            {!isUser && msg.approval_required && (
                decision ? (
                    <ApprovalBadge decision={decision} msg={msg} theme={theme} />
                ) : (
                    <ApprovalCard msg={msg} theme={theme} onApprove={() => onApprove(msg)} onReject={() => onReject(msg)} />
                )
            )}
        </div>
    )
});

// ─── Plan Overlay ─────────────────────────────────────────────────────────────
const PlanOverlay = memo(({ currentPlan, theme, isPlanExpanded, setIsPlanExpanded }) => {
    let markdownString = "";
    if (typeof currentPlan === 'string') {
        markdownString = currentPlan;
    } else if (currentPlan && currentPlan.plan && typeof currentPlan.plan === 'string') {
        markdownString = currentPlan.plan;
    }

    if (!markdownString || !markdownString.trim()) return null;

    // Simple parser for checkboxes to show progress stats
    const totalCheckboxes = (markdownString.match(/- \[\s?[xX]?\s?\]/g) || []).length;
    const completedCheckboxes = (markdownString.match(/- \[[xX]\]/g) || []).length;

    return (
        <div style={{
            margin: "20px 40px 0 40px",
            padding: "16px 20px",
            backgroundColor: theme.colors.neutral[900],
            borderRadius: "12px",
            border: `1px solid ${theme.colors.neutral[800]}`,
            boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
            maxHeight: isPlanExpanded ? "60%" : "auto",
            overflowY: isPlanExpanded ? "auto" : "hidden",
            flexShrink: 0,
            transition: "all 0.3s ease",
            zIndex: 10
        }} className="hover-scrollbar">
            <div
                style={{ display: "flex", alignItems: "center", cursor: "pointer", userSelect: "none" }}
                onClick={() => setIsPlanExpanded(!isPlanExpanded)}
            >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{
                        width: "28px", height: "28px", borderRadius: "8px",
                        backgroundColor: theme.colors.primary[900],
                        color: theme.colors.primary[400],
                        display: "flex", alignItems: "center", justifyContent: "center"
                    }}>
                        <Check size={16} strokeWidth={2.5} />
                    </div>
                    <div>
                        <div style={{ fontSize: "0.9em", fontWeight: 600, color: theme.colors.neutral[200], letterSpacing: "0.02em" }}>
                            Agent Workspace
                        </div>
                        {totalCheckboxes > 0 && (
                            <div style={{ fontSize: "0.75em", color: theme.colors.muted_foreground, marginTop: "2px" }}>
                                {completedCheckboxes} of {totalCheckboxes} tasks completed
                            </div>
                        )}
                        {totalCheckboxes === 0 && (
                            <div style={{ fontSize: "0.75em", color: theme.colors.muted_foreground, marginTop: "2px" }}>
                                Active planning session
                            </div>
                        )}
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
                <div style={{
                    marginTop: "16px",
                    paddingTop: "16px",
                    borderTop: `1px solid ${theme.colors.neutral[800]}`,
                    fontSize: "0.95em",
                    color: theme.colors.neutral[200] || theme.colors.foreground,
                    lineHeight: "1.6"
                }}>
                    <MarkdownContent content={markdownString} theme={theme} textColor={theme.colors.neutral[200] || theme.colors.foreground} />
                </div>
            )}
        </div>
    );
});

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
                <MessageSquarePlus size={20} style={{ color: theme.colors.neutral[500] }} />
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
    isCenteredMode,
}) {
    const theme = useTheme()
    const messagesEndRef = useRef(null)
    const messagesContainerRef = useRef(null)
    const [approvalDecisions, setApprovalDecisions] = useState({})
    const [isFocused, setIsFocused] = useState(false)
    const [isPlanExpanded, setIsPlanExpanded] = useState(true)
    const [isAgentPaletteOpen, setIsAgentPaletteOpen] = useState(false)

    // Auto-scroll logic (Optimized for performance)
    const lastScrollTime = useRef(0);
    useEffect(() => {
        if (isScrolledToBottom && messages.length > 0) {
            const now = Date.now();
            // Throttle scroll updates to prevent UI thrashing during high-speed streaming
            if (now - lastScrollTime.current > 100) {
                messagesEndRef.current?.scrollIntoView({ behavior: isStreaming ? "auto" : "smooth" });
                lastScrollTime.current = now;
            }
        }
    }, [messages, isScrolledToBottom, isStreaming]);

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

    // ─── Centered No-Agent Layout ─────────────────────────────────────────────
    if (isCenteredMode) {
        return (
            <div style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: theme.colors.background,
                height: "100%",
                overflow: "hidden",
                padding: "0 24px",
            }}>
                {/* Prani logo + heading */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", marginBottom: "32px" }}>
                    <img src={logo} alt="Prani Logo" style={{ height: "40px", width: "auto", opacity: 0.9 }} />
                    <div style={{ fontSize: "1.05em", fontWeight: 500, color: theme.colors.muted_foreground, letterSpacing: "0.02em" }}>
                        Select an agent to get started
                    </div>
                </div>

                {/* Centered Input Box */}
                <div style={{ width: "100%", maxWidth: "680px" }}>
                    <div
                        style={{
                            position: "relative",
                            backgroundColor: theme.colors.card,
                            border: `1px solid ${theme.colors.border}`,
                            borderRadius: "28px",
                            boxShadow: "0 8px 32px rgba(0,0,0,0.08), 0 2px 14px rgba(0,0,0,0.04)",
                            transition: "box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.3s ease",
                            display: "flex",
                            flexDirection: "column",
                            maxHeight: "500px",
                            overflow: "hidden",
                        }}
                        onFocus={e => {
                            e.currentTarget.style.boxShadow = `0 0 0 4px ${theme.colors.primary[100]}, 0 12px 40px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.06)`
                            e.currentTarget.style.borderColor = theme.colors.primary[400]
                        }}
                        onBlur={e => {
                            e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,0,0,0.08), 0 2px 14px rgba(0,0,0,0.04)"
                            e.currentTarget.style.borderColor = theme.colors.border
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
                            disabled={!selectedAgentId}
                            rows={3}
                            placeholder={selectedAgentId ? "Write a message... (Enter to send, Shift+Enter for newline)" : "Pick an agent below, then type your message..."}
                            style={{
                                padding: "20px 24px 10px",
                                backgroundColor: "transparent",
                                color: theme.colors.foreground,
                                resize: "none",
                                border: "none",
                                outline: "none",
                                fontFamily: "inherit",
                                fontSize: "0.9rem",
                                overflowY: "auto",
                                lineHeight: "1.65",
                                opacity: selectedAgentId ? 1 : 0.45,
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
                            padding: "10px 16px 16px",
                            borderTop: `1px solid ${theme.colors.neutral[100]}`,
                            gap: theme.spacing[3],
                        }}>
                            {/* Agent Selector Button */}
                            <button
                                onClick={() => setIsAgentPaletteOpen(true)}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "6px",
                                    padding: "8px 16px",
                                    borderRadius: "24px",
                                    border: `1px solid ${selectedAgentId ? theme.colors.primary[300] : theme.colors.neutral[200]}`,
                                    backgroundColor: selectedAgentId ? theme.colors.primary[50] : "transparent",
                                    color: selectedAgentId ? theme.colors.primary[700] : theme.colors.muted_foreground,
                                    fontFamily: "inherit",
                                    fontSize: "0.82rem",
                                    fontWeight: selectedAgentId ? 500 : 400,
                                    cursor: "pointer",
                                    transition: "all 0.15s ease",
                                    whiteSpace: "nowrap",
                                    maxWidth: "220px",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.borderColor = theme.colors.primary[400]
                                    e.currentTarget.style.backgroundColor = theme.colors.primary[50]
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.borderColor = selectedAgentId ? theme.colors.primary[300] : theme.colors.neutral[200]
                                    e.currentTarget.style.backgroundColor = selectedAgentId ? theme.colors.primary[50] : "transparent"
                                }}
                            >
                                <Cpu size={13} style={{ flexShrink: 0 }} />
                                <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
                                    {agents.find(a => a.id === selectedAgentId)?.name || "Select Agent"}
                                </span>
                                <ChevronDown size={11} style={{ flexShrink: 0, opacity: 0.6 }} />
                            </button>

                            {/* Send Button */}
                            <button
                                onClick={handleSendMessage}
                                disabled={!inputValue.trim() || !selectedAgentId}
                                style={{
                                    flexShrink: 0,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    width: "42px",
                                    height: "42px",
                                    borderRadius: "50%",
                                    border: "none",
                                    cursor: (!inputValue.trim() || !selectedAgentId) ? "not-allowed" : "pointer",
                                    backgroundColor: (!inputValue.trim() || !selectedAgentId) ? theme.colors.neutral[200] : theme.colors.primary[600],
                                    color: (!inputValue.trim() || !selectedAgentId) ? theme.colors.neutral[400] : "#ffffff",
                                    transition: "background-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease",
                                    boxShadow: (!inputValue.trim() || !selectedAgentId) ? "none" : "0 4px 14px rgba(79,111,150,0.45)",
                                }}
                                onMouseEnter={e => { 
                                    if (!e.currentTarget.disabled) {
                                        e.currentTarget.style.transform = "scale(1.08)"
                                        e.currentTarget.style.boxShadow = "0 6px 20px rgba(79,111,150,0.55)"
                                    } 
                                }}
                                onMouseLeave={e => { 
                                    e.currentTarget.style.transform = "scale(1)"
                                    if (!e.currentTarget.disabled) {
                                        e.currentTarget.style.boxShadow = "0 4px 14px rgba(79,111,150,0.45)"
                                    }
                                }}
                            >
                                <Send size={15} />
                            </button>
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

                {/* Agent Command Palette */}
                <CommandPalette
                    isOpen={isAgentPaletteOpen}
                    onClose={() => setIsAgentPaletteOpen(false)}
                    title="Select Agent"
                    description="Choose an agent to power this conversation."
                    placeholder="Search agents..."
                    items={agents.map(a => ({ id: String(a.id), label: a.name, description: a.instructions ? a.instructions.slice(0, 80) + (a.instructions.length > 80 ? '...' : '') : undefined }))}
                    selectedIds={selectedAgentId ? [String(selectedAgentId)] : []}
                    onSelect={(id) => { setSelectedAgentId(id); setIsAgentPaletteOpen(false) }}
                    onDeselect={() => { setSelectedAgentId(""); setIsAgentPaletteOpen(false) }}
                    emptyMessage="No agents found."
                />
            </div>
        )
    }

    return (
        <div style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            backgroundColor: theme.colors.background,
            height: "100%",
            overflow: "hidden",
        }}>
            {/* Plan Area - Persistent Mission Control */}
            <PlanOverlay
                currentPlan={currentPlan}
                theme={theme}
                isPlanExpanded={isPlanExpanded}
                setIsPlanExpanded={setIsPlanExpanded}
            />

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
                    gap: "8px", // Aggressively squashed whitespace
                }}
            >
                {messages.length === 0 ? (
                    <EmptyState theme={theme} />
                ) : (
                    messages.map((msg, idx) => {
                        const prevMsg = messages[idx - 1];
                        // Consolidated Label Logic: Only show "Prani" if sender changed or run changed
                        const showLabel = !prevMsg || prevMsg.sender !== msg.sender || (prevMsg.run_id !== msg.run_id && msg.run_id);

                        return (
                            <MessageRow
                                key={msg.id || idx}
                                msg={msg}
                                showLabel={showLabel}
                                theme={theme}
                                onApprove={handleApproveMsg}
                                onReject={handleRejectMsg}
                                approvalDecisions={approvalDecisions}
                            />
                        );
                    })
                )}

                {/* Streaming indicator */}
                {isStreaming && (
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", alignSelf: "flex-start", marginBottom: "12px" }}>
                        <div style={{
                            width: "24px", height: "24px", borderRadius: "50%",
                            backgroundColor: theme.colors.neutral[800],
                            display: "flex", alignItems: "center", justifyContent: "center",
                            border: `1px solid ${theme.colors.neutral[700]}`
                        }}>
                            <Lightbulb size={13} style={{ color: theme.colors.primary[400] }} />
                        </div>
                        <span style={{ fontSize: "0.85em", color: theme.colors.muted_foreground, fontStyle: "italic", fontWeight: 500 }}>
                            {messages[messages.length - 1]?.status || "Thinking..."}
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
            {
                !isScrolledToBottom && messages.length > 0 && (
                    <Button
                        onClick={scrollToBottom}
                        variant="primary"
                        size="sm"
                        style={{
                            position: "absolute",
                            bottom: "160px", // Moved higher to ensure it doesn't block the input area
                            left: "50%",
                            transform: "translateX(-50%)",
                            borderRadius: "50%",
                            width: "36px", height: "36px",
                            padding: 0,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                            zIndex: 60,
                            backgroundColor: theme.colors.primary[600],
                            border: `1px solid ${theme.colors.primary[500]}`,
                        }}
                    >
                        <ChevronDown size={20} />
                    </Button>
                )
            }

            {/* Input Area */}
            <div style={{ padding: "0 24px 24px" }}>
                <div
                    style={{
                        position: "relative",
                        backgroundColor: theme.colors.card,
                        border: `1px solid ${theme.colors.border}`,
                        borderRadius: "28px",
                        boxShadow: "0 8px 32px rgba(0,0,0,0.08), 0 2px 14px rgba(0,0,0,0.04)",
                        transition: "box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.3s ease",
                        display: "flex",
                        flexDirection: "column",
                        maxHeight: "500px",
                        overflow: "hidden",
                    }}
                    onFocus={e => {
                        e.currentTarget.style.boxShadow = `0 0 0 4px ${theme.colors.primary[100]}, 0 12px 40px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.06)`
                        e.currentTarget.style.borderColor = theme.colors.primary[400]
                    }}
                    onBlur={e => {
                        e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,0,0,0.08), 0 2px 14px rgba(0,0,0,0.04)"
                        e.currentTarget.style.borderColor = theme.colors.border
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
                        rows={3}
                        placeholder={isStreaming ? (currentPlan?.status || "Agent is working...") : "Write a message... (Enter to send, Shift+Enter for newline)"}
                        style={{
                            padding: "20px 24px 10px",
                            backgroundColor: "transparent",
                            color: isStreaming ? theme.colors.neutral[500] : theme.colors.foreground,
                            resize: "none",
                            border: "none",
                            outline: "none",
                            fontFamily: "inherit",
                            fontSize: "0.9rem",
                            overflowY: "auto",
                            lineHeight: "1.65",
                            opacity: isStreaming ? 0.5 : 1,
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
                        padding: "10px 16px 16px",
                        borderTop: `1px solid ${theme.colors.neutral[100]}`,
                        gap: theme.spacing[3],
                    }}>
                        {/* Agent Selector Button */}
                        <button
                            onClick={() => setIsAgentPaletteOpen(true)}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                                padding: "8px 16px",
                                borderRadius: "24px",
                                border: `1px solid ${selectedAgentId ? theme.colors.primary[300] : theme.colors.neutral[200]}`,
                                backgroundColor: selectedAgentId ? theme.colors.primary[50] : "transparent",
                                color: selectedAgentId ? theme.colors.primary[700] : theme.colors.muted_foreground,
                                fontFamily: "inherit",
                                fontSize: "0.82rem",
                                fontWeight: selectedAgentId ? 500 : 400,
                                cursor: "pointer",
                                transition: "all 0.15s ease",
                                whiteSpace: "nowrap",
                                maxWidth: "220px",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.borderColor = theme.colors.primary[400]
                                e.currentTarget.style.backgroundColor = theme.colors.primary[50]
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.borderColor = selectedAgentId ? theme.colors.primary[300] : theme.colors.neutral[200]
                                e.currentTarget.style.backgroundColor = selectedAgentId ? theme.colors.primary[50] : "transparent"
                            }}
                        >
                            <Cpu size={13} style={{ flexShrink: 0 }} />
                            <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
                                {selectedAgent ? selectedAgent.name : "Select Agent"}
                            </span>
                            <ChevronDown size={11} style={{ flexShrink: 0, opacity: 0.6 }} />
                        </button>

                        {/* Send / Stop Button */}
                        {isStreaming ? (
                            <button
                                onClick={onAbort}
                                style={{
                                    flexShrink: 0,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    width: "42px",
                                    height: "42px",
                                    borderRadius: "50%",
                                    border: "none",
                                    cursor: "pointer",
                                    backgroundColor: theme.colors.destructive?.DEFAULT || "#a84a4a",
                                    color: "#ffffff",
                                    boxShadow: "0 4px 14px rgba(168,74,74,0.45)",
                                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                                }}
                                onMouseEnter={e => { 
                                    e.currentTarget.style.transform = "scale(1.08)"
                                    e.currentTarget.style.boxShadow = "0 6px 20px rgba(168,74,74,0.55)"
                                }}
                                onMouseLeave={e => { 
                                    e.currentTarget.style.transform = "scale(1)"
                                    e.currentTarget.style.boxShadow = "0 4px 14px rgba(168,74,74,0.45)"
                                }}
                            >
                                <Pause size={15} />
                            </button>
                        ) : (
                            <button
                                onClick={handleSendMessage}
                                disabled={!inputValue.trim() || !selectedAgentId}
                                style={{
                                    flexShrink: 0,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    width: "42px",
                                    height: "42px",
                                    borderRadius: "50%",
                                    border: "none",
                                    cursor: (!inputValue.trim() || !selectedAgentId) ? "not-allowed" : "pointer",
                                    backgroundColor: (!inputValue.trim() || !selectedAgentId) ? theme.colors.neutral[200] : theme.colors.primary[600],
                                    color: (!inputValue.trim() || !selectedAgentId) ? theme.colors.neutral[400] : "#ffffff",
                                    transition: "background-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease",
                                    boxShadow: (!inputValue.trim() || !selectedAgentId) ? "none" : "0 4px 14px rgba(79,111,150,0.45)",
                                }}
                                onMouseEnter={e => { 
                                    if (!e.currentTarget.disabled) {
                                        e.currentTarget.style.transform = "scale(1.08)"
                                        e.currentTarget.style.boxShadow = "0 6px 20px rgba(79,111,150,0.55)"
                                    } 
                                }}
                                onMouseLeave={e => { 
                                    e.currentTarget.style.transform = "scale(1)"
                                    if (!e.currentTarget.disabled) {
                                        e.currentTarget.style.boxShadow = "0 4px 14px rgba(79,111,150,0.45)"
                                    }
                                }}
                            >
                                <Send size={15} />
                            </button>
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

            {/* Agent Command Palette */}
            <CommandPalette
                isOpen={isAgentPaletteOpen}
                onClose={() => setIsAgentPaletteOpen(false)}
                title="Select Agent"
                description="Choose an agent to power this conversation."
                placeholder="Search agents..."
                items={agents.map(a => ({ id: String(a.id), label: a.name, description: a.instructions ? a.instructions.slice(0, 80) + (a.instructions.length > 80 ? '...' : '') : undefined }))}
                selectedIds={selectedAgentId ? [String(selectedAgentId)] : []}
                onSelect={(id) => { setSelectedAgentId(id); setIsAgentPaletteOpen(false) }}
                onDeselect={() => { setSelectedAgentId(""); setIsAgentPaletteOpen(false) }}
                emptyMessage="No agents found."
            />
        </div >
    )
}
