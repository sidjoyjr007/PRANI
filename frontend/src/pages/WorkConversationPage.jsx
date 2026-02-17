import { useState } from "react"
import { Send, Plus, ChevronDown } from "lucide-react"
import { useTheme } from "@/context/ThemeContext"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Combobox, ComboboxTrigger, ComboboxContent, ComboboxItem, ComboboxSearch } from "@/components/ui/combobox"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Text } from "@/components/ui/text"
import { Separator } from "@/components/ui/separator"
import Layout from "@/components/Layout"

export default function WorkPage() {
  const theme = useTheme()
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState("")
  const [selectedAgent, setSelectedAgent] = useState("")
  const [conversations, setConversations] = useState([
    { id: 1, title: "Project Planning", date: "Today" },
    { id: 2, title: "Design Feedback", date: "Yesterday" },
    { id: 3, title: "Bug Discussion", date: "2 days ago" },
  ])
  const [activeConversation, setActiveConversation] = useState(null)
  const [rightPanelTab, setRightPanelTab] = useState("tools")

  const agents = [
    { id: 1, name: "Claude Haiku", provider: "Anthropic" },
    { id: 2, name: "GPT-4 Turbo", provider: "OpenAI" },
    { id: 3, name: "Llama 2 70B", provider: "Meta" },
  ]

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      setMessages([...messages, { text: inputValue, sender: "user" }])
      setInputValue("")
    }
  }

  return (
    <Layout>
      <div style={{ display: "flex", height: "100%", overflow: "hidden" }}>
        {/* Left Panel - Conversations */}
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
              style={{ width: "32px", height: "32px", padding: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              <Plus size={16} />
            </Button>
          </div>

          <div style={{ flex: 1, overflow: "auto", display: "flex", flexDirection: "column", gap: theme.spacing[2] }}>
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setActiveConversation(conv.id)}
                style={{
                  padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
                  backgroundColor: activeConversation === conv.id ? theme.colors.primary[600] : "transparent",
                  color: activeConversation === conv.id ? theme.colors.white : theme.colors.foreground,
                  border: "none",
                  borderRadius: theme.borderRadius.md,
                  cursor: "pointer",
                  textAlign: "left",
                  transition: theme.transitions.normal,
                }}
                onMouseEnter={(e) => {
                  if (activeConversation !== conv.id) {
                    e.currentTarget.style.backgroundColor = theme.colors.neutral[100]
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeConversation !== conv.id) {
                    e.currentTarget.style.backgroundColor = "transparent"
                  }
                }}
              >
                <Text as="div" variant="body" size="sm" style={{ fontWeight: theme.typography.fontWeight.medium, margin: 0 }}>
                  {conv.title}
                </Text>
                <Text as="div" variant="muted" size="xs" style={{ marginTop: theme.spacing[1], opacity: theme.opacity.disabled, margin: 0 }}>
                  {conv.date}
                </Text>
              </button>
            ))}
          </div>
        </div>

        {/* Center Panel - Chat */}
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
          <div style={{ flex: 1, overflow: "auto", marginBottom: theme.spacing[6], display: "flex", flexDirection: "column", gap: theme.spacing[4], padding: `${theme.spacing[4]} 0` }}>
            {messages.length === 0 ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: theme.colors.muted_foreground }}>
                Start a conversation
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div key={idx} style={{ textAlign: msg.sender === "user" ? "right" : "left" }}>
                  <div
                    style={{
                      display: "inline-block",
                      backgroundColor: msg.sender === "user" ? theme.colors.primary[600] : theme.colors.muted,
                      color: msg.sender === "user" ? theme.colors.white : theme.colors.foreground,
                      padding: `${theme.spacing[2]} ${theme.spacing[4]}`,
                      borderRadius: theme.borderRadius.md,
                      maxWidth: "80%",
                      wordWrap: "break-word",
                    }}
                  >
                    {msg.text}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Input Area */}
          <div style={{ 
            position: "relative",
            backgroundColor: theme.colors.card,
            border: `${theme.borderWidth.sm} solid ${theme.colors.border}`,
            borderRadius: theme.borderRadius.xxl,
            boxShadow: theme.shadows.lg,
            overflow: "visible",
            outline: "2px solid transparent",
            outlineOffset: "-2px",
            transition: `outline ${theme.transitions.fast}`,
            display: "flex",
            flexDirection: "column",
            maxHeight: "500px",
          }}
          onFocus={(e) => {
            e.currentTarget.style.outline = `2px solid ${theme.colors.primary[500]}`
          }}
          onBlur={(e) => {
            e.currentTarget.style.outline = "2px solid transparent"
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
                padding: theme.spacing[6],
                backgroundColor: "transparent",
                color: theme.colors.foreground,
                resize: "none",
                border: "none",
                outline: "none",
                fontFamily: "inherit",
                fontSize: "1rem",
                overflowY: "auto",
                lineHeight: "1.5",
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
              backgroundColor: theme.colors.card,
              gap: theme.spacing[4],
            }}>
              {/* Agent Selection Combobox - Fixed Width */}
              <div style={{ position: "relative", width: "auto", zIndex: 50 }}>
                <Combobox value={selectedAgent} onValueChange={setSelectedAgent} variant="default" size="md">
                  <ComboboxTrigger>
                    {selectedAgent ? agents.find(a => a.id === parseInt(selectedAgent))?.name : "Select Agent"}
                  </ComboboxTrigger>
                  <ComboboxContent>
                    <ComboboxSearch placeholder="Search agents..." />
                    {agents.map((agent) => (
                      <ComboboxItem key={agent.id} value={String(agent.id)} searchableText={`${agent.name} ${agent.provider}`}>
                        <div style={{ display: "flex", flexDirection: "column" }}>
                          <span>{agent.name}</span>
                          <span style={{ fontSize: "0.75rem", opacity: 0.6 }}>{agent.provider}</span>
                        </div>
                      </ComboboxItem>
                    ))}
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

        {/* Right Panel - Details */}
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
              <TabsTrigger value="tools" badge="4">Tools</TabsTrigger>
              <TabsTrigger value="capabilities" badge="5">Capabilities</TabsTrigger>
              <TabsTrigger value="info">Info</TabsTrigger>
            </TabsList>

            <TabsContent value="tools" style={{ flex: 1 }}>
              <Text as="h3" variant="label" size="sm" style={{ marginBottom: theme.spacing[4], display: "block" }}>
                Available Tools
              </Text>
              <div style={{ display: "flex", flexWrap: "wrap", gap: theme.spacing[2] }}>
                {["Web Search", "Code Executor", "File Manager", "API Caller"].map((tool) => (
                  <Badge key={tool} variant="outline" color="secondary" pill>
                    {tool}
                  </Badge>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="capabilities" style={{ flex: 1 }}>
              <Text as="h3" variant="label" size="sm" style={{ marginBottom: theme.spacing[4], display: "block" }}>
                Agent Capabilities
              </Text>
              <div style={{ display: "flex", flexWrap: "wrap", gap: theme.spacing[2] }}>
                {["Text Generation", "Code Analysis", "Data Processing", "Reasoning", "Multi-turn Chat"].map((cap) => (
                  <Badge key={cap} variant="outline" color="secondary" pill>
                    {cap}
                  </Badge>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="info" style={{ flex: 1 }}>
              {selectedAgent ? (
                <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing[4] }}>
                  <div>
                    <Text as="label" variant="helper" size="xs" style={{ display: "block", marginBottom: theme.spacing[2] }}>
                      Model
                    </Text>
                    <Text as="p" variant="body" size="sm" style={{ margin: 0 }}>
                      Claude Haiku
                    </Text>
                  </div>
                  <Separator />
                  <div>
                    <Text as="label" variant="helper" size="xs" style={{ display: "block", marginBottom: theme.spacing[2] }}>
                      Provider
                    </Text>
                    <Text as="p" variant="body" size="sm" style={{ margin: 0 }}>
                      Anthropic
                    </Text>
                  </div>
                  <Separator />
                  <div>
                    <Text as="label" variant="helper" size="xs" style={{ display: "block", marginBottom: theme.spacing[2] }}>
                      Name
                    </Text>
                    <Text as="p" variant="body" size="sm" style={{ margin: 0 }}>
                      Fast & Efficient
                    </Text>
                  </div>
                </div>
              ) : (
                <Text as="div" variant="muted" size="sm" style={{ textAlign: "center", paddingTop: theme.spacing[6] }}>
                  Select an agent to view details
                </Text>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  )
}