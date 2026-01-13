"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Header } from "@/components/dashboard/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Users, Mail, Building, Phone, MapPin, FileText, Check, Sparkles } from "lucide-react";

const clientSchema = z.object({
  name: z.string().min(1, "Client name is required"),
  email: z.string().email("Please enter a valid email address"),
  company: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
});

type ClientFormData = z.infer<typeof clientSchema>;

export default function NewClientPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
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
    },
  });

  const watchName = watch("name");
  const watchEmail = watch("email");

  const createClient = trpc.clients.create.useMutation({
    onSuccess: (client) => {
      toast.success("Client added successfully!");
      router.push(`/dashboard/clients/${client.id}`);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to add client");
      setIsSubmitting(false);
    },
  });

  const onSubmit = async (data: ClientFormData) => {
    setIsSubmitting(true);
    createClient.mutate({
      name: data.name,
      email: data.email,
      company: data.company || undefined,
      phone: data.phone || undefined,
      address: data.address || undefined,
      notes: data.notes || undefined,
    });
  };

  // Generate initials preview
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "?";
  };

  return (
    <>
      <Header
        title="Add Client"
        action={
          <Button variant="ghost" asChild>
            <Link href="/dashboard/clients">
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
            {(watchName || watchEmail) && (
              <Card className="bg-linear-to-br from-primary/10 to-primary/5 border-primary/20 overflow-hidden animate-in fade-in slide-in-from-top-2">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl gradient-primary text-lg font-semibold text-white shadow-lg shadow-primary/25">
                      {getInitials(watchName || "?")}
                    </div>
                    <div>
                      <p className="font-semibold text-lg">
                        {watchName || "Client Name"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {watchEmail || "email@example.com"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Client Details */}
            <Card className="bg-card/50 backdrop-blur-sm overflow-hidden">
              <CardHeader className="border-b border-border/50 bg-secondary/20">
                <CardTitle className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20">
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                  Client Information
                </CardTitle>
                <CardDescription>
                  Basic contact details for your client.
                </CardDescription>
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

            {/* Tip */}
            <div className="flex items-start gap-2 rounded-lg bg-primary/5 border border-primary/20 p-3 text-sm">
              <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <p className="text-muted-foreground">
                <span className="font-medium text-foreground">Tip:</span> After adding a client, you can create projects for them and send contracts and invoices directly.
              </p>
            </div>

            {/* Submit */}
            <div className="flex items-center justify-between gap-3 rounded-lg border border-border/50 bg-card/50 p-4">
              <div className="text-sm text-muted-foreground">
                {isDirty ? (
                  <span className="text-primary">Unsaved changes</span>
                ) : (
                  <span>Fill in the client details above</span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <Button type="button" variant="ghost" asChild>
                  <Link href="/dashboard/clients">Cancel</Link>
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="gradient-primary border-0 min-w-30"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      Add Client
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