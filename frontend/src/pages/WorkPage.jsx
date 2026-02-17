import { useState, useEffect, useRef } from "react"
import { Send, Plus, ChevronDown, Logs, User, Bot, Check, X, MoreHorizontal, Edit, Trash } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useTheme } from "@/context/ThemeContext"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Combobox, ComboboxTrigger, ComboboxContent, ComboboxItem, ComboboxSearch } from "@/components/ui/combobox"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Text } from "@/components/ui/text"
import { Separator } from "@/components/ui/separator"
import { Dropdown, DropdownTrigger, DropdownContent, DropdownItem, DropdownSeparator } from "@/components/ui/dropdown"
import Layout from "@/components/Layout"

export default function WorkPage() {
  const theme = useTheme()
  const navigate = useNavigate()
  const messagesEndRef = useRef(null)
  const messagesContainerRef = useRef(null)
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState("")
  const [selectedAgent, setSelectedAgent] = useState("")
  const [streamingIndex, setStreamingIndex] = useState(null) // Track which message is streaming
  const [messageActions, setMessageActions] = useState({}) // Track which messages show action buttons
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(true) // Track if user is at bottom
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

  const botResponses = [
    "I've analyzed your requirements. This approach should improve performance by 30%.",
    "Based on the current codebase, I suggest refactoring the authentication module for better scalability.",
    "I found a potential security issue in the API endpoint. Would you like me to suggest fixes?",
    "The implementation looks good. I recommend adding unit tests for edge cases.",
    "I've reviewed the architecture. Consider adding caching to optimize database queries.",
  ]

  const botActionsResponses = [
    "Ready to refactor the authentication module. Should I proceed with the changes?",
    "I can create unit tests for the API endpoints. Do you want me to generate them?",
    "I suggest applying the security patch to the endpoint. Shall I implement it?",
    "I can optimize the database queries by adding indexes. Should I proceed?",
    "Ready to add caching layer to improve response time. Approve this change?",
  ]

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      const userMessage = { text: inputValue, sender: "user" }
      setMessages([...messages, userMessage])
      setInputValue("")
      
      // Simulate bot response streaming after a short delay
      setTimeout(() => {
        // Randomly decide if this response needs user action (50% chance)
        const needsAction = Math.random() > 0.5
        const responseList = needsAction ? botActionsResponses : botResponses
        const randomBotMessage = responseList[Math.floor(Math.random() * responseList.length)]
        
        const newMessages = [...messages, userMessage, { text: "", sender: "bot", needsAction }]
        setMessages(newMessages)
        
        // Stream the message character by character
        const messageIndex = newMessages.length - 1
        setStreamingIndex(messageIndex)
        
        let charIndex = 0
        const streamInterval = setInterval(() => {
          if (charIndex < randomBotMessage.length) {
            setMessages(prev => {
              const updated = [...prev]
              updated[messageIndex].text = randomBotMessage.slice(0, charIndex + 1)
              return updated
            })
            charIndex++
          } else {
            clearInterval(streamInterval)
            setStreamingIndex(null)
            
            // Show action buttons only if this message needs user action
            if (needsAction) {
              setTimeout(() => {
                setMessageActions(prev => ({ ...prev, [messageIndex]: true }))
              }, 500)
            }
          }
        }, 30) // Stream 30ms per character
      }, 500)
    }
  }

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

  // Scroll to latest message
  const scrollToBottom = () => {
    setIsScrolledToBottom(true)
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
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
            {conversations.map((conv) => {
              const [isHovered, setIsHovered] = useState(false)
              return (
              <div
                key={conv.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: `${theme.spacing[3]} 0`,
                  backgroundColor: activeConversation === conv.id ? theme.colors.primary[600] : "transparent",
                  borderRadius: theme.borderRadius.md,
                  cursor: "pointer",
                  transition: theme.transitions.normal,
                }}
                onMouseEnter={(e) => {
                  setIsHovered(true)
                  if (activeConversation !== conv.id) {
                    e.currentTarget.style.backgroundColor = theme.colors.neutral[100]
                  }
                }}
                onMouseLeave={(e) => {
                  setIsHovered(false)
                  if (activeConversation !== conv.id) {
                    e.currentTarget.style.backgroundColor = "transparent"
                  }
                }}
              >
                <button
                  onClick={() => setActiveConversation(conv.id)}
                  style={{
                    flex: 1,
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    textAlign: "left",
                    padding: `0 ${theme.spacing[4]}`,
                  }}
                >
                  <Text as="div" variant="body" size="sm" style={{ fontWeight: theme.typography.fontWeight.medium, margin: 0, color: activeConversation === conv.id ? theme.colors.white : theme.colors.foreground }}>
                    {conv.title}
                  </Text>
                </button>

                {/* Dropdown Menu - Only visible on hover */}
                {isHovered && (
                  <Dropdown>
                    <DropdownTrigger asChild>
                      <button
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          padding: `0 ${theme.spacing[4]}`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: activeConversation === conv.id ? theme.colors.white : theme.colors.foreground,
                        }}
                      >
                        <MoreHorizontal size={16} />
                      </button>
                    </DropdownTrigger>
                    <DropdownContent align="end">
                      <DropdownItem 
                        leadingIcon={Edit}
                        onClick={() => console.log("Rename:", conv.title)}
                      >
                        Rename
                      </DropdownItem>
                      <DropdownSeparator />
                      <DropdownItem 
                        variant="destructive"
                        leadingIcon={Trash}
                        onClick={() => {
                          setConversations(conversations.filter(c => c.id !== conv.id))
                          if (activeConversation === conv.id) {
                            setActiveConversation(null)
                          }
                        }}
                      >
                        Delete
                      </DropdownItem>
                    </DropdownContent>
                  </Dropdown>
                )}
              </div>
            )})}
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
            overflow: "hidden",
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
      </div>
    </Layout>
  )
}
