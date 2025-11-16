export const ERROR_CODES = {
  ACTIVE_GOAL_EXISTS: "ACTIVE_GOAL_EXISTS",
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];
