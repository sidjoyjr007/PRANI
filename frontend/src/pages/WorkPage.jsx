import { useState, useEffect } from "react"
import { Toast, ToastContainer } from "@/components/ui/toast"
import { useDispatch, useSelector } from "react-redux"
import { useParams, useNavigate } from "react-router-dom"
import Layout from "@/components/Layout"
import ConversationsPanel from "@/components/work/ConversationsPanel"
import ChatPanel from "@/components/work/ChatPanel"
import AgentDetailsPanel from "@/components/work/AgentDetailsPanel"

import { fetchAgents } from "@/store/slices/agentSlice"
import { fetchTools } from "@/store/slices/toolSlice"
import { fetchLLMs } from "@/store/slices/llmSlice"
import { fetchMCPs } from "@/store/slices/mcpSlice"
import {
  fetchConversations,
  setCurrentConversationId,
  createConversation,
  fetchMessages,
  deleteConversation,
  updateConversation,
  fetchPlan
} from "@/store/slices/conversationSlice"

import { useAgentStream } from "@/hooks/useAgentStream"

export default function WorkPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { sessionId } = useParams()
  const { streamMessage, resumeStream, abortStream, connectStream, disconnectStream, isStreaming } = useAgentStream(sessionId)

  // -- Redux Data --
  const { items: agents } = useSelector((state) => state.agents)
  const { items: tools } = useSelector((state) => state.tools)
  const { items: llms } = useSelector((state) => state.llms)
  const { items: mcps } = useSelector((state) => state.mcps)
  const { list: conversations, messages, currentConversationId, currentPlan } = useSelector((state) => state.conversations)

  // -- Local State for UI --
  const [inputValue, setInputValue] = useState("")
  const [selectedAgentId, setSelectedAgentId] = useState("")
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(true)

  // Toast State
  const [toasts, setToasts] = useState([])
  const addToast = (title, description, variant = "info") => {
    const id = Date.now().toString()
    setToasts((prev) => [...prev, { id, title, description, variant }])
    setTimeout(() => removeToast(id), 5000)
  }
  const removeToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id))

  // -- Fetch Data on Mount --
  useEffect(() => {
    dispatch(fetchAgents({ size: 100 }))
    dispatch(fetchTools({ size: 100 }))
    dispatch(fetchLLMs({ size: 100 }))
    dispatch(fetchMCPs({ size: 100 }))
    dispatch(fetchConversations())
  }, [dispatch])

  // -- Handle Session Routing --
  useEffect(() => {
    if (sessionId) {
      if (currentConversationId !== sessionId) {
        dispatch(setCurrentConversationId(sessionId))
        dispatch(fetchMessages(sessionId))
        dispatch(fetchPlan(sessionId)).unwrap().then((data) => {
          // Restore streaming state if the agent is active
          if (data && ["THINKING", "TOOL_EXECUTION", "SUMMARIZING", "PLANNING"].includes(data.agent_state)) {
            setIsStreaming(true);
          }
        });
      }

      // Connect to the real-time event stream
      connectStream(sessionId)

      // Update selected agent based on conversation history if available
      const conv = conversations.find(c => c.id === sessionId)
      if (conv?.agent_id) {
        setSelectedAgentId(conv.agent_id)
      }
    } else {
      dispatch(setCurrentConversationId(null))
      disconnectStream()
    }

    return () => disconnectStream()
  }, [sessionId, dispatch, conversations, currentConversationId, connectStream, disconnectStream])

  // -- Handlers --
  const scrollToBottom = () => {
    setIsScrolledToBottom(true)
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isStreaming) return

    const content = inputValue
    setInputValue("")

    if (sessionId) {
      // Existing conversation
      await streamMessage(sessionId, content, selectedAgentId)
    } else {
      // New conversation
      if (!selectedAgentId) return

      try {
        const newConv = await dispatch(createConversation({
          title: content.slice(0, 30) + (content.length > 30 ? "..." : ""), // Simple title generation
          agent_id: selectedAgentId
        })).unwrap()

        // Wait for the event stream to connect BEFORE streaming the message
        // to prevent race conditions where events are missed.
        await connectStream(newConv.id)

        navigate(`/work/${newConv.id}`)
        // Stream message to the new conversation
        await streamMessage(newConv.id, content, selectedAgentId)
      } catch (error) {
        console.error("Failed to create conversation:", error)
        // Restore input on error?
        setInputValue(content)
      }
    }
  }

  const handleApprove = async (toolCalls) => {
    if (!sessionId) return;
    await resumeStream(sessionId, toolCalls);
  }

  // Conversation Panel Handlers
  const handleSelectConversation = (id) => {
    navigate(`/work/${id}`)
  }

  const handleNewConversation = () => {
    navigate("/work")
  }

  const handleDeleteConversation = async (id) => {
    try {
      await dispatch(deleteConversation(id)).unwrap()
      addToast("Success", "Conversation deleted successfully", "success")
      if (sessionId === id) {
        navigate("/work")
      }
    } catch (error) {
      addToast("Error", "Failed to delete conversation", "error")
    }
  }

  const handleRenameConversation = async (id, newTitle) => {
    await dispatch(updateConversation({ id, title: newTitle })).unwrap()
  }

  // Helper to resolve selected agent object
  const selectedAgent = agents.find(a => a.id === selectedAgentId)

  // Map Redux messages to ChatPanel format
  const uiMessages = messages.map(m => ({
    id: m.id,
    text: m.text || (typeof m.content === 'string' ? m.content : JSON.stringify(m.content)),
    sender: m.role === "user" ? "user" : "bot",
    thoughts: m.thoughts,
    tool_calls: m.tool_calls,
    approval_required: m.approval_required,
    pending_tool_calls: m.pending_tool_calls,
    error: m.error
  }))

  return (
    <Layout>
      <div style={{ display: "flex", height: "100%", overflow: "hidden" }}>

        <ToastContainer position="top-center">
          {toasts.map((toast) => (
            <Toast
              key={toast.id}
              title={toast.title}
              description={toast.description}
              variant={toast.variant}
              onDismiss={() => removeToast(toast.id)}
            />
          ))}
        </ToastContainer>

        {/* Left Panel */}
        <ConversationsPanel
          conversations={selectedAgentId ? conversations.filter(c => c.agent_id === selectedAgentId) : []}
          activeConversation={sessionId}
          onSelectConversation={handleSelectConversation}
          onNewConversation={handleNewConversation}
          onDeleteConversation={handleDeleteConversation}
          onRenameConversation={handleRenameConversation}
          selectedAgentId={selectedAgentId}
        />

        {/* Center Panel */}
        <ChatPanel
          messages={uiMessages}
          currentPlan={currentPlan}
          setMessages={() => { }}
          inputValue={inputValue}
          setInputValue={setInputValue}
          handleSendMessage={handleSendMessage}
          selectedAgentId={selectedAgentId}
          setSelectedAgentId={setSelectedAgentId}
          agents={agents}
          streamingIndex={null}
          messageActions={{}}
          isScrolledToBottom={isScrolledToBottom}
          setIsScrolledToBottom={setIsScrolledToBottom}
          scrollToBottom={scrollToBottom}
          onApprove={handleApprove}
          onAbort={() => abortStream(sessionId)}
          isStreaming={isStreaming}
        />

        {/* Right Panel */}
        <AgentDetailsPanel
          selectedAgent={selectedAgent}
          allTools={tools}
          allLLMs={llms}
          allMCPServers={mcps}
          sessionId={sessionId}
        />

      </div>
    </Layout>
  )
}
