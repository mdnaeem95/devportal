"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { trpc } from "@/lib/trpc";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  Loader2, Plus, Target, Calendar as CalendarIcon, DollarSign, Check, Circle, Clock,
  CheckCircle2, Receipt, MoreHorizontal, Pencil, Trash2, AlertTriangle, ArrowRight,
  GripVertical
} from "lucide-react";

// Drag and drop imports
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Milestone {
  id: string;
  name: string;
  description: string | null;
  amount: number;
  status: "pending" | "in_progress" | "completed" | "invoiced" | "paid";
  dueDate: Date | null;
  completedAt: Date | null;
  order: number | null;
}

interface MilestonesTabProps {
  projectId: string;
  milestones: Milestone[];
}

const statusConfig = {
  pending: { 
    label: "Pending", 
    icon: Circle, 
    color: "text-muted-foreground", 
    bg: "bg-secondary",
    nextStatus: "in_progress" as const,
    nextLabel: "Start Progress"
  },
  in_progress: { 
    label: "In Progress", 
    icon: Clock, 
    color: "text-yellow-400", 
    bg: "bg-yellow-500/20",
    nextStatus: "completed" as const,
    nextLabel: "Mark Complete"
  },
  completed: { 
    label: "Completed", 
    icon: CheckCircle2, 
    color: "text-green-400", 
    bg: "bg-green-500/20",
    nextStatus: null,
    nextLabel: null
  },
  invoiced: { 
    label: "Invoiced", 
    icon: Receipt, 
    color: "text-primary", 
    bg: "bg-primary/20",
    nextStatus: null,
    nextLabel: null
  },
  paid: { 
    label: "Paid", 
    icon: Check, 
    color: "text-green-400", 
    bg: "bg-green-500/20",
    nextStatus: null,
    nextLabel: null
  },
};

// Helper to check if milestone is overdue
function isOverdue(milestone: Milestone): boolean {
  if (!milestone.dueDate) return false;
  if (["completed", "invoiced", "paid"].includes(milestone.status)) return false;
  return new Date(milestone.dueDate) < new Date();
}

// Helper to get days until/past due
function getDueDays(dueDate: Date | null): { days: number; isPast: boolean } | null {
  if (!dueDate) return null;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  const diffTime = due.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return { days: Math.abs(diffDays), isPast: diffDays < 0 };
}

// ============================================
// SORTABLE MILESTONE CARD COMPONENT
// ============================================
interface SortableMilestoneCardProps {
  milestone: Milestone;
  index: number;
  onStatusChange: (id: string, status: Milestone["status"]) => void;
  onCreateInvoice: (id: string) => void;
  onEdit: (milestone: Milestone) => void;
  onDelete: (milestone: { id: string; name: string }) => void;
  creatingInvoice: string | null;
  isUpdatingStatus: boolean;
  isDragging?: boolean;
}

