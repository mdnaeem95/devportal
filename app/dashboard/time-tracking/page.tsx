"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/dashboard/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, Plus, Play, Timer, DollarSign, FolderOpen, MoreHorizontal, Pencil, Trash2, Shield, Lock, History, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks } from "date-fns";

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export default function TimeTrackingPage() {
  const router = useRouter();
  const [selectedWeek, setSelectedWeek] = useState(() => {
    const now = new Date();
    return startOfWeek(now, { weekStartsOn: 1 }); // Monday
  });
  const [filterProject, setFilterProject] = useState<string>("all");
  const [filterBillable, setFilterBillable] = useState<string>("all");
  const [isManualDialogOpen, setIsManualDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<string | null>(null);

  // Manual entry form state
  const [manualForm, setManualForm] = useState({
    projectId: "",
    description: "",
    date: format(new Date(), "yyyy-MM-dd"),
    hours: "",
    minutes: "",
    billable: true,
  });

  const utils = trpc.useUtils();

  // Queries
  const { data: projects } = trpc.project.list.useQuery();
  const { data: settings } = trpc.timeTracking.getSettings.useQuery();
  
  const weekEnd = endOfWeek(selectedWeek, { weekStartsOn: 1 });
  
  const { data: entriesData, isLoading: entriesLoading } = trpc.timeTracking.list.useQuery({
    startDate: selectedWeek,
    endDate: weekEnd,
    projectId: filterProject !== "all" ? filterProject : undefined,
    billable: filterBillable === "billable" ? true : filterBillable === "non-billable" ? false : undefined,
  });

  const { data: weeklyStats, isLoading: statsLoading } = trpc.timeTracking.getStats.useQuery({
    startDate: selectedWeek,
    endDate: weekEnd,
  });

  const { data: timesheet } = trpc.timeTracking.getWeeklyTimesheet.useQuery({
    weekStart: selectedWeek,
  });

  // Mutations
  const createManual = trpc.timeTracking.createManual.useMutation({
    onSuccess: (data) => {
      utils.timeTracking.list.invalidate();
      utils.timeTracking.getStats.invalidate();
      utils.timeTracking.getWeeklyTimesheet.invalidate();
      setIsManualDialogOpen(false);
      resetManualForm();
      if (data.warning) {
        toast.warning(data.warning);
      } else {
        toast.success("Time entry added");
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteEntry = trpc.timeTracking.delete.useMutation({
    onSuccess: () => {
      utils.timeTracking.list.invalidate();
      utils.timeTracking.getStats.invalidate();
      utils.timeTracking.getWeeklyTimesheet.invalidate();
      setDeleteDialogOpen(null);
      toast.success("Entry deleted");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const resetManualForm = () => {
    setManualForm({
      projectId: "",
      description: "",
      date: format(new Date(), "yyyy-MM-dd"),
      hours: "",
      minutes: "",
      billable: true,
    });
  };

  const handleAddManual = () => {
    const hours = parseInt(manualForm.hours) || 0;
    const minutes = parseInt(manualForm.minutes) || 0;
    const durationSeconds = hours * 3600 + minutes * 60;

    if (durationSeconds < 60) {
      toast.error("Minimum duration is 1 minute");
      return;
    }

    if (!manualForm.description.trim()) {
      toast.error("Description is required for manual entries");
      return;
    }

    createManual.mutate({
      projectId: manualForm.projectId || undefined,
      description: manualForm.description,
      date: new Date(manualForm.date),
      duration: durationSeconds,
      billable: manualForm.billable,
    });
  };

  const navigateWeek = (direction: "prev" | "next") => {
    setSelectedWeek((prev) => 
      direction === "prev" ? subWeeks(prev, 1) : addWeeks(prev, 1)
    );
  };

  const entries = entriesData?.entries || [];
  const totals = entriesData?.totals;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Time Tracking</h1>
          <p className="text-muted-foreground">
            Track your work hours and bill clients accurately
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isManualDialogOpen} onOpenChange={setIsManualDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Add Manual Entry
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Add Manual Time Entry
                </DialogTitle>
                <DialogDescription>
                  Manual entries are marked separately from tracked time for transparency.
                  {settings?.maxRetroactiveDays !== undefined && (
                    <span className="block mt-1 text-amber-600">
                      ⚠️ You can only add entries up to {settings.maxRetroactiveDays} days in the past.
                    </span>
                  )}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {/* Project */}
                <div className="space-y-2">
                  <Label>Project (optional)</Label>
                  <Select
                    value={manualForm.projectId}
                    onValueChange={(v) => setManualForm({ ...manualForm, projectId: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a project..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No project</SelectItem>
                      {projects?.map((p) => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label>Description *</Label>
                  <Input
                    placeholder="What did you work on?"
                    value={manualForm.description}
                    onChange={(e) => setManualForm({ ...manualForm, description: e.target.value })}
                  />
                </div>

                {/* Date */}
                <div className="space-y-2">
                  <Label>Date *</Label>
                  <Input
                    type="date"
                    value={manualForm.date}
                    onChange={(e) => setManualForm({ ...manualForm, date: e.target.value })}
                    max={format(new Date(), "yyyy-MM-dd")}
                  />
                </div>

                {/* Duration */}
                <div className="space-y-2">
                  <Label>Duration *</Label>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Input
                        type="number"
                        placeholder="Hours"
                        min="0"
                        value={manualForm.hours}
                        onChange={(e) => setManualForm({ ...manualForm, hours: e.target.value })}
                      />
                    </div>
                    <div className="flex-1">
                      <Input
                        type="number"
                        placeholder="Minutes"
                        min="0"
                        max="59"
                        value={manualForm.minutes}
                        onChange={(e) => setManualForm({ ...manualForm, minutes: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* Billable */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="billable"
                    checked={manualForm.billable}
                    onChange={(e) => setManualForm({ ...manualForm, billable: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <Label htmlFor="billable" className="cursor-pointer">Billable time</Label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsManualDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddManual} disabled={createManual.isPending}>
                  {createManual.isPending ? "Adding..." : "Add Entry"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Link href="/dashboard/time-tracking/settings">
            <Button variant="outline" size="icon">
              <Shield className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-card/50 backdrop-blur-sm transition-all hover:bg-card hover:-translate-y-0.5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold">
                {weeklyStats?.formattedTotal || "0h 0m"}
              </div>
            )}
            <p className="text-xs text-muted-foreground">This week</p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm transition-all hover:bg-card hover:-translate-y-0.5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Billable Time</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold text-green-600">
                {weeklyStats?.formattedBillable || "0h 0m"}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              {weeklyStats ? Math.round((weeklyStats.billableDuration / Math.max(weeklyStats.totalDuration, 1)) * 100) : 0}% of total
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm transition-all hover:bg-card hover:-translate-y-0.5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold">
                {formatCurrency(weeklyStats?.totalEarnings || 0)}
              </div>
            )}
            <p className="text-xs text-muted-foreground">Based on hourly rates</p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm transition-all hover:bg-card hover:-translate-y-0.5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entry Types</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-primary">{weeklyStats?.trackedCount || 0}</span>
                <span className="text-sm text-muted-foreground">tracked</span>
                <span className="text-lg font-semibold text-amber-600">{weeklyStats?.manualCount || 0}</span>
                <span className="text-sm text-muted-foreground">manual</span>
              </div>
            )}
            <p className="text-xs text-muted-foreground">Transparency indicator</p>
          </CardContent>
        </Card>
      </div>

      {/* Week Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => navigateWeek("prev")}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-sm font-medium px-4 py-2 bg-secondary rounded-md">
            {format(selectedWeek, "MMM d")} - {format(weekEnd, "MMM d, yyyy")}
          </div>
          <Button variant="outline" size="icon" onClick={() => navigateWeek("next")}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedWeek(startOfWeek(new Date(), { weekStartsOn: 1 }))}
          >
            Today
          </Button>
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          <Select value={filterProject} onValueChange={setFilterProject}>
            <SelectTrigger className="w-45">
              <SelectValue placeholder="All projects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All projects</SelectItem>
              {projects?.map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterBillable} onValueChange={setFilterBillable}>
            <SelectTrigger className="w-35">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="billable">Billable</SelectItem>
              <SelectItem value="non-billable">Non-billable</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabs: List vs Weekly View */}
      <Tabs defaultValue="list">
        <TabsList>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="weekly">Weekly View</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-4">
          <Card>
            <CardContent className="p-0">
              {entriesLoading ? (
                <div className="p-8 space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : entries.length === 0 ? (
                <div className="p-8 text-center">
                  <Clock className="h-12 w-12 mx-auto text-muted-foreground/50" />
                  <h3 className="mt-4 text-lg font-semibold">No time entries</h3>
                  <p className="text-muted-foreground">
                    Start a timer or add a manual entry to track your time.
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Project</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {entries.map((entry, index) => (
                      <TableRow
                        key={entry.id}
                        className={cn(
                          "animate-in fade-in slide-in-from-bottom-2",
                          entry.isRunning && "bg-primary/5"
                        )}
                        style={{ animationDelay: `${index * 30}ms` }}
                      >
                        <TableCell className="font-medium">
                          {format(new Date(entry.startTime), "MMM d")}
                          <span className="text-muted-foreground text-xs block">
                            {format(new Date(entry.startTime), "h:mm a")}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="line-clamp-1">
                            {entry.description || <span className="text-muted-foreground italic">No description</span>}
                          </span>
                        </TableCell>
                        <TableCell>
                          {entry.project ? (
                            <Link
                              href={`/dashboard/projects/${entry.project.id}`}
                              className="text-primary hover:underline flex items-center gap-1"
                            >
                              <FolderOpen className="h-3 w-3" />
                              {entry.project.name}
                            </Link>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="font-mono">
                          {entry.isRunning ? (
                            <Badge variant="secondary" className="animate-pulse">
                              <Play className="h-3 w-3 mr-1 fill-current" />
                              Running...
                            </Badge>
                          ) : (
                            entry.formattedDuration
                          )}
                        </TableCell>
                        <TableCell>
                          {entry.isManual ? (
                            <Badge variant="outline" className="text-amber-600 border-amber-600/30">
                              <Pencil className="h-3 w-3 mr-1" />
                              Manual
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-primary border-primary/30">
                              <Timer className="h-3 w-3 mr-1" />
                              Tracked
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {entry.billable ? (
                              <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                                <DollarSign className="h-3 w-3" />
                              </Badge>
                            ) : (
                              <Badge variant="secondary">Non-billable</Badge>
                            )}
                            {entry.isLocked && (
                              <Badge variant="secondary" className="text-muted-foreground">
                                <Lock className="h-3 w-3" />
                              </Badge>
                            )}
                            {(entry.editHistory as any[])?.length > 0 && (
                              <Badge variant="secondary" className="text-amber-600">
                                <History className="h-3 w-3" />
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" disabled={entry.isRunning || entry.isLocked}>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => setEditingEntry(entry.id)}
                                disabled={entry.isLocked}
                              >
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => setDeleteDialogOpen(entry.id)}
                                disabled={entry.isLocked}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="weekly" className="mt-4">
          <Card>
            <CardContent className="p-6">
              {timesheet ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-7 gap-2">
                    {timesheet.days.map((day) => {
                      const dayDate = new Date(day.date);
                      const isToday = format(new Date(), "yyyy-MM-dd") === day.date;
                      
                      return (
                        <div
                          key={day.date}
                          className={cn(
                            "p-4 rounded-lg border text-center transition-all",
                            isToday && "border-primary bg-primary/5",
                            day.totalSeconds > 0 && "bg-green-50 border-green-200"
                          )}
                        >
                          <div className="text-xs text-muted-foreground">
                            {format(dayDate, "EEE")}
                          </div>
                          <div className="text-lg font-semibold">
                            {format(dayDate, "d")}
                          </div>
                          <div className={cn(
                            "text-sm font-mono mt-2",
                            day.totalSeconds > 0 ? "text-green-700" : "text-muted-foreground"
                          )}>
                            {day.formattedTotal || "0h"}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {day.entries.length} entries
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Week Total */}
                  <div className="flex justify-end pt-4 border-t">
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">Week Total</div>
                      <div className="text-2xl font-bold">{timesheet.totals.formattedTotal}</div>
                      <div className="text-sm text-green-600">
                        {timesheet.totals.formattedBillable} billable
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <Skeleton className="h-48 w-full" />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteDialogOpen} onOpenChange={() => setDeleteDialogOpen(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Time Entry?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. The time entry will be permanently deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteDialogOpen && deleteEntry.mutate({ id: deleteDialogOpen })}
              disabled={deleteEntry.isPending}
            >
              {deleteEntry.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}