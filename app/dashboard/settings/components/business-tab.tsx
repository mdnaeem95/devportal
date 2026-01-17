"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Loader2, Upload, Check, X, ImageIcon, ChevronDown } from "lucide-react";
import { currencies } from "./constants";

interface BusinessTabProps {
  settings: {
    businessName: string | null;
    businessAddress: string | null;
    taxId: string | null;
    currency: string;
    logoUrl: string | null;
  };
  onRefetch: () => void;
}

export function BusinessTab({ settings, onRefetch }: BusinessTabProps) {
  const [businessName, setBusinessName] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");
  const [taxId, setTaxId] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Populate form when settings load
  useEffect(() => {
    setBusinessName(settings.businessName || "");
    setBusinessAddress(settings.businessAddress || "");
    setTaxId(settings.taxId || "");
    setCurrency(settings.currency || "USD");
  }, [settings]);

  // Mutations
  const updateBusiness = trpc.settings.updateBusiness.useMutation({
    onSuccess: () => {
      toast.success("Business settings saved");
      onRefetch();
    },
    onError: (error) => toast.error(error.message || "Failed to save settings"),
  });

  const updateLogo = trpc.settings.updateLogo.useMutation({
    onSuccess: () => {
      toast.success("Logo updated");
      onRefetch();
      setLogoFile(null);
      setLogoPreview(null);
    },
    onError: (error) => toast.error(error.message || "Failed to update logo"),
  });

  const getLogoUploadUrl = trpc.settings.getLogoUploadUrl.useMutation();

  const handleSave = () => {
    updateBusiness.mutate({
      businessName: businessName || null,
      businessAddress: businessAddress || null,
      taxId: taxId || null,
      currency: currency as "USD" | "EUR" | "GBP" | "SGD" | "AUD" | "CAD",
    });
  };

  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be less than 2MB");
      return;
    }

    setLogoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setLogoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleLogoUpload = async () => {
    if (!logoFile) return;
    setIsUploadingLogo(true);

    try {
      const { uploadUrl, fileUrl } = await getLogoUploadUrl.mutateAsync({
        fileName: logoFile.name,
        contentType: logoFile.type,
      });

      const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        body: logoFile,
        headers: { "Content-Type": logoFile.type },
      });

      if (!uploadResponse.ok) throw new Error("Failed to upload file");
      await updateLogo.mutateAsync({ logoUrl: fileUrl });
    } catch (error) {
      console.error("[Settings] Logo upload error:", error);
      toast.error("Failed to upload logo");
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleRemoveLogo = async () => {
    setLogoFile(null);
    setLogoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (settings.logoUrl) {
      try {
        await updateLogo.mutateAsync({ logoUrl: null });
      } catch {
        toast.error("Failed to remove logo");
      }
    }
  };

  const displayLogo = logoPreview || settings.logoUrl;

  return (
    <Card className="bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Business Information</CardTitle>
        <CardDescription>
          This information appears on your invoices, contracts, and client-facing pages.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Logo */}
        <div className="space-y-2">
          <Label>Business Logo</Label>
          <div className="flex items-center gap-4">
            <div className="relative">
              {displayLogo ? (
                <div className="relative">
                  <img
                    src={displayLogo}
                    alt="Business logo"
                    className="h-16 w-16 rounded-lg object-cover border border-border/50"
                  />
                  <button
                    onClick={handleRemoveLogo}
                    className="absolute -top-2 -right-2 p-1 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-dashed border-border bg-secondary/30">
                  <ImageIcon className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoSelect}
                className="hidden"
              />
              <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                <Upload className="h-4 w-4" />
                {displayLogo ? "Change Logo" : "Upload Logo"}
              </Button>
              {logoFile && (
                <Button
                  size="sm"
                  onClick={handleLogoUpload}
                  disabled={isUploadingLogo}
                  className="gradient-primary border-0"
                >
                  {isUploadingLogo ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  {isUploadingLogo ? "Uploading..." : "Save Logo"}
                </Button>
              )}
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Square image, at least 200×200px, max 2MB</p>
        </div>

        {/* Business Name */}
        <div className="space-y-2">
          <Label htmlFor="businessName">Business Name</Label>
          <Input
            id="businessName"
            placeholder="Your Business Name"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
          />
        </div>

        {/* Address */}
        <div className="space-y-2">
          <Label htmlFor="businessAddress">Business Address</Label>
          <textarea
            id="businessAddress"
            placeholder={"123 Main St\nCity, State 12345\nCountry"}
            value={businessAddress}
            onChange={(e) => setBusinessAddress(e.target.value)}
            rows={3}
            className="flex w-full rounded-lg border border-border/50 bg-secondary/50 px-3 py-2 text-sm transition-colors placeholder:text-muted-foreground focus:border-primary/50 focus:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* Tax ID */}
        <div className="space-y-2">
          <Label htmlFor="taxId">Tax ID / VAT Number</Label>
          <Input
            id="taxId"
            placeholder="e.g., EIN, VAT, GST number"
            value={taxId}
            onChange={(e) => setTaxId(e.target.value)}
          />
        </div>

        {/* Currency */}
        <div className="space-y-2">
          <Label htmlFor="currency">Default Currency</Label>
          <div className="relative">
            <select
              id="currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="flex h-10 w-full appearance-none rounded-lg border border-border/50 bg-secondary/50 px-3 py-2 text-sm transition-colors focus:border-primary/50 focus:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {currencies.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} - {c.name} ({c.symbol})
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <Button
            onClick={handleSave}
            disabled={updateBusiness.isPending}
            className="gradient-primary border-0"
          >
            {updateBusiness.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}