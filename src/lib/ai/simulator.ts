import OpenAI from "openai";
import { heuristicCustomerReply, heuristicScore } from "@/lib/ai/heuristic";
import type { ChatMessage, SimulationScenario, SimulationScore } from "@/types";

function clamp(n: number) {
  return Math.max(0, Math.min(100, Math.round(n)));
}

async function openaiScore(
  scenario: SimulationScenario,
  messages: ChatMessage[],
): Promise<SimulationScore | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  try {
    const client = new OpenAI({ apiKey });
    const transcript = messages
      .map((m) => `${m.role === "customer" ? "Cliente" : "Agente"}: ${m.content}`)
      .join("\n");

    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      temperature: 0.3,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `Eres evaluador de atendeBR. Evalúas agentes chilenos que atienden clientes brasileños.
Devuelve JSON con: overall, language, tone, culture, empathy (0-100), feedback (string en español), suggestions (array de 2-3 strings en español).
Criterios: corrección del portugués BR, tono/calidez, expresiones culturales/humor adecuado, empatía y manejo de la situación.
Escenario: ${scenario.title}. Persona: ${scenario.customer_persona}. Situación: ${scenario.situation}.
Focos: ${(scenario.evaluation_rubric.focus ?? []).join(", ")}.`,
        },
        { role: "user", content: transcript },
      ],
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SimulationScore;
    return {
      overall: clamp(Number(parsed.overall)),
      language: clamp(Number(parsed.language)),
      tone: clamp(Number(parsed.tone)),
      culture: clamp(Number(parsed.culture)),
      empathy: clamp(Number(parsed.empathy)),
      feedback: String(parsed.feedback ?? ""),
      suggestions: Array.isArray(parsed.suggestions)
        ? parsed.suggestions.map(String).slice(0, 3)
        : [],
    };
  } catch {
    return null;
  }
}

export async function evaluateSimulation(
  scenario: SimulationScenario,
  messages: ChatMessage[],
): Promise<SimulationScore> {
  const ai = await openaiScore(scenario, messages);
  return ai ?? heuristicScore(scenario, messages);
}

export async function generateCustomerReply(
  scenario: SimulationScenario,
  messages: ChatMessage[],
): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (apiKey) {
    try {
      const client = new OpenAI({ apiKey });
      const completion = await client.chat.completions.create({
        model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
        temperature: 0.7,
        messages: [
          {
            role: "system",
            content: `Você é o cliente brasileiro deste role-play. Persona: ${scenario.customer_persona}. Situação: ${scenario.situation}.
Responda em português do Brasil, em 1-3 frases, no tom da persona. Não saia do personagem. Se o agente resolver bem, vá amolecendo.`,
          },
          ...messages.map((m) => ({
            role: (m.role === "agent" ? "user" : "assistant") as "user" | "assistant",
            content: m.content,
          })),
        ],
      });
      const text = completion.choices[0]?.message?.content?.trim();
      if (text) return text;
    } catch {
      // fall through
    }
  }

  return heuristicCustomerReply(scenario, messages);
}
