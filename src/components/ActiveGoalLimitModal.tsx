"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { errorMessages } from "@/lib/constants/errorMessage";

interface ActiveGoalLimitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ActiveGoalLimitModal({
  open,
  onOpenChange,
}: ActiveGoalLimitModalProps) {
  const router = useRouter();

  const handleViewGoals = () => {
    onOpenChange(false);
    router.push("/goals");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Active Goal Limit Reached</DialogTitle>
          <DialogDescription>
            {errorMessages.ACTIVE_GOAL_EXISTS_MODAL_DESCRIPTION}
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-3 mt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            Close
          </Button>
          <Button onClick={handleViewGoals} className="flex-1">
            View My Goals
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