function SortableMilestoneCard({
  milestone,
  index,
  onStatusChange,
  onCreateInvoice,
  onEdit,
  onDelete,
  creatingInvoice,
  isUpdatingStatus,
  isDragging = false,
}: SortableMilestoneCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: milestone.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    animationDelay: `${index * 50}ms`,
    animationFillMode: "backwards" as const,
  };

  const status = statusConfig[milestone.status];
  const StatusIcon = status.icon;
  const canEdit = !["invoiced", "paid"].includes(milestone.status);
  const canChangeStatus = !["invoiced", "paid"].includes(milestone.status);
  const canCreateInvoice = milestone.status === "completed";
  const overdueCheck = isOverdue(milestone);
  const dueDays = getDueDays(milestone.dueDate);

  // Don't render the actual card if it's being dragged (we'll show it in DragOverlay)
  if (isSortableDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="rounded-lg border-2 border-dashed border-primary/30 bg-primary/5 p-4 h-30"
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group flex items-start gap-4 rounded-lg border p-4 transition-all animate-in fade-in slide-in-from-bottom-2 duration-300",
        overdueCheck 
          ? "border-red-500/50 bg-red-500/5 hover:border-red-500/70" 
          : "border-border/50 hover:border-border hover:bg-secondary/30",
        isDragging && "opacity-50"
      )}
    >
      {/* Drag Handle */}
      <button
        {...attributes}
        {...listeners}
        className="flex h-10 w-6 items-center justify-center cursor-grab active:cursor-grabbing shrink-0 text-muted-foreground/50 hover:text-muted-foreground transition-colors touch-none"
        aria-label="Drag to reorder"
      >
        <GripVertical className="h-5 w-5" />
      </button>

      {/* Status Icon */}
      <div className={cn(
        "flex h-10 w-10 items-center justify-center rounded-lg shrink-0",
        overdueCheck ? "bg-red-500/20" : status.bg
      )}>
        {overdueCheck ? (
          <AlertTriangle className="h-5 w-5 text-red-400" />
        ) : (
          <StatusIcon className={cn("h-5 w-5", status.color)} />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-medium">{milestone.name}</p>
              {overdueCheck && (
                <Badge variant="destructive" className="text-xs">
                  {dueDays && dueDays.days === 0 ? "Due today" : `${dueDays?.days}d overdue`}
                </Badge>
              )}
            </div>
            {milestone.description && (
              <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                {milestone.description}
              </p>
            )}
          </div>
          <div className="text-right shrink-0">
            <p className="font-semibold">{formatCurrency(milestone.amount)}</p>
            {milestone.dueDate && (
              <p className={cn(
                "text-xs flex items-center gap-1 justify-end",
                overdueCheck ? "text-red-400 font-medium" : "text-muted-foreground"
              )}>
                <CalendarIcon className="h-3 w-3" />
                {formatDate(milestone.dueDate)}
              </p>
            )}
          </div>
        </div>

        {/* Actions Row */}
        <div className="mt-3 flex items-center gap-2 flex-wrap">
          <Badge variant={overdueCheck ? "destructive" : "secondary"} className="text-xs">
            {overdueCheck ? "Overdue" : status.label}
          </Badge>

          {/* Quick Status Change */}
          {canChangeStatus && status.nextStatus && (
            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-xs cursor-pointer hover:bg-primary/10 text-primary"
              onClick={() => onStatusChange(milestone.id, status.nextStatus!)}
              disabled={isUpdatingStatus}
            >
              <ArrowRight className="h-3 w-3" />
              {status.nextLabel}
            </Button>
          )}

          {/* Create Invoice */}
          {canCreateInvoice && (
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs cursor-pointer hover:bg-primary/10 hover:border-primary/50 transition-colors"
              onClick={() => onCreateInvoice(milestone.id)}
              disabled={creatingInvoice === milestone.id}
            >
              {creatingInvoice === milestone.id ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Receipt className="h-3 w-3" />
              )}
              Create Invoice
            </Button>
          )}

          {/* More Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {canEdit && (
                <DropdownMenuItem 
                  className="cursor-pointer"
                  onClick={() => onEdit(milestone)}
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
              )}
              {canChangeStatus && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => onStatusChange(milestone.id, "pending")}
                    disabled={milestone.status === "pending"}
                  >
                    <Circle className="h-4 w-4 mr-2" />
                    Set Pending
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => onStatusChange(milestone.id, "in_progress")}
                    disabled={milestone.status === "in_progress"}
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    Set In Progress
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => onStatusChange(milestone.id, "completed")}
                    disabled={milestone.status === "completed"}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Set Completed
                  </DropdownMenuItem>
                </>
              )}
              {canEdit && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer text-destructive focus:text-destructive"
                    onClick={() => onDelete({ id: milestone.id, name: milestone.name })}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </>
              )}
              {!canEdit && (
                <DropdownMenuItem disabled className="text-muted-foreground">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  {milestone.status === "invoiced" ? "Invoiced - locked" : "Paid - locked"}
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}

// ============================================
// DRAG OVERLAY CARD (static preview while dragging)
// ============================================
function MilestoneCardOverlay({ milestone }: { milestone: Milestone }) {
  const status = statusConfig[milestone.status];
  const StatusIcon = status.icon;
  const overdueCheck = isOverdue(milestone);

  return (
    <div className={cn(
      "flex items-start gap-4 rounded-lg border p-4 bg-card shadow-2xl rotate-2 scale-105",
      overdueCheck ? "border-red-500/50" : "border-primary"
    )}>
      {/* Drag Handle */}
      <div className="flex h-10 w-6 items-center justify-center shrink-0 text-muted-foreground">
        <GripVertical className="h-5 w-5" />
      </div>

      {/* Status Icon */}
      <div className={cn(
        "flex h-10 w-10 items-center justify-center rounded-lg shrink-0",
        overdueCheck ? "bg-red-500/20" : status.bg
      )}>
        {overdueCheck ? (
          <AlertTriangle className="h-5 w-5 text-red-400" />
        ) : (
          <StatusIcon className={cn("h-5 w-5", status.color)} />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="font-medium">{milestone.name}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="font-semibold">{formatCurrency(milestone.amount)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================
export function MilestonesTab({ projectId, milestones: initialMilestones }: MilestonesTabProps) {
  const router = useRouter();
  const utils = trpc.useUtils();

  // Local state for optimistic reordering
  const [milestones, setMilestones] = useState(initialMilestones);
  const [activeId, setActiveId] = useState<string | null>(null);

  // Dialog states
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null);
  const [deletingMilestone, setDeletingMilestone] = useState<{ id: string; name: string } | null>(null);
  const [creatingInvoice, setCreatingInvoice] = useState<string | null>(null);

  // Form states
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [newDueDate, setNewDueDate] = useState<Date | undefined>();

  // Edit form states
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [editDueDate, setEditDueDate] = useState<Date | undefined>();

  // ✅ FIXED: Use useEffect to sync local state with props
  useEffect(() => {
    setMilestones(initialMilestones);
  }, [initialMilestones]);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Mutations
  const createMilestone = trpc.milestones.create.useMutation({
    onSuccess: () => {
      toast.success("Milestone created!");
      utils.project.get.invalidate({ id: projectId });
      setShowAddDialog(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create milestone");
    },
  });

  const updateMilestone = trpc.milestones.update.useMutation({
    onSuccess: () => {
      toast.success("Milestone updated!");
      utils.project.get.invalidate({ id: projectId });
      setEditingMilestone(null);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update milestone");
    },
  });

  const updateStatus = trpc.milestones.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Status updated!");
      utils.project.get.invalidate({ id: projectId });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update status");
    },
  });

  const deleteMilestone = trpc.milestones.delete.useMutation({
    onSuccess: () => {
      toast.success("Milestone deleted");
      utils.project.get.invalidate({ id: projectId });
      setDeletingMilestone(null);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete milestone");
    },
  });

  const reorderMilestones = trpc.milestones.reorder.useMutation({
    onSuccess: () => {
      toast.success("Order updated!");
      utils.project.get.invalidate({ id: projectId });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to reorder milestones");
      // Revert to original order on error
      setMilestones(initialMilestones);
    },
  });

  const createInvoiceFromMilestone = trpc.invoice.createFromMilestone.useMutation({
    onSuccess: (invoice) => {
      toast.success("Invoice created!");
      router.push(`/dashboard/invoices/${invoice.id}`);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create invoice");
      setCreatingInvoice(null);
    },
  });

  // Handlers
  const resetForm = () => {
    setNewName("");
    setNewDescription("");
    setNewAmount("");
    setNewDueDate(undefined);
  };

  const handleCreate = () => {
    if (!newName.trim()) {
      toast.error("Name is required");
      return;
    }

    const amount = parseFloat(newAmount) || 0;
    createMilestone.mutate({
      projectId,
      name: newName.trim(),
      description: newDescription.trim() || undefined,
      amount: Math.round(amount * 100), // Convert to cents
      dueDate: newDueDate,
    });
  };

  const openEditDialog = (milestone: Milestone) => {
    setEditingMilestone(milestone);
    setEditName(milestone.name);
    setEditDescription(milestone.description || "");
    setEditAmount((milestone.amount / 100).toString());
    setEditDueDate(milestone.dueDate ? new Date(milestone.dueDate) : undefined);
  };

  const handleUpdate = () => {
    if (!editingMilestone) return;
    if (!editName.trim()) {
      toast.error("Name is required");
      return;
    }

    const amount = parseFloat(editAmount) || 0;
    updateMilestone.mutate({
      id: editingMilestone.id,
      name: editName.trim(),
      description: editDescription.trim() || undefined,
      amount: Math.round(amount * 100),
      dueDate: editDueDate ?? null,
    });
  };

  const handleStatusChange = (id: string, status: Milestone["status"]) => {
    updateStatus.mutate({ id, status });
  };

  const handleCreateInvoice = (milestoneId: string) => {
    setCreatingInvoice(milestoneId);
    createInvoiceFromMilestone.mutate({ milestoneId });
  };

  const handleDelete = () => {
    if (!deletingMilestone) return;
    deleteMilestone.mutate({ id: deletingMilestone.id });
  };

  // Drag and Drop handlers
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (over && active.id !== over.id) {
      const oldIndex = milestones.findIndex((m) => m.id === active.id);
      const newIndex = milestones.findIndex((m) => m.id === over.id);

      // Optimistic update
      const newOrder = arrayMove(milestones, oldIndex, newIndex);
      setMilestones(newOrder);

      // Persist to server
      reorderMilestones.mutate({
        projectId,
        milestoneIds: newOrder.map((m) => m.id),
      });
    }
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  // Find active milestone for overlay
  const activeMilestone = activeId ? milestones.find((m) => m.id === activeId) : null;

  // Calculate stats
  const totalAmount = milestones.reduce((sum, m) => sum + m.amount, 0);
  const completedAmount = milestones
    .filter((m) => ["completed", "invoiced", "paid"].includes(m.status))
    .reduce((sum, m) => sum + m.amount, 0);
  const pendingCount = milestones.filter((m) => m.status === "pending").length;
  const inProgressCount = milestones.filter((m) => m.status === "in_progress").length;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Milestones</h2>
          <p className="text-sm text-muted-foreground">
            Track project progress and create invoices from completed work
          </p>
        </div>
        <Button 
          className="cursor-pointer gradient-primary shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all"
          onClick={() => setShowAddDialog(true)}
        >
          <Plus className="h-4 w-4" />
          Add Milestone
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card className="bg-card/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{milestones.length}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-500/20">
                <Clock className="h-5 w-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingCount + inProgressCount}</p>
                <p className="text-xs text-muted-foreground">In Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/20">
                <CheckCircle2 className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatCurrency(completedAmount)}</p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                <DollarSign className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatCurrency(totalAmount)}</p>
                <p className="text-xs text-muted-foreground">Total Value</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Milestones List with Drag and Drop */}
      {milestones.length === 0 ? (
        <Card className="bg-card/50 backdrop-blur-sm border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
              <Target className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-semibold mb-1">No milestones yet</h3>
            <p className="text-sm text-muted-foreground text-center mb-4">
              Break your project into milestones to track progress and bill incrementally
            </p>
            <Button 
              className="cursor-pointer gradient-primary"
              onClick={() => setShowAddDialog(true)}
            >
              <Plus className="h-4 w-4" />
              Add First Milestone
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground flex items-center gap-1.5 mb-3">
            <GripVertical className="h-3 w-3" />
            Drag milestones to reorder
          </p>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
          >
            <SortableContext
              items={milestones.map((m) => m.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {milestones.map((milestone, index) => (
                  <SortableMilestoneCard
                    key={milestone.id}
                    milestone={milestone}
                    index={index}
                    onStatusChange={handleStatusChange}
                    onCreateInvoice={handleCreateInvoice}
                    onEdit={openEditDialog}
                    onDelete={setDeletingMilestone}
                    creatingInvoice={creatingInvoice}
                    isUpdatingStatus={updateStatus.isPending}
                    isDragging={activeId === milestone.id}
                  />
                ))}
              </div>
            </SortableContext>

            {/* Drag Overlay - shows a preview of the card being dragged */}
            <DragOverlay>
              {activeMilestone ? (
                <MilestoneCardOverlay milestone={activeMilestone} />
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>
      )}

      {/* Add Milestone Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Milestone</DialogTitle>
            <DialogDescription>
              Create a new milestone to track progress
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Design Phase, MVP Development"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="Brief description of deliverables"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount ($)</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    className="pl-9"
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Due Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal cursor-pointer",
                        !newDueDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {newDueDate ? format(newDueDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={newDueDate}
                      onSelect={setNewDueDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAddDialog(false)}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={createMilestone.isPending}
              className="cursor-pointer gradient-primary"
            >
              {createMilestone.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Milestone Dialog */}
      <Dialog open={!!editingMilestone} onOpenChange={(open) => !open && setEditingMilestone(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Milestone</DialogTitle>
            <DialogDescription>
              Update milestone details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name *</Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Input
                id="edit-description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-amount">Amount ($)</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="edit-amount"
                    type="number"
                    step="0.01"
                    min="0"
                    className="pl-9"
                    value={editAmount}
                    onChange={(e) => setEditAmount(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Due Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal cursor-pointer",
                        !editDueDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {editDueDate ? format(editDueDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={editDueDate}
                      onSelect={setEditDueDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditingMilestone(null)}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={updateMilestone.isPending}
              className="cursor-pointer gradient-primary"
            >
              {updateMilestone.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletingMilestone} onOpenChange={(open) => !open && setDeletingMilestone(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Milestone</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deletingMilestone?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeletingMilestone(null)}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMilestone.isPending}
              className="cursor-pointer"
            >
              {deleteMilestone.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}