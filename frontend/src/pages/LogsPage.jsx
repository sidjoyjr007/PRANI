import { useState, useEffect, useMemo, useCallback, useRef } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useTheme } from "@/context/ThemeContext"
import Layout from "@/components/Layout"
import Container from "@/components/Container"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Text } from "@/components/ui/text"
import {
  ChevronLeft, Search, Download, Copy, Check,
  RefreshCw, Terminal, AlertCircle, Info, AlertTriangle, Bug,
  FileText, Layers, Clock
} from "lucide-react"

// ─── Level config ─────────────────────────────────────────────────────────────
const LEVEL_CONFIG = {
  DEBUG: { color: "#7c8dcc", bg: "rgba(124,141,204,0.1)", label: "DEBUG", icon: Bug },
  INFO: { color: "#4ade80", bg: "rgba(74,222,128,0.1)", label: "INFO ", icon: Info },
  WARN: { color: "#facc15", bg: "rgba(250,204,21,0.1)", label: "WARN ", icon: AlertTriangle },
  ERROR: { color: "#f87171", bg: "rgba(248,113,113,0.1)", label: "ERROR", icon: AlertCircle },
}

// All distinct category (source) values that may come back from the API
const ALL_SOURCES = [
  "All Categories",
  "Agent Loop",
  "Reasoning",
  "Tool Handler",
  "Execution Engine",
  "Task Planner",
  "Human in Loop",
  "Response",
  "Agent",
]

const ALL_LEVELS = ["All Levels", "DEBUG", "INFO", "WARN", "ERROR"]

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatTs(isoStr) {
  if (!isoStr) return "—"
  try {
    const d = new Date(isoStr)
    return d.toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" }) +
      "." + String(d.getMilliseconds()).padStart(3, "0")
  } catch { return isoStr }
}

function formatFullTs(isoStr) {
  if (!isoStr) return "—"
  try {
    const d = new Date(isoStr)
    return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) +
      " " + d.toLocaleTimeString("en-US", { hour12: false })
  } catch { return isoStr }
}

