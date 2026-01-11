"use client";

import Link from "next/link";
import { Header } from "@/components/dashboard/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { formatRelativeTime, getInitials } from "@/lib/utils";
import { Plus, Users, Mail, Building, ArrowUpRight } from "lucide-react";

export default function ClientsPage() {
  const { data: clients, isLoading } = trpc.client.list.useQuery();

  return (
    <>
      <Header
        title="Clients"
        description={`${clients?.length ?? 0} total clients`}
        action={
          <Button className="gradient-primary border-0" asChild>
            <Link href="/dashboard/clients/new">
              <Plus className="h-4 w-4" />
              Add Client
            </Link>
          </Button>
        }
      />

      <div className="flex-1 overflow-auto p-6">
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="bg-card/50 animate-pulse">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-secondary" />
                    <div className="space-y-2 flex-1">
                      <div className="h-4 w-24 rounded bg-secondary" />
                      <div className="h-3 w-32 rounded bg-secondary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
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
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {clients?.map((client) => (
              <Link key={client.id} href={`/dashboard/clients/${client.id}`}>
                <Card className="bg-card/50 backdrop-blur-sm transition-all hover:bg-card hover:border-border group">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-primary text-sm font-semibold text-white">
                          {getInitials(client.name)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium truncate">{client.name}</p>
                          {client.company && (
                            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                              <Building className="h-3.5 w-3.5" />
                              <span className="truncate">{client.company}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                    </div>
                    
                    <div className="mt-4 flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Mail className="h-3.5 w-3.5" />
                      <span className="truncate">{client.email}</span>
                    </div>

                    <div className="mt-4 pt-4 border-t border-border/50 text-xs text-muted-foreground">
                      Added {formatRelativeTime(client.createdAt)}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}