import OpenAI from "openai";
import type { ChatMessage, SimulationScenario, SimulationScore } from "@/types";

const WARMTH_MARKERS = [
  "sinto muito",
  "entendo",
  "entendi",
  "pode deixar",
  "combinado",
  "tranquil",
  "vamos resolver",
  "obrigad",
  "prazer",
  "rapidinho",
  "momentinho",
  "poxa",
  "que chato",
  "estou aqui",
  "qualquer coisa",
];

const COLD_MARKERS = [
  "conforme nossa política",
  "não é possível",
  "protocolo",
  "infelizmente não há",
  "não posso fazer nada",
];

const SPANISH_LEAKS = [
  "hola",
  "buenos días",
  "disculpe",
  "por favor",
  "gracias",
  "pedido",
  "lo siento",
  "¿",
  "¡",
];

function clamp(n: number) {
  return Math.max(0, Math.min(100, Math.round(n)));
}

function heuristicScore(
  scenario: SimulationScenario,
  messages: ChatMessage[],
): SimulationScore {
  const agentTexts = messages
    .filter((m) => m.role === "agent")
    .map((m) => m.content.toLowerCase());
  const joined = agentTexts.join(" \n ");

  let language = 70;
  let tone = 65;
  let culture = 65;
  let empathy = 60;

  if (agentTexts.length === 0) {
    return {
      overall: 40,
      language: 40,
      tone: 40,
      culture: 40,
      empathy: 40,
      feedback: "No hubo respuestas del agente para evaluar.",
      suggestions: ["Responde en portugués brasileño con empatía antes de la solución."],
    };
  }

  const warmthHits = WARMTH_MARKERS.filter((m) => joined.includes(m)).length;
  const coldHits = COLD_MARKERS.filter((m) => joined.includes(m)).length;
  const spanishHits = SPANISH_LEAKS.filter((m) => joined.includes(m)).length;

  tone += warmthHits * 4 - coldHits * 8;
  empathy += warmthHits * 5 - coldHits * 6;
  culture += Math.min(warmthHits * 3, 20);
  language -= spanishHits * 12;

  if (/[áéíóúñ¿¡]/i.test(joined)) language -= 8;
  if (joined.includes("você") || joined.includes("voce")) culture += 4;
  if (joined.includes("o senhor") || joined.includes("a senhora")) {
    if (scenario.slug.includes("formal")) {
      culture += 8;
      tone += 4;
    }
  }

  if (scenario.slug.includes("irritado") || scenario.slug.includes("danificado")) {
    if (joined.includes("sinto muito") || joined.includes("entendo")) empathy += 10;
    if (!joined.includes("vou") && !joined.includes("vamos")) empathy -= 5;
  }

  if (joined.length > 40 && joined.length < 500) language += 5;
  if (joined.length > 800) tone -= 5;

  language = clamp(language);
  tone = clamp(tone);
  culture = clamp(culture);
  empathy = clamp(empathy);
  const overall = clamp(language * 0.25 + tone * 0.25 + culture * 0.25 + empathy * 0.25);

  const suggestions: string[] = [];
  if (empathy < 75) {
    suggestions.push("Empieza validando la emoción: \"Sinto muito pelo transtorno / Entendo sua frustração\".");
  }
  if (tone < 75) {
    suggestions.push("Añade calidez natural: \"rapidinho\", \"combinado?\", \"pode deixar comigo\".");
  }
  if (language < 75) {
    suggestions.push("Evita filtraciones del español y mantén el 100% en portugués brasileño.");
  }
  if (culture < 75) {
    suggestions.push("Usa expresiones cotidianas BR (poxa, combinado, qualquer coisa) sin forzar humor.");
  }
  if (suggestions.length === 0) {
    suggestions.push("Excelente base. Prueba cerrar con un resumen + \"Ficou alguma coisa pendente?\".");
  }

  let feedback = "Respuesta sólida en registro de atención.";
  if (overall >= 85) {
    feedback =
      "El cliente brasileño sentiría que habla con alguien que lo entiende: buen tono, empatía y naturalidad.";
  } else if (overall >= 70) {
    feedback =
      "Vas bien: hay conexión, pero aún se nota espacio para más calidez o un plan más concreto.";
  } else {
    feedback =
      "Se percibe distancia o traducción. Prioriza empatía en portugués natural antes de la solución.";
  }

  return {
    overall,
    language,
    tone,
    culture,
    empathy,
    feedback,
    suggestions: suggestions.slice(0, 3),
  };
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
  const lastAgent = [...messages].reverse().find((m) => m.role === "agent")?.content ?? "";

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

  const lower = lastAgent.toLowerCase();
  if (scenario.slug.includes("irritado")) {
    if (lower.includes("sinto muito") || lower.includes("vou")) {
      return "Ok... ainda tô chateado, mas me explica o prazo certinho então.";
    }
    return "Isso não resolve. Quero saber QUANDO chega ou o reembolso.";
  }
  if (scenario.slug.includes("conversador")) {
    return "Haha valeu! Então a blusa azul no M tem estoque pra enviar essa semana?";
  }
  if (scenario.slug.includes("formal")) {
    return "Perfeito. Por favor confirme por e-mail o protocolo e o horário da correção.";
  }
  if (scenario.slug.includes("danificado")) {
    return "Certo. Vocês buscam o produto quebrado ou eu preciso postar?";
  }
  if (lower.includes("combinado") || lower.includes("prazo") || lower.includes("vou")) {
    return "Beleza, obrigado. Qualquer atualização me avisa por aqui.";
  }
  return "Entendi. Pode detalhar o próximo passo, por favor?";
}
