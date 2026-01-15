"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/dashboard/header";
import { CommandPalette, useCommandPalette } from "@/components/dashboard/command-palette";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/dashboard/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import { trpc } from "@/lib/trpc";
import { formatCurrency, formatDate, formatRelativeTime, getInitials, cn } from "@/lib/utils";
import { toast } from "sonner";
import { Mail, Building, Phone, MapPin, FileText, Edit, Trash2, Plus, FolderKanban, CreditCard,
  ArrowUpRight, Loader2, Star, Clock, UserCheck, UserX, UserPlus, ChevronDown, MessageCircle, Send, TrendingUp,
  Calendar, DollarSign, Receipt, ScrollText, StickyNote, MoreHorizontal, Zap } from "lucide-react";

const projectStatusConfig = {
  draft: { label: "Draft", variant: "secondary" as const },
  active: { label: "Active", variant: "success" as const },
  on_hold: { label: "On Hold", variant: "warning" as const },
  completed: { label: "Completed", variant: "default" as const },
  cancelled: { label: "Cancelled", variant: "destructive" as const },
};

const invoiceStatusConfig = {
  draft: { label: "Draft", variant: "secondary" as const },
  sent: { label: "Sent", variant: "default" as const },
  viewed: { label: "Viewed", variant: "default" as const },
  paid: { label: "Paid", variant: "success" as const },
  overdue: { label: "Overdue", variant: "destructive" as const },
  cancelled: { label: "Cancelled", variant: "secondary" as const },
};

const contractStatusConfig = {
  draft: { label: "Draft", variant: "secondary" as const },
  sent: { label: "Sent", variant: "default" as const },
  viewed: { label: "Viewed", variant: "default" as const },
  signed: { label: "Signed", variant: "success" as const },
  declined: { label: "Declined", variant: "destructive" as const },
};

const clientStatusConfig = {
  active: { label: "Active", variant: "success" as const, icon: UserCheck, color: "text-green-500" },
  inactive: { label: "Inactive", variant: "secondary" as const, icon: UserX, color: "text-muted-foreground" },
  lead: { label: "Lead", variant: "default" as const, icon: UserPlus, color: "text-primary" },
};

const paymentBehaviorConfig = {
  success: { bg: "bg-green-500/10", border: "border-green-500/30", text: "text-green-500" },
  default: { bg: "bg-secondary", border: "border-border", text: "text-muted-foreground" },
  warning: { bg: "bg-yellow-500/10", border: "border-yellow-500/30", text: "text-yellow-500" },
  destructive: { bg: "bg-red-500/10", border: "border-red-500/30", text: "text-red-500" },
};

const timelineIconConfig = {
  project: { icon: FolderKanban, color: "text-blue-500", bg: "bg-blue-500/10" },
  invoice: { icon: Receipt, color: "text-green-500", bg: "bg-green-500/10" },
  contract: { icon: ScrollText, color: "text-purple-500", bg: "bg-purple-500/10" },
  note: { icon: StickyNote, color: "text-yellow-500", bg: "bg-yellow-500/10" },
};

