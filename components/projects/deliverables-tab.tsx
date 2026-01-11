"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { formatDate, cn } from "@/lib/utils";
import { Loader2, Upload, File, FileCode, FileText, FileImage, FileArchive, FileJson, Figma, Github, Download,
  Trash2, ExternalLink, Check, X, ChevronDown, Eye } from "lucide-react";

interface DeliverablesTabProps {
  projectId: string;
  milestones?: Array<{ id: string; name: string }>;
}

const categoryIcons: Record<string, React.ElementType> = {
  code: FileCode,
  document: FileText,
  image: FileImage,
  archive: FileArchive,
  data: FileJson,
  design: Figma,
  other: File,
};

export function DeliverablesTab({ projectId, milestones = [] }: DeliverablesTabProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showGithubForm, setShowGithubForm] = useState(false);
  const [githubUrl, setGithubUrl] = useState("");
  const [selectedMilestone, setSelectedMilestone] = useState<string>("");
  const [versionNotes, setVersionNotes] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: deliverables, isLoading, refetch } = trpc.deliverable.list.useQuery({
    projectId,
  });

  const getUploadUrl = trpc.deliverable.getUploadUrl.useMutation();
  const createDeliverable = trpc.deliverable.create.useMutation({
    onSuccess: () => {
      refetch();
      setIsUploading(false);
      setUploadProgress(0);
      setVersionNotes("");
      setSelectedMilestone("");
    },
  });

  const addGithubLink = trpc.deliverable.addGithubLink.useMutation({
    onSuccess: () => {
      refetch();
      setShowGithubForm(false);
      setGithubUrl("");
    },
  });

  const deleteDeliverable = trpc.deliverable.delete.useMutation({
    onSuccess: () => {
      refetch();
      setDeletingId(null);
    },
  });

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(10);

    try {
      // Get presigned upload URL
      const { fileUrl } = await getUploadUrl.mutateAsync({
        projectId,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
      });

      setUploadProgress(30);

      // In production, upload to R2/S3 using presigned URL
      // For now, simulate upload
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setUploadProgress(70);

      // Create deliverable record
      await createDeliverable.mutateAsync({
        projectId,
        milestoneId: selectedMilestone || undefined,
        fileName: file.name,
        fileUrl,
        fileSize: file.size,
        mimeType: file.type,
        versionNotes: versionNotes || undefined,
      });

      setUploadProgress(100);
    } catch (error) {
      console.error("Upload failed:", error);
      setIsUploading(false);
      setUploadProgress(0);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleAddGithub = async () => {
    if (!githubUrl) return;
    await addGithubLink.mutateAsync({
      projectId,
      githubUrl,
    });
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this file?")) {
      setDeletingId(id);
      await deleteDeliverable.mutateAsync({ id });
    }
  };

  // Group deliverables: GitHub repos first, then files
  const githubRepos = deliverables?.filter((d) => d.mimeType === "application/x-github-repo") || [];
  const files = deliverables?.filter((d) => d.mimeType !== "application/x-github-repo") || [];

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card className="bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Upload Files</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowGithubForm(!showGithubForm)}
            >
              <Github className="h-4 w-4" />
              Link GitHub
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* GitHub Link Form */}
          {showGithubForm && (
            <div className="flex gap-2 p-4 rounded-lg border border-border/50 bg-secondary/30">
              <Input
                placeholder="https://github.com/username/repo"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                className="flex-1"
              />
              <Button
                onClick={handleAddGithub}
                disabled={!githubUrl || addGithubLink.isPending}
              >
                {addGithubLink.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
                Add
              </Button>
              <Button variant="ghost" onClick={() => setShowGithubForm(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* File Upload */}
          <div className="space-y-3">
            {/* Optional: Milestone and Notes */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Link to Milestone (optional)</Label>
                <div className="relative">
                  <select
                    value={selectedMilestone}
                    onChange={(e) => setSelectedMilestone(e.target.value)}
                    className="flex h-9 w-full appearance-none rounded-lg border border-border/50 bg-secondary/50 px-3 py-1 text-sm transition-colors focus:border-primary/50 focus:outline-none"
                  >
                    <option value="">No milestone</option>
                    {milestones.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Version Notes (optional)</Label>
                <Input
                  placeholder="e.g., Initial design mockups"
                  value={versionNotes}
                  onChange={(e) => setVersionNotes(e.target.value)}
                  className="h-9"
                />
              </div>
            </div>

            {/* Upload Area */}
            <div
              className={cn(
                "relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors",
                isUploading
                  ? "border-primary/50 bg-primary/5"
                  : "border-border/50 hover:border-primary/30 hover:bg-secondary/30"
              )}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="absolute inset-0 cursor-pointer opacity-0"
                onChange={handleFileSelect}
                disabled={isUploading}
              />
              
              {isUploading ? (
                <div className="text-center">
                  <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                  <p className="mt-2 text-sm font-medium">Uploading...</p>
                  <div className="mt-2 h-1.5 w-48 rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full gradient-primary transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              ) : (
                <>
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <p className="mt-2 text-sm font-medium">
                    Drop files here or click to upload
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Source code, documents, images, or archives
                  </p>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* GitHub Repos */}
      {githubRepos.length > 0 && (
        <Card className="bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Github className="h-4 w-4" />
              GitHub Repositories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {githubRepos.map((repo) => (
                <div
                  key={repo.id}
                  className="flex items-center justify-between rounded-lg border border-border/50 p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                      <Github className="h-5 w-5" />
                    </div>
                    <div>
                      <a
                        href={repo.githubUrl || repo.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium hover:text-primary transition-colors flex items-center gap-1"
                      >
                        {repo.fileName}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                      <p className="text-xs text-muted-foreground">
                        Added {formatDate(repo.createdAt)}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => handleDelete(repo.id)}
                    disabled={deletingId === repo.id}
                  >
                    {deletingId === repo.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Files */}
      <Card className="bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Files</CardTitle>
            {files.length > 0 && (
              <p className="text-sm text-muted-foreground">{files.length} files</p>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg border border-border/50 p-3 animate-pulse">
                  <div className="h-10 w-10 rounded-lg bg-secondary" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-32 rounded bg-secondary" />
                    <div className="h-3 w-24 rounded bg-secondary" />
                  </div>
                </div>
              ))}
            </div>
          ) : files.length === 0 ? (
            <div className="py-8 text-center">
              <File className="mx-auto h-8 w-8 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">No files uploaded yet</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Upload files above to share with your client
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {files.map((file) => {
                const Icon = categoryIcons[file.category] || File;
                return (
                  <div
                    key={file.id}
                    className="flex items-center justify-between rounded-lg border border-border/50 p-3 group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary shrink-0">
                        <Icon className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium truncate">{file.fileName}</p>
                          {file.version > 1 && (
                            <Badge variant="secondary" className="text-xs shrink-0">
                              v{file.version}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          {file.formattedSize && <span>{file.formattedSize}</span>}
                          {file.formattedSize && <span>•</span>}
                          <span>{formatDate(file.createdAt)}</span>
                          {file.milestone && (
                            <>
                              <span>•</span>
                              <span>{file.milestone.name}</span>
                            </>
                          )}
                        </div>
                        {file.versionNotes && (
                          <p className="text-xs text-muted-foreground mt-1 italic">
                            "{file.versionNotes}"
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {file.downloadCount > 0 && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mr-2">
                          <Eye className="h-3 w-3" />
                          {file.downloadCount}
                        </div>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                      >
                        <a href={file.fileUrl} download={file.fileName}>
                          <Download className="h-4 w-4" />
                        </a>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleDelete(file.id)}
                        disabled={deletingId === file.id}
                      >
                        {deletingId === file.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}