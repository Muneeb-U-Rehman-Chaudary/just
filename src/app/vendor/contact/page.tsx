"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/hooks/useSession";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquare, Send, Clock, CheckCircle2, Mail, AlertCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export default function VendorContactPage() {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ subject: "", message: "", type: "support" });

  useEffect(() => {
    if (session?.user) fetchMessages();
  }, [session]);

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem("bearer_token");
      const res = await fetch("/api/vendor/contact", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setMessages(data.messages || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.subject.trim() || !form.message.trim()) {
      toast.error("Please fill all required fields");
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem("bearer_token");
      const res = await fetch("/api/vendor/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: session?.user?.name,
          email: session?.user?.email,
          ...form,
        }),
      });
      if (res.ok) {
        toast.success("Message sent to admin!");
        setForm({ subject: "", message: "", type: "support" });
        fetchMessages();
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to send message");
      }
    } catch (e) {
      toast.error("Error sending message");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Contact Admin</h1>
        <p className="text-muted-foreground">Get support or send inquiries to the admin team</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" /> Send Message
            </CardTitle>
            <CardDescription>Fill out the form to contact the admin team</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Message Type</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="support">Technical Support</SelectItem>
                  <SelectItem value="billing">Billing Inquiry</SelectItem>
                  <SelectItem value="withdrawal">Withdrawal Issue</SelectItem>
                  <SelectItem value="product">Product Question</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject *</Label>
              <Input id="subject" placeholder="Brief description of your inquiry..." value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message *</Label>
              <Textarea id="message" placeholder="Describe your issue or question in detail..." rows={6} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
            </div>

            <Button onClick={handleSubmit} disabled={submitting} className="w-full gradient-bg">
              {submitting ? "Sending..." : "Send Message"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" /> Message History
            </CardTitle>
            <CardDescription>Your previous messages and admin replies</CardDescription>
          </CardHeader>
          <CardContent>
            {messages.length > 0 ? (
              <div className="space-y-4 max-h-[500px] overflow-y-auto">
                {messages.map((msg) => (
                  <div key={msg.messageId} className="p-4 border rounded-lg space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{msg.subject}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(msg.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <Badge variant={msg.status === "replied" ? "default" : "secondary"}>
                        {msg.status === "replied" ? (
                          <><CheckCircle2 className="mr-1 h-3 w-3" /> Replied</>
                        ) : (
                          <><Clock className="mr-1 h-3 w-3" /> Pending</>
                        )}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{msg.message}</p>
                    {msg.reply && (
                      <div className="mt-3 p-3 bg-primary/10 rounded-lg">
                        <p className="text-xs font-medium text-primary mb-1">Admin Reply:</p>
                        <p className="text-sm">{msg.reply}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Mail className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No messages yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-blue-500/50 bg-blue-500/5">
        <CardContent className="flex items-center gap-4 p-4">
          <AlertCircle className="h-8 w-8 text-blue-500" />
          <div>
            <h3 className="font-semibold">Response Time</h3>
            <p className="text-sm text-muted-foreground">We typically respond within 24-48 hours on business days</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
