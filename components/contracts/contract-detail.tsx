"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ContractPDFButton } from "@/components/pdf/pdf-download-button";
import { trpc } from "@/lib/trpc";
import { formatDate, cn } from "@/lib/utils";
import { Loader2, Send, Eye, Clock, CheckCircle2, XCircle, Copy, ExternalLink } from "lucide-react";

interface ContractDetailProps {
  contractId: string;
}

export function ContractDetail({ contractId }: ContractDetailProps) {
  const { data: contract, isLoading } = trpc.contract.get.useQuery({
    id: contractId,
  });

  const sendMutation = trpc.contract.send.useMutation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!contract) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">Contract not found</p>
        </CardContent>
      </Card>
    );
  }

  const statusConfig = {
    draft: { icon: Clock, color: "secondary", label: "Draft" },
    sent: { icon: Send, color: "info", label: "Sent" },
    viewed: { icon: Eye, color: "warning", label: "Viewed" },
    signed: { icon: CheckCircle2, color: "success", label: "Signed" },
    declined: { icon: XCircle, color: "destructive", label: "Declined" },
    expired: { icon: Clock, color: "secondary", label: "Expired" },
  };

  const status = statusConfig[contract.status as keyof typeof statusConfig];
  const StatusIcon = status.icon;

  const signUrl = contract.signToken
    ? `${window.location.origin}/sign/${contract.signToken}`
    : null;

  const copySignUrl = () => {
    if (signUrl) {
      navigator.clipboard.writeText(signUrl);
      // Could add toast notification here
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{contract.name}</h1>
          <p className="text-muted-foreground">
            {contract.client.name}
            {contract.project && ` • ${contract.project.name}`}
          </p>
        </div>
        <Badge variant={status.color as any} className="gap-1.5">
          <StatusIcon className="h-3.5 w-3.5" />
          {status.label}
        </Badge>
      </div>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          {/* Send button (only for drafts) */}
          {contract.status === "draft" && (
            <Button
              onClick={() => sendMutation.mutate({ id: contract.id })}
              disabled={sendMutation.isPending}
            >
              {sendMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Send for Signature
            </Button>
          )}

          {/* Copy sign link (for sent contracts) */}
          {signUrl && contract.status !== "draft" && (
            <Button variant="outline" onClick={copySignUrl}>
              <Copy className="h-4 w-4" />
              Copy Sign Link
            </Button>
          )}

          {/* View signing page */}
          {signUrl && (
            <Button variant="outline" asChild>
              <a href={signUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
                View Signing Page
              </a>
            </Button>
          )}

          {/* Download PDF - available for all statuses */}
          <ContractPDFButton
            contractId={contract.id}
            variant="outline"
          />
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary">
                <Clock className="h-4 w-4" />
              </div>
              <div>
                <p className="font-medium">Created</p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(contract.createdAt)}
                </p>
              </div>
            </div>

            {contract.sentAt && (
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                  <Send className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Sent</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(contract.sentAt)}
                  </p>
                </div>
              </div>
            )}

            {contract.viewedAt && (
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100">
                  <Eye className="h-4 w-4 text-amber-600" />
                </div>
                <div>
                  <p className="font-medium">Viewed by Client</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(contract.viewedAt)}
                  </p>
                </div>
              </div>
            )}

            {contract.signedAt && (
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">Signed</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(contract.signedAt)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Signature (for signed contracts) */}
      {contract.status === "signed" && contract.clientSignature && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Client Signature</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border bg-secondary/30 p-6">
              {contract.clientSignature.startsWith("data:image") ? (
                <img
                  src={contract.clientSignature}
                  alt="Client signature"
                  className="max-h-20"
                />
              ) : (
                <p className="text-2xl" style={{ fontFamily: "cursive" }}>
                  {contract.clientSignature}
                </p>
              )}
              <div className="mt-4 text-sm text-muted-foreground">
                <p>Signed by: {contract.client.name}</p>
                {contract.clientIp && <p>IP Address: {contract.clientIp}</p>}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contract Content */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Contract Content</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none">
            <div className="whitespace-pre-wrap rounded-lg bg-secondary/30 p-6">
              {contract.content}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}