"use client";

import { useState } from "react";
import { useSession } from "@/hooks/useSession";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MessageSquare,
  Mail,
  Clock,
  CheckCircle,
  Calendar,
  User,
  Trash2,
  Send,
  AlertTriangle,
  Info,
  Search,
  UserPlus,
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
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  useAdminContactsList, 
  useDeleteAdminContact, 
  useReplyToContact, 
  useSendMessageToUser,
  useAdminUsers
} from "@/hooks/useApi";
import { toast } from "sonner";
import { useEffect } from "react";

export default function AdminContactPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [deleteMessage, setDeleteMessage] = useState<any>(null);
  const [reply, setReply] = useState("");
  
  const [showMessageUserDialog, setShowMessageUserDialog] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [messageSubject, setMessageSubject] = useState("");
  const [messageContent, setMessageContent] = useState("");
  const [messageType, setMessageType] = useState<"warning" | "info">("warning");

  const { data: contactsData, isLoading: loading } = useAdminContactsList();
  const { data: usersData, isLoading: searchLoading } = useAdminUsers({ search: userSearch, limit: 10 });
  
  const deleteMutation = useDeleteAdminContact();
  const replyMutation = useReplyToContact();
  const messageUserMutation = useSendMessageToUser();

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/login");
    } else if (session?.user?.role !== "admin") {
      router.push("/");
    }
  }, [session, isPending, router]);

  const handleReply = () => {
    if (!reply.trim()) {
      toast.error("Please enter a reply");
      return;
    }

    replyMutation.mutate({ id: selectedMessage.id, reply }, {
      onSuccess: () => {
        setSelectedMessage(null);
        setReply("");
      }
    });
  };

  const handleDelete = () => {
    deleteMutation.mutate(deleteMessage.id, {
      onSuccess: () => setDeleteMessage(null)
    });
  };

  const handleSendUserMessage = () => {
    if (!selectedUser) {
      toast.error("Please select a user");
      return;
    }
    if (!messageSubject.trim()) {
      toast.error("Please enter a subject");
      return;
    }
    if (!messageContent.trim()) {
      toast.error("Please enter a message");
      return;
    }

    messageUserMutation.mutate({
      userId: selectedUser.id,
      subject: messageSubject,
      message: messageContent,
      // @ts-ignore - Backend supports type
      type: messageType,
    }, {
      onSuccess: () => {
        setShowMessageUserDialog(false);
        resetMessageForm();
      }
    });
  };

  const resetMessageForm = () => {
    setUserSearch("");
    setSelectedUser(null);
    setMessageSubject("");
    setMessageContent("");
    setMessageType("warning");
  };

  if (isPending || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-64 mb-8" />
        <div className="grid gap-6">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    );
  }

  if (!session?.user || session.user.role !== "admin") return null;

  const messages = contactsData?.messages || [];
  const stats = contactsData?.stats || { total: 0, pending: 0, resolved: 0 };
  const searchResults = usersData?.users || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Contact Messages</h1>
          <p className="text-muted-foreground">
            Manage and respond to user inquiries
          </p>
        </div>
        <Button onClick={() => setShowMessageUserDialog(true)} className="gap-2">
          <UserPlus className="h-4 w-4" />
          Message User
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Messages
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">All inquiries</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">Awaiting response</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.resolved}</div>
            <p className="text-xs text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Messages Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Messages ({messages.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {messages.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>From</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {messages.map((message: any) => (
                  <TableRow key={message.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        {message.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        {message.email}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[300px] truncate">
                      {message.subject}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          message.status === "resolved"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {message.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {new Date(message.createdAt).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedMessage(message);
                            setReply(message.reply || "");
                          }}
                        >
                          <Send className="h-4 w-4 mr-1" />
                          {message.reply ? "View Reply" : "Reply"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600"
                          onClick={() => setDeleteMessage(message)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <MessageSquare className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No messages</h3>
              <p className="text-muted-foreground">
                User inquiries will appear here
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reply Dialog */}
      <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedMessage?.reply ? "View Message & Reply" : "Reply to Message"}
            </DialogTitle>
            <DialogDescription>
              From: {selectedMessage?.name} ({selectedMessage?.email})
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Subject</Label>
              <div className="p-3 bg-muted rounded-md">
                {selectedMessage?.subject}
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Message</Label>
              <div className="p-3 bg-muted rounded-md max-h-[200px] overflow-y-auto">
                {selectedMessage?.message}
              </div>
            </div>
            {selectedMessage?.reply && (
              <div className="grid gap-2">
                <Label>Previous Reply</Label>
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-md">
                  {selectedMessage.reply}
                </div>
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="reply">
                {selectedMessage?.reply ? "Update Reply" : "Your Reply"}
              </Label>
              <span className="text-xs text-muted-foreground mb-1 block">React Query Integrated Mutation</span>
              <Textarea
                id="reply"
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="Type your response here..."
                rows={6}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedMessage(null);
                setReply("");
              }}
              disabled={replyMutation.isPending}
            >
              Cancel
            </Button>
            <Button onClick={handleReply} disabled={replyMutation.isPending || !reply.trim()}>
              {replyMutation.isPending ? "Sending..." : "Send Reply"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Message User Dialog */}
      <Dialog open={showMessageUserDialog} onOpenChange={(open) => {
        setShowMessageUserDialog(open);
        if (!open) resetMessageForm();
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Send Message to User
            </DialogTitle>
            <DialogDescription>
              Send a warning or informational message directly to any user
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {!selectedUser ? (
              <div className="grid gap-2">
                <Label>Search User</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or email..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                {searchLoading && (
                  <div className="text-sm text-muted-foreground">Searching...</div>
                )}
                {searchResults.length > 0 && (
                  <div className="border rounded-md max-h-[200px] overflow-y-auto">
                    {searchResults.map((user: any) => (
                      <div
                        key={user.id}
                        className="p-3 hover:bg-muted cursor-pointer flex items-center justify-between border-b last:border-b-0"
                        onClick={() => {
                          setSelectedUser(user);
                          setUserSearch("");
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="font-medium">{user.name}</div>
                            <div className="text-sm text-muted-foreground">{user.email}</div>
                          </div>
                        </div>
                        <Badge variant="outline">{user.role}</Badge>
                      </div>
                    ))}
                  </div>
                )}
                {userSearch.length >= 2 && !searchLoading && searchResults.length === 0 && (
                  <div className="text-sm text-muted-foreground">No users found</div>
                )}
              </div>
            ) : (
              <div className="grid gap-4">
                <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-medium">{selectedUser.name}</div>
                      <div className="text-sm text-muted-foreground">{selectedUser.email}</div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedUser(null)}
                  >
                    Change
                  </Button>
                </div>

                <div className="grid gap-2">
                  <Label>Message Type</Label>
                  <Select value={messageType} onValueChange={(v: "warning" | "info") => setMessageType(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="warning">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-yellow-600" />
                          Warning
                        </div>
                      </SelectItem>
                      <SelectItem value="info">
                        <div className="flex items-center gap-2">
                          <Info className="h-4 w-4 text-blue-600" />
                          Information
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    placeholder={messageType === "warning" ? "e.g., Policy Violation Warning" : "e.g., Account Update"}
                    value={messageSubject}
                    onChange={(e) => setMessageSubject(e.target.value)}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    placeholder={messageType === "warning" 
                      ? "Describe the issue and what action is required..."
                      : "Enter your message..."
                    }
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                    rows={6}
                  />
                </div>

                {messageType === "warning" && (
                  <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-md text-sm text-yellow-800 dark:text-yellow-200 flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>
                      This will send a warning notification to the user. Repeated violations may result in account suspension.
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowMessageUserDialog(false);
                resetMessageForm();
              }}
              disabled={messageUserMutation.isPending}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSendUserMessage} 
              disabled={messageUserMutation.isPending || !selectedUser || !messageSubject.trim() || !messageContent.trim()}
              className={messageType === "warning" ? "bg-yellow-600 hover:bg-yellow-700" : ""}
            >
              {messageUserMutation.isPending ? "Sending..." : messageType === "warning" ? "Send Warning" : "Send Message"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteMessage}
        onOpenChange={() => setDeleteMessage(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Message?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the message from {deleteMessage?.name}.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete Message"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
