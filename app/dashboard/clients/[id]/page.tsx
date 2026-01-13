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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { formatCurrency, formatDate, formatRelativeTime, getInitials, cn } from "@/lib/utils";
import { toast } from "sonner";
import { Mail, Building, Phone, MapPin, FileText, Edit, Trash2, Plus, FolderKanban,
  CreditCard, ArrowUpRight, Loader, 
  Loader2} from "lucide-react";

const statusConfig = {
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

export default function ClientDetailPage() {
  const router = useRouter();
  const params = useParams();
  const clientId = params.id as string;
  
  const { open: commandOpen, setOpen: setCommandOpen } = useCommandPalette();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleDelete = () => {
    setIsDeleting(true);
    deleteClient.mutate({ id: clientId });
  };

  if (isLoading) {
    return (
      <>
        <Header title="Client" />
        <div className="flex-1 overflow-auto p-6">
          <div className="mx-auto max-w-4xl space-y-6">
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
            <div className="grid gap-6 lg:grid-cols-2">
              <Skeleton className="h-64 rounded-xl" />
              <Skeleton className="h-64 rounded-xl" />
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

  const totalRevenue = client.invoices?.reduce((sum, inv) => 
    inv.status === "paid" ? sum + inv.total : sum, 0
  ) ?? 0;

  const outstandingAmount = client.invoices?.reduce((sum, inv) => 
    inv.status === "sent" || inv.status === "viewed" ? sum + inv.total : sum, 0
  ) ?? 0;

  return (
    <>
      <Header
        title={client.name}
        description={client.company || client.email}
        onSearchClick={() => setCommandOpen(true)}
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/dashboard/clients/${clientId}/edit`}>
                <Edit className="h-4 w-4" />
                Edit
              </Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
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
              All associated projects, contracts, and invoices will be affected.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
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

      <div className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-4xl space-y-6">
          {/* Client Info Card */}
          <Card className="bg-card/50 backdrop-blur-sm overflow-hidden">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-xl gradient-primary text-xl font-semibold text-white shadow-lg shadow-primary/25">
                    {getInitials(client.name)}
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">{client.name}</h2>
                    {client.company && (
                      <div className="flex items-center gap-1.5 text-muted-foreground mt-1">
                        <Building className="h-4 w-4" />
                        <span>{client.company}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Quick Stats */}
                <div className="flex gap-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-500">
                      {formatCurrency(totalRevenue)}
                    </p>
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
                    <a href={`tel:${client.phone}`} className="hover:text-primary">
                      {client.phone}
                    </a>
                  </div>
                )}
                {client.address && (
                  <div className="flex items-center gap-2 text-sm sm:col-span-2">
                    <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="text-muted-foreground">{client.address}</span>
                  </div>
                )}
              </div>

              {client.notes && (
                <div className="mt-4 pt-4 border-t border-border/50">
                  <div className="flex items-start gap-2 text-sm">
                    <FileText className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                    <p className="text-muted-foreground">{client.notes}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-3">
            <Button className="gradient-primary border-0" asChild>
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
                      const status = statusConfig[project.status as keyof typeof statusConfig];
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
                            <Badge variant={status?.variant || "secondary"}>
                              {status?.label || project.status}
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
                      const status = invoiceStatusConfig[invoice.status as keyof typeof invoiceStatusConfig];
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
                            <span className={cn(
                              "font-semibold",
                              invoice.status === "paid" ? "text-green-500" : ""
                            )}>
                              {formatCurrency(invoice.total)}
                            </span>
                            <Badge variant={status?.variant || "secondary"}>
                              {status?.label || invoice.status}
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
            Client added {formatRelativeTime(client.createdAt)}
          </div>
        </div>
      </div>
    </>
  );
}