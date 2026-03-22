import { useTheme } from "@/context/ThemeContext"
import { Text } from "@/components/ui/text"
import { MousePointerClick, AlertCircle, Wrench, Server, Brain, Cpu, Box } from "lucide-react"
import { Empty } from "@/components/ui/empty"
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card"
import { StackedList, StackedListItem, StackedListSection } from "@/components/ui/stacked-list"

export default function AgentDetailsPanel({ selectedAgent, allTools = [], allLLMs = [], allMCPServers = [], sessionId = null }) {
    const theme = useTheme()

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
                    width: "320px",
                    borderLeft: `1px solid ${theme.colors.neutral[200] || 'rgba(0,0,0,0.06)'}`,
                    backgroundColor: theme.colors.background || "#fafafa",
                    position: "relative",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100%",
                }}
            >
                <Empty
                    icon={MousePointerClick}
                    title="No Agent Selected"
                    description="Select an agent from the chat panel to view their tools, capabilities, and configurations."
                    variant="subtle"
                />
            </div>
        )
    }

    return (
        <div
            style={{
                width: "320px",
                borderLeft: `1px solid ${theme.colors.neutral[200] || 'rgba(0,0,0,0.06)'}`,
                backgroundColor: theme.colors.background || "#fafafa",
                display: "flex",
                flexDirection: "column",
                height: "100%",
            }}
        >
            <div 
                className="hover-scrollbar"
                style={{ 
                    padding: theme.spacing[5] || "20px", 
                    flex: 1, 
                    display: "flex", 
                    flexDirection: "column",
                    overflowY: "auto",
                    gap: "24px"
                }}
            >
                {/* Header */}
                <div style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    gap: "12px",
                    paddingBottom: "12px"
                }}>
                    <div>
                        <Text 
                            as="div"
                            style={{ 
                                margin: 0, 
                                fontWeight: "600", 
                                color: theme.colors.neutral[900],
                                fontSize: "0.95rem",
                            }}
                        >
                            {selectedAgent.name || "Agent Details"}
                        </Text>
                        <Text variant="muted" style={{ fontWeight: 500, fontSize: "0.75rem", letterSpacing: "0.02em" }}>
                            System Configuration
                        </Text>
                    </div>
                </div>

                {/* Content using native StackedList but keeping it clean */}
                <StackedList variant="bordered" style={{ backgroundColor: theme.colors.card || "#ffffff", boxShadow: "0 1px 4px rgba(0,0,0,0.02)" }}>
                    <StackedListSection title="Model Config">
                        <StackedListItem 
                            title="Language Model" 
                            description={llmName}
                            trailing={<Brain size={14} style={{ color: theme.colors.neutral[400] }} />}
                            size="sm"
                        />
                    </StackedListSection>
                </StackedList>

                <StackedList variant="bordered" style={{ backgroundColor: theme.colors.card || "#ffffff", boxShadow: "0 1px 4px rgba(0,0,0,0.02)" }}>
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
                                            <Wrench size={14} style={{ color: theme.colors.neutral[400] }} />
                                        </div>
                                    }
                                    size="sm"
                                    divider={idx !== agentTools.length - 1}
                                />
                            ))
                        ) : (
                            <div style={{ padding: "12px 16px" }}>
                                <Text variant="muted" size="xs">No tools assigned.</Text>
                            </div>
                        )}
                    </StackedListSection>
                </StackedList>

                <StackedList variant="bordered" style={{ backgroundColor: theme.colors.card || "#ffffff", boxShadow: "0 1px 4px rgba(0,0,0,0.02)" }}>
                    <StackedListSection title={`MCP Servers (${agentMCPServers.length})`}>
                        {agentMCPServers.length > 0 ? (
                            agentMCPServers.map((server, idx) => (
                                <StackedListItem
                                    key={idx}
                                    title={server.name}
                                    description={server.type || "MCP server integration"}
                                    trailing={<Server size={14} style={{ color: theme.colors.neutral[400] }} />}
                                    size="sm"
                                    divider={idx !== agentMCPServers.length - 1}
                                />
                            ))
                        ) : (
                            <div style={{ padding: "12px 16px" }}>
                                <Text variant="muted" size="xs">No MCP servers assigned.</Text>
                            </div>
                        )}
                    </StackedListSection>
                </StackedList>
            </div>
        </div>
    )
}
