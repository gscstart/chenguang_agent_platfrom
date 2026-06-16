import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AgentMonitor() {

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Agent监控</h1>
        <p className="text-muted-foreground">智能客服Agent的实时监控数据</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">调用量</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,247</div>
            <p className="text-xs text-muted-foreground">今日</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">成功率</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">98.5%</div>
            <p className="text-xs text-muted-foreground">今日</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">平均延迟</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1.2s</div>
            <p className="text-xs text-muted-foreground">今日</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Token消耗</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">234K</div>
            <p className="text-xs text-muted-foreground">今日</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="1h">
        <TabsList>
          <TabsTrigger value="1h">1小时</TabsTrigger>
          <TabsTrigger value="24h">24小时</TabsTrigger>
          <TabsTrigger value="7d">7天</TabsTrigger>
          <TabsTrigger value="30d">30天</TabsTrigger>
        </TabsList>
        <TabsContent value="1h" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>调用量趋势</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                [折线图占位]
              </div>
            </CardContent>
          </Card>
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>成功率趋势</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                  [折线图占位]
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>延迟分布</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                  [柱状图占位]
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>错误分布</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            [饼图占位]
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
