"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { ContractPDFButton } from "@/components/pdf/pdf-download-button";
import { Loader2, Building, CheckCircle2, FileText, PenTool, Type, X } from "lucide-react";
import { useParams } from "next/navigation";

export default function ContractSigningPage() {
  const { token } = useParams<{ token: string }>();
  const [signatureType, setSignatureType] = useState<"draw" | "type">("type");
  const [typedSignature, setTypedSignature] = useState("");
  const [isDrawing, setIsDrawing] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [isDeclining, setIsDeclining] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { data: contract, isLoading, refetch } = trpc.contract.getByToken.useQuery({ token });

  const signMutation = trpc.contract.sign.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const declineMutation = trpc.contract.decline.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  // Canvas drawing functions
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.strokeStyle = "#1a1a1a";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const getSignature = (): string => {
    if (signatureType === "type") {
      return typedSignature;
    }

    const canvas = canvasRef.current;
    if (!canvas) return "";

    return canvas.toDataURL("image/png");
  };

  const handleSign = async () => {
    const signature = getSignature();

    if (!signature) {
      alert("Please provide your signature");
      return;
    }

    setIsSigning(true);

    try {
      // Get client IP (will be captured server-side more accurately)
      let clientIp = "";
      try {
        const ipResponse = await fetch("https://api.ipify.org?format=json");
        const ipData = await ipResponse.json();
        clientIp = ipData.ip;
      } catch {
        // IP fetch failed, will use server-side detection
      }

      await signMutation.mutateAsync({
        token,
        signature,
        signatureType: signatureType === "draw" ? "drawn" : "typed",
        clientIp,
      });
    } catch (error) {
      console.error("Sign error:", error);
    } finally {
      setIsSigning(false);
    }
  };

  const handleDecline = async () => {
    if (!confirm("Are you sure you want to decline this contract?")) {
      return;
    }

    setIsDeclining(true);

    try {
      await declineMutation.mutateAsync({ token });
    } catch (error) {
      console.error("Decline error:", error);
    } finally {
      setIsDeclining(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardContent className="py-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
            <h1 className="mt-4 text-xl font-semibold">Contract Not Found</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              This contract doesn't exist or the link has expired.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isSigned = contract.status === "signed";
  const isDeclined = contract.status === "declined";

  return (
    <>
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            {contract.business?.logoUrl ? (
              <img
                src={contract.business.logoUrl}
                alt={contract.business.name}
                className="h-10 w-10 rounded-lg object-cover"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <Building className="h-5 w-5 text-primary-foreground" />
              </div>
            )}
            <div>
              <p className="font-semibold">{contract.business?.name}</p>
              <p className="text-xs text-muted-foreground">Contract</p>
            </div>
          </div>
          <Badge
            variant={
              isSigned ? "default" : isDeclined ? "destructive" : "secondary"
            }
            className={isSigned ? "bg-green-500" : ""}
          >
            {contract.status}
          </Badge>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-8">
        {/* Signed State */}
        {isSigned && (
          <Card className="mb-8 border-green-200 bg-green-50">
            <CardContent className="py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-green-700">
                      Contract Signed
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Signed on{" "}
                      {new Date(contract.signedAt!).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <ContractPDFButton
                  contractId={contract.id}
                  signToken={token}
                  variant="outline"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Declined State */}
        {isDeclined && (
          <Card className="mb-8 border-red-200 bg-red-50">
            <CardContent className="py-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                  <X className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-red-700">
                    Contract Declined
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Please contact {contract.business?.name} if you have questions.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ============================================ */}
        {/* NEW: Developer Already Signed Banner */}
        {/* ============================================ */}
        {contract.developerSignature && !isSigned && !isDeclined && (
          <Card className="mb-8 border-green-200 bg-green-50/50">
            <CardContent className="py-4">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 shrink-0">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-green-700">
                    {contract.developerName || contract.business?.name} has already signed this contract
                  </p>
                  <p className="text-sm text-green-600/80">
                    Signed on{" "}
                    {contract.developerSignedAt
                      ? new Date(contract.developerSignedAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : ""}
                  </p>
                </div>
                {/* Show developer signature preview on larger screens */}
                <div className="hidden sm:block rounded-lg border border-green-200 bg-white p-2">
                  <img
                    src={contract.developerSignature}
                    alt="Developer signature"
                    className="max-h-10 w-auto"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Contract Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">{contract.name}</h1>
          {contract.project && (
            <p className="mt-2 text-muted-foreground">
              Project: {contract.project.name}
            </p>
          )}
        </div>

        {/* Parties */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">
                Developer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium">{contract.business?.name}</p>
              <p className="text-sm text-muted-foreground">
                {contract.business?.email}
              </p>
              {/* Show signed status for developer */}
              {contract.developerSignature && (
                <Badge variant="outline" className="mt-2 border-green-300 text-green-600">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Signed
                </Badge>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">
                Client
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium">{contract.client.name}</p>
              <p className="text-sm text-muted-foreground">
                {contract.client.email}
              </p>
              {/* Show signed status for client */}
              {isSigned && (
                <Badge variant="outline" className="mt-2 border-green-300 text-green-600">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Signed
                </Badge>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Contract Content */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Contract Terms</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              <div className="whitespace-pre-wrap">{contract.content}</div>
            </div>
          </CardContent>
        </Card>

        {/* Signature Section (only if not signed/declined) */}
        {!isSigned && !isDeclined && (
          <Card>
            <CardHeader>
              <CardTitle>Sign Contract</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Signature Type Toggle */}
              <div className="flex gap-2">
                <Button
                  variant={signatureType === "type" ? "default" : "outline"}
                  onClick={() => setSignatureType("type")}
                  className="flex-1"
                >
                  <Type className="mr-2 h-4 w-4" />
                  Type Signature
                </Button>
                <Button
                  variant={signatureType === "draw" ? "default" : "outline"}
                  onClick={() => setSignatureType("draw")}
                  className="flex-1"
                >
                  <PenTool className="mr-2 h-4 w-4" />
                  Draw Signature
                </Button>
              </div>

              {/* Type Signature */}
              {signatureType === "type" && (
                <div className="space-y-2">
                  <Label htmlFor="signature">Type your full name</Label>
                  <Input
                    id="signature"
                    value={typedSignature}
                    onChange={(e) => setTypedSignature(e.target.value)}
                    placeholder="Your full legal name"
                    className="text-lg"
                  />
                  {typedSignature && (
                    <div className="mt-4 rounded-lg border bg-secondary/50 p-4">
                      <p className="text-sm text-muted-foreground">Preview:</p>
                      <p
                        className="mt-2 text-2xl"
                        style={{ fontFamily: "cursive" }}
                      >
                        {typedSignature}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Draw Signature */}
              {signatureType === "draw" && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Draw your signature</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearCanvas}
                    >
                      Clear
                    </Button>
                  </div>
                  <div className="rounded-lg border bg-white">
                    <canvas
                      ref={canvasRef}
                      width={500}
                      height={150}
                      className="w-full cursor-crosshair touch-none"
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Use your mouse or finger to draw your signature
                  </p>
                </div>
              )}

              {/* Agreement */}
              <div className="rounded-lg bg-secondary/50 p-4">
                <p className="text-sm text-muted-foreground">
                  By signing this document, I agree to the terms and conditions
                  outlined above. I understand that this is a legally binding
                  agreement.
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <Button
                  variant="outline"
                  onClick={handleDecline}
                  disabled={isDeclining || isSigning}
                >
                  {isDeclining ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <X className="mr-2 h-4 w-4" />
                  )}
                  Decline
                </Button>
                <Button
                  onClick={handleSign}
                  disabled={
                    isSigning ||
                    isDeclining ||
                    (signatureType === "type" && !typedSignature)
                  }
                >
                  {isSigning ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Sign Contract
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Signatures Display (for signed contracts) */}
        {isSigned && (
          <Card>
            <CardHeader>
              <CardTitle>Signatures</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 sm:grid-cols-2">
                {/* Developer Signature (if sequential signing was used) */}
                {contract.developerSignature && (
                  <div className="rounded-lg border bg-secondary/50 p-6">
                    <p className="text-sm text-muted-foreground mb-2">
                      {contract.developerName || contract.business?.name}
                    </p>
                    {contract.developerSignature.startsWith("data:image") ? (
                      <img
                        src={contract.developerSignature}
                        alt="Developer Signature"
                        className="max-h-16"
                      />
                    ) : (
                      <p className="text-2xl" style={{ fontFamily: "cursive" }}>
                        {contract.developerSignature}
                      </p>
                    )}
                    <p className="mt-4 text-xs text-muted-foreground">
                      Signed on{" "}
                      {contract.developerSignedAt
                        ? new Date(contract.developerSignedAt).toLocaleString()
                        : ""}
                    </p>
                  </div>
                )}

                {/* Client Signature */}
                {contract.clientSignature && (
                  <div className="rounded-lg border bg-secondary/50 p-6">
                    <p className="text-sm text-muted-foreground mb-2">
                      {contract.client.name}
                    </p>
                    {contract.clientSignature.startsWith("data:image") ? (
                      <img
                        src={contract.clientSignature}
                        alt="Client Signature"
                        className="max-h-16"
                      />
                    ) : (
                      <p className="text-2xl" style={{ fontFamily: "cursive" }}>
                        {contract.clientSignature}
                      </p>
                    )}
                    <p className="mt-4 text-xs text-muted-foreground">
                      Signed on {new Date(contract.signedAt!).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t bg-card/50 mt-12">
        <div className="mx-auto max-w-4xl px-6 py-6">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <p>Contract for {contract.client.name}</p>
            <p>Powered by Zovo</p>
          </div>
        </div>
      </footer>
    </>
  );
}