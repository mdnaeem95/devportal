"use client";

import { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/dashboard/header";
import { CommandPalette, useCommandPalette } from "@/components/dashboard/command-palette";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/dashboard/skeleton";
import { trpc } from "@/lib/trpc";
import { formatRelativeTime, getInitials, cn } from "@/lib/utils";
import { Plus, Users, Mail, Building, ArrowUpRight, Search, Phone, FolderKanban } from "lucide-react";

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

  const { data: clients, isLoading } = trpc.client.list.useQuery();

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

  return (
    <>
      <Header
        title="Clients"
        description={`${clients?.length ?? 0} total clients`}
        onSearchClick={() => setCommandOpen(true)}
        action={
          <Button className="gradient-primary border-0 shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5" asChild>
            <Link href="/dashboard/clients/new">
              <Plus className="h-4 w-4" />
              Add Client
            </Link>
          </Button>
        }
      />

      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />

      <div className="flex-1 overflow-auto">
        {/* Search Bar */}
        {(clients?.length ?? 0) > 0 && (
          <div className="border-b border-border/50 bg-card/30 px-6 py-3">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search clients by name, email, or company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-secondary/50"
              />
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
          ) : clients?.length === 0 ? (
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
          ) : filteredClients?.length === 0 ? (
            <Card className="mx-auto max-w-md bg-card/50 backdrop-blur-sm">
              <CardContent className="flex flex-col items-center py-12">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="mt-6 text-lg font-semibold">No clients found</h3>
                <p className="mt-2 text-center text-sm text-muted-foreground max-w-xs">
                  No clients match "{searchQuery}". Try a different search term.
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
              {filteredClients?.map((client, index) => (
                <Link
                  key={client.id}
                  href={`/dashboard/clients/${client.id}`}
                  className="group"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <Card className="bg-card/50 backdrop-blur-sm transition-all duration-300 hover:bg-card hover:border-border hover:shadow-lg hover:-translate-y-1 h-full">
                    <CardContent className="p-6 h-full flex flex-col">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-primary text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-transform group-hover:scale-105">
                            {getInitials(client.name)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium truncate group-hover:text-primary transition-colors">
                              {client.name}
                            </p>
                            {client.company && (
                              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                <Building className="h-3.5 w-3.5 shrink-0" />
                                <span className="truncate">{client.company}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0 shrink-0" />
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

                      <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          Added {formatRelativeTime(client.createdAt)}
                        </span>
                        {client.projectCount !== undefined && client.projectCount > 0 && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <FolderKanban className="h-3 w-3" />
                            <span>{client.projectCount} project{client.projectCount !== 1 ? "s" : ""}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}