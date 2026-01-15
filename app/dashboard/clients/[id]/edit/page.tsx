"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Header } from "@/components/dashboard/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/dashboard/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { cn, getInitials } from "@/lib/utils";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Users, Mail, Building, Phone, MapPin, FileText, Check, UserCheck, UserX, UserPlus } from "lucide-react";

const clientSchema = z.object({
  name: z.string().min(1, "Client name is required"),
  email: z.string().email("Please enter a valid email address"),
  company: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(["active", "inactive", "lead"]),
});

type ClientFormData = z.infer<typeof clientSchema>;

const statusOptions = [
  { value: "active", label: "Active", icon: UserCheck, description: "Currently working with this client" },
  { value: "lead", label: "Lead", icon: UserPlus, description: "Potential client, not yet converted" },
  { value: "inactive", label: "Inactive", icon: UserX, description: "No longer active" },
];

export default function EditClientPage() {
  const router = useRouter();
  const params = useParams();
  const clientId = params.id as string;

  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: client, isLoading } = trpc.clients.get.useQuery({ id: clientId });

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors, isDirty },
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: "",
      email: "",
      company: "",
      phone: "",
      address: "",
      notes: "",
      status: "active",
    },
  });

  // Populate form when client data loads
  useEffect(() => {
    if (client) {
      reset({
        name: client.name,
        email: client.email,
        company: client.company || "",
        phone: client.phone || "",
        address: client.address || "",
        notes: client.notes || "",
        status: (client.status as "active" | "inactive" | "lead") || "active",
      });
    }
  }, [client, reset]);

  const watchName = watch("name");
  const watchEmail = watch("email");
  const watchStatus = watch("status");

  const utils = trpc.useUtils();

  const updateClient = trpc.clients.update.useMutation({
    onSuccess: () => {
      toast.success("Client updated successfully!");
      utils.clients.get.invalidate({ id: clientId });
      utils.clients.list.invalidate();
      router.push(`/dashboard/clients/${clientId}`);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update client");
      setIsSubmitting(false);
    },
  });

  const onSubmit = async (data: ClientFormData) => {
    setIsSubmitting(true);
    updateClient.mutate({
      id: clientId,
      name: data.name,
      email: data.email,
      company: data.company || undefined,
      phone: data.phone || undefined,
      address: data.address || undefined,
      notes: data.notes || undefined,
      status: data.status,
    });
  };

  const selectedStatus = statusOptions.find((s) => s.value === watchStatus);

  if (isLoading) {
    return (
      <>
        <Header title="Edit Client" />
        <div className="flex-1 overflow-auto p-6">
          <div className="mx-auto max-w-2xl space-y-6">
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-96 rounded-xl" />
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

  return (
    <>
      <Header
        title="Edit Client"
        action={
          <Button variant="ghost" asChild>
            <Link href={`/dashboard/clients/${clientId}`}>
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
          </Button>
        }
      />

      <div className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-2xl">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Preview Card */}
            <Card className="bg-linear-to-br from-primary/10 to-primary/5 border-primary/20 overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl gradient-primary text-lg font-semibold text-white shadow-lg shadow-primary/25">
                    {getInitials(watchName || client.name)}
                  </div>
                  <div>
                    <p className="font-semibold text-lg">{watchName || client.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {watchEmail || client.email}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Client Details */}
            <Card className="bg-card/50 backdrop-blur-sm overflow-hidden">
              <CardHeader className="border-b border-border/50 bg-secondary/20">
                <CardTitle className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20">
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                  Client Information
                </CardTitle>
                <CardDescription>Update contact details for your client.</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Name <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="name"
                      placeholder="John Smith"
                      className={cn(
                        "pl-9",
                        errors.name && "border-destructive focus:ring-destructive/20"
                      )}
                      {...register("name")}
                    />
                  </div>
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name.message}</p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">
                    Email <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@company.com"
                      className={cn(
                        "pl-9",
                        errors.email && "border-destructive focus:ring-destructive/20"
                      )}
                      {...register("email")}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email.message}</p>
                  )}
                </div>

                {/* Company & Phone Row */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="company">Company</Label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="company"
                        placeholder="Acme Inc."
                        className="pl-9"
                        {...register("company")}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="phone"
                        placeholder="+1 (555) 123-4567"
                        className="pl-9"
                        {...register("phone")}
                      />
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={watchStatus}
                    onValueChange={(value) =>
                      setValue("status", value as "active" | "inactive" | "lead", {
                        shouldDirty: true,
                      })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select status">
                        {selectedStatus && (
                          <div className="flex items-center gap-2">
                            <selectedStatus.icon className="h-4 w-4" />
                            {selectedStatus.label}
                          </div>
                        )}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            <option.icon className="h-4 w-4" />
                            <div>
                              <p>{option.label}</p>
                              <p className="text-xs text-muted-foreground">{option.description}</p>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Address */}
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <textarea
                      id="address"
                      placeholder="123 Main St, City, State 12345"
                      rows={2}
                      className="flex w-full rounded-lg border border-border/50 bg-secondary/50 pl-9 pr-3 py-2 text-sm transition-colors placeholder:text-muted-foreground focus:border-primary/50 focus:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                      {...register("address")}
                    />
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <textarea
                      id="notes"
                      placeholder="Any additional notes about this client..."
                      rows={3}
                      className="flex w-full rounded-lg border border-border/50 bg-secondary/50 pl-9 pr-3 py-2 text-sm transition-colors placeholder:text-muted-foreground focus:border-primary/50 focus:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                      {...register("notes")}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submit */}
            <div className="flex items-center justify-between gap-3 rounded-lg border border-border/50 bg-card/50 p-4">
              <div className="text-sm text-muted-foreground">
                {isDirty ? (
                  <span className="text-primary">Unsaved changes</span>
                ) : (
                  <span>No changes made</span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <Button type="button" variant="ghost" asChild>
                  <Link href={`/dashboard/clients/${clientId}`}>Cancel</Link>
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || !isDirty}
                  className="gradient-primary border-0 min-w-35 shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}