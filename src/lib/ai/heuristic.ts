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

/** Evaluación heurística (cliente + GitHub Pages). */
export function heuristicScore(
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
    suggestions.push(
      'Empieza validando la emoción: "Sinto muito pelo transtorno / Entendo sua frustração".',
    );
  }
  if (tone < 75) {
    suggestions.push('Añade calidez natural: "rapidinho", "combinado?", "pode deixar comigo".');
  }
  if (language < 75) {
    suggestions.push("Evita filtraciones del español y mantén el 100% en portugués brasileño.");
  }
  if (culture < 75) {
    suggestions.push(
      "Usa expresiones cotidianas BR (poxa, combinado, qualquer coisa) sin forzar humor.",
    );
  }
  if (suggestions.length === 0) {
    suggestions.push('Excelente base. Prueba cerrar con un resumen + "Ficou alguma coisa pendente?".');
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

export function heuristicCustomerReply(
  scenario: SimulationScenario,
  messages: ChatMessage[],
): string {
  const lastAgent = [...messages].reverse().find((m) => m.role === "agent")?.content ?? "";
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
