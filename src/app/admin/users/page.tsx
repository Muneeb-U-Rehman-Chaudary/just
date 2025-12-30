"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "@/hooks/useSession";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  User,
  Search,
  Mail,
  Shield,
  Trash2,
  Ban,
  CheckCircle,
  MoreVertical,
  MessageSquare,
  Upload,
  Link as LinkIcon,
  Image as ImageIcon,
  X,
  FileText,
  AlertCircle
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAdminUsers, useDeleteUser, useBanUser, useUnbanUser, useMessageUser } from "@/hooks/useApi";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const DEFAULT_MESSAGES: Record<string, string> = {
  welcome: "Welcome to our platform! We're excited to have you here. Let us know if you need any help getting started.",
  warning: "This is a formal warning regarding your recent activity on the platform. Please review our community guidelines to avoid further action.",
  announcement: "We have some exciting new features coming soon! Stay tuned for more updates.",
  support: "Hello, I'm reaching out to assist you with your recent inquiry. How can I help you today?",
  custom: ""
};

export default function AdminUsersPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  
  // Messaging state
  const [messageType, setMessageType] = useState<string>("custom");
  const [messageSubject, setMessageSubject] = useState("");
  const [messageContent, setMessageContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);

  const { data: usersData, isLoading: usersLoading, refetch } = useAdminUsers();
  const deleteMutation = useDeleteUser();
  const banMutation = useBanUser();
  const unbanMutation = useUnbanUser();
  const messageMutation = useMessageUser();

  useEffect(() => {
    if (!isPending) {
      if (!session?.user) {
        router.push("/login");
      } else if (session?.user?.role !== "admin") {
        router.push("/");
      }
    }
  }, [session, isPending, router]);

  useEffect(() => {
    if (messageType !== "custom") {
      setMessageContent(DEFAULT_MESSAGES[messageType]);
      setMessageSubject(messageType.charAt(0).toUpperCase() + messageType.slice(1) + " Notification");
    }
  }, [messageType]);

  const handleMessageSubmit = async () => {
    if (!selectedUser) return;
    
    const finalContent = imageUrl 
      ? `${messageContent}\n\n![Image](${imageUrl})`
      : messageContent;

    messageMutation.mutate({
      userId: selectedUser.id,
      subject: messageSubject,
      content: finalContent
    }, {
      onSuccess: () => {
        setShowMessageDialog(false);
        setMessageContent("");
        setMessageSubject("");
        setImageUrl("");
        setMessageType("custom");
      }
    });
  };

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleFileUpload(file);
    } else {
      toast.error("Please drop an image file");
    }
  }, []);

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        setImageUrl(data.url);
        toast.success("Image uploaded successfully");
      } else {
        throw new Error("Upload failed");
      }
    } catch (err) {
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const users = usersData?.users || [];
  const filteredUsers = users.filter((user: any) =>
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isPending || usersLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-10 w-64 mb-8" />
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
        </div>
      </div>
    );
  }

  if (!session?.user || session.user.role !== "admin") return null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground mt-1">Monitor and manage all users on the platform</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11 bg-muted/50 border-none focus-visible:ring-1 focus-visible:ring-primary"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="border-none shadow-sm bg-blue-50/50 dark:bg-blue-950/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wider">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{users.length}</div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-green-50/50 dark:bg-green-950/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-600 dark:text-green-400 uppercase tracking-wider">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{users.filter((u: any) => !u.isBanned).length}</div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-red-50/50 dark:bg-red-950/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-600 dark:text-red-400 uppercase tracking-wider">Banned</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{users.filter((u: any) => u.isBanned).length}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="py-4 pl-6">User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-40 text-center text-muted-foreground">
                    No users found matching your search.
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user: any) => (
                  <TableRow key={user.id} className="group hover:bg-muted/20 transition-colors">
                    <TableCell className="pl-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                          {user.name?.substring(0, 1).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-sm">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className="capitalize font-medium">
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {user.isBanned ? (
                        <Badge variant="destructive" className="flex w-fit items-center gap-1.5 font-medium">
                          <Ban className="h-3 w-3" /> Banned
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="flex w-fit items-center gap-1.5 text-green-600 border-green-200 bg-green-50 dark:bg-green-950/20 font-medium">
                          <CheckCircle className="h-3 w-3" /> Active
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-9 w-9 p-0 rounded-full"
                          onClick={() => {
                            setSelectedUser(user);
                            setShowMessageDialog(true);
                          }}
                        >
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className={`h-9 w-9 p-0 rounded-full ${user.isBanned ? 'text-green-600' : 'text-orange-600'}`}
                          onClick={() => {
                            if (user.isBanned) unbanMutation.mutate(user.id);
                            else banMutation.mutate({ id: user.id });
                          }}
                        >
                          {user.isBanned ? <CheckCircle className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-9 w-9 p-0 rounded-full text-destructive hover:bg-destructive/10"
                          onClick={() => {
                            setSelectedUser(user);
                            setShowDeleteDialog(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Delete Confirmation */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{selectedUser?.name}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)} className="rounded-full">Cancel</Button>
            <Button 
              variant="destructive" 
              className="rounded-full"
              onClick={() => {
                deleteMutation.mutate(selectedUser.id, {
                  onSuccess: () => setShowDeleteDialog(false)
                });
              }}
              disabled={deleteMutation.isPending}
            >
              Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Messaging Modal */}
      <Dialog open={showMessageDialog} onOpenChange={setShowMessageDialog}>
        <DialogContent className="sm:max-w-xl p-0 overflow-hidden border-none shadow-2xl backdrop-blur-xl bg-background/95">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <MessageSquare className="h-6 w-6 text-primary" />
              Message {selectedUser?.name}
            </DialogTitle>
            <DialogDescription>
              Send a notification or message to this user.
            </DialogDescription>
          </DialogHeader>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Message Type</Label>
                <Select value={messageType} onValueChange={setMessageType}>
                  <SelectTrigger className="rounded-xl bg-muted/30 border-none h-11">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="custom">Custom Message</SelectItem>
                    <SelectItem value="welcome">Welcome Message</SelectItem>
                    <SelectItem value="support">Support Inquiry</SelectItem>
                    <SelectItem value="warning">Account Warning</SelectItem>
                    <SelectItem value="announcement">New Announcement</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Subject</Label>
                <Input 
                  value={messageSubject}
                  onChange={(e) => setMessageSubject(e.target.value)}
                  placeholder="Subject line"
                  className="rounded-xl bg-muted/30 border-none h-11"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Message Body</Label>
              <Textarea 
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                placeholder="Write your message here..."
                className="min-h-[150px] rounded-xl bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-primary p-4 resize-none"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Attachments & Links</Label>
              
              <div 
                className={`relative group border-2 border-dashed rounded-2xl p-6 transition-all duration-300 ${
                  isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/20 hover:border-primary/40'
                }`}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
              >
                {imageUrl ? (
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-muted group/img">
                    <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <Button variant="outline" size="sm" className="bg-white/10 border-white/20 text-white hover:bg-white/20" onClick={() => setImageUrl("")}>
                        <X className="h-4 w-4 mr-2" /> Remove
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-4 text-center">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      {uploading ? (
                        <div className="h-5 w-5 border-2 border-primary border-t-transparent animate-spin rounded-full" />
                      ) : (
                        <Upload className="h-6 w-6 text-primary" />
                      )}
                    </div>
                    <p className="text-sm font-bold">Drop image here or click to upload</p>
                    <p className="text-xs text-muted-foreground mt-1">PNG, JPG or WEBP (Max 5MB)</p>
                    <input 
                      type="file" 
                      className="absolute inset-0 opacity-0 cursor-pointer" 
                      onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                      accept="image/*"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Add image URL instead..." 
                    className="pl-10 h-11 rounded-xl bg-muted/30 border-none"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                  />
                </div>
                {imageUrl && !imageUrl.startsWith('data:') && (
                  <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setImageUrl("")}>
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="p-6 pt-2 gap-3 sm:gap-0 bg-muted/30">
            <Button variant="outline" onClick={() => setShowMessageDialog(false)} className="rounded-full px-6">Cancel</Button>
            <Button 
              className="rounded-full px-8 font-bold"
              onClick={handleMessageSubmit}
              disabled={messageMutation.isPending || !messageContent || !messageSubject}
            >
              {messageMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-white border-t-transparent animate-spin rounded-full" />
                  Sending...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Send Message
                  <Mail className="h-4 w-4" />
                </span>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
