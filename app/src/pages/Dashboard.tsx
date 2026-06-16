import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Activity, TrendingUp, DollarSign, Bot, AlertCircle, CheckCircle2, Info } from 'lucide-react'
import { dashboardService } from '@/services/dashboard'
import type { DashboardStats, TrendData, AgentRanking, Alert, ResourceUsage } from '@/services/types/dashboard'

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [trends, setTrends] = useState<TrendData[]>([])
  const [topAgents, setTopAgents] = useState<AgentRanking[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [resources, setResources] = useState<ResourceUsage[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [statsData, trendsData, agentsData, alertsData, resourcesData] = await Promise.all([
        dashboardService.getDashboardStats(),
        dashboardService.getTrendData(),
        dashboardService.getTopAgents(),
        dashboardService.getRecentAlerts(),
        dashboardService.getResourceUsage()
      ])
      setStats(statsData)
      setTrends(trendsData)
      setTopAgents(agentsData)
      setAlerts(alertsData)
      setResources(resourcesData)
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <TrendingUp className="h-3 w-3 text-green-600" />
    if (trend < 0) return <TrendingUp className="h-3 w-3 text-red-600 rotate-180" />
    return null
  }

  const getAlertIcon = (level: string) => {
    switch (level) {
      case 'error':
      case 'critical':
        return <AlertCircle className="h-4 w-4 text-red-600" />
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />
      case 'info':
        return <Info className="h-4 w-4 text-blue-600" />
      default:
        return <CheckCircle2 className="h-4 w-4 text-green-600" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">加载中...</div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">工作台</h2>
        <p className="text-muted-foreground">欢迎回来，查看平台运行状态</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">今日调用量</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.todayCalls.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              {getTrendIcon(stats?.todayCallsTrend || 0)}
              <span className="ml-1">较昨日 {stats?.todayCallsTrend > 0 ? '+' : ''}{stats?.todayCallsTrend}%</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Token消耗</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats?.tokenUsage || 0)}</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              {getTrendIcon(stats?.tokenUsageTrend || 0)}
              <span className="ml-1">较昨日 {stats?.tokenUsageTrend > 0 ? '+' : ''}{stats?.tokenUsageTrend}%</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">费用估算</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">¥{stats?.cost.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              {getTrendIcon(stats?.costTrend || 0)}
              <span className="ml-1">较昨日 {stats?.costTrend > 0 ? '+' : ''}{stats?.costTrend}%</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">活跃Agent</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeAgents}/{stats?.totalAgents}</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              {getTrendIcon(stats?.activeAgentsTrend || 0)}
              <span className="ml-1">较昨日 {stats?.activeAgentsTrend}</span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Trends and Rankings */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Agent Rankings */}
        <Card>
          <CardHeader>
            <CardTitle>Agent排行榜</CardTitle>
            <CardDescription>调用量Top 5的Agent</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topAgents.map((agent, index) => (
                <div key={agent.agentId} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{agent.agentName}</p>
                      <p className="text-sm text-muted-foreground">{agent.calls.toLocaleString()}次调用</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-green-600">{agent.successRate}%</p>
                    <p className="text-xs text-muted-foreground">{agent.avgLatency}s</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Alerts */}
        <Card>
          <CardHeader>
            <CardTitle>最近告警</CardTitle>
            <CardDescription>系统告警事件</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div key={alert.id} className="flex items-start gap-3 p-3 border rounded-lg">
                  {getAlertIcon(alert.level)}
                  <div className="flex-1">
                    <p className="text-sm font-medium">{alert.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">{alert.time}</p>
                  </div>
                  <Badge variant={alert.status === 'resolved' ? 'secondary' : 'default'}>
                    {alert.status === 'resolved' ? '已处理' : '未处理'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resource Usage */}
      <Card>
        <CardHeader>
          <CardTitle>资源用量</CardTitle>
          <CardDescription>系统资源使用情况</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {resources.map((resource) => (
              <div key={resource.name} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{resource.name}</span>
                  <span className="text-muted-foreground">
                    {resource.used.toLocaleString()} / {resource.total.toLocaleString()} {resource.unit}
                  </span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      resource.percentage > 80 ? 'bg-red-500' :
                      resource.percentage > 60 ? 'bg-yellow-500' : 'bg-primary'
                    }`}
                    style={{ width: `${resource.percentage}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">{resource.percentage}% 已使用</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
