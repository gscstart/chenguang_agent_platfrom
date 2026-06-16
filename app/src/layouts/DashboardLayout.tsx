import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { 
  Bot, 
  Settings, 
  Database, 
  FileText, 
  LayoutDashboard, 
  Brain, 
  Wrench, 
  MessageSquare, 
  BarChart3,
  ChevronRight,
  ChevronDown,
  User,
  LogOut,
  Home
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useState } from 'react'

export default function DashboardLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const [systemMenuOpen, setSystemMenuOpen] = useState(false)

  const menuItems = [
    { path: '/', icon: LayoutDashboard, label: '工作台' },
    { path: '/agents', icon: Bot, label: 'Agent管理' },
    { path: '/models', icon: Brain, label: '模型管理' },
    { path: '/prompts', icon: FileText, label: 'Prompt管理' },
    { path: '/knowledge', icon: Database, label: '知识库' },
    { path: '/tools', icon: Wrench, label: '工具管理' },
    { path: '/conversations', icon: MessageSquare, label: '对话日志' },
    { path: '/analytics', icon: BarChart3, label: '数据统计' },
  ]

  const systemMenuItems = [
    { path: '/system/users', label: '用户管理' },
    { path: '/system/roles', label: '角色管理' },
    { path: '/system/permissions', label: '权限管理' },
    { path: '/system/api-keys', label: 'API密钥' },
    { path: '/system/audit', label: '审计日志' },
    { path: '/system/alerts', label: '告警规则' },
    { path: '/system/settings', label: '系统配置' },
  ]

  const isSystemPath = location.pathname.startsWith('/system')

  // 生成面包屑
  const getBreadcrumbs = () => {
    const paths = location.pathname.split('/').filter(Boolean)
    const breadcrumbs = [{ label: '首页', path: '/' }]
    
    let currentPath = ''
    paths.forEach((path, index) => {
      currentPath += `/${path}`
      const menuItem = menuItems.find(item => item.path === currentPath)
      const systemItem = systemMenuItems.find(item => item.path === currentPath)
      
      if (menuItem) {
        breadcrumbs.push({ label: menuItem.label, path: currentPath })
      } else if (systemItem) {
        if (breadcrumbs[breadcrumbs.length - 1].label !== '系统管理') {
          breadcrumbs.push({ label: '系统管理', path: '/system' })
        }
        breadcrumbs.push({ label: systemItem.label, path: currentPath })
      } else if (index === paths.length - 1) {
        // 最后一个路径，显示为当前页
        breadcrumbs.push({ label: path, path: currentPath })
      }
    })
    
    return breadcrumbs
  }

  const breadcrumbs = getBreadcrumbs()

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Logo Area */}
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-sm">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-bold text-base text-gray-900">辰光 Agent</div>
              <div className="text-xs text-gray-500">Enterprise</div>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="text-xs font-semibold text-gray-400 px-3 mb-2">平台功能</div>
          
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path || 
              (item.path !== '/' && location.pathname.startsWith(item.path))
            return (
              <Link key={item.path} to={item.path}>
                <div
                  className={`
                    relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all cursor-pointer
                    ${isActive 
                      ? 'bg-blue-500 text-white' 
                      : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                >
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-600 rounded-r-full" />
                  )}
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
              </Link>
            )
          })}
          
          {/* System Menu with Submenu */}
          <div className="pt-4">
            <div className="text-xs font-semibold text-gray-400 px-3 mb-2">系统设置</div>
            <div>
              <div
                className={`
                  relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all cursor-pointer
                  ${isSystemPath 
                    ? 'bg-blue-500 text-white' 
                    : 'text-gray-700 hover:bg-gray-100'
                  }
                `}
                onClick={() => setSystemMenuOpen(!systemMenuOpen)}
              >
                {isSystemPath && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-600 rounded-r-full" />
                )}
                <Settings className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm font-medium flex-1">系统管理</span>
                {systemMenuOpen ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </div>
              
              {systemMenuOpen && (
                <div className="mt-1 ml-8 space-y-1">
                  {systemMenuItems.map((item) => {
                    const isActive = location.pathname === item.path
                    return (
                      <Link key={item.path} to={item.path}>
                        <div
                          className={`
                            px-3 py-2 rounded-lg text-sm transition-all cursor-pointer
                            ${isActive 
                              ? 'bg-blue-500 text-white' 
                              : 'text-gray-600 hover:bg-gray-100'
                            }
                          `}
                        >
                          {item.label}
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </nav>

        {/* User Area at Bottom */}
        <div className="p-3 border-t border-gray-200">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-100 cursor-pointer transition-all">
                <Avatar className="h-9 w-9 border-2 border-gray-200">
                  <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=admin" />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                    管
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">管理员</div>
                  <div className="text-xs text-gray-500 truncate">admin@example.com</div>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>我的账户</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/profile')}>
                <User className="mr-2 h-4 w-4" />
                <span>个人资料</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/settings')}>
                <Settings className="mr-2 h-4 w-4" />
                <span>账户设置</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-red-600"
                onClick={() => {
                  import('@/services/auth').then(({ authService }) => authService.logout());
                  navigate('/login');
                }}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>退出登录</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Right Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Breadcrumb Bar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-6">
          <div className="flex items-center gap-2 text-sm">
            {breadcrumbs.map((crumb, index) => (
              <div key={crumb.path} className="flex items-center gap-2">
                {index > 0 && <ChevronRight className="h-4 w-4 text-gray-400" />}
                {index === breadcrumbs.length - 1 ? (
                  <span className="text-gray-900 font-medium">{crumb.label}</span>
                ) : (
                  <Link 
                    to={crumb.path}
                    className="text-gray-500 hover:text-gray-900 transition-colors"
                  >
                    {index === 0 ? <Home className="h-4 w-4" /> : crumb.label}
                  </Link>
                )}
              </div>
            ))}
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
