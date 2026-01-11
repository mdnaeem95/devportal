"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { formatDate } from "@/lib/utils";
import { Loader2, CheckCircle2, AlertCircle, FileText, Building, Calendar, PenTool, Eraser, Check } from "lucide-react";

const signatureSchema = z.object({
  signedName: z.string().min(1, "Your name is required"),
  signedEmail: z.string().email("Valid email is required"),
  agreedToTerms: z.boolean().refine((val) => val === true, "You must agree to the terms"),
});

type SignatureFormData = z.infer<typeof signatureSchema>;

export default function PublicSignPage({ params }: { params: { token: string } }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [signatureMode, setSignatureMode] = useState<"draw" | "type">("draw");
  const [typedSignature, setTypedSignature] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const { data: contract, isLoading, error } = trpc.contract.getByToken.useQuery({
    token: params.token,
  });

  const signContract = trpc.contract.sign.useMutation({
    onSuccess: () => {
      setIsComplete(true);
      setIsSubmitting(false);
    },
    onError: () => {
      setIsSubmitting(false);
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignatureFormData>({
    resolver: zodResolver(signatureSchema),
    defaultValues: {
      signedName: "",
      signedEmail: "",
      agreedToTerms: false,
    },
  });

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);

    // Set drawing style
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, []);

  const getCoords = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    if ("touches" in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx) return;

    setIsDrawing(true);
    const { x, y } = getCoords(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx) return;

    const { x, y } = getCoords(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !canvas) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const getSignatureData = (): string => {
    if (signatureMode === "type") {
      // Create an image from typed text
      const canvas = document.createElement("canvas");
      canvas.width = 400;
      canvas.height = 100;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.font = "italic 32px 'Brush Script MT', cursive";
        ctx.fillStyle = "#000";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(typedSignature, canvas.width / 2, canvas.height / 2);
      }
      return canvas.toDataURL("image/png");
    }
    return canvasRef.current?.toDataURL("image/png") || "";
  };

  const onSubmit = async (data: SignatureFormData) => {
    const signature = getSignatureData();
    if (signatureMode === "draw" && !hasSignature) {
      alert("Please draw your signature");
      return;
    }
    if (signatureMode === "type" && !typedSignature) {
      alert("Please type your signature");
      return;
    }

    setIsSubmitting(true);
    signContract.mutate({
      token: params.token,
      signature,
      signedName: data.signedName,
      signedEmail: data.signedEmail,
      agreedToTerms: data.agreedToTerms,
    });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error?.data?.code === "NOT_FOUND" || !contract) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <Card className="w-full max-w-md bg-card/50 backdrop-blur-sm">
          <CardContent className="py-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary">
              <AlertCircle className="h-7 w-7 text-muted-foreground" />
            </div>
            <h1 className="mt-6 text-xl font-semibold">Contract Not Found</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              This contract doesn't exist or the link may have expired.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Handle already signed contract
  if (contract.alreadySigned) {
    const signedDate = contract.signedAt ? formatDate(contract.signedAt) : null;
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <Card className="w-full max-w-md bg-card/50 backdrop-blur-sm border-green-500/30">
          <CardContent className="py-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-green-500/20">
              <CheckCircle2 className="h-7 w-7 text-green-400" />
            </div>
            <h1 className="mt-6 text-xl font-semibold text-green-400">Already Signed</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              This contract was signed{signedDate ? ` on ${signedDate}` : ""}.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isComplete) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <Card className="w-full max-w-md bg-card/50 backdrop-blur-sm border-green-500/30">
          <CardContent className="py-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-green-500/20">
              <CheckCircle2 className="h-7 w-7 text-green-400" />
            </div>
            <h1 className="mt-6 text-xl font-semibold text-green-400">Contract Signed!</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Thank you for signing. You will receive a copy via email.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // At this point, contract is not alreadySigned, so it has all the fields
  const contractData = contract;
  const expiresDate = contractData.expiresAt ? formatDate(contractData.expiresAt) : null;

  return (
    <>
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-primary">
              <Building className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-semibold">{contractData.business?.name || "Developer"}</p>
              <p className="text-xs text-muted-foreground">Contract Signing</p>
            </div>
          </div>
          {expiresDate && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              Expires {expiresDate}
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Contract Content */}
          <div className="lg:col-span-2">
            <Card className="bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  {contractData.name}
                </CardTitle>
                {contractData.project && (
                  <p className="text-sm text-muted-foreground">
                    Project: {contractData.project.name}
                  </p>
                )}
              </CardHeader>
              <CardContent>
                <div className="prose prose-invert prose-sm max-w-none max-h-[60vh] overflow-y-auto rounded-lg border border-border/50 bg-secondary/30 p-6">
                  <pre className="whitespace-pre-wrap font-sans text-sm">{contractData.content}</pre>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Signature Panel */}
          <div className="space-y-6">
            <Card className="bg-card/50 backdrop-blur-sm sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PenTool className="h-5 w-5" />
                  Sign Contract
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  {/* Name */}
                  <div className="space-y-2">
                    <Label htmlFor="signedName">Your Full Name</Label>
                    <Input
                      id="signedName"
                      placeholder="John Doe"
                      {...register("signedName")}
                      className={errors.signedName ? "border-destructive" : ""}
                    />
                    {errors.signedName && (
                      <p className="text-sm text-destructive">{errors.signedName.message}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="signedEmail">Your Email</Label>
                    <Input
                      id="signedEmail"
                      type="email"
                      placeholder="john@example.com"
                      defaultValue={contractData.client?.email || ""}
                      {...register("signedEmail")}
                      className={errors.signedEmail ? "border-destructive" : ""}
                    />
                    {errors.signedEmail && (
                      <p className="text-sm text-destructive">{errors.signedEmail.message}</p>
                    )}
                  </div>

                  {/* Signature Mode Toggle */}
                  <div className="space-y-2">
                    <Label>Signature</Label>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant={signatureMode === "draw" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSignatureMode("draw")}
                      >
                        Draw
                      </Button>
                      <Button
                        type="button"
                        variant={signatureMode === "type" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSignatureMode("type")}
                      >
                        Type
                      </Button>
                    </div>
                  </div>

                  {/* Signature Area */}
                  {signatureMode === "draw" ? (
                    <div className="space-y-2">
                      <div className="relative rounded-lg border border-border bg-white">
                        <canvas
                          ref={canvasRef}
                          className="w-full h-32 cursor-crosshair touch-none"
                          onMouseDown={startDrawing}
                          onMouseMove={draw}
                          onMouseUp={stopDrawing}
                          onMouseLeave={stopDrawing}
                          onTouchStart={startDrawing}
                          onTouchMove={draw}
                          onTouchEnd={stopDrawing}
                        />
                        {!hasSignature && (
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <p className="text-gray-400 text-sm">Draw your signature here</p>
                          </div>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={clearSignature}
                        disabled={!hasSignature}
                      >
                        <Eraser className="h-4 w-4" />
                        Clear
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Input
                        placeholder="Type your full name"
                        value={typedSignature}
                        onChange={(e) => setTypedSignature(e.target.value)}
                        className="font-signature text-xl"
                      />
                      {typedSignature && (
                        <div className="rounded-lg border border-border bg-white p-4">
                          <p
                            className="text-2xl text-black text-center"
                            style={{ fontFamily: "'Brush Script MT', cursive" }}
                          >
                            {typedSignature}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Terms Agreement */}
                  <div className="space-y-2">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        {...register("agreedToTerms")}
                        className="mt-1 h-4 w-4 rounded border-border"
                      />
                      <span className="text-sm text-muted-foreground">
                        I agree that my electronic signature is the legal equivalent of my manual
                        signature and I have read and agree to the terms of this contract.
                      </span>
                    </label>
                    {errors.agreedToTerms && (
                      <p className="text-sm text-destructive">{errors.agreedToTerms.message}</p>
                    )}
                  </div>

                  {/* Submit */}
                  <Button
                    type="submit"
                    className="w-full gradient-primary border-0 h-12"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Check className="h-5 w-5" />
                    )}
                    {isSubmitting ? "Signing..." : "Sign Contract"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Client Info */}
            {contractData.client && (
              <Card className="bg-card/50 backdrop-blur-sm">
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground mb-2">Contract prepared for</p>
                  <p className="font-medium">{contractData.client.name}</p>
                  <p className="text-sm text-muted-foreground">{contractData.client.email}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-card/30 mt-12">
        <div className="mx-auto max-w-5xl px-6 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>This is a legally binding contract.</p>
            <div className="flex items-center gap-2">
              <span>Powered by</span>
              <Link href="/" className="font-medium text-foreground hover:text-primary transition-colors">
                DevPortal
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}