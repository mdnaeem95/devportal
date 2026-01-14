"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Play, Square, Clock, Trash2, FolderOpen, Timer } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

const NO_PROJECT = "_none_";

export function TimerWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [description, setDescription] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState<string>(NO_PROJECT);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const utils = trpc.useUtils();

  // Get running timer
  const { data: runningTimer, isLoading } = trpc.timeTracking.getRunningTimer.useQuery(
    undefined,
    { refetchInterval: 10000 } // Refresh every 10 seconds as backup
  );

  // Get projects for dropdown
  const { data: projects } = trpc.project.list.useQuery({ status: "active" });

  // Mutations
  const startTimer = trpc.timeTracking.startTimer.useMutation({
    onSuccess: () => {
      utils.timeTracking.getRunningTimer.invalidate();
      toast.success("Timer started");
      setDescription("");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const stopTimer = trpc.timeTracking.stopTimer.useMutation({
    onSuccess: () => {
      utils.timeTracking.getRunningTimer.invalidate();
      utils.timeTracking.list.invalidate();
      toast.success("Time entry saved");
      setElapsedSeconds(0);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const discardTimer = trpc.timeTracking.discardTimer.useMutation({
    onSuccess: () => {
      utils.timeTracking.getRunningTimer.invalidate();
      toast.success("Timer discarded");
      setElapsedSeconds(0);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Update elapsed time every second when timer is running
  useEffect(() => {
    if (runningTimer) {
      // Set initial elapsed time
      setElapsedSeconds(runningTimer.currentDuration);
      setDescription(runningTimer.description || "");
      setSelectedProjectId(runningTimer.projectId || NO_PROJECT);

      // Start interval
      intervalRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      // Clear interval when timer stops
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setElapsedSeconds(0);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [runningTimer?.id]);

  // Keyboard shortcut (Ctrl/Cmd + T)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "t") {
        e.preventDefault();
        if (runningTimer) {
          handleStop();
        } else {
          setIsOpen(true);
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [runningTimer]);

  const handleStart = () => {
    const projectId = selectedProjectId === NO_PROJECT ? undefined : selectedProjectId;
    startTimer.mutate({
      projectId,
      description: description || undefined,
      billable: true,
    });
    setIsOpen(false);
  };

  const handleStop = () => {
    if (!runningTimer) return;
    stopTimer.mutate({
      id: runningTimer.id,
      description: description || undefined,
    });
  };

  const handleDiscard = () => {
    if (!runningTimer) return;
    discardTimer.mutate({ id: runningTimer.id });
  };

  const isTimerRunning = !!runningTimer;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={isTimerRunning ? "default" : "outline"}
          size="sm"
          className={cn(
            "gap-2 min-w-30 font-mono transition-all",
            isTimerRunning && "bg-primary animate-pulse shadow-lg shadow-primary/25"
          )}
        >
          {isTimerRunning ? (
            <>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
              </span>
              {formatTime(elapsedSeconds)}
            </>
          ) : (
            <>
              <Timer className="h-4 w-4" />
              <span className="hidden sm:inline">Start Timer</span>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-5" align="end">
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {isTimerRunning ? "Timer Running" : "Start Timer"}
            </h4>
            {isTimerRunning && (
              <Badge variant="secondary" className="font-mono">
                {formatTime(elapsedSeconds)}
              </Badge>
            )}
          </div>

          {/* Timer Display when running */}
          {isTimerRunning && (
            <div className="text-center py-4 bg-secondary/50 rounded-lg">
              <div className="text-4xl font-mono font-bold text-primary">
                {formatTime(elapsedSeconds)}
              </div>
              {runningTimer?.project && (
                <p className="text-sm text-muted-foreground mt-2 flex items-center justify-center gap-1">
                  <FolderOpen className="h-3 w-3" />
                  {runningTimer.project.name}
                </p>
              )}
            </div>
          )}

          {/* Project Selection */}
          <div className="space-y-2.5">
            <Label htmlFor="project">Project (optional)</Label>
            <Select
              value={selectedProjectId}
              onValueChange={setSelectedProjectId}
              disabled={isTimerRunning}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a project..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_PROJECT}>No project</SelectItem>
                {projects?.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2.5">
            <Label htmlFor="description">What are you working on?</Label>
            <Input
              id="description"
              placeholder="e.g., Building login page..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !isTimerRunning) {
                  handleStart();
                }
              }}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            {isTimerRunning ? (
              <>
                <Button
                  className="flex-1"
                  onClick={handleStop}
                  disabled={stopTimer.isPending}
                >
                  <Square className="h-4 w-4 mr-2 fill-current" />
                  Stop & Save
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleDiscard}
                  disabled={discardTimer.isPending}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <Button
                className="w-full gradient-primary border-0"
                onClick={handleStart}
                disabled={startTimer.isPending}
              >
                <Play className="h-4 w-4 mr-2 fill-current" />
                Start Timer
              </Button>
            )}
          </div>

          {/* Keyboard shortcut hint */}
          <p className="text-xs text-center text-muted-foreground pt-1">
            Press <kbd className="px-1.5 py-0.5 bg-secondary rounded text-[10px]">⌘T</kbd> to {isTimerRunning ? "stop" : "start"} timer
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}