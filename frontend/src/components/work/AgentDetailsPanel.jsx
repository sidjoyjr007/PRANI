import { useState, useEffect } from "react"
import { useTheme } from "@/context/ThemeContext"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Text } from "@/components/ui/text"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Logs, MousePointerClick, AlertCircle, Wrench, Server, Zap, Box, Info, Layout, Brain } from "lucide-react"
import { Empty } from "@/components/ui/empty"
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card"
import { StackedList, StackedListItem, StackedListSection } from "@/components/ui/stacked-list"

export default function AgentDetailsPanel({ selectedAgent, allTools = [], allLLMs = [], allMCPServers = [], sessionId = null }) {
    const theme = useTheme()
    const navigate = useNavigate()
    const [rightPanelTab, setRightPanelTab] = useState("tools")

    // Resolve tool objects from IDs
    const agentTools = selectedAgent?.tool_ids?.reduce((acc, id) => {
        const tool = allTools.find(t => t.id === id)
        if (tool) acc.push(tool)
        return acc
    }, []) || []

    // Resolve MCP Server objects from IDs
    const agentMCPServers = selectedAgent?.mcp_server_ids?.reduce((acc, id) => {
        const server = allMCPServers.find(s => s.id === id)
        if (server) acc.push(server)
        return acc
    }, []) || []

    // Resolve LLM name
    const llmName = selectedAgent?.llm_id
        ? allLLMs.find(l => l.id === selectedAgent.llm_id)?.name || selectedAgent.llm_id
        : "Not Configured"

    if (!selectedAgent) {
        return (
            <div
                style={{
                    width: "400px",
                    borderLeft: `1px solid ${theme.colors.neutral[100]}`,
                    backgroundColor: theme.colors.card || "#ffffff",
                    position: "relative",
                    zIndex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100%",
                }}
            >
                {/* Subtle Gradient Overlay */}
                <div style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: `linear-gradient(180deg, rgba(255,255,255,0) 0%, ${theme.colors.neutral[50]}44 100%)`,
                    pointerEvents: "none",
                    zIndex: -1
                }} />
                <Empty
                    icon={MousePointerClick}
                    title="No Agent Selected"
                    description="Select an agent from the chat panel to view their tools, capabilities, and configuration details."
                    variant="subtle"
                />
            </div>
        )
    }

    return (
        <div
            style={{
                width: "300px",
                borderLeft: `1px solid ${theme.colors.neutral[100]}`,
                backgroundColor: theme.colors.card || "#ffffff",
                position: "relative",
                zIndex: 1,
                display: "flex",
                flexDirection: "column",
                height: "100%",
            }}
        >
            {/* Subtle Gradient Overlay */}
            <div style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: `linear-gradient(180deg, rgba(255,255,255,0) 0%, ${theme.colors.neutral[50]}44 100%)`,
                pointerEvents: "none",
                zIndex: -1
            }} />

            <div 
                className="hover-scrollbar"
                style={{ 
                    padding: theme.spacing[4], 
                    flex: 1, 
                    display: "flex", 
                    flexDirection: "column",
                    overflowY: "auto"
                }}
            >
                <div style={{ 
                    padding: `${theme.spacing[2]} ${theme.spacing[2]} ${theme.spacing[4]}`,
                    display: "flex", 
                    alignItems: "center", 
                    gap: theme.spacing[2],
                    marginBottom: theme.spacing[2]
                }}>
                    <Info size={16} style={{ color: theme.colors.neutral[500] }} />
                    <Text 
                        as="label" 
                        variant="label" 
                        size="sm" 
                        style={{ 
                            margin: 0, 
                            textTransform: "uppercase", 
                            letterSpacing: "0.1em", 
                            fontWeight: "900", 
                            color: theme.colors.neutral[600],
                            fontSize: "0.75rem"
                        }}
                    >
                        Agent Overview
                    </Text>
                </div>

                <StackedList variant="flat" style={{ backgroundColor: "transparent", border: "none", boxShadow: "none" }}>
                    <StackedListSection title="Model Config">
                        <StackedListItem 
                            title="LLM" 
                            description={llmName}
                            trailing={<Brain size={14} />}
                            size="sm"
                        />
                    </StackedListSection>

                    {/* Tools Section */}
                    <StackedListSection title={`Tools (${agentTools.length})`}>
                        {agentTools.length > 0 ? (
                            agentTools.map((tool, idx) => (
                                <StackedListItem
                                    key={idx}
                                    title={tool.name}
                                    description={tool.description || "Custom Python executable tool"}
                                    trailing={
                                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                            {tool.sync_status === "FAILED" && (
                                                <HoverCard openDelay={0} closeDelay={0}>
                                                    <HoverCardTrigger asChild>
                                                        <AlertCircle size={14} style={{ color: theme.colors.destructive[500], cursor: "help" }} />
                                                    </HoverCardTrigger>
                                                    <HoverCardContent side="left" style={{ width: "240px", fontSize: "12px", padding: "12px" }}>
                                                        <Text variant="body" size="xs" style={{ color: theme.colors.destructive[700], fontWeight: "600", marginBottom: "4px" }}>Sync Error</Text>
                                                        <Text variant="muted" size="xs">{tool.sync_error || "Unknown synchronization error"}</Text>
                                                    </HoverCardContent>
                                                </HoverCard>
                                            )}
                                            <Wrench size={14} />
                                        </div>
                                    }
                                    size="sm"
                                    divider={idx !== agentTools.length - 1}
                                />
                            ))
                        ) : (
                            <div style={{ padding: "12px 20px" }}>
                                <Text variant="muted" size="xs">No tools assigned.</Text>
                            </div>
                        )}
                    </StackedListSection>

                    {/* MCP Servers Section */}
                    <StackedListSection title={`MCP Servers (${agentMCPServers.length})`}>
                        {agentMCPServers.length > 0 ? (
                            agentMCPServers.map((server, idx) => (
                                <StackedListItem
                                    key={idx}
                                    title={server.name}
                                    description={server.type || "MCP server integration"}
                                    trailing={<Server size={14} />}
                                    size="sm"
                                    divider={idx !== agentMCPServers.length - 1}
                                />
                            ))
                        ) : (
                            <div style={{ padding: "12px 20px" }}>
                                <Text variant="muted" size="xs">No MCP servers assigned.</Text>
                            </div>
                        )}
                    </StackedListSection>
                </StackedList>
            </div>
        </div>
    )
}
