import './App.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import VerifyEmailPage from './pages/VerifyEmailPage'
import WorkPage from './pages/WorkPage'
import WorkConversationPage from './pages/WorkConversationPage'
import AgentsPage from './pages/AgentsPage'
import CreateAgentPage from './pages/CreateAgentPage'
import ToolsPage from './pages/ToolsPage'
import ToolTestPage from './pages/ToolTestPage'
import CreateToolPage from './pages/CreateToolPage'
import MCPServersPage from './pages/MCPServersPage'
import CreateMCPServerPage from './pages/CreateMCPServerPage'
import LLMsPage from './pages/LLMsPage'
import CreateLLMPage from './pages/CreateLLMPage'
import LogsPage from './pages/LogsPage'
import ComponentShowcase from './pages/ComponentShowcase'
import NotFoundPage from './pages/NotFoundPage'
import { ProtectedRoute, PublicRoute } from './components/ProtectedRoute'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />
        <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
        <Route path="/reset-password" element={<PublicRoute><ResetPasswordPage /></PublicRoute>} />
        <Route path="/verify-email" element={<PublicRoute><VerifyEmailPage /></PublicRoute>} />
        <Route path="/work" element={<ProtectedRoute><WorkPage /></ProtectedRoute>} />
        <Route path="/work/:sessionId" element={<ProtectedRoute><WorkConversationPage /></ProtectedRoute>} />
        <Route path="/logs" element={<ProtectedRoute><LogsPage /></ProtectedRoute>} />
        <Route path="/agents" element={<ProtectedRoute><AgentsPage /></ProtectedRoute>} />
        <Route path="/create-agent" element={<ProtectedRoute><CreateAgentPage /></ProtectedRoute>} />
        <Route path="/edit-agent/:agentId" element={<ProtectedRoute><CreateAgentPage /></ProtectedRoute>} />
        <Route path="/tools" element={<ProtectedRoute><ToolsPage /></ProtectedRoute>} />
        <Route path="/test-tool/:toolId" element={<ProtectedRoute><ToolTestPage /></ProtectedRoute>} />
        <Route path="/create-tool" element={<ProtectedRoute><CreateToolPage /></ProtectedRoute>} />
        <Route path="/edit-tool/:toolId" element={<ProtectedRoute><CreateToolPage /></ProtectedRoute>} />
        <Route path="/mcp-servers" element={<ProtectedRoute><MCPServersPage /></ProtectedRoute>} />
        <Route path="/create-mcp-server" element={<ProtectedRoute><CreateMCPServerPage /></ProtectedRoute>} />
        <Route path="/edit-mcp-server/:serverId" element={<ProtectedRoute><CreateMCPServerPage /></ProtectedRoute>} />
        <Route path="/llms" element={<ProtectedRoute><LLMsPage /></ProtectedRoute>} />
        <Route path="/create-llm" element={<ProtectedRoute><CreateLLMPage /></ProtectedRoute>} />
        <Route path="/edit-llm/:llmId" element={<ProtectedRoute><CreateLLMPage /></ProtectedRoute>} />
        <Route path="/components" element={<ComponentShowcase />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
