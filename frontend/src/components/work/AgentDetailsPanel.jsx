import { useState } from "react"
import { useTheme } from "@/context/ThemeContext"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Text } from "@/components/ui/text"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Logs, MousePointerClick, AlertCircle } from "lucide-react"
import { Empty } from "@/components/ui/empty"
import { HoverCardContent } from "@/components/ui/hover-card"

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
                    borderLeft: `${theme.borderWidth.sm} solid ${theme.colors.border}`,
                    backgroundColor: theme.colors.card,
                    padding: theme.spacing[6],
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
                    description="Select an agent from the chat panel to view their tools, capabilities, and configuration details."
                    variant="subtle"
                />
            </div>
        )
    }

    return (
        <div
            style={{
                width: "400px",
                borderLeft: `${theme.borderWidth.sm} solid ${theme.colors.border}`,
                backgroundColor: theme.colors.card,
                padding: theme.spacing[6],
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
            }}
        >
            <Tabs value={rightPanelTab} onValueChange={setRightPanelTab} variant="badge" style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                <TabsList style={{ width: "100%", marginBottom: theme.spacing[6], gap: theme.spacing[4], display: "flex", overflowX: "auto" }}>
                    <TabsTrigger value="tools" badge={String(agentTools.length + agentMCPServers.length)}>Tools & MCP</TabsTrigger>
                    <TabsTrigger value="capabilities" badge={String(selectedAgent.capabilities?.length || 0)}>Capabilities</TabsTrigger>
                </TabsList>

                <TabsContent value="tools" style={{ flex: 1 }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing[6] }}>
                        {/* Tools Section */}
                        <div>
                            <Text as="label" variant="helper" size="xs" style={{ display: "block", marginBottom: theme.spacing[3], textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: "600", color: theme.colors.muted_foreground }}>
                                Tools
                            </Text>
                            {agentTools.length > 0 ? (
                                <div style={{ display: "flex", flexWrap: "wrap", gap: theme.spacing[2] }}>
                                    {agentTools.map((tool, idx) => (
                                        <div key={idx} style={{ display: "flex" }}>
                                            {tool.sync_status === "FAILED" ? (
                                                <HoverCardContent
                                                    side="bottom"
                                                    style={{
                                                        width: "280px",
                                                        padding: theme.spacing[3],
                                                        backgroundColor: theme.colors.card,
                                                        border: `1px solid ${theme.colors.destructive[200]}`,
                                                        boxShadow: `0 4px 12px ${theme.colors.destructive[900]}1a`
                                                    }}
                                                >
                                                    <div style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "help" }}>
                                                        <Badge variant="outline" color="secondary" pill>
                                                            {tool.name}
                                                        </Badge>
                                                        <AlertCircle size={16} style={{ color: theme.colors.destructive[500] }} />
                                                    </div>
                                                    <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing[3] }}>
                                                        <div style={{ display: "flex", alignItems: "center", gap: theme.spacing[2], color: theme.colors.destructive[600] }}>
                                                            <AlertCircle size={16} />
                                                            <Text size="sm" as="span" style={{ fontWeight: 600, color: "inherit", margin: 0 }}>Sync Failed</Text>
                                                        </div>
                                                        <div style={{ backgroundColor: theme.colors.destructive[50], padding: theme.spacing[2], borderRadius: theme.borderRadius.sm, border: `1px solid ${theme.colors.destructive[100]}` }}>
                                                            <Text size="xs" as="p" style={{ color: theme.colors.destructive[800], fontFamily: "monospace", wordBreak: "break-word", margin: 0 }}>
                                                                {tool.sync_error || "Unknown failure"}
                                                            </Text>
                                                        </div>
                                                        <Text size="xs" as="p" style={{ color: theme.colors.muted_foreground, margin: 0 }}>
                                                            Go to the Custom Tools page and click 'Retry Sync' to fix this issue.
                                                        </Text>
                                                    </div>
                                                </HoverCardContent>
                                            ) : (
                                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                                    <Badge variant="outline" color="secondary" pill>
                                                        {tool.name}
                                                    </Badge>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <Text as="p" variant="muted" size="sm">No tools assigned.</Text>
                            )}
                        </div>

                        {/* MCP Servers Section */}
                        <div>
                            <Text as="label" variant="helper" size="xs" style={{ display: "block", marginBottom: theme.spacing[3], textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: "600", color: theme.colors.muted_foreground }}>
                                MCP Servers
                            </Text>
                            {agentMCPServers.length > 0 ? (
                                <div style={{ display: "flex", flexWrap: "wrap", gap: theme.spacing[2] }}>
                                    {agentMCPServers.map((server, idx) => (
                                        <div key={idx} style={{ display: "flex" }}>
                                            {server.sync_status === "FAILED" ? (
                                                <HoverCardContent
                                                    side="bottom"
                                                    style={{
                                                        width: "280px",
                                                        padding: theme.spacing[3],
                                                        backgroundColor: theme.colors.card,
                                                        border: `1px solid ${theme.colors.destructive[200]}`,
                                                        boxShadow: `0 4px 12px ${theme.colors.destructive[900]}1a`
                                                    }}
                                                >
                                                    <div style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "help" }}>
                                                        <Badge variant="outline" color="primary" pill>
                                                            {server.name}
                                                        </Badge>
                                                        <AlertCircle size={16} style={{ color: theme.colors.destructive[500] }} />
                                                    </div>
                                                    <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing[3] }}>
                                                        <div style={{ display: "flex", alignItems: "center", gap: theme.spacing[2], color: theme.colors.destructive[600] }}>
                                                            <AlertCircle size={16} />
                                                            <Text size="sm" as="span" style={{ fontWeight: 600, color: "inherit", margin: 0 }}>Sync Failed</Text>
                                                        </div>
                                                        <div style={{ backgroundColor: theme.colors.destructive[50], padding: theme.spacing[2], borderRadius: theme.borderRadius.sm, border: `1px solid ${theme.colors.destructive[100]}` }}>
                                                            <Text size="xs" as="p" style={{ color: theme.colors.destructive[800], fontFamily: "monospace", wordBreak: "break-word", margin: 0 }}>
                                                                {server.sync_error || "Unknown failure"}
                                                            </Text>
                                                        </div>
                                                        <Text size="xs" as="p" style={{ color: theme.colors.muted_foreground, margin: 0 }}>
                                                            Go to the MCP Servers page and click 'Retry Sync' to fix this issue.
                                                        </Text>
                                                    </div>
                                                </HoverCardContent>
                                            ) : (
                                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                                    <Badge variant="outline" color="primary" pill>
                                                        {server.name}
                                                    </Badge>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <Text as="p" variant="muted" size="sm">No MCP servers assigned.</Text>
                            )}
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="capabilities" style={{ flex: 1 }}>
                    <Text as="label" variant="helper" size="xs" style={{ display: "block", marginBottom: theme.spacing[3], textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: "600", color: theme.colors.muted_foreground }}>
                        Agent Capabilities
                    </Text>
                    {selectedAgent.capabilities && selectedAgent.capabilities.length > 0 ? (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: theme.spacing[2] }}>
                            {selectedAgent.capabilities.map((cap, idx) => (
                                <Badge key={idx} variant="outline" color="secondary" pill>
                                    {cap}
                                </Badge>
                            ))}
                        </div>
                    ) : (
                        <Text as="p" variant="muted" size="sm">No specific capabilities listed.</Text>
                    )}
                </TabsContent>
            </Tabs>

        </div>
    )
}
