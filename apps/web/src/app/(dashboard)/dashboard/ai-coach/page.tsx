"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { Bot, User, Send, Sparkles, Loader2, RefreshCw, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
  isError?: boolean;
}

export default function AICoachPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hello! I am your AI Life Coach. I look at your goals, habits, and tasks to provide personalized coaching. How can I help you today?" }
  ]);
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const [lastFailedMessage, setLastFailedMessage] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoadingChat]);

  // Fetch Coach Insights
  const { data: insightsData, isLoading: isLoadingInsights, refetch: refetchInsights } = useQuery({
    queryKey: ["ai", "insights"],
    queryFn: async () => {
      const res = await apiClient.post<any>("/api/ai/insights", { context: {} });
      return res.data || res;
    }
  });

  const chatMutation = useMutation({
    mutationFn: async (payload: { message: string; history: Message[] }) => {
      const res = await apiClient.post<any>("/api/ai/chat", {
        message: payload.message,
        history: payload.history.map((m) => ({ role: m.role, content: m.content }))
      });
      return res.data || res;
    },
    onSuccess: (data) => {
      setLastFailedMessage(null);
      setMessages((prev) => [...prev, { role: "assistant", content: data.message }]);
      setIsLoadingChat(false);
    },
    onError: (error: Error) => {
      setMessages((prev) => [...prev, { role: "assistant", content: error.message, isError: true }]);
      setIsLoadingChat(false);
    }
  });

  const sendMessage = (msg: string) => {
    if (!msg.trim() || isLoadingChat) return;
    const userMsg = msg.trim();
    setInput("");
    setLastFailedMessage(userMsg);
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setIsLoadingChat(true);

    chatMutation.mutate({
      message: userMsg,
      history: messages.slice(1)
    });
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleRetry = () => {
    if (lastFailedMessage) {
      sendMessage(lastFailedMessage);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const insights = insightsData?.insights || insightsData || "No insights generated yet. Add more goals, habits, and tasks to feed the AI Coach context engine!";

  return (
    <div className="grid gap-6 lg:grid-cols-3 h-[calc(100vh-8rem)] max-w-7xl mx-auto">
      {/* Chat pane */}
      <div className="lg:col-span-2 flex flex-col h-full rounded-2xl border-0 shadow-md ring-1 ring-black/5 dark:ring-white/5 bg-card/60 backdrop-blur-xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b shrink-0 bg-background/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            <h2 className="font-bold text-base">Conversational Coach</h2>
          </div>
          <Badge variant="outline" className="text-xs">Context Engine Active</Badge>
        </div>

        {/* Chat log */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin">
          {messages.map((m, idx) => {
            const isBot = m.role === "assistant";
            return (
              <div key={idx} className={cn("flex gap-3", !isBot && "flex-row-reverse")}>
                <div className={cn(
                  "h-9 w-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm",
                  isBot ? "bg-primary/10 text-primary" : "bg-muted text-foreground"
                )}>
                  {isBot ? <Bot className="h-5 w-5" /> : <User className="h-4.5 w-4.5" />}
                </div>
                <div className={cn(
                  "rounded-2xl px-4 py-3 text-sm max-w-[80%] leading-relaxed shadow-sm",
                  isBot
                    ? "bg-background border text-foreground rounded-tl-none"
                    : "bg-primary text-primary-foreground rounded-tr-none"
                )}>
                  <span className={m.isError ? "text-red-500" : ""}>{m.content}</span>
                  {m.isError && (
                    <button
                      onClick={handleRetry}
                      className="mt-2 flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      <RotateCcw className="h-3 w-3" /> Retry
                    </button>
                  )}
                </div>
              </div>
            );
          })}
          {isLoadingChat && (
            <div className="flex gap-3">
              <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Bot className="h-5 w-5" />
              </div>
              <div className="bg-background border rounded-2xl rounded-tl-none px-4 py-3 text-sm flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span className="text-xs text-muted-foreground">Formulating response…</span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input form */}
        <form onSubmit={handleSend} className="p-4 border-t bg-background/50 shrink-0">
          <div className="flex gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask your AI Coach anything… (Shift+Enter for new line)"
              rows={1}
              className="flex-1 resize-none rounded-xl border-0 ring-1 ring-black/10 dark:ring-white/10 bg-muted/40 px-4 py-2.5 text-sm focus:outline-none focus:ring-primary"
            />
            <Button type="submit" disabled={isLoadingChat || !input.trim()} className="rounded-xl bg-primary shadow-lg shadow-primary/20 self-end">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </div>

      {/* Insights panel */}
      <div className="flex flex-col h-full rounded-2xl border-0 shadow-md ring-1 ring-black/5 dark:ring-white/5 bg-card/60 backdrop-blur-xl p-5 overflow-y-auto scrollbar-thin">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-base flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Coach Insights
          </h3>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => refetchInsights()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        {isLoadingInsights ? (
          <div className="space-y-4">
            <Skeleton className="h-24 w-full rounded-2xl" />
            <Skeleton className="h-24 w-full rounded-2xl" />
          </div>
        ) : (
          <div className="space-y-4">
            <Card className="border-0 bg-primary/5 shadow-inner">
              <CardContent className="p-4 text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
                {insights}
              </CardContent>
            </Card>

            <div className="space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground/75 px-1">Coaching Prompts</h4>
              {[
                "How can I better balance my goals?",
                "What habits should I adjust to reach my milestones?",
                "Review my tasks for today.",
              ].map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => setInput(prompt)}
                  className="w-full text-left p-3 text-xs border rounded-xl hover:bg-muted/50 transition-colors font-medium text-foreground bg-background/40"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
