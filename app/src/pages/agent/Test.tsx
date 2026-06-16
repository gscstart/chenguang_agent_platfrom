import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export default function AgentTest() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "你好！有什么可以帮助你的？" },
  ]);
  const [input, setInput] = useState("");
  const [debugInfo] = useState({
    steps: [
      "1. 收到用户消息",
      "2. 检索知识库(3条)",
      "3. 拼接Prompt",
      "4. 调用GPT-4",
      "5. 返回结果",
    ],
    tokens: { input: 234, output: 89 },
    latency: "1.2s",
  });

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages([...messages, { role: "user", content: input }]);
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "这是一个测试响应..." },
      ]);
    }, 500);
    setInput("");
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">测试: 智能客服Agent</h1>
          <p className="text-muted-foreground">实时测试和调试Agent</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>对话窗口</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-[500px] overflow-y-auto space-y-4 p-4 border rounded-lg">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="输入消息..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
              />
              <Button onClick={handleSend}>发送</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>调试面板</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="reasoning">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="reasoning">推理链路</TabsTrigger>
                <TabsTrigger value="knowledge">知识检索</TabsTrigger>
                <TabsTrigger value="tools">工具调用</TabsTrigger>
                <TabsTrigger value="raw">原始响应</TabsTrigger>
              </TabsList>
              <TabsContent value="reasoning" className="space-y-4">
                <div className="space-y-2">
                  {debugInfo.steps.map((step, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Badge variant="outline">{idx + 1}</Badge>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-4 border-t space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Token:</span>
                    <span className="text-sm">
                      输入{debugInfo.tokens.input} 输出{debugInfo.tokens.output}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">延迟:</span>
                    <span className="text-sm">{debugInfo.latency}</span>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="knowledge">
                <div className="space-y-2">
                  <div className="p-3 border rounded-lg">
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">产品手册v3.pdf</span>
                      <Badge>0.95</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      辰光Agent平台支持多种大语言模型...
                    </p>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="tools">
                <p className="text-sm text-muted-foreground">未调用工具</p>
              </TabsContent>
              <TabsContent value="raw">
                <pre className="text-xs bg-muted p-4 rounded-lg overflow-auto">
                  {JSON.stringify({ response: "..." }, null, 2)}
                </pre>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>参数覆盖</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Temperature</Label>
              <Input type="number" defaultValue="0.7" step="0.1" />
            </div>
            <div className="space-y-2">
              <Label>Top K</Label>
              <Input type="number" defaultValue="5" />
            </div>
            <div className="space-y-2">
              <Label>Model</Label>
              <Select defaultValue="gpt-4">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-4">GPT-4</SelectItem>
                  <SelectItem value="gpt-3.5">GPT-3.5</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button variant="outline">重置参数</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
