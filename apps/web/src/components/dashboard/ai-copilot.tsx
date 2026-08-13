"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, Send, Bot, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function AICopilot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hi! I'm your LifeOS Copilot. I can search notes, query goals, or help organize tasks. Ask me anything!" }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setIsLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg,
          history: messages.slice(1).map((m) => ({ role: m.role, content: m.content }))
        }) });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || "AI failed");

      const responseText = json.data?.text || json.text || "Sorry, I couldn't process that request.";
      setMessages((prev) => [...prev, { role: "assistant", content: responseText }]);
    } catch (error) {
      setMessages((prev) => [...prev, { role: "assistant", content: "I encountered an error connecting to the AI Coach. Please verify your API key configurations." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-20 lg:bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-600 via-primary to-purple-600 hover:scale-105 active:scale-95 transition-all text-white shadow-xl shadow-primary/20"
        >
          <Sparkles className="h-6 w-6 animate-pulse" />
        </Button>
      </div>

      {/* Slide-over Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm"
            />

            {/* Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-background/95 backdrop-blur-xl border-l shadow-2xl flex flex-col h-full"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b shrink-0 bg-gradient-to-r from-primary/5 to-purple-500/5">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">LifeOS AI Copilot</h3>
                    <p className="text-[10px] text-muted-foreground">Always-on productivity partner</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => setIsOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin">
                {messages.map((m, idx) => {
                  const isAssistant = m.role === "assistant";
                  return (
                    <div key={idx} className={cn("flex gap-3", !isAssistant && "flex-row-reverse")}>
                      <div className={cn(
                        "h-8 w-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm",
                        isAssistant ? "bg-primary/10 text-primary" : "bg-muted text-foreground"
                      )}>
                        {isAssistant ? <Bot className="h-4.5 w-4.5" /> : <User className="h-4 w-4" />}
                      </div>
                      <div className={cn(
                        "rounded-2xl px-4 py-2.5 text-sm max-w-[80%] leading-relaxed shadow-sm",
                        isAssistant
                          ? "bg-card/80 border border-muted/50 text-foreground rounded-tl-none"
                          : "bg-primary text-primary-foreground rounded-tr-none"
                      )}>
                        {m.content}
                      </div>
                    </div>
                  );
                })}
                {isLoading && (
                  <div className="flex gap-3">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <Bot className="h-4.5 w-4.5" />
                    </div>
                    <div className="bg-card/80 border rounded-2xl rounded-tl-none px-4 py-3 text-sm flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      <span className="text-xs text-muted-foreground">Thinking…</span>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Input Form */}
              <form onSubmit={handleSend} className="p-4 border-t bg-background shrink-0">
                <div className="flex gap-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask copilot to search, schedule, or suggest..."
                    className="rounded-xl border-0 ring-1 ring-black/10 dark:ring-white/10 bg-muted/40 focus-visible:ring-primary focus-visible:ring-offset-0"
                  />
                  <Button type="submit" size="icon" disabled={isLoading || !input.trim()} className="rounded-xl shrink-0 bg-primary hover:scale-105 transition-all">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