export default function ClientDetailPage() {
  const router = useRouter();
  const params = useParams();
  const clientId = params.id as string;

  const { open: commandOpen, setOpen: setCommandOpen } = useCommandPalette();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [phoneDialogOpen, setPhoneDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [isAddingNote, setIsAddingNote] = useState(false);

  const { data: client, isLoading } = trpc.clients.get.useQuery({ id: clientId });

  const utils = trpc.useUtils();

  const deleteClient = trpc.clients.delete.useMutation({
    onSuccess: () => {
      toast.success("Client deleted");
      router.push("/dashboard/clients");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete client");
      setIsDeleting(false);
    },
  });

  const toggleStarred = trpc.clients.toggleStarred.useMutation({
    onSuccess: (updated) => {
      utils.clients.get.invalidate({ id: clientId });
      utils.clients.list.invalidate();
      toast.success(updated.starred ? "Client starred" : "Client unstarred");
    },
    onError: () => {
      toast.error("Failed to update client");
    },
  });

  const updateStatus = trpc.clients.updateStatus.useMutation({
    onSuccess: (updated) => {
      utils.clients.get.invalidate({ id: clientId });
      utils.clients.list.invalidate();
      toast.success(
        `Status changed to ${clientStatusConfig[updated.status as keyof typeof clientStatusConfig]?.label}`
      );
    },
    onError: () => {
      toast.error("Failed to update status");
    },
  });

  const updateLastContact = trpc.clients.updateLastContact.useMutation({
    onSuccess: () => {
      utils.clients.get.invalidate({ id: clientId });
      utils.clients.list.invalidate();
      toast.success("Last contact updated");
    },
    onError: () => {
      toast.error("Failed to update last contact");
    },
  });

  const addNote = trpc.clients.addNote.useMutation({
    onSuccess: () => {
      utils.clients.get.invalidate({ id: clientId });
      setNewNote("");
      setIsAddingNote(false);
      toast.success("Note added");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to add note");
    },
  });

  const deleteNote = trpc.clients.deleteNote.useMutation({
    onSuccess: () => {
      utils.clients.get.invalidate({ id: clientId });
      toast.success("Note deleted");
    },
    onError: () => {
      toast.error("Failed to delete note");
    },
  });

  const handleDelete = () => {
    setIsDeleting(true);
    deleteClient.mutate({ id: clientId });
  };

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    addNote.mutate({ clientId, content: newNote.trim() });
  };

  if (isLoading) {
    return (
      <>
        <Header title="Client" />
        <div className="flex-1 overflow-auto p-6">
          <div className="mx-auto max-w-5xl space-y-6">
            <Card className="bg-card/50">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-16 w-16 rounded-xl" />
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-40" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <div className="grid gap-6 lg:grid-cols-3">
              <Skeleton className="h-48 rounded-xl" />
              <Skeleton className="h-48 rounded-xl" />
              <Skeleton className="h-48 rounded-xl" />
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!client) {
    return (
      <>
        <Header title="Client Not Found" />
        <div className="flex-1 overflow-auto p-6">
          <Card className="mx-auto max-w-md bg-card/50">
            <CardContent className="flex flex-col items-center py-12">
              <p className="text-muted-foreground">This client doesn't exist or was deleted.</p>
              <Button className="mt-4" asChild>
                <Link href="/dashboard/clients">Back to Clients</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  const totalRevenue =
    client.invoices?.reduce((sum, inv) => (inv.status === "paid" ? sum + inv.total : sum), 0) ?? 0;

  const outstandingAmount =
    client.invoices?.reduce(
      (sum, inv) => (inv.status === "sent" || inv.status === "viewed" ? sum + inv.total : sum),
      0
    ) ?? 0;

  const status = clientStatusConfig[client.status as keyof typeof clientStatusConfig];
  const StatusIcon = status?.icon || UserCheck;
  const paymentStyle = paymentBehaviorConfig[client.paymentBehavior.variant];

  return (
    <>
      <Header
        title={client.name}
        description={client.company || client.email}
        onSearchClick={() => setCommandOpen(true)}
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => toggleStarred.mutate({ id: clientId })}
              className={cn(
                "gap-2 cursor-pointer",
                client.starred && "border-yellow-500/50 bg-yellow-500/10 text-yellow-500"
              )}
            >
              <Star className={cn("h-4 w-4", client.starred && "fill-current")} />
              {client.starred ? "Starred" : "Star"}
            </Button>

            <Button variant="outline" size="sm" asChild>
              <Link href={`/dashboard/clients/${clientId}/edit`}>
                <Edit className="h-4 w-4" />
                Edit
              </Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-destructive hover:text-destructive hover:bg-destructive/10 cursor-pointer"
              onClick={() => setDeleteDialogOpen(true)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        }
      />

      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Client</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {client.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Client"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Phone Dialog */}
      {client.phone && (
        <Dialog open={phoneDialogOpen} onOpenChange={setPhoneDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Contact {client.name}</DialogTitle>
              <DialogDescription>Choose how you'd like to reach out</DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-3 py-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">{client.phone}</span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    navigator.clipboard.writeText(client.phone!);
                    toast.success("Phone number copied!");
                    setPhoneDialogOpen(false);
                  }}
                >
                  Copy Number
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => {
                    window.location.href = `tel:${client.phone}`;
                    setPhoneDialogOpen(false);
                  }}
                >
                  Call Now
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      <div className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-5xl space-y-6">
          {/* Client Info Card */}
          <Card
            className={cn(
              "bg-card/50 backdrop-blur-sm overflow-hidden",
              client.starred && "border-yellow-500/50"
            )}
          >
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="flex h-16 w-16 items-center justify-center rounded-xl gradient-primary text-xl font-semibold text-white shadow-lg shadow-primary/25">
                      {getInitials(client.name)}
                    </div>
                    {client.starred && (
                      <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-yellow-500 shadow-md">
                        <Star className="h-3 w-3 fill-white text-white" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">{client.name}</h2>
                    {client.company && (
                      <div className="flex items-center gap-1.5 text-muted-foreground mt-1">
                        <Building className="h-4 w-4" />
                        <span>{client.company}</span>
                      </div>
                    )}
                    {/* Status & Payment Behavior Row */}
                    <div className="flex items-center gap-2 mt-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="gap-2 h-7 text-xs cursor-pointer">
                            <StatusIcon className={cn("h-3.5 w-3.5", status?.color)} />
                            {status?.label || client.status}
                            <ChevronDown className="h-3 w-3 opacity-50" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {Object.entries(clientStatusConfig).map(([key, config]) => {
                            const Icon = config.icon;
                            return (
                              <DropdownMenuItem
                                key={key}
                                onClick={() =>
                                  updateStatus.mutate({
                                    id: clientId,
                                    status: key as "active" | "inactive" | "lead",
                                  })
                                }
                              >
                                <Icon className={cn("h-4 w-4 mr-2", config.color)} />
                                {config.label}
                                {client.status === key && <span className="ml-auto">✓</span>}
                              </DropdownMenuItem>
                            );
                          })}
                        </DropdownMenuContent>
                      </DropdownMenu>

                      {/* Payment Behavior Badge */}
                      <div
                        className={cn(
                          "flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium border",
                          paymentStyle.bg,
                          paymentStyle.border,
                          paymentStyle.text
                        )}
                      >
                        <Zap className="h-3 w-3" />
                        {client.paymentBehavior.label}
                        {client.paymentBehavior.avgDays !== null && (
                          <span className="opacity-75">({client.paymentBehavior.avgDays}d avg)</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="flex gap-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-500">{formatCurrency(totalRevenue)}</p>
                    <p className="text-xs text-muted-foreground">Total Revenue</p>
                  </div>
                  {outstandingAmount > 0 && (
                    <div className="text-center">
                      <p className="text-2xl font-bold text-orange-500">
                        {formatCurrency(outstandingAmount)}
                      </p>
                      <p className="text-xs text-muted-foreground">Outstanding</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Contact Details */}
              <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a href={`mailto:${client.email}`} className="text-primary hover:underline">
                    {client.email}
                  </a>
                </div>
                {client.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <button
                      onClick={() => setPhoneDialogOpen(true)}
                      className="hover:text-primary cursor-pointer"
                    >
                      {client.phone}
                    </button>
                  </div>
                )}
                {client.address && (
                  <div className="flex items-center gap-2 text-sm sm:col-span-2">
                    <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="text-muted-foreground">{client.address}</span>
                  </div>
                )}
              </div>

              {/* Last Contact Section */}
              <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>
                    Last contact:{" "}
                    {client.lastContactAt
                      ? formatRelativeTime(client.lastContactAt)
                      : "Never recorded"}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateLastContact.mutate({ id: clientId })}
                  className="gap-2 cursor-pointer"
                >
                  <MessageCircle className="h-4 w-4" />
                  Log Contact
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Client Insights */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-card/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                    <DollarSign className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{formatCurrency(client.insights.lifetimeValue)}</p>
                    <p className="text-xs text-muted-foreground">Lifetime Value</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                    <TrendingUp className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{formatCurrency(client.insights.avgProjectValue)}</p>
                    <p className="text-xs text-muted-foreground">Avg Project Value</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
                    <FolderKanban className="h-5 w-5 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{client.insights.totalProjects}</p>
                    <p className="text-xs text-muted-foreground">Total Projects</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10">
                    <Calendar className="h-5 w-5 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {client.insights.monthsWorking}
                      <span className="text-sm font-normal text-muted-foreground"> mo</span>
                    </p>
                    <p className="text-xs text-muted-foreground">Working Together</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-3">
            <Button
              className="gradient-primary border-0 shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5"
              asChild
            >
              <Link href={`/dashboard/projects/new?client=${clientId}`}>
                <Plus className="h-4 w-4" />
                New Project
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/dashboard/invoices/new?client=${clientId}`}>
                <CreditCard className="h-4 w-4" />
                Create Invoice
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/dashboard/contracts/new?client=${clientId}`}>
                <FileText className="h-4 w-4" />
                Create Contract
              </Link>
            </Button>
          </div>

          {/* Quick Notes & Activity Timeline */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Quick Notes */}
            <Card className="bg-card/50 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <StickyNote className="h-4 w-4" />
                  Quick Notes
                </CardTitle>
                <span className="text-sm text-muted-foreground">{client.notes?.length ?? 0} notes</span>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Add Note Input */}
                <div className="space-y-2">
                  <Textarea
                    placeholder="Add a quick note... (e.g., 'Called about Q2 project, interested in mobile app')"
                    value={newNote}
                    onChange={(e: any) => setNewNote(e.target.value)}
                    className="min-h-20 resize-none"
                  />
                  <div className="flex justify-end">
                    <Button
                      size="sm"
                      onClick={handleAddNote}
                      disabled={!newNote.trim() || addNote.isPending}
                      className="gap-2 cursor-pointer"
                    >
                      {addNote.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                      Add Note
                    </Button>
                  </div>
                </div>

                {/* Notes List */}
                {client.quickNotes && client.quickNotes.length > 0 ? (
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {client.quickNotes.map((note) => (
                      <div
                        key={note.id}
                        className="group relative rounded-lg border border-border/50 bg-secondary/30 p-3"
                      >
                        <p className="text-sm whitespace-pre-wrap pr-8">{note.content}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {formatRelativeTime(note.createdAt)}
                        </p>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => deleteNote.mutate({ id: note.id })}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-6 text-center text-sm text-muted-foreground">
                    No notes yet. Add your first note above!
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Activity Timeline */}
            <Card className="bg-card/50 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Activity Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                {client.timeline && client.timeline.length > 0 ? (
                  <div className="relative space-y-4 max-h-96 overflow-y-auto">
                    {/* Timeline line */}
                    <div className="absolute left-4 top-2 bottom-2 w-px bg-border" />

                    {client.timeline.map((item, index) => {
                      const config = timelineIconConfig[item.type];
                      const Icon = config.icon;

                      return (
                        <div key={item.id} className="relative flex gap-4 pl-2">
                          {/* Icon */}
                          <div
                            className={cn(
                              "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                              config.bg
                            )}
                          >
                            <Icon className={cn("h-4 w-4", config.color)} />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0 pb-4">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="font-medium text-sm truncate">{item.title}</p>
                                <p className="text-xs text-muted-foreground">{item.description}</p>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                {item.amount && (
                                  <span className="text-sm font-medium">
                                    {formatCurrency(item.amount)}
                                  </span>
                                )}
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatRelativeTime(item.date)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-secondary">
                      <Clock className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="mt-4 text-sm text-muted-foreground">No activity yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Projects & Invoices Grid */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Projects */}
            <Card className="bg-card/50 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <FolderKanban className="h-4 w-4" />
                  Projects
                </CardTitle>
                <span className="text-sm text-muted-foreground">
                  {client.projects?.length ?? 0} total
                </span>
              </CardHeader>
              <CardContent>
                {!client.projects?.length ? (
                  <div className="py-8 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-secondary">
                      <FolderKanban className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="mt-4 text-sm text-muted-foreground">No projects yet</p>
                    <Button variant="link" size="sm" asChild className="mt-2">
                      <Link href={`/dashboard/projects/new?client=${clientId}`}>
                        Create first project
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {client.projects.slice(0, 5).map((project) => {
                      const pStatus =
                        projectStatusConfig[project.status as keyof typeof projectStatusConfig];
                      return (
                        <Link
                          key={project.id}
                          href={`/dashboard/projects/${project.id}`}
                          className="flex items-center justify-between rounded-lg border border-border/50 p-3 transition-all hover:bg-secondary/50 hover:border-border group"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="font-medium truncate group-hover:text-primary transition-colors">
                              {project.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatRelativeTime(project.updatedAt)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={pStatus?.variant || "secondary"}>
                              {pStatus?.label || project.status}
                            </Badge>
                            <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </Link>
                      );
                    })}
                    {client.projects.length > 5 && (
                      <Button variant="ghost" size="sm" className="w-full" asChild>
                        <Link href={`/dashboard/projects?client=${clientId}`}>
                          View all {client.projects.length} projects
                        </Link>
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Invoices */}
            <Card className="bg-card/50 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Invoices
                </CardTitle>
                <span className="text-sm text-muted-foreground">
                  {client.invoices?.length ?? 0} total
                </span>
              </CardHeader>
              <CardContent>
                {!client.invoices?.length ? (
                  <div className="py-8 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-secondary">
                      <CreditCard className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="mt-4 text-sm text-muted-foreground">No invoices yet</p>
                    <Button variant="link" size="sm" asChild className="mt-2">
                      <Link href={`/dashboard/invoices/new?client=${clientId}`}>
                        Create first invoice
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {client.invoices.slice(0, 5).map((invoice) => {
                      const iStatus =
                        invoiceStatusConfig[invoice.status as keyof typeof invoiceStatusConfig];
                      return (
                        <Link
                          key={invoice.id}
                          href={`/dashboard/invoices/${invoice.id}`}
                          className="flex items-center justify-between rounded-lg border border-border/50 p-3 transition-all hover:bg-secondary/50 hover:border-border group"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="font-medium font-mono text-sm group-hover:text-primary transition-colors">
                              {invoice.invoiceNumber}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Due {formatDate(invoice.dueDate)}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span
                              className={cn(
                                "font-semibold",
                                invoice.status === "paid" ? "text-green-500" : ""
                              )}
                            >
                              {formatCurrency(invoice.total)}
                            </span>
                            <Badge variant={iStatus?.variant || "secondary"}>
                              {iStatus?.label || invoice.status}
                            </Badge>
                          </div>
                        </Link>
                      );
                    })}
                    {client.invoices.length > 5 && (
                      <Button variant="ghost" size="sm" className="w-full" asChild>
                        <Link href={`/dashboard/invoices?client=${clientId}`}>
                          View all {client.invoices.length} invoices
                        </Link>
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Client Meta */}
          <div className="text-center text-xs text-muted-foreground">
            Client added {formatRelativeTime(client.createdAt)} • Last active{" "}
            {formatRelativeTime(client.lastActivity)}
          </div>
        </div>
      </div>
    </>
  );
}