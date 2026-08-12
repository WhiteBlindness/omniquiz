import { findQuestionById } from "../../../lib/questions/catalog";
import { normalizeAnswer } from "../../../lib/questions/normalize";
import { evaluateSubmission } from "../../../lib/game/scoring";

type ApiEnvelope<T> = Readonly<{
  success: boolean;
  data: T | null;
  error: string | null;
}>;

const response = <T>(body: ApiEnvelope<T>, status: number) =>
  Response.json(body, { status });

const failure = (message: string, status = 400) =>
  response({ success: false, data: null, error: message }, status);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const QUESTION_ID_PATTERN = /^(general|science|geography|history)-\d{3}$/;

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return failure("request body must be valid JSON");
  }

  if (!isRecord(payload)) return failure("request body must be an object");

  const questionId = payload.questionId;
  const answer = payload.answer;
  if (
    typeof questionId !== "string" ||
    !QUESTION_ID_PATTERN.test(questionId) ||
    typeof answer !== "string" ||
    !normalizeAnswer(answer)
  ) {
    return failure("questionId and a non-empty answer are required");
  }

  const question = findQuestionById(questionId);
  if (!question) return failure("question was not found", 404);

  return response(
    { success: true, data: evaluateSubmission(question, answer), error: null },
    200,
  );
}
