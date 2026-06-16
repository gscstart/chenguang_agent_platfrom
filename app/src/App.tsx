import { BrowserRouter, Routes, Route } from 'react-router-dom'
import DashboardLayout from './layouts/DashboardLayout'
import AuthGuard from './components/AuthGuard'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Profile from './pages/Profile'
import Settings from './pages/Settings'
import { AgentList, AgentCreate, AgentDetail, AgentTest, AgentVersions, AgentMonitor } from './pages/agent'
import { ModelList, ModelProviders, ModelCreate } from './pages/model'
import { PromptList, PromptCreate, PromptVersions } from './pages/prompt'
import { KnowledgeList, KnowledgeCreate, KnowledgeDetail, KnowledgeDocuments, KnowledgeSegments, KnowledgeTest } from './pages/knowledge'
import { ToolList, ToolCreate, ToolDetail } from './pages/tool'
import { ConversationList, ConversationDetail } from './pages/conversation'
import { AnalyticsUsage, AnalyticsCosts, AnalyticsEvaluation } from './pages/analytics'
import { SystemUsers, SystemRoles, SystemPermissions, SystemApiKeys, SystemAudit, SystemAlerts, SystemSettings } from './pages/system'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Login Route - Outside DashboardLayout */}
        <Route path="/login" element={<Login />} />
        
        {/* Main App Routes - Inside DashboardLayout, protected by AuthGuard */}
        <Route path="/" element={<AuthGuard><DashboardLayout /></AuthGuard>}>
          <Route index element={<Dashboard />} />
          
          {/* User Routes */}
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<Settings />} />
          
          {/* Agent Routes */}
          <Route path="agents" element={<AgentList />} />
          <Route path="agents/create" element={<AgentCreate />} />
          <Route path="agents/:id" element={<AgentDetail />} />
          <Route path="agents/:id/edit" element={<AgentCreate />} />
          <Route path="agents/:id/test" element={<AgentTest />} />
          <Route path="agents/:id/versions" element={<AgentVersions />} />
          <Route path="agents/:id/monitor" element={<AgentMonitor />} />
          
          {/* Model Routes */}
          <Route path="models" element={<ModelList />} />
          <Route path="models/create" element={<ModelCreate />} />
          <Route path="models/:id/edit" element={<ModelCreate />} />
          <Route path="models/providers" element={<ModelProviders />} />
          
          {/* Prompt Routes */}
          <Route path="prompts" element={<PromptList />} />
          <Route path="prompts/create" element={<PromptCreate />} />
          <Route path="prompts/:id/edit" element={<PromptCreate />} />
          <Route path="prompts/:id/versions" element={<PromptVersions />} />
          
          {/* Knowledge Routes */}
          <Route path="knowledge" element={<KnowledgeList />} />
          <Route path="knowledge/create" element={<KnowledgeCreate />} />
          <Route path="knowledge/:id" element={<KnowledgeDetail />} />
          <Route path="knowledge/:id/documents" element={<KnowledgeDocuments />} />
          <Route path="knowledge/:id/segments" element={<KnowledgeSegments />} />
          <Route path="knowledge/:id/test" element={<KnowledgeTest />} />
          
          {/* Tool Routes */}
          <Route path="tools" element={<ToolList />} />
          <Route path="tools/create" element={<ToolCreate />} />
          <Route path="tools/:id" element={<ToolDetail />} />
          
          {/* Conversation Routes */}
          <Route path="conversations" element={<ConversationList />} />
          <Route path="conversations/:id" element={<ConversationDetail />} />
          
          {/* Analytics Routes */}
          <Route path="analytics" element={<AnalyticsUsage />} />
          <Route path="analytics/costs" element={<AnalyticsCosts />} />
          <Route path="analytics/evaluation" element={<AnalyticsEvaluation />} />
          
          {/* System Routes */}
          <Route path="system/users" element={<SystemUsers />} />
          <Route path="system/roles" element={<SystemRoles />} />
          <Route path="system/permissions" element={<SystemPermissions />} />
          <Route path="system/api-keys" element={<SystemApiKeys />} />
          <Route path="system/audit" element={<SystemAudit />} />
          <Route path="system/alerts" element={<SystemAlerts />} />
          <Route path="system/settings" element={<SystemSettings />} />
          <Route path="*" element={<div className="p-6 text-center text-muted-foreground">页面开发中...</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
