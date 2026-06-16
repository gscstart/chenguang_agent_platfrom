import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { User, Mail, Phone, MapPin, Calendar, Upload, Save } from 'lucide-react';

export default function Profile() {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [profile, setProfile] = useState({
    name: '管理员',
    email: 'admin@example.com',
    phone: '+86 138 0000 0000',
    department: '技术部',
    position: '系统管理员',
    location: '北京市朝阳区',
    bio: '负责辰光Agent平台的系统管理和运维工作',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
    joinDate: '2024-01-15',
    lastLogin: '2024-02-08 10:30:00',
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      // 模拟保存
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 这里应该调用实际的API
      // await userService.updateProfile(profile);
      
      setEditing(false);
      alert('保存成功');
    } catch {
      alert('保存失败');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = () => {
    // 触发文件选择
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setProfile({ ...profile, avatar: e.target?.result as string });
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">个人资料</h2>
        <p className="text-muted-foreground">管理您的个人信息和偏好设置</p>
      </div>

      <div className="grid gap-6">
        {/* Profile Header */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-6">
              <div className="relative">
                <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                  <AvatarImage src={profile.avatar} />
                  <AvatarFallback className="text-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                    {profile.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                {editing && (
                  <Button
                    size="sm"
                    variant="secondary"
                    className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                    onClick={handleAvatarUpload}
                  >
                    <Upload className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-2xl font-bold">{profile.name}</h3>
                  <Badge variant="secondary">{profile.position}</Badge>
                </div>
                <p className="text-muted-foreground mb-4">{profile.email}</p>
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>加入于 {profile.joinDate}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    <span>最后登录 {profile.lastLogin}</span>
                  </div>
                </div>
              </div>
              <div>
                {!editing ? (
                  <Button onClick={() => setEditing(true)}>编辑资料</Button>
                ) : (
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setEditing(false)}>
                      取消
                    </Button>
                    <Button onClick={handleSave} disabled={saving}>
                      <Save className="h-4 w-4 mr-2" />
                      {saving ? '保存中...' : '保存'}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>基本信息</CardTitle>
            <CardDescription>您的个人基本信息</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">姓名</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    disabled={!editing}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">邮箱</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    disabled={!editing}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">手机号</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="phone"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    disabled={!editing}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">所在地</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="location"
                    value={profile.location}
                    onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                    disabled={!editing}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">部门</Label>
                <Input
                  id="department"
                  value={profile.department}
                  onChange={(e) => setProfile({ ...profile, department: e.target.value })}
                  disabled={!editing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="position">职位</Label>
                <Input
                  id="position"
                  value={profile.position}
                  onChange={(e) => setProfile({ ...profile, position: e.target.value })}
                  disabled={!editing}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">个人简介</Label>
              <Textarea
                id="bio"
                value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                disabled={!editing}
                rows={3}
                placeholder="介绍一下自己..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Account Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>账户统计</CardTitle>
            <CardDescription>您的平台使用情况</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">12</div>
                <div className="text-sm text-muted-foreground mt-1">创建的Agent</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">45</div>
                <div className="text-sm text-muted-foreground mt-1">上传的文档</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">8</div>
                <div className="text-sm text-muted-foreground mt-1">创建的Prompt</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">156</div>
                <div className="text-sm text-muted-foreground mt-1">总调用次数</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>最近活动</CardTitle>
            <CardDescription>您最近的操作记录</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { action: '创建了Agent', name: '智能客服Agent', time: '2小时前' },
                { action: '上传了文档', name: '产品手册v2.0.pdf', time: '5小时前' },
                { action: '修改了Prompt', name: '客服对话模板', time: '1天前' },
                { action: '创建了知识库', name: '技术文档库', time: '2天前' },
              ].map((activity, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">
                        {activity.action} <span className="text-blue-600">{activity.name}</span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                    </div>
                  </div>
                  {index < 3 && <Separator className="mt-4" />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