// ─── LogRow ───────────────────────────────────────────────────────────────────
function LogRow({ log, index, copiedId, onCopy }) {
  const lc = LEVEL_CONFIG[log.level] || LEVEL_CONFIG.INFO

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "12px",
        padding: "6px 12px",
        borderRadius: "4px",
        transition: "background 0.12s",
        cursor: "pointer",
        borderBottom: "1px solid rgba(255,255,255,0.03)",
      }}
      onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.03)"}
      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
    >
      {/* Line number */}
      <span style={{ color: "#475569", fontSize: "0.72em", minWidth: "36px", textAlign: "right", userSelect: "none", paddingTop: "2px" }}>
        {String(index + 1).padStart(4, " ")}
      </span>

      {/* Timestamp */}
      <span style={{ color: "#64748b", fontSize: "0.74em", minWidth: "100px", flexShrink: 0, paddingTop: "2px", fontFamily: "monospace" }}>
        {formatTs(log.timestamp)}
      </span>

      {/* Level badge */}
      <span style={{
        color: lc.color,
        backgroundColor: lc.bg,
        fontSize: "0.68em",
        fontWeight: 700,
        letterSpacing: "0.06em",
        padding: "1px 6px",
        borderRadius: "3px",
        border: `1px solid ${lc.color}33`,
        minWidth: "52px",
        textAlign: "center",
        flexShrink: 0,
        marginTop: "1px",
      }}>
        {lc.label}
      </span>

      {/* Source chip */}
      <span style={{
        color: "#60a5fa",
        fontSize: "0.74em",
        minWidth: "110px",
        flexShrink: 0,
        paddingTop: "2px",
        fontFamily: "monospace",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      }}>
        {log.source}
      </span>

      {/* Content */}
      <span style={{
        flex: 1,
        color: "#e2e8f0",
        fontSize: "0.82em",
        fontFamily: "monospace",
        wordBreak: "break-word",
        whiteSpace: "pre-wrap",
        lineHeight: "1.5",
      }}>
        {log.content || <span style={{ color: "#475569" }}>—</span>}
      </span>

      {/* Copy button */}
      <button
        onClick={e => { e.stopPropagation(); onCopy(log) }}
        title={copiedId === log.id ? "Copied!" : "Copy"}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: copiedId === log.id ? "#22c55e" : "#475569",
          padding: "2px 4px",
          flexShrink: 0,
          transition: "color 0.15s",
        }}
        onMouseEnter={e => { if (copiedId !== log.id) e.currentTarget.style.color = "#94a3b8" }}
        onMouseLeave={e => { if (copiedId !== log.id) e.currentTarget.style.color = "#475569" }}
      >
        {copiedId === log.id ? <Check size={13} /> : <Copy size={13} />}
      </button>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function LogsPage() {
  const theme = useTheme()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const sessionId = searchParams.get("session")
  const agentId = searchParams.get("agent")

  const [logs, setLogs] = useState([])
  const [sessions, setSessions] = useState([])         // for agent-level view
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const LIMIT = 20

  // ── Frontend-only filter state ──
  const [search, setSearch] = useState("")
  const [levelFilter, setLevelFilter] = useState("All Levels")
  const [sourceFilter, setSourceFilter] = useState("All Categories")

  const [copiedId, setCopiedId] = useState(null)

  // ── Fetch logs ───────────────────────────────────────────────────────────────
  const fetchLogs = useCallback(async (isLoadMore = false) => {
    if (!sessionId) return
    if (isLoadMore && (!hasMore || loadingMore)) return

    if (!isLoadMore) {
      setLoading(true)
      setLogs([])
    } else {
      setLoadingMore(true)
    }

    setError(null)
    try {
      const currentOffset = isLoadMore ? logs.length : 0
      const res = await fetch(`http://localhost:8000/api/logs/session/${sessionId}?limit=${LIMIT}&offset=${currentOffset}`, {
        credentials: "include",
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()

      if (isLoadMore) {
        setLogs(prev => [...prev, ...data])
      } else {
        setLogs(data)
      }

      setHasMore(data.length === LIMIT)
    } catch (e) {
      setError(e.message)
    } finally {
      if (!isLoadMore) setLoading(false)
      setLoadingMore(false)
    }
  }, [sessionId, logs.length, hasMore, loadingMore])

  // ── Fetch agent sessions (when no sessionId) ──────────────────────────────
  const fetchSessions = useCallback(async () => {
    if (!agentId || sessionId) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`http://localhost:8000/api/logs/agent/${agentId}/sessions`, {
        credentials: "include",
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setSessions(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [agentId, sessionId])

  useEffect(() => {
    if (sessionId && logs.length === 0) fetchLogs(false)
    else if (agentId) fetchSessions()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, agentId])

  const observerTarget = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          if (!loading && !loadingMore && hasMore && search === "" && levelFilter === "All Levels" && sourceFilter === "All Categories") {
            fetchLogs(true)
          }
        }
      },
      { threshold: 0.1 }
    )

    const currentTarget = observerTarget.current
    if (currentTarget) {
      observer.observe(currentTarget)
    }

    return () => {
      if (currentTarget) observer.unobserve(currentTarget)
    }
  }, [loading, loadingMore, hasMore, search, levelFilter, sourceFilter, fetchLogs])

  // ── Frontend filtering (search + level + source) ──────────────────────────
  const filtered = useMemo(() => {
    return logs.filter(log => {
      const matchLevel = levelFilter === "All Levels" || log.level === levelFilter
      const matchSource = sourceFilter === "All Categories" || log.source === sourceFilter
      const q = search.toLowerCase()
      const matchSearch = !q ||
        log.content.toLowerCase().includes(q) ||
        log.source.toLowerCase().includes(q) ||
        log.event_type.toLowerCase().includes(q)
      return matchLevel && matchSource && matchSearch
    })
  }, [logs, levelFilter, sourceFilter, search])

  // ── Download ──────────────────────────────────────────────────────────────
  const handleDownload = () => {
    const text = filtered
      .map(l => `[${l.timestamp || ""}] [${l.level}] ${l.source}: ${l.content}`)
      .join("\n")
    const a = document.createElement("a")
    const filename = `logs-session-${(sessionId || "agent").slice(0, 8)}-${new Date().toISOString().slice(0, 10)}.txt`
    a.href = "data:text/plain;charset=utf-8," + encodeURIComponent(text)
    a.download = filename
    a.click()
  }

  // ── Copy one line ────────────────────────────────────────────────────────
  const handleCopy = (log) => {
    const line = `[${log.timestamp}] [${log.level}] ${log.source}: ${log.content}`
    navigator.clipboard.writeText(line)
    setCopiedId(log.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  // ── Page title ────────────────────────────────────────────────────────────
  const pageTitle = sessionId
    ? "Session Logs"
    : agentId
      ? "Agent Sessions"
      : "Logs"

  // ─────────────────────────────────────────────────────────────────────────
  //  RENDER: Agent-level session list (when no sessionId provided)
  // ─────────────────────────────────────────────────────────────────────────
  if (!sessionId && agentId) {
    return (
      <Layout>
      {/* Action-Centric Sticky Header */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 40,
          backgroundColor: `${theme.colors.card}f2`,
          backdropFilter: "blur(12px)",
          borderBottom: `${theme.borderWidth.sm} solid ${theme.colors.neutral[200]}`,
          padding: `${theme.spacing[3]} 0`,
          width: "100%",
        }}
      >
        <div style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: `0 ${theme.spacing[8]}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          height: "36px"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: theme.spacing[3] }}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(-1)}
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                padding: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: `${theme.borderWidth.sm} solid ${theme.colors.neutral[300]}`,
                color: theme.colors.foreground
              }}
            >
              <ChevronLeft size={20} strokeWidth={2.5} />
            </Button>
            <div style={{ width: "1px", height: "14px", backgroundColor: theme.colors.neutral[300] }} />
            <Text weight="semibold" style={{ fontSize: "14px", color: theme.colors.foreground, margin: 0 }}>
              Agent Sessions
            </Text>
          </div>
        </div>
      </div>

      <Container maxWidth="1280px" style={{ paddingTop: theme.spacing[8] }}>

          {loading && <div style={{ color: theme.colors.muted_foreground, padding: "40px", textAlign: "center" }}>Loading…</div>}
          {error && <div style={{ color: theme.colors.destructive, padding: "40px", textAlign: "center" }}>{error}</div>}

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {sessions.map(s => (
              <div
                key={s.session_id}
                onClick={() => navigate(`/logs?session=${s.session_id}&agent=${agentId}`)}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "12px 16px",
                  backgroundColor: theme.colors.neutral[900],
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: "8px",
                  cursor: "pointer",
                  transition: "border-color 0.15s",
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = theme.colors.primary[500]}
                onMouseLeave={e => e.currentTarget.style.borderColor = theme.colors.border}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <Layers size={16} style={{ color: theme.colors.primary[400] }} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "0.9em", color: theme.colors.foreground }}>
                      {s.title || s.session_id.slice(0, 24) + "…"}
                    </div>
                    <div style={{ fontSize: "0.75em", color: theme.colors.muted_foreground, marginTop: "2px" }}>
                      {formatFullTs(s.last_activity || s.created_at)}
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.8em", color: theme.colors.muted_foreground }}>
                  <FileText size={13} />
                  {s.log_count} entries
                </div>
              </div>
            ))}
            {!loading && sessions.length === 0 && (
              <div style={{ textAlign: "center", padding: "60px", color: theme.colors.muted_foreground, fontSize: "0.9em" }}>
                No sessions with logged activity yet.
              </div>
            )}
          </div>
        </Container>
      </Layout>
    )
  }

  // ─────────────────────────────────────────────────────────────────────────
  //  RENDER: Session-level terminal log viewer
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <Layout>
      {/* Action-Centric Sticky Header */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 40,
          backgroundColor: `${theme.colors.card}f2`,
          backdropFilter: "blur(12px)",
          borderBottom: `${theme.borderWidth.sm} solid ${theme.colors.neutral[200]}`,
          padding: `${theme.spacing[3]} 0`,
          width: "100%",
        }}
      >
        <div style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: `0 ${theme.spacing[8]}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          height: "36px"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: theme.spacing[3] }}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(-1)}
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                padding: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: `${theme.borderWidth.sm} solid ${theme.colors.neutral[300]}`,
                color: theme.colors.foreground
              }}
            >
              <ChevronLeft size={20} strokeWidth={2.5} />
            </Button>
            <div style={{ width: "1px", height: "14px", backgroundColor: theme.colors.neutral[300] }} />
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Terminal size={14} style={{ color: theme.colors.primary[500] }} />
              <Text weight="semibold" style={{ fontSize: "14px", color: theme.colors.foreground, margin: 0 }}>
                {pageTitle}
              </Text>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: theme.spacing[2] }}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fetchLogs(false)}
              disabled={loading}
              style={{ height: "32px", fontSize: "13px", color: theme.colors.muted_foreground }}
            >
              <RefreshCw size={14} style={{ marginRight: theme.spacing[2], animation: loading ? "spin 1s linear infinite" : "none" }} />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              disabled={filtered.length === 0}
              style={{ height: "32px", fontSize: "13px", color: theme.colors.foreground, border: `1px solid ${theme.colors.neutral[300]}` }}
            >
              <Download size={14} style={{ marginRight: theme.spacing[2] }} />
              Download ({filtered.length})
            </Button>
          </div>
        </div>
      </div>

      <Container maxWidth="1280px" style={{ paddingTop: theme.spacing[8], paddingBottom: theme.spacing[16], backgroundColor: "transparent" }}>

        {/* ── Terminal Card ── */}
        <Card style={{
          padding: 0,
          border: `1px solid #1e293b`,
          borderRadius: theme.borderRadius.xl,
          backgroundColor: "#0d1117",
          fontFamily: '"Fira Code", "JetBrains Mono", monospace',
          color: "#e2e8f0",
          overflow: "hidden",
          height: "calc(100vh - 200px)",
          minHeight: "600px",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 20px 50px -12px rgba(0, 0, 0, 0.5)"
        }}>
          {/* ── Terminal chrome ── */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "10px 16px",
            backgroundColor: "#161b22",
            borderBottom: "1px solid #21262d",
          }}>
            <div style={{ display: "flex", gap: "6px" }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: "#ef4444" }} />
              <div style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: "#eab308" }} />
              <div style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: "#22c55e" }} />
            </div>
            <span style={{ fontSize: "0.72em", color: "#64748b", fontFamily: "system-ui, sans-serif" }}>
              prani — agent execution logs
            </span>
            <span style={{ fontSize: "0.7em", color: "#475569", fontFamily: "system-ui, sans-serif" }}>
              {logs.length} entries loaded
            </span>
          </div>

          {/* ── Filter bar ── */}
          <div style={{
            display: "flex", alignItems: "center", gap: "8px",
            padding: "10px 16px",
            borderBottom: "1px solid #161b22",
            backgroundColor: "#0d1117",
            flexWrap: "wrap",
          }}>
            {/* Search */}
            <div style={{
              display: "flex", alignItems: "center", gap: "6px",
              backgroundColor: "#161b22", border: "1px solid #21262d",
              borderRadius: "5px", padding: "5px 10px", flex: "1 1 200px",
            }}>
              <Search size={13} style={{ color: "#64748b", flexShrink: 0 }} />
              <input
                type="text"
                placeholder="Search content, source, event type…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  flex: 1, background: "transparent", border: "none", outline: "none",
                  color: "#e2e8f0", fontSize: "0.78em", fontFamily: "inherit",
                }}
              />
              {search && (
                <button onClick={() => setSearch("")} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b", padding: 0, lineHeight: 1 }}>×</button>
              )}
            </div>

            {/* Level filter */}
            <select
              value={levelFilter}
              onChange={e => setLevelFilter(e.target.value)}
              style={{
                background: "#161b22", border: "1px solid #21262d", borderRadius: "5px",
                color: levelFilter === "All Levels" ? "#94a3b8" : (LEVEL_CONFIG[levelFilter]?.color || "#e2e8f0"),
                fontSize: "0.78em", padding: "5px 8px", outline: "none", cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              {ALL_LEVELS.map(l => (
                <option key={l} value={l} style={{ backgroundColor: "#0d1117", color: LEVEL_CONFIG[l]?.color || "#e2e8f0" }}>
                  {l}
                </option>
              ))}
            </select>

            {/* Category filter */}
            <select
              value={sourceFilter}
              onChange={e => setSourceFilter(e.target.value)}
              style={{
                background: "#161b22", border: "1px solid #21262d", borderRadius: "5px",
                color: "#94a3b8",
                fontSize: "0.78em", padding: "5px 8px", outline: "none", cursor: "pointer",
                fontFamily: "inherit", maxWidth: "160px",
              }}
            >
              {ALL_SOURCES.map(s => (
                <option key={s} value={s} style={{ backgroundColor: "#0d1117", color: "#e2e8f0" }}>
                  {s}
                </option>
              ))}
            </select>

            {/* Active filter chips */}
            {(levelFilter !== "All Levels" || sourceFilter !== "All Categories" || search) && (
              <button
                onClick={() => { setLevelFilter("All Levels"); setSourceFilter("All Categories"); setSearch("") }}
                style={{
                  background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "4px",
                  color: "#f87171", fontSize: "0.72em", padding: "4px 8px", cursor: "pointer",
                }}
              >
                Clear filters
              </button>
            )}
          </div>

          {/* ── Log rows ── */}
          <div
            style={{ flex: 1, overflowY: "auto", padding: "4px 0" }}
            className="hover-scrollbar"
          >
            {loading && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "200px", color: "#64748b", gap: "8px" }}>
                <RefreshCw size={16} style={{ animation: "spin 1s linear infinite" }} />
                <span style={{ fontSize: "0.85em" }}>Loading logs…</span>
              </div>
            )}

            {error && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "200px", color: "#f87171", gap: "8px" }}>
                <AlertCircle size={16} />
                <span style={{ fontSize: "0.85em" }}>{error}</span>
              </div>
            )}

            {!loading && !error && filtered.length === 0 && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "200px", color: "#64748b", gap: "8px" }}>
                <FileText size={24} />
                <span style={{ fontSize: "0.85em" }}>
                  {logs.length === 0 ? "No logs yet for this session." : "No logs match your filters."}
                </span>
              </div>
            )}

            {!loading && !error && filtered.map((log, i) => (
              <LogRow
                key={log.id}
                log={log}
                index={i}
                copiedId={copiedId}
                onCopy={handleCopy}
              />
            ))}

            {loadingMore && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "20px 0", color: "#64748b", gap: "8px" }}>
                <RefreshCw size={14} style={{ animation: "spin 1s linear infinite" }} />
                <span style={{ fontSize: "0.8em" }}>Loading more logs…</span>
              </div>
            )}

            {/* Invisible sentinel element for IntersectionObserver */}
            {hasMore && !loading && (
              <div ref={observerTarget} style={{ height: "20px" }} />
            )}
          </div>

          {/* ── Footer ── */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "8px 16px",
            borderTop: "1px solid #161b22",
            backgroundColor: "#0d1117",
            color: "#475569",
            fontSize: "0.72em",
            fontFamily: "system-ui, sans-serif",
          }}>
            <span>
              {filtered.length} log entries · latest first
            </span>
            <div style={{ display: "flex", gap: "12px" }}>
              {Object.entries(LEVEL_CONFIG).map(([lvl, cfg]) => {
                const count = filtered.filter(l => l.level === lvl).length
                return count > 0 ? (
                  <span key={lvl} style={{ color: cfg.color }}>
                    {lvl} {count}
                  </span>
                ) : null
              })}
            </div>
          </div>
        </Card>

        <style>{`
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        `}</style>
      </Container>
    </Layout>
  )
}
