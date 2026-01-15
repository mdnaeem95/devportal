"use client";

import { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/dashboard/header";
import { CommandPalette, useCommandPalette } from "@/components/dashboard/command-palette";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/dashboard/skeleton";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel} from "@/components/ui/dropdown-menu";
import { trpc } from "@/lib/trpc";
import { formatRelativeTime, formatCurrency, getInitials, cn } from "@/lib/utils";
import { toast } from "sonner";
import { Plus, Users, Mail, Building, ArrowUpRight, Search, Phone, FolderKanban, Star, ArrowUpDown,
  SlidersHorizontal, Clock, DollarSign, Calendar, UserCheck, UserX, UserPlus } from "lucide-react";

const statusConfig = {
  active: { label: "Active", variant: "success" as const, icon: UserCheck },
  inactive: { label: "Inactive", variant: "secondary" as const, icon: UserX },
  lead: { label: "Lead", variant: "default" as const, icon: UserPlus },
};

const sortOptions = [
  { value: "dateAdded", label: "Date Added", icon: Calendar },
  { value: "name", label: "Name", icon: Users },
  { value: "revenue", label: "Revenue", icon: DollarSign },
  { value: "lastActivity", label: "Last Activity", icon: Clock },
] as const;

function ClientCardSkeleton() {
  return (
    <Card className="bg-card/50">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        </div>
        <Skeleton className="mt-4 h-4 w-40" />
        <div className="mt-4 pt-4 border-t border-border/50">
          <Skeleton className="h-3 w-24" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function ClientsPage() {
  const { open: commandOpen, setOpen: setCommandOpen } = useCommandPalette();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"dateAdded" | "name" | "revenue" | "lastActivity">("dateAdded");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [statusFilter, setStatusFilter] = useState<"active" | "inactive" | "lead" | undefined>(undefined);

  // Query without status filter to get total count for stats
  const { data: allClients } = trpc.clients.list.useQuery({
    sortBy: "dateAdded",
    sortOrder: "desc",
    status: undefined,
  });

  // Query with current filters for display
  const { data: clients, isLoading } = trpc.clients.list.useQuery({
    sortBy,
    sortOrder,
    status: statusFilter,
  });

  const utils = trpc.useUtils();

  const toggleStarred = trpc.clients.toggleStarred.useMutation({
    onSuccess: (client) => {
      utils.clients.list.invalidate();
      toast.success(client.starred ? "Client starred" : "Client unstarred");
    },
    onError: () => {
      toast.error("Failed to update client");
    },
  });

  // Filter clients based on search
  const filteredClients = clients?.filter((client) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      client.name.toLowerCase().includes(query) ||
      client.email?.toLowerCase().includes(query) ||
      client.company?.toLowerCase().includes(query)
    );
  });

  // Stats from all clients (unfiltered)
  const totalClients = allClients?.length ?? 0;
  const activeClients = allClients?.filter((c) => c.status === "active").length ?? 0;
  const starredClients = allClients?.filter((c) => c.starred).length ?? 0;
  const totalRevenue = allClients?.reduce((sum, c) => sum + c.totalRevenue, 0) ?? 0;

  const handleStarClick = (e: React.MouseEvent, clientId: string) => {
    e.preventDefault();
    e.stopPropagation();
    toggleStarred.mutate({ id: clientId });
  };

  // Check if any filters are active
  const hasActiveFilters = statusFilter !== undefined || searchQuery.trim() !== "";

  return (
    <>
      <Header
        title="Clients"
        description={`${totalClients} total clients`}
        onSearchClick={() => setCommandOpen(true)}
        action={
          <Button
            className="gradient-primary border-0 shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5"
            asChild
          >
            <Link href="/dashboard/clients/new">
              <Plus className="h-4 w-4" />
              Add Client
            </Link>
          </Button>
        }
      />

      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />

      <div className="flex-1 overflow-auto">
        {/* Stats Cards - Show when there are clients */}
        {!isLoading && totalClients > 0 && (
          <div className="border-b border-border/50 bg-card/30 px-6 py-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalClients}</p>
                  <p className="text-xs text-muted-foreground">Total</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/20">
                  <UserCheck className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{activeClients}</p>
                  <p className="text-xs text-muted-foreground">Active</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-500/20">
                  <Star className="h-5 w-5 text-yellow-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{starredClients}</p>
                  <p className="text-xs text-muted-foreground">Starred</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/20">
                  <DollarSign className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
                  <p className="text-xs text-muted-foreground">Total Revenue</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters Bar - Always show when there are clients */}
        {!isLoading && totalClients > 0 && (
          <div className="border-b border-border/50 bg-card/30 px-6 py-3">
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              {/* Search */}
              <div className="relative w-full sm:max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search clients..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-secondary/50"
                />
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2">
                {/* Status Filter */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className={cn(
                        "gap-2 cursor-pointer",
                        statusFilter && "border-primary/50 bg-primary/10"
                      )}
                    >
                      <SlidersHorizontal className="h-4 w-4" />
                      {statusFilter ? statusConfig[statusFilter].label : "All Status"}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setStatusFilter(undefined)}>
                      <Users className="h-4 w-4 mr-2" />
                      All Clients
                      {!statusFilter && <span className="ml-auto">✓</span>}
                    </DropdownMenuItem>
                    {Object.entries(statusConfig).map(([key, config]) => {
                      const Icon = config.icon;
                      return (
                        <DropdownMenuItem
                          key={key}
                          onClick={() => setStatusFilter(key as "active" | "inactive" | "lead")}
                        >
                          <Icon className="h-4 w-4 mr-2" />
                          {config.label}
                          {statusFilter === key && <span className="ml-auto">✓</span>}
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Sort */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2 cursor-pointer">
                      <ArrowUpDown className="h-4 w-4" />
                      Sort
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {sortOptions.map((option) => {
                      const Icon = option.icon;
                      return (
                        <DropdownMenuItem
                          key={option.value}
                          onClick={() => {
                            if (sortBy === option.value) {
                              setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                            } else {
                              setSortBy(option.value);
                              setSortOrder("desc");
                            }
                          }}
                        >
                          <Icon className="h-4 w-4 mr-2" />
                          {option.label}
                          {sortBy === option.value && (
                            <span className="ml-auto text-xs text-muted-foreground">
                              {sortOrder === "asc" ? "↑" : "↓"}
                            </span>
                          )}
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Clear Filters Button - Show when filters are active */}
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setStatusFilter(undefined);
                      setSearchQuery("");
                    }}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Clear
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="p-6">
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <ClientCardSkeleton />
              <ClientCardSkeleton />
              <ClientCardSkeleton />
              <ClientCardSkeleton />
              <ClientCardSkeleton />
              <ClientCardSkeleton />
            </div>
          ) : totalClients === 0 ? (
            // True empty state - no clients at all
            <Card className="mx-auto max-w-md bg-card/50 backdrop-blur-sm">
              <CardContent className="flex flex-col items-center py-12">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary">
                  <Users className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="mt-6 text-lg font-semibold">No clients yet</h3>
                <p className="mt-2 text-center text-sm text-muted-foreground max-w-xs">
                  Add your first client to start creating projects and sending invoices.
                </p>
                <Button className="mt-6 gradient-primary border-0" asChild>
                  <Link href="/dashboard/clients/new">
                    <Plus className="h-4 w-4" />
                    Add Client
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : clients?.length === 0 ? (
            // Filtered empty state - no results for current status filter
            <Card className="mx-auto max-w-md bg-card/50 backdrop-blur-sm">
              <CardContent className="flex flex-col items-center py-12">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary">
                  <SlidersHorizontal className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="mt-6 text-lg font-semibold">
                  No {statusFilter && statusConfig[statusFilter]?.label.toLowerCase()} clients
                </h3>
                <p className="mt-2 text-center text-sm text-muted-foreground max-w-xs">
                  You don't have any clients with this status.
                </p>
                <Button
                  variant="outline"
                  className="mt-6"
                  onClick={() => setStatusFilter(undefined)}
                >
                  Show All Clients
                </Button>
              </CardContent>
            </Card>
          ) : filteredClients?.length === 0 ? (
            // Search empty state - no results for search query
            <Card className="mx-auto max-w-md bg-card/50 backdrop-blur-sm">
              <CardContent className="flex flex-col items-center py-12">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="mt-6 text-lg font-semibold">No clients found</h3>
                <p className="mt-2 text-center text-sm text-muted-foreground max-w-xs">
                  No clients match "{searchQuery}".
                </p>
                <Button
                  variant="outline"
                  className="mt-6"
                  onClick={() => setSearchQuery("")}
                >
                  Clear Search
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredClients?.map((client, index) => {
                const status = statusConfig[client.status as keyof typeof statusConfig];
                const StatusIcon = status?.icon || UserCheck;

                return (
                  <Link
                    key={client.id}
                    href={`/dashboard/clients/${client.id}`}
                    className="group"
                    style={{
                      animationDelay: `${index * 50}ms`,
                      animationFillMode: "backwards",
                    }}
                  >
                    <Card
                      className={cn(
                        "bg-card/50 backdrop-blur-sm transition-all duration-300 hover:bg-card hover:border-border hover:shadow-lg hover:-translate-y-1 h-full animate-in fade-in slide-in-from-bottom-2",
                        client.starred && "border-yellow-500/50 bg-yellow-500/5"
                      )}
                    >
                      <CardContent className="p-6 h-full flex flex-col">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-primary text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-transform group-hover:scale-105">
                              {getInitials(client.name)}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="font-medium truncate group-hover:text-primary transition-colors">
                                  {client.name}
                                </p>
                                {client.starred && (
                                  <Star className="h-4 w-4 fill-yellow-500 text-yellow-500 shrink-0" />
                                )}
                              </div>
                              {client.company && (
                                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                  <Building className="h-3.5 w-3.5 shrink-0" />
                                  <span className="truncate">{client.company}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => handleStarClick(e, client.id)}
                              className={cn(
                                "p-1 rounded-md transition-all hover:bg-secondary cursor-pointer",
                                client.starred
                                  ? "text-yellow-500"
                                  : "text-muted-foreground hover:text-yellow-500"
                              )}
                            >
                              <Star
                                className={cn(
                                  "h-4 w-4",
                                  client.starred && "fill-current"
                                )}
                              />
                            </button>
                            <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0 shrink-0" />
                          </div>
                        </div>

                        <div className="mt-4 space-y-2 flex-1">
                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <Mail className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate">{client.email}</span>
                          </div>
                          {client.phone && (
                            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                              <Phone className="h-3.5 w-3.5 shrink-0" />
                              <span className="truncate">{client.phone}</span>
                            </div>
                          )}
                        </div>

                        {/* Revenue & Activity Row */}
                        <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-3">
                            <Badge variant={status?.variant || "secondary"} className="gap-1">
                              <StatusIcon className="h-3 w-3" />
                              {status?.label || client.status}
                            </Badge>
                            {client.projectCount > 0 && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <FolderKanban className="h-3 w-3" />
                                <span>{client.projectCount}</span>
                              </div>
                            )}
                          </div>
                          {client.totalRevenue > 0 && (
                            <span className="text-sm font-medium text-green-500">
                              {formatCurrency(client.totalRevenue)}
                            </span>
                          )}
                        </div>

                        {/* Last Activity */}
                        <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>Active {formatRelativeTime(client.lastActivity)}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}