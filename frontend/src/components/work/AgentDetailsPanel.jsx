import { useState } from "react"
import { useTheme } from "@/context/ThemeContext"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Text } from "@/components/ui/text"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Logs, MousePointerClick } from "lucide-react"
import { Empty } from "@/components/ui/empty"

export default function AgentDetailsPanel({ selectedAgent, allTools = [], allLLMs = [], allMCPServers = [], sessionId = null }) {
    const theme = useTheme()
    const navigate = useNavigate()
    const [rightPanelTab, setRightPanelTab] = useState("tools")

    // Resolve tool names from IDs
    const agentTools = selectedAgent?.tool_ids?.map(id => {
        const tool = allTools.find(t => t.id === id)
        return tool ? tool.name : "Unknown Tool"
    }) || []

    // Resolve MCP Server names from IDs
    const agentMCPServers = selectedAgent?.mcp_server_ids?.map(id => {
        const server = allMCPServers.find(s => s.id === id)
        return server ? server.name : "Unknown Server"
    }) || []

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
                                        <Badge key={idx} variant="outline" color="secondary" pill>
                                            {tool}
                                        </Badge>
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
                                        <Badge key={idx} variant="outline" color="primary" pill>
                                            {server}
                                        </Badge>
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
