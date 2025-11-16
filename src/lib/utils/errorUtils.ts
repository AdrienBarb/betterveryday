import { AxiosError } from "axios";

interface ApiErrorData {
  error?: string;
  code?: string;
}

export function getApiError(error: unknown): {
  message: string;
  code?: string;
} {
  if (error instanceof AxiosError) {
    const errorData = error.response?.data as ApiErrorData | undefined;
    return {
      message: errorData?.error || error.message || "Something went wrong",
      code: errorData?.code,
    };
  }

  return {
    message:
      error instanceof Error ? error.message : "Something went wrong",
  };
}

