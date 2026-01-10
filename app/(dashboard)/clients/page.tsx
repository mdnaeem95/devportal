"use client";

import Link from "next/link";
import { Header } from "@/components/dashboard/header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { formatRelativeTime, getInitials } from "@/lib/utils";
import { Plus, Users, Mail, Building } from "lucide-react";

export default function ClientsPage() {
  const { data: clients, isLoading } = trpc.client.list.useQuery();

  return (
    <>
      <Header
        title="Clients"
        description="Manage your client relationships"
        action={
          <Button asChild>
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
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-muted" />
                    <div className="space-y-2">
                      <div className="h-4 w-24 rounded bg-muted" />
                      <div className="h-3 w-32 rounded bg-muted" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : clients?.length === 0 ? (
          <Card className="mx-auto max-w-md">
            <CardContent className="flex flex-col items-center py-12">
              <Users className="h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No clients yet</h3>
              <p className="mt-2 text-center text-sm text-muted-foreground">
                Add your first client to start creating projects and sending
                invoices.
              </p>
              <Button className="mt-6" asChild>
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
                <Card className="transition-colors hover:bg-secondary/50">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <span className="text-sm font-medium">
                          {getInitials(client.name)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{client.name}</p>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          <span className="truncate">{client.email}</span>
                        </div>
                        {client.company && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Building className="h-3 w-3" />
                            <span className="truncate">{client.company}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="mt-4 text-xs text-muted-foreground">
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
