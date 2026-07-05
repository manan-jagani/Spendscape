export type FieldErrors = Record<string, string[] | undefined>;

export type ActionState =
  | { status: "idle" }
  | { status: "success"; message: string }
  | { status: "error"; message: string; fieldErrors?: FieldErrors };

export const INITIAL_ACTION_STATE: ActionState = { status: "idle" };

export function actionSuccess(message: string): ActionState {
  return { status: "success", message };
}

export function actionError(
  message: string,
  fieldErrors?: FieldErrors,
): ActionState {
  return fieldErrors
    ? { status: "error", message, fieldErrors }
    : { status: "error", message };
}
