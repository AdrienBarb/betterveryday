"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";
import { useSession } from "@/lib/better-auth/auth-client";
import { useGlobalModalStore } from "@/lib/stores/GlobalModalStore";
import toast from "react-hot-toast";
import useApi from "@/lib/hooks/useApi";
import { useUser } from "@/lib/hooks/useUser";
import { getApiError } from "@/lib/utils/errorUtils";
import { ERROR_CODES } from "@/lib/constants/errorCodes";

const goalInputSchema = z.object({
  userGoal: z.string().min(1, "Please enter a goal"),
});

const goalConfirmationSchema = z.object({
  goalTitle: z.string().min(1),
  goalDescription: z.string().min(1),
  suggestedEndDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
});

type GoalInputFormData = z.infer<typeof goalInputSchema>;
type GoalConfirmationFormData = z.infer<typeof goalConfirmationSchema>;

interface GoalData {
  goalTitle: string;
  goalDescription: string;
  suggestedEndDate: string;
}

const goalExamples = [
  "Lose 5kg by next summer",
  "Launch my MVP next month",
  "Finish a book by the 3 August",
  "Save 1000€ by next year",
  "Run a marathon next spring",
  "Learn Spanish by December",
  "Build a side project by next month",
];

function useTypingEffect(examples: string[]) {
  const [displayedText, setDisplayedText] = useState("");
  const [currentExampleIndex, setCurrentExampleIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentExample = examples[currentExampleIndex];
    let timeout: NodeJS.Timeout;

    if (!isDeleting && displayedText.length < currentExample.length) {
      // Typing
      timeout = setTimeout(() => {
        setDisplayedText(currentExample.slice(0, displayedText.length + 1));
      }, 100);
    } else if (!isDeleting && displayedText.length === currentExample.length) {
      // Pause after typing complete
      timeout = setTimeout(() => {
        setIsDeleting(true);
      }, 2000);
    } else if (isDeleting && displayedText.length > 0) {
      // Deleting
      timeout = setTimeout(() => {
        setDisplayedText(currentExample.slice(0, displayedText.length - 1));
      }, 50);
    } else if (isDeleting && displayedText.length === 0) {
      // Move to next example
      timeout = setTimeout(() => {
        setIsDeleting(false);
        setCurrentExampleIndex((prev) => (prev + 1) % examples.length);
      }, 50);
    }

    return () => clearTimeout(timeout);
  }, [displayedText, currentExampleIndex, isDeleting, examples]);

  return displayedText;
}

