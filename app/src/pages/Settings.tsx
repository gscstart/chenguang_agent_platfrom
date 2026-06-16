import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Lock, 
  Bell, 
  Globe, 
  Palette, 
  Shield, 
  Key,
  Smartphone,
  Mail,
  Save,
  AlertCircle
} from 'lucide-react';

export default function Settings() {
  const [saving, setSaving] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const [settings, setSettings] = useState({
    // 通知设置
    emailNotifications: true,
    pushNotifications: false,
    agentAlerts: true,
    systemUpdates: true,
    weeklyReport: true,
    
    // 安全设置
    twoFactorAuth: false,
    sessionTimeout: '30',
    
    // 偏好设置
    language: 'zh-CN',
    theme: 'light',
    timezone: 'Asia/Shanghai',
  });

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      // await settingsService.updateSettings(settings);
      alert('设置已保存');
    } catch {
      alert('保存失败');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordForm.current || !passwordForm.new || !passwordForm.confirm) {
      alert('请填写所有密码字段');
      return;
    }

    if (passwordForm.new !== passwordForm.confirm) {
      alert('新密码两次输入不一致');
      return;
    }

    if (passwordForm.new.length < 8) {
      alert('密码长度至少8位');
      return;
    }

    setSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      // await authService.changePassword(passwordForm);
      alert('密码修改成功');
      setPasswordForm({ current: '', new: '', confirm: '' });
    } catch {
      alert('密码修改失败');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">账户设置</h2>
        <p className="text-muted-foreground">管理您的账户安全和偏好设置</p>
      </div>

      <div className="grid gap-6">
        {/* Password Change */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              <CardTitle>修改密码</CardTitle>
            </div>
            <CardDescription>定期更换密码以保护账户安全</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">当前密码</Label>
              <Input
                id="current-password"
                type="password"
                value={passwordForm.current}
                onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                placeholder="请输入当前密码"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-password">新密码</Label>
              <Input
                id="new-password"
                type="password"
                value={passwordForm.new}
                onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
                placeholder="请输入新密码（至少8位）"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">确认新密码</Label>
              <Input
                id="confirm-password"
                type="password"
                value={passwordForm.confirm}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                placeholder="请再次输入新密码"
              />
            </div>

            <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-600">
                <p className="font-medium">密码要求：</p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>至少8个字符</li>
                  <li>包含大小写字母</li>
                  <li>包含数字和特殊字符</li>
                </ul>
              </div>
            </div>

            <Button onClick={handleChangePassword} disabled={saving}>
              <Lock className="h-4 w-4 mr-2" />
              {saving ? '修改中...' : '修改密码'}
            </Button>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              <CardTitle>安全设置</CardTitle>
            </div>
            <CardDescription>增强您的账户安全性</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4 text-muted-foreground" />
                  <Label>双因素认证</Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  使用手机验证码增强登录安全
                </p>
              </div>
              <Switch
                checked={settings.twoFactorAuth}
                onCheckedChange={(checked) => 
                  setSettings({ ...settings, twoFactorAuth: checked })
                }
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>会话超时时间</Label>
              <Select
                value={settings.sessionTimeout}
                onValueChange={(value) => 
                  setSettings({ ...settings, sessionTimeout: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15分钟</SelectItem>
                  <SelectItem value="30">30分钟</SelectItem>
                  <SelectItem value="60">1小时</SelectItem>
                  <SelectItem value="120">2小时</SelectItem>
                  <SelectItem value="0">永不超时</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                长时间无操作后自动退出登录
              </p>
            </div>

            <Separator />

            <div>
              <Button variant="outline">
                <Key className="h-4 w-4 mr-2" />
                管理API密钥
              </Button>
              <p className="text-sm text-muted-foreground mt-2">
                查看和管理您的API访问密钥
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              <CardTitle>通知设置</CardTitle>
            </div>
            <CardDescription>选择您希望接收的通知类型</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <Label>邮件通知</Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  接收重要事件的邮件通知
                </p>
              </div>
              <Switch
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => 
                  setSettings({ ...settings, emailNotifications: checked })
                }
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>浏览器推送通知</Label>
                <p className="text-sm text-muted-foreground">
                  在浏览器中接收实时通知
                </p>
              </div>
              <Switch
                checked={settings.pushNotifications}
                onCheckedChange={(checked) => 
                  setSettings({ ...settings, pushNotifications: checked })
                }
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Agent告警通知</Label>
                <p className="text-sm text-muted-foreground">
                  Agent异常或错误时通知
                </p>
              </div>
              <Switch
                checked={settings.agentAlerts}
                onCheckedChange={(checked) => 
                  setSettings({ ...settings, agentAlerts: checked })
                }
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>系统更新通知</Label>
                <p className="text-sm text-muted-foreground">
                  平台功能更新和维护通知
                </p>
              </div>
              <Switch
                checked={settings.systemUpdates}
                onCheckedChange={(checked) => 
                  setSettings({ ...settings, systemUpdates: checked })
                }
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>每周报告</Label>
                <p className="text-sm text-muted-foreground">
                  每周发送使用情况汇总报告
                </p>
              </div>
              <Switch
                checked={settings.weeklyReport}
                onCheckedChange={(checked) => 
                  setSettings({ ...settings, weeklyReport: checked })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              <CardTitle>偏好设置</CardTitle>
            </div>
            <CardDescription>自定义您的使用体验</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>
                  <Globe className="h-4 w-4 inline mr-2" />
                  语言
                </Label>
                <Select
                  value={settings.language}
                  onValueChange={(value) => 
                    setSettings({ ...settings, language: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="zh-CN">简体中文</SelectItem>
                    <SelectItem value="zh-TW">繁體中文</SelectItem>
                    <SelectItem value="en-US">English</SelectItem>
                    <SelectItem value="ja-JP">日本語</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>
                  <Palette className="h-4 w-4 inline mr-2" />
                  主题
                </Label>
                <Select
                  value={settings.theme}
                  onValueChange={(value) => 
                    setSettings({ ...settings, theme: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">浅色</SelectItem>
                    <SelectItem value="dark">深色</SelectItem>
                    <SelectItem value="auto">跟随系统</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 col-span-2">
                <Label>时区</Label>
                <Select
                  value={settings.timezone}
                  onValueChange={(value) => 
                    setSettings({ ...settings, timezone: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Asia/Shanghai">中国标准时间 (UTC+8)</SelectItem>
                    <SelectItem value="Asia/Tokyo">日本标准时间 (UTC+9)</SelectItem>
                    <SelectItem value="America/New_York">美国东部时间 (UTC-5)</SelectItem>
                    <SelectItem value="Europe/London">格林威治时间 (UTC+0)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end gap-2">
          <Button variant="outline">重置为默认</Button>
          <Button onClick={handleSaveSettings} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? '保存中...' : '保存设置'}
          </Button>
        </div>
      </div>
    </div>
  );
}
