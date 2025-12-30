"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Send, RotateCcw, MessageSquare, Image as ImageIcon, Link as LinkIcon } from "lucide-react";
import ImageUpload from "./ImageUpload";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface MessageTemplate {
  id: string;
  label: string;
  subject: string;
  content: string;
}

const DEFAULT_TEMPLATES: MessageTemplate[] = [
  {
    id: "welcome",
    label: "Welcome Message",
    subject: "Welcome to DigiVerse!",
    content: "Hi there!\n\nWelcome to DigiVerse, your premier marketplace for digital products. We're excited to have you on board. If you have any questions, feel free to reach out to our support team.\n\nBest regards,\nThe DigiVerse Team"
  },
  {
    id: "account-verify",
    label: "Account Verification",
    subject: "Verify Your Account",
    content: "Hello,\n\nPlease verify your account to access all features of our platform. Click the link below to complete the process.\n\nThank you,\nDigiVerse Support"
  },
  {
    id: "vendor-approve",
    label: "Vendor Approval",
    subject: "Your Vendor Application Approved",
    content: "Congratulations!\n\nYour application to become a vendor on DigiVerse has been approved. You can now start listing your products on your store dashboard.\n\nWelcome to our vendor community!"
  },
  {
    id: "product-reject",
    label: "Product Rejection",
    subject: "Action Required: Product Submission",
    content: "Hello,\n\nWe've reviewed your recent product submission. Unfortunately, it doesn't meet our quality guidelines at this time. Please review our submission standards and update your listing accordingly.\n\nReason: \n\nBest regards,\nReview Team"
  },
  {
    id: "order-confirmation",
    label: "Order Confirmation",
    subject: "Your Order is Ready!",
    content: "Thank you for your purchase!\n\nYour order has been processed and is now available for download. You can access it via your dashboard or the link below.\n\nEnjoy your new digital assets!"
  },
  {
    id: "custom",
    label: "Custom Message",
    subject: "",
    content: ""
  }
];

interface MessageEditorProps {
  onSend: (message: { subject: string, content: string, imageUrl?: string }) => void;
  isSending?: boolean;
  recipientName?: string;
}

export default function MessageEditor({ onSend, isSending, recipientName }: MessageEditorProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string>("welcome");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState<string>("");

  useEffect(() => {
    const template = DEFAULT_TEMPLATES.find(t => t.id === selectedTemplate);
    if (template) {
      setSubject(template.subject);
      setContent(template.content.replace("Hi there!", `Hi ${recipientName || 'there'}!`));
    }
  }, [selectedTemplate, recipientName]);

  const handleReset = () => {
    const template = DEFAULT_TEMPLATES.find(t => t.id === selectedTemplate);
    if (template) {
      setSubject(template.subject);
      setContent(template.content.replace("Hi there!", `Hi ${recipientName || 'there'}!`));
      setImageUrl("");
    }
  };

  return (
    <Card className="border-none shadow-none bg-transparent">
      <CardContent className="p-0 space-y-6">
        <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="template" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Message Type</Label>
              <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                <SelectTrigger className="h-12 rounded-xl border-border bg-background">
                  <SelectValue placeholder="Select a message type" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-border">
                  {DEFAULT_TEMPLATES.map((t) => (
                    <SelectItem key={t.id} value={t.id} className="rounded-lg">
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Subject Line</Label>
              <input
                id="subject"
                className="flex h-12 w-full rounded-xl border border-border bg-background px-4 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all"
                placeholder="Enter message subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Include Image (Optional)</Label>
            <div className="rounded-2xl border border-border bg-muted/30 p-4">
              <ImageUpload 
                value={imageUrl} 
                onChange={setImageUrl}
                onRemove={() => setImageUrl("")}
                placeholder="Drag & drop an image or use URL"
                aspect="wide"
                className="rounded-xl overflow-hidden"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="message" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Message Content</Label>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleReset}
                className="h-7 text-[10px] font-bold uppercase tracking-tighter gap-1 hover:bg-muted/50 rounded-lg"
              >
                <RotateCcw className="h-3 w-3" /> Reset to Default
              </Button>
            </div>
            <div className="relative group">
              <Textarea
                id="message"
                rows={8}
                placeholder="Write your professional message here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="resize-none rounded-2xl border-border bg-background p-4 text-sm leading-relaxed focus-visible:ring-primary/20 focus-visible:border-primary transition-all"
              />
              <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <Badge variant="outline" className="text-[9px] font-bold uppercase tracking-widest bg-background shadow-sm">
                  {content.length} characters
                </Badge>
              </div>
            </div>
          </div>

        <Button 
          onClick={() => onSend({ subject, content, imageUrl })} 
          className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-bold text-base shadow-xl shadow-primary/10 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
          disabled={isSending || !content || !subject}
        >
          {isSending ? (
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 border-2 border-primary-foreground border-t-transparent animate-spin rounded-full" />
              <span>Sending Message...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Send className="h-4 w-4" /> 
              <span>Send Professional Message</span>
            </div>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