export default function DefineGoalPage() {
  const router = useRouter();
  const { usePost } = useApi();
  const { data: session } = useSession();
  const openModal = useGlobalModalStore((s) => s.openModal);
  const [goalData, setGoalData] = useState<GoalData | null>(null);
  const typingPlaceholder = useTypingEffect(goalExamples);
  const { user } = useUser();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset: resetInputForm,
  } = useForm<GoalInputFormData>({
    resolver: zodResolver(goalInputSchema),
  });

  const confirmationForm = useForm<GoalConfirmationFormData>({
    resolver: zodResolver(goalConfirmationSchema),
  });

  const {
    register: registerConfirmation,
    handleSubmit: handleSubmitConfirmation,
    formState: { errors: confirmationErrors },
    reset,
    setValue,
    watch,
  } = confirmationForm;

  const selectedDate = watch("suggestedEndDate")
    ? new Date(watch("suggestedEndDate"))
    : undefined;

  const generateGoal = usePost("/maarty/goals/generate", {
    onSuccess: (data: GoalData) => {
      setGoalData(data);
      reset({
        goalTitle: data.goalTitle,
        goalDescription: data.goalDescription,
        suggestedEndDate: data.suggestedEndDate,
      });
    },
    onError: (error: unknown) => {
      const errorMessage =
        error && typeof error === "object" && "response" in error
          ? (error as { response?: { data?: { error?: string } } }).response
              ?.data?.error
          : undefined;
      toast.error(errorMessage || "Something went wrong. Please try again.");
    },
  });

  const saveGoal = usePost("/maarty/goals", {
    onSuccess: () => {
      router.push("/goals");
    },
    onError: (error: unknown) => {
      const { code } = getApiError(error);
      if (code === ERROR_CODES.ACTIVE_GOAL_EXISTS) {
        openModal("activeGoalLimit");
      }
    },
  });

  const onSubmitGoal = (data: GoalInputFormData) => {
    if (user && user.goals.length >= 1) {
      openModal("activeGoalLimit");
      return;
    }

    generateGoal.mutate({ userGoal: data.userGoal.trim() });
  };

  const onSubmitConfirmation = (data: GoalConfirmationFormData) => {
    if (!session?.user) {
      openModal("auth", {
        onComplete: () => {
          saveGoal.mutate({
            title: data.goalTitle,
            description: data.goalDescription,
            endDate: data.suggestedEndDate,
          });
        },
      });
      return;
    }

    saveGoal.mutate({
      title: data.goalTitle,
      description: data.goalDescription,
      endDate: data.suggestedEndDate,
    });
  };

  if (generateGoal.isPending) {
    return (
      <div className="flex flex-col items-center py-20">
        <Image
          src="/maarty.png"
          alt="Maarty"
          width={200}
          height={200}
          className="w-32 h-32 object-contain animate-spin"
        />
        <p className="mt-4 text-text/70 text-center">
          Maarty is planning your goal...
        </p>
      </div>
    );
  }

  if (goalData) {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-center text-text">
            Here&apos;s your goal with Maarty
          </h1>

          <form
            onSubmit={handleSubmitConfirmation(onSubmitConfirmation)}
            className="space-y-6 bg-white p-8 rounded-lg border"
          >
            <div>
              <Label htmlFor="goal-title" className="text-text font-semibold">
                Goal
              </Label>
              <Input
                id="goal-title"
                {...registerConfirmation("goalTitle")}
                className="mt-2"
              />
              {confirmationErrors.goalTitle && (
                <p className="text-sm text-destructive mt-1">
                  {confirmationErrors.goalTitle.message}
                </p>
              )}
            </div>

            <div>
              <Label
                htmlFor="goal-description"
                className="text-text font-semibold"
              >
                Description
              </Label>
              <Textarea
                id="goal-description"
                {...registerConfirmation("goalDescription")}
                className="mt-2 min-h-[100px]"
                defaultValue={goalData.goalDescription}
              />
              {confirmationErrors.goalDescription && (
                <p className="text-sm text-destructive mt-1">
                  {confirmationErrors.goalDescription.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="end-date" className="text-text font-semibold">
                When do you want this done?
              </Label>
              <div className="mt-2">
                <DatePicker
                  value={selectedDate}
                  onChange={(date: Date | undefined) => {
                    if (date) {
                      const dateString = date.toISOString().split("T")[0];
                      setValue("suggestedEndDate", dateString, {
                        shouldValidate: true,
                      });
                    }
                  }}
                  placeholder="Select a date"
                  disabled={saveGoal.isPending}
                />
              </div>
              {confirmationErrors.suggestedEndDate && (
                <p className="text-sm text-destructive mt-1">
                  {confirmationErrors.suggestedEndDate.message}
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                size="lg"
                disabled={saveGoal.isPending}
                className="flex-1"
                onClick={() => {
                  setGoalData(null);
                  reset();
                  resetInputForm();
                }}
              >
                Redefine my goal
              </Button>
              <Button
                type="submit"
                size="lg"
                disabled={saveGoal.isPending}
                className="flex-1 bg-black text-white hover:bg-black/90"
              >
                {saveGoal.isPending
                  ? "Saving..."
                  : user
                    ? "Create Goal"
                    : "Start with Maarty"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-20">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center text-text">
          What do you want to achieve?
        </h1>

        <form onSubmit={handleSubmit(onSubmitGoal)} className="space-y-6">
          <div>
            <Label htmlFor="user-goal" className="sr-only">
              Your goal
            </Label>
            <Textarea
              id="user-goal"
              {...register("userGoal")}
              placeholder={typingPlaceholder}
              className="min-h-[120px]"
              disabled={generateGoal.isPending}
            />
            {errors.userGoal && (
              <p className="text-sm text-destructive mt-1">
                {errors.userGoal?.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            size="lg"
            disabled={generateGoal.isPending}
            className="w-full bg-black text-white hover:bg-black/90"
          >
            {generateGoal.isPending ? "Creating your goal..." : "Continue"}
          </Button>
        </form>
      </div>
    </div>
  );
}
