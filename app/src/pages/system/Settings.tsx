import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { systemService } from '@/services/system';
import type { SystemSettings } from '@/services/types/system';

export default function SystemSettings() {
  const [settings, setSettings] = useState<SystemSettings | null>(null);

  const loadSettings = async () => {
    try {
      const data = await systemService.getSettings();
      setSettings(data);
    } catch (error) {
      console.error('加载设置失败:', error);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSave = async () => {
    if (!settings) return;
    try {
      await systemService.updateSettings(settings);
      alert('保存成功');
    } catch (error) {
      console.error('保存失败:', error);
    }
  };

  if (!settings) {
    return <div className="p-6">加载中...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">系统配置</h1>
          <p className="text-muted-foreground mt-1">管理系统基本设置</p>
        </div>
        <Button onClick={handleSave}>
          <Save className="h-4 w-4 mr-2" />
          保存设置
        </Button>
      </div>

      <Tabs defaultValue="basic" className="space-y-4">
        <TabsList>
          <TabsTrigger value="basic">基本设置</TabsTrigger>
          <TabsTrigger value="model">模型配置</TabsTrigger>
          <TabsTrigger value="email">邮件配置</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>基本信息</CardTitle>
              <CardDescription>配置系统基本信息</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>系统名称</Label>
                <Input
                  value={settings.systemName}
                  onChange={(e) =>
                    setSettings({ ...settings, systemName: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>系统描述</Label>
                <Input
                  value={settings.systemDescription}
                  onChange={(e) =>
                    setSettings({ ...settings, systemDescription: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>默认语言</Label>
                <Input
                  value={settings.defaultLanguage}
                  onChange={(e) =>
                    setSettings({ ...settings, defaultLanguage: e.target.value })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="model" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>模型配置</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>默认模型</Label>
                <Input
                  value={settings.defaultModel}
                  onChange={(e) =>
                    setSettings({ ...settings, defaultModel: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>默认Temperature</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={settings.defaultTemperature}
                  onChange={(e) =>
                    setSettings({ ...settings, defaultTemperature: parseFloat(e.target.value) })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>默认Max Tokens</Label>
                <Input
                  type="number"
                  value={settings.defaultMaxTokens}
                  onChange={(e) =>
                    setSettings({ ...settings, defaultMaxTokens: parseInt(e.target.value) })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>邮件配置</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>SMTP服务器</Label>
                <Input
                  value={settings.smtpServer}
                  onChange={(e) =>
                    setSettings({ ...settings, smtpServer: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>SMTP端口</Label>
                <Input
                  type="number"
                  value={settings.smtpPort}
                  onChange={(e) =>
                    setSettings({ ...settings, smtpPort: parseInt(e.target.value) })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>发件人邮箱</Label>
                <Input
                  value={settings.senderEmail}
                  onChange={(e) =>
                    setSettings({ ...settings, senderEmail: e.target.value })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
