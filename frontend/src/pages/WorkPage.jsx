import { useState, useEffect, useRef } from "react"
import { useDispatch, useSelector } from "react-redux"
import Layout from "@/components/Layout"
import ConversationsPanel from "@/components/work/ConversationsPanel"
import ChatPanel from "@/components/work/ChatPanel"
import AgentDetailsPanel from "@/components/work/AgentDetailsPanel"

import { fetchAgents } from "@/store/slices/agentSlice"
import { fetchTools } from "@/store/slices/toolSlice"
import { fetchLLMs } from "@/store/slices/llmSlice"

export default function WorkPage() {
  const dispatch = useDispatch()

  // -- Redux Data --
  const { items: agents } = useSelector((state) => state.agents)
  const { items: tools } = useSelector((state) => state.tools)
  const { items: llms } = useSelector((state) => state.llms)

  // -- Chat State --
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState("")
  const [selectedAgentId, setSelectedAgentId] = useState("")
  const [streamingIndex, setStreamingIndex] = useState(null)
  const [messageActions, setMessageActions] = useState({})
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(true)
  const messagesEndRef = useRef(null)

  // -- Conversations State --
  const [conversations, setConversations] = useState([
    { id: 1, title: "Project Planning", date: "Today" },
    { id: 2, title: "Design Feedback", date: "Yesterday" },
    { id: 3, title: "Bug Discussion", date: "2 days ago" },
  ])
  const [activeConversation, setActiveConversation] = useState(null)


  // -- Fetch Data on Mount --
  useEffect(() => {
    dispatch(fetchAgents({ size: 100 })) // Fetch all agents for the dropdown
    dispatch(fetchTools({ size: 100 }))  // Fetch all tools to resolve names
    dispatch(fetchLLMs({ size: 100 }))   // Fetch all LLMs for info
  }, [dispatch])


  // -- Handlers --
  const scrollToBottom = () => {
    setIsScrolledToBottom(true)
  }

  // Mock bot responses
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

      // Simulate bot response
      setTimeout(() => {
        const needsAction = Math.random() > 0.5
        const responseList = needsAction ? botActionsResponses : botResponses
        const randomBotMessage = responseList[Math.floor(Math.random() * responseList.length)]

        const newMessages = [...messages, userMessage, { text: "", sender: "bot", needsAction }]
        setMessages(newMessages)

        const messageIndex = newMessages.length - 1
        setStreamingIndex(messageIndex)

        let charIndex = 0
        const streamInterval = setInterval(() => {
          if (charIndex < randomBotMessage.length) {
            setMessages(prev => {
              const updated = [...prev]
              if (updated[messageIndex]) {
                updated[messageIndex].text = randomBotMessage.slice(0, charIndex + 1)
              }
              return updated
            })
            charIndex++
          } else {
            clearInterval(streamInterval)
            setStreamingIndex(null)

            if (needsAction) {
              setTimeout(() => {
                setMessageActions(prev => ({ ...prev, [messageIndex]: true }))
              }, 500)
            }
          }
        }, 30)
      }, 500)
    }
  }

  // Find the selected agent object to pass to details panel
  const selectedAgent = agents.find(a => a.id === selectedAgentId)

  return (
    <Layout>
      <div style={{ display: "flex", height: "100%", overflow: "hidden" }}>

        {/* Left Panel */}
        <ConversationsPanel
          conversations={conversations}
          activeConversation={activeConversation}
          setActiveConversation={setActiveConversation}
          setConversations={setConversations}
          selectedAgentId={selectedAgentId}
        />

        {/* Center Panel */}
        <ChatPanel
          messages={messages}
          setMessages={setMessages}
          inputValue={inputValue}
          setInputValue={setInputValue}
          handleSendMessage={handleSendMessage}
          selectedAgentId={selectedAgentId}
          setSelectedAgentId={setSelectedAgentId}
          agents={agents}
          streamingIndex={streamingIndex}
          messageActions={messageActions}
          isScrolledToBottom={isScrolledToBottom}
          setIsScrolledToBottom={setIsScrolledToBottom}
          scrollToBottom={scrollToBottom}
        />

        {/* Right Panel */}
        <AgentDetailsPanel
          selectedAgent={selectedAgent}
          allTools={tools}
          allLLMs={llms}
        />

      </div>
    </Layout>
  )
}
