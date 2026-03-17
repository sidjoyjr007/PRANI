import { useState, useEffect } from "react"
import { Toast, ToastContainer } from "@/components/ui/toast"
import { useDispatch, useSelector } from "react-redux"
import { useParams, useNavigate, useLocation } from "react-router-dom"
import { ChevronLeft, ChevronRight } from "lucide-react"
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
  const location = useLocation()
  const { sessionId } = useParams()
  const { streamMessage, resumeStream, abortStream, connectStream, disconnectStream, isStreaming, setIsStreaming } = useAgentStream(sessionId)

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
  const [leftPanelOpen, setLeftPanelOpen] = useState(true)
  const [rightPanelOpen, setRightPanelOpen] = useState(true)

  // Toast State
  const [toasts, setToasts] = useState([])
  const addToast = (title, description, variant = "info") => {
    const id = Date.now().toString()
    setToasts((prev) => [...prev, { id, title, description, variant }])
    setTimeout(() => removeToast(id), 5000)
  }
  const removeToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id))

  // -- Handle Navigation State --
  useEffect(() => {
    if (!sessionId && location.state?.agentId) {
      setSelectedAgentId(location.state.agentId)
    }
  }, [sessionId, location.state])

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

  // Handlers --
  const scrollToBottom = () => {
    setIsScrolledToBottom(true)
  }

  const handleAgentChange = (agentId) => {
    setSelectedAgentId(agentId)
    if (sessionId) {
      // If we are in an active session and switch agents, navigate to new chat
      navigate("/work")
    }
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
    if (id === "new") {
      navigate("/work")
    } else {
      navigate(`/work/${id}`)
    }
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

  // Calculate conversations to display
  const agentConversations = selectedAgentId ? conversations.filter(c => c.agent_id === selectedAgentId) : []
  const displayConversations = (!sessionId && selectedAgentId)
    ? [{ id: "new", title: "New Chat", isTemporary: true }, ...agentConversations]
    : agentConversations
  const activePanelConversation = sessionId || (selectedAgentId ? "new" : null)

  // When no agent is selected, hide both side panels and use a centered layout
  const isNoAgentState = !selectedAgentId && !sessionId

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
      <div style={{ display: "flex", height: "100%", overflow: "hidden", position: "relative" }}>

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

        {/* Left toggle button */}
        {!isNoAgentState && (
          <button
            onClick={() => setLeftPanelOpen(v => !v)}
            title={leftPanelOpen ? "Hide conversations" : "Show conversations"}
            style={{
              position: "absolute",
              left: 0,
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 100,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "20px",
              height: "48px",
              borderRadius: "0 8px 8px 0",
              border: "1px solid #e4e8ec",
              borderLeft: "none",
              backgroundColor: "#ffffff",
              cursor: "pointer",
              color: "#8a94a0",
              boxShadow: "2px 0 6px rgba(0,0,0,0.06)",
              transition: "color 0.15s, background-color 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = "#f2f4f7"; e.currentTarget.style.color = "#4d5661" }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = "#ffffff"; e.currentTarget.style.color = "#8a94a0" }}
          >
            {leftPanelOpen ? <ChevronLeft size={12} /> : <ChevronRight size={12} />}
          </button>
        )}

        {/* Left Panel — hidden when no agent selected or collapsed */}
        {!isNoAgentState && leftPanelOpen && (
          <ConversationsPanel
            conversations={displayConversations}
            activeConversation={activePanelConversation}
            onSelectConversation={handleSelectConversation}
            onNewConversation={handleNewConversation}
            onDeleteConversation={handleDeleteConversation}
            onRenameConversation={handleRenameConversation}
            selectedAgentId={selectedAgentId}
          />
        )}

        {/* Center Panel — wraps chat + toggle buttons */}
        <div style={{
          flex: 1,
          display: "flex",
          overflow: "hidden",
          position: "relative",
          ...((!isNoAgentState && !leftPanelOpen && !rightPanelOpen) ? {
            maxWidth: "860px",
            margin: "0 auto",
            width: "100%",
          } : {}),
        }}>

          <ChatPanel
            messages={uiMessages}
            currentPlan={currentPlan}
            setMessages={() => { }}
            inputValue={inputValue}
            setInputValue={setInputValue}
            handleSendMessage={handleSendMessage}
            selectedAgentId={selectedAgentId}
            setSelectedAgentId={handleAgentChange}
            agents={agents}
            streamingIndex={null}
            messageActions={{}}
            isScrolledToBottom={isScrolledToBottom}
            setIsScrolledToBottom={setIsScrolledToBottom}
            scrollToBottom={scrollToBottom}
            onApprove={handleApprove}
            onAbort={() => abortStream(sessionId)}
            isStreaming={isStreaming}
            isCenteredMode={isNoAgentState}
          />

        </div>

        {/* Right toggle button */}
        {!isNoAgentState && (
          <button
            onClick={() => setRightPanelOpen(v => !v)}
            title={rightPanelOpen ? "Hide details" : "Show details"}
            style={{
              position: "absolute",
              right: 0,
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 100,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "20px",
              height: "48px",
              borderRadius: "8px 0 0 8px",
              border: "1px solid #e4e8ec",
              borderRight: "none",
              backgroundColor: "#ffffff",
              cursor: "pointer",
              color: "#8a94a0",
              boxShadow: "-2px 0 6px rgba(0,0,0,0.06)",
              transition: "color 0.15s, background-color 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = "#f2f4f7"; e.currentTarget.style.color = "#4d5661" }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = "#ffffff"; e.currentTarget.style.color = "#8a94a0" }}
          >
            {rightPanelOpen ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
          </button>
        )}

        {/* Right Panel — hidden when no agent selected or collapsed */}
        {!isNoAgentState && rightPanelOpen && (
          <AgentDetailsPanel
            selectedAgent={selectedAgent}
            allTools={tools}
            allLLMs={llms}
            allMCPServers={mcps}
            sessionId={sessionId}
          />
        )}

      </div>
    </Layout>
  )
}
