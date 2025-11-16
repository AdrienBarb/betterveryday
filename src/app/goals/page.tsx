"use client";

import useApi from "@/lib/hooks/useApi";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { GoalStatus } from "@prisma/client";

interface Goal {
  id: string;
  title: string;
  description: string;
  endDate: string;
  status: GoalStatus;
  createdAt: string;
  updatedAt: string;
}

export default function GoalsPage() {
  const { useGet } = useApi();

  const { data, isLoading, error } = useGet("/maarty/goals") as {
    data?: { goals: Goal[] };
    isLoading: boolean;
    error: unknown;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center">
            <p className="text-text/70">Loading your goals...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
            <p className="text-destructive">
              Failed to load goals. Please try again.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const goals = data?.goals || [];

  return (
    <div className="container mx-auto px-4 py-20">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-text">My Goals</h1>
          <div className="flex items-center gap-3">
            <Link href="/define-goal">
              <Button className="bg-black text-white hover:bg-black/90">
                New Goal
              </Button>
            </Link>
          </div>
        </div>

        {goals.length === 0 ? (
          <div className="bg-white rounded-lg border p-12 text-center">
            <p className="text-text/70 mb-4">
              You don&apos;t have any goals yet.
            </p>
            <Link href="/define-goal">
              <Button className="bg-black text-white hover:bg-black/90">
                Create Your First Goal
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {goals.map((goal: Goal) => (
              <Link key={goal.id} href={`/goals/${goal.id}`}>
                <div className="bg-white rounded-lg border p-6 hover:shadow-md transition-shadow cursor-pointer mb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-2xl font-semibold text-text">
                          {goal.title}
                        </h2>
                        <Badge
                          variant={
                            goal.status === GoalStatus.active
                              ? "active"
                              : goal.status === GoalStatus.completed
                                ? "completed"
                                : "abandoned"
                          }
                        >
                          {goal.status.charAt(0).toUpperCase() +
                            goal.status.slice(1)}
                        </Badge>
                      </div>
                      <p className="text-text/70 mb-4">{goal.description}</p>
                      <div className="flex items-center gap-4 text-sm text-text/60">
                        <span>
                          End date: {format(new Date(goal.endDate), "PPP")}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
