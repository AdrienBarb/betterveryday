"use client";

import { use } from "react";
import useApi from "@/lib/hooks/useApi";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import toast from "react-hot-toast";
import { getApiError } from "@/lib/utils/errorUtils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useGlobalModalStore } from "@/lib/stores/GlobalModalStore";
import { ERROR_CODES } from "@/lib/constants/errorCodes";
import { GoalStatus } from "@prisma/client";

interface Reflection {
  id: string;
  date: string;
  mood?: string | null;
  progress?: string | null;
  stuck?: string | null;
}

interface Goal {
  id: string;
  title: string;
  description: string;
  status: GoalStatus;
  createdAt: string;
  updatedAt: string;
  reflections: Reflection[];
}

export default function GoalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const { useGet, usePut } = useApi();
  const { openModal } = useGlobalModalStore();
  const { data, isLoading, error, refetch } = useGet(`/maarty/goals/${id}`) as {
    data?: { goal: Goal };
    isLoading: boolean;
    error: unknown;
    refetch: () => void;
  };

  const updateStatus = usePut(`/maarty/goals/${id}`, {
    onSuccess: () => {
      toast.success("Goal status updated successfully!");
      refetch();
    },
    onError: (error: unknown) => {
      const { code } = getApiError(error);

      if (code === ERROR_CODES.ACTIVE_GOAL_EXISTS) {
        openModal("activeGoalLimit");
      }
    },
  });

  const handleStatusChange = (newStatus: GoalStatus) => {
    updateStatus.mutate({ status: newStatus });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center">
            <p className="text-text/70">Loading goal...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data?.goal) {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
            <p className="text-destructive mb-4">
              Failed to load goal. Please try again.
            </p>
            <Link href="/goals">
              <Button variant="outline">Back to Goals</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const goal = data.goal;

  return (
    <div className="container mx-auto px-4 py-20">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <Link href="/goals">
            <Button variant="ghost">← Back to Goals</Button>
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" disabled={updateStatus.isPending}>
                {updateStatus.isPending ? "Updating..." : "Actions"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {goal.status !== GoalStatus.active && (
                <DropdownMenuItem
                  onClick={() => handleStatusChange(GoalStatus.active)}
                >
                  Mark as Active
                </DropdownMenuItem>
              )}
              {goal.status !== GoalStatus.completed && (
                <DropdownMenuItem
                  onClick={() => handleStatusChange(GoalStatus.completed)}
                >
                  Mark as Completed
                </DropdownMenuItem>
              )}
              {goal.status !== GoalStatus.abandoned && (
                <DropdownMenuItem
                  onClick={() => handleStatusChange(GoalStatus.abandoned)}
                >
                  Mark as Abandoned
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Goal Header */}
        <div className="bg-white rounded-lg border p-6 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-bold text-text">{goal.title}</h1>
            <Badge
              variant={
                goal.status === GoalStatus.active
                  ? "active"
                  : goal.status === GoalStatus.completed
                    ? "completed"
                    : "abandoned"
              }
            >
              {goal.status.charAt(0).toUpperCase() + goal.status.slice(1)}
            </Badge>
          </div>
          <p className="text-text/70 text-lg">{goal.description}</p>
        </div>

        {goal.reflections.length > 0 && (
          <div className="bg-white rounded-lg border p-6 mb-6">
            <h2 className="text-2xl font-semibold text-text mb-4">
              Daily Reflections
            </h2>
            <div className="space-y-4">
              {goal.reflections.map((reflection) => (
                <div
                  key={reflection.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-text">
                      {format(new Date(reflection.date), "PPP")}
                    </p>
                  </div>
                  <div className="space-y-2 text-sm">
                    {reflection.mood && (
                      <div>
                        <span className="text-text/60">Mood: </span>
                        <span className="text-text">{reflection.mood}</span>
                      </div>
                    )}
                    {reflection.progress && (
                      <div>
                        <span className="text-text/60">Progress: </span>
                        <span className="text-text">{reflection.progress}</span>
                      </div>
                    )}
                    {reflection.stuck && (
                      <div>
                        <span className="text-text/60">Blockers: </span>
                        <span className="text-text">{reflection.stuck}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {goal.reflections.length === 0 && (
          <div className="bg-white rounded-lg border p-12 text-center">
            <p className="text-text/70">
              No reflections yet. Start chatting with Maarty on Telegram to see
              your progress here!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
