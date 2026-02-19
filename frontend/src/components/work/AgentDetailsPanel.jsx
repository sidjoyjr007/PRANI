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

export default function AgentDetailsPanel({ selectedAgent, allTools = [], allLLMs = [] }) {
    const theme = useTheme()
    const navigate = useNavigate()
    const [rightPanelTab, setRightPanelTab] = useState("tools")

    // Resolve tool names from IDs
    const agentTools = selectedAgent?.tool_ids?.map(id => {
        const tool = allTools.find(t => t.id === id)
        return tool ? tool.name : "Unknown Tool"
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
                <TabsList style={{ width: "100%", marginBottom: theme.spacing[6], gap: theme.spacing[4], display: "flex" }}>
                    <TabsTrigger value="tools" badge={String(agentTools.length)}>Tools</TabsTrigger>
                    <TabsTrigger value="capabilities" badge={String(selectedAgent.capabilities?.length || 0)}>Capabilities</TabsTrigger>
                    <TabsTrigger value="info">Info</TabsTrigger>
                </TabsList>

                <TabsContent value="tools" style={{ flex: 1 }}>
                    <Text as="h3" variant="label" size="sm" style={{ marginBottom: theme.spacing[4], display: "block" }}>
                        Available Tools
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
                </TabsContent>

                <TabsContent value="capabilities" style={{ flex: 1 }}>
                    <Text as="h3" variant="label" size="sm" style={{ marginBottom: theme.spacing[4], display: "block" }}>
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

                <TabsContent value="info" style={{ flex: 1 }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing[4] }}>
                        <div>
                            <Text as="label" variant="helper" size="xs" style={{ display: "block", marginBottom: theme.spacing[2] }}>
                                Name
                            </Text>
                            <Text as="p" variant="body" size="sm" style={{ margin: 0, fontWeight: "bold" }}>
                                {selectedAgent.name}
                            </Text>
                        </div>
                        <Separator />
                        <div>
                            <Text as="label" variant="helper" size="xs" style={{ display: "block", marginBottom: theme.spacing[2] }}>
                                Description
                            </Text>
                            <Text as="p" variant="body" size="sm" style={{ margin: 0 }}>
                                {selectedAgent.description || "No description provided."}
                            </Text>
                        </div>
                        <Separator />
                        <div>
                            <Text as="label" variant="helper" size="xs" style={{ display: "block", marginBottom: theme.spacing[2] }}>
                                Model
                            </Text>
                            <Text as="p" variant="body" size="sm" style={{ margin: 0 }}>
                                {llmName}
                            </Text>
                        </div>
                        <Separator />
                        <div>
                            <Text as="label" variant="helper" size="xs" style={{ display: "block", marginBottom: theme.spacing[2] }}>
                                Human in Loop
                            </Text>
                            <Badge variant={selectedAgent.human_in_loop ? "default" : "outline"} color={selectedAgent.human_in_loop ? "primary" : "neutral"} size="sm">
                                {selectedAgent.human_in_loop ? "Enabled" : "Disabled"}
                            </Badge>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>

            {/* Check Logs Button */}
            <Button
                variant="outline"
                size="md"
                leadingIcon={Logs}
                onClick={() => navigate("/logs")}
                style={{ marginTop: theme.spacing[6], width: "100%" }}
            >
                Check Logs
            </Button>
        </div>
    )
}
