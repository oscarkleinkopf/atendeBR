import type { ChatMessage } from "@/types";

export const MAX_SIMULATOR_MESSAGES = 24;
export const MAX_MESSAGE_CHARS = 2000;

const MESSAGE_ROLES = new Set(["customer", "agent", "system"]);

export type SimulatorAction = "continue" | "evaluate";

export type SimulatorInput = {
  scenarioId: string;
  messages: ChatMessage[];
  action: SimulatorAction;
  durationSeconds: number;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function parseMessage(value: unknown): ChatMessage | null {
  const row = asRecord(value);
  if (!row) return null;
  if (typeof row.role !== "string" || !MESSAGE_ROLES.has(row.role)) return null;
  if (typeof row.content !== "string") return null;
  const content = row.content.trim();
  if (!content || content.length > MAX_MESSAGE_CHARS) return null;
  const message: ChatMessage = {
    role: row.role as ChatMessage["role"],
    content,
  };
  if (row.at !== undefined) {
    if (typeof row.at !== "string" || row.at.length > 40) return null;
    message.at = row.at;
  }
  return message;
}

export function parseSimulatorInput(
  value: unknown,
): { ok: true; value: SimulatorInput } | { ok: false; error: string } {
  const body = asRecord(value);
  if (!body) return { ok: false, error: "Cuerpo inválido" };

  if (typeof body.scenarioId !== "string" || !/^[a-zA-Z0-9_-]{1,80}$/.test(body.scenarioId)) {
    return { ok: false, error: "scenarioId inválido" };
  }

  if (body.action !== "continue" && body.action !== "evaluate") {
    return { ok: false, error: "action inválida" };
  }

  if (!Array.isArray(body.messages)) {
    return { ok: false, error: "messages inválidos" };
  }
  if (body.messages.length === 0 || body.messages.length > MAX_SIMULATOR_MESSAGES) {
    return { ok: false, error: "Cantidad de mensajes inválida" };
  }

  const messages: ChatMessage[] = [];
  for (const item of body.messages) {
    const parsed = parseMessage(item);
    if (!parsed) return { ok: false, error: "Mensaje inválido" };
    messages.push(parsed);
  }

  let durationSeconds = 0;
  if (body.durationSeconds !== undefined) {
    if (typeof body.durationSeconds !== "number" || !Number.isFinite(body.durationSeconds)) {
      return { ok: false, error: "durationSeconds inválido" };
    }
    durationSeconds = Math.max(0, Math.min(7200, Math.round(body.durationSeconds)));
  }

  return {
    ok: true,
    value: {
      scenarioId: body.scenarioId,
      messages,
      action: body.action,
      durationSeconds,
    },
  };
}
