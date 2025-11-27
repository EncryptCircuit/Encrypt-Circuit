import { useState, useRef, useEffect } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  ArrowLeft,
  MessageSquareLock,
  Send,
  Lock,
  Shield,
  CheckCircle2,
  Clock,
  Key,
  RefreshCw,
  Zap,
} from "lucide-react";

interface Message {
  id: string;
  sender: "user" | "recipient";
  content: string;
  encrypted: string;
  timestamp: string;
  status: "sending" | "delivered" | "read";
  proofHash?: string;
}

export default function DemoMessaging() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "recipient",
      content: "Hello! This is a secure channel.",
      encrypted: "aG9sYSBob2xhIGhvbGE=",
      timestamp: new Date(Date.now() - 300000).toISOString(),
      status: "read",
    },
    {
      id: "2",
      sender: "recipient",
      content: "All messages are end-to-end encrypted with ZK proofs.",
      encrypted: "dGhpcyBpcyBlbmNyeXB0ZWQ=",
      timestamp: new Date(Date.now() - 240000).toISOString(),
      status: "read",
    },
  ]);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showEncrypted, setShowEncrypted] = useState(false);
  const [keyEstablished, setKeyEstablished] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const generateHash = (): string => {
    return "0x" + Array.from({ length: 16 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join("");
  };

  const encryptMessage = (text: string): string => {
    return btoa(text).split("").reverse().join("");
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    
    const msgContent = newMessage;
    setNewMessage("");
    setIsSending(true);

    const tempId = Date.now().toString();
    const newMsg: Message = {
      id: tempId,
      sender: "user",
      content: msgContent,
      encrypted: encryptMessage(msgContent),
      timestamp: new Date().toISOString(),
      status: "sending",
    };

    setMessages((prev) => [...prev, newMsg]);

    await new Promise((r) => setTimeout(r, 1500));

    setMessages((prev) =>
      prev.map((m) =>
        m.id === tempId
          ? { ...m, status: "delivered" as const, proofHash: generateHash() }
          : m
      )
    );

    setIsSending(false);

    setTimeout(() => {
      const reply: Message = {
        id: (Date.now() + 1).toString(),
        sender: "recipient",
        content: "Message received with verified ZK proof!",
        encrypted: encryptMessage("Message received with verified ZK proof!"),
        timestamp: new Date().toISOString(),
        status: "read",
      };
      setMessages((prev) => [...prev, reply]);
    }, 2000);
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/playground" data-testid="link-back-playground">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
            <MessageSquareLock className="h-6 w-6 text-green-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold" data-testid="text-demo-title">Encrypted Messaging Demo</h1>
            <p className="text-muted-foreground">End-to-end encrypted with delivery proofs</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Panel */}
        <Card className="lg:col-span-2 flex flex-col h-[600px]">
          {/* Chat Header */}
          <CardHeader className="pb-3 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback className="bg-green-500 text-white">EC</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-base">Encrypt Circuit Bot</CardTitle>
                  <CardDescription className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    Online
                  </CardDescription>
                </div>
              </div>
              <Badge variant="secondary" className="gap-1">
                <Lock className="h-3 w-3" />
                E2E Encrypted
              </Badge>
            </div>
          </CardHeader>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            <div className="space-y-4">
              {/* Key Exchange Notice */}
              <div className="flex justify-center">
                <Badge variant="outline" className="gap-1 text-xs">
                  <Key className="h-3 w-3" />
                  Secure key exchange completed
                </Badge>
              </div>

              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                  data-testid={`message-${message.id}`}
                >
                  <div
                    className={`max-w-[80%] space-y-1 ${
                      message.sender === "user" ? "items-end" : "items-start"
                    }`}
                  >
                    <div
                      className={`p-3 rounded-2xl ${
                        message.sender === "user"
                          ? "bg-primary text-primary-foreground rounded-br-md"
                          : "bg-muted rounded-bl-md"
                      }`}
                    >
                      <p className="text-sm">
                        {showEncrypted ? message.encrypted : message.content}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 px-1">
                      <span className="text-xs text-muted-foreground">
                        {formatTime(message.timestamp)}
                      </span>
                      {message.sender === "user" && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          {message.status === "sending" ? (
                            <Clock className="h-3 w-3" />
                          ) : message.status === "delivered" ? (
                            <CheckCircle2 className="h-3 w-3 text-green-500" />
                          ) : (
                            <CheckCircle2 className="h-3 w-3 text-blue-500" />
                          )}
                          {message.status}
                        </span>
                      )}
                    </div>
                    {message.proofHash && (
                      <p className="text-xs text-muted-foreground font-mono px-1">
                        Proof: {message.proofHash}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Message Input */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                disabled={isSending}
                className="flex-1"
                data-testid="input-message"
              />
              <Button
                onClick={sendMessage}
                disabled={!newMessage.trim() || isSending}
                data-testid="button-send"
              >
                {isSending ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowEncrypted(!showEncrypted)}
                className="text-xs"
                data-testid="button-toggle-encrypted"
              >
                {showEncrypted ? "Show Decrypted" : "Show Encrypted"}
              </Button>
            </div>
          </div>
        </Card>

        {/* Info Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Security Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-green-500/10">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-medium text-sm">Key Exchange</p>
                    <p className="text-xs text-muted-foreground">Completed</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-green-500/10">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-medium text-sm">E2E Encryption</p>
                    <p className="text-xs text-muted-foreground">Active</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-green-500/10">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-medium text-sm">ZK Delivery Proofs</p>
                    <p className="text-xs text-muted-foreground">Enabled</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Zap className="h-5 w-5" />
                How It Works
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="text-sm text-muted-foreground space-y-3 list-decimal list-inside">
                <li>Messages are encrypted with shared secret key</li>
                <li>Encryption happens client-side before sending</li>
                <li>ZK proof confirms delivery without revealing content</li>
                <li>Only recipient can decrypt messages</li>
                <li>Server never sees plaintext data</li>
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
