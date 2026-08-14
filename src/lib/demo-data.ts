import type {
  Company,
  LearningPath,
  Lesson,
  LessonProgress,
  Profile,
  SimulationAttempt,
  SimulationScenario,
  TeamMemberProgress,
} from "@/types";

export const DEMO_COMPANY: Company = {
  id: "11111111-1111-1111-1111-111111111111",
  name: "Demo Retail Chile",
  slug: "demo-retail",
  primary_color: "#0A4D68",
};

export const DEMO_USERS: Record<"collaborator" | "supervisor" | "company_admin", Profile> = {
  collaborator: {
    id: "u0000001-0000-0000-0000-000000000001",
    company_id: DEMO_COMPANY.id,
    email: "camila@demo-retail.cl",
    full_name: "Camila Rojas",
    role: "collaborator",
    streak_days: 4,
    last_activity_at: new Date().toISOString(),
  },
  supervisor: {
    id: "u0000001-0000-0000-0000-000000000002",
    company_id: DEMO_COMPANY.id,
    email: "andres@demo-retail.cl",
    full_name: "Andrés Muñoz",
    role: "supervisor",
    streak_days: 2,
    last_activity_at: new Date().toISOString(),
  },
  company_admin: {
    id: "u0000001-0000-0000-0000-000000000003",
    company_id: DEMO_COMPANY.id,
    email: "admin@demo-retail.cl",
    full_name: "Valentina Pérez",
    role: "company_admin",
    streak_days: 1,
    last_activity_at: new Date().toISOString(),
  },
};

export const DEMO_PATH: LearningPath = {
  id: "a0000001-0000-0000-0000-000000000001",
  company_id: null,
  slug: "atencion-al-cliente",
  title: "Atención al Cliente",
  description:
    "Portugués brasileño natural para equipos de soporte y atención. Microlearning + práctica cultural.",
  role_focus: "atencion",
  estimated_hours: 5.5,
  is_template: true,
};

export const DEMO_LESSONS: Lesson[] = [
  {
    id: "c0000001-0000-0000-0000-000000000001",
    path_id: DEMO_PATH.id,
    slug: "boas-vindas",
    title: "Boas-vindas que abren puertas",
    summary: "Saludos cálidos vs formales: cuándo usar cada uno.",
    content_md: `# Boas-vindas que abren puertas

En Brasil, el saludo no es un trámite: es la primera señal de que hay una persona detrás del ticket.

## Lo que funciona
- **"Oi, tudo bem?"** — cercano, ideal en chat/WhatsApp.
- **"Olá! Como posso te ajudar hoje?"** — profesional y cálido.
- Usar el nombre del cliente temprano: *"Oi, Mariana!"*

## Evita
- Traducir literal desde el español.
- Empezar directo al problema sin connection.

## Tip cultural
Los brasileños esperan calor humano incluso en reclamos. Un saludo breve + empatía reduce escalamientos.`,
    audio_script:
      "Oi, tudo bem? Meu nome é Camila e vou te ajudar hoje. Pode me contar o que aconteceu?",
    lesson_type: "content",
    duration_minutes: 6,
    sort_order: 1,
    phrases_json: [
      { pt: "Oi, tudo bem?", es: "Hola, ¿todo bien?", note: "Saludo cotidiano cálido" },
      { pt: "Como posso te ajudar hoje?", es: "¿Cómo te puedo ayudar hoy?", note: "Apertura profesional" },
    ],
  },
  {
    id: "c0000001-0000-0000-0000-000000000002",
    path_id: DEMO_PATH.id,
    slug: "tom-e-calor",
    title: "Tono y calor: el jeitinho de atender",
    summary: "Cómo sonar cercano sin perder profesionalismo.",
    content_md: `# Tono y calor

El portugués "correcto pero frío" es el error más común de equipos chilenos.

## Señales de calidez
- Diminutivos naturales: *momentinho*.
- Confirmaciones: *certo*, *entendi*, *pode deixar*.
- Cierre positivo: *qualquer coisa, estou por aqui*.

## Práctica
En vez de: "Vou verificar e retorno."
Prueba: "Deixa eu verificar isso rapidinho e já te retorno, combinado?"`,
    audio_script: "Deixa eu verificar isso rapidinho e já te retorno, combinado?",
    lesson_type: "culture",
    duration_minutes: 7,
    sort_order: 2,
    phrases_json: [
      { pt: "Deixa eu verificar isso rapidinho", es: "Déjame revisar eso rapidito", note: "Calidez + acción" },
      { pt: "Pode deixar comigo", es: "Déjamelo a mí", note: "Ownership" },
    ],
  },
  {
    id: "c0000001-0000-0000-0000-000000000003",
    path_id: DEMO_PATH.id,
    slug: "empatia-em-reclamacoes",
    title: "Empatía en reclamos",
    summary: "Validar frustración antes de ofrecer solución.",
    content_md: `# Empatía en reclamos

Valida el sentimiento **antes** de la solución.

## Fórmula ACE
1. **Acknowledge** — *Entendo sua frustração...*
2. **Care** — *Sinto muito pelo transtorno.*
3. **Engage** — *Vamos resolver isso juntos.*

## Evita
- Justificar la empresa antes de escuchar.
- Respuestas robot al inicio.`,
    audio_script: "Sinto muito pelo transtorno. Vamos resolver isso juntos agora.",
    lesson_type: "content",
    duration_minutes: 8,
    sort_order: 3,
    phrases_json: [
      { pt: "Sinto muito pelo transtorno", es: "Lamento el inconveniente", note: "Empatía" },
      { pt: "Vamos resolver isso juntos", es: "Vamos a resolver esto juntos", note: "Alianza" },
    ],
  },
  {
    id: "c0000001-0000-0000-0000-000000000004",
    path_id: DEMO_PATH.id,
    slug: "humor-leve",
    title: "Humor leve (sin forzar)",
    summary: "Cuándo un toque de humor desarma tensión.",
    content_md: `# Humor leve

El humor brasileño en atención es ligereza, no stand-up.

## Seguro
- Autoironía suave sobre demoras ya resueltas.
- Emojis moderados en chat (1–2).

## Peligroso
- Bromear sobre el dinero perdido del cliente.
- Ironía seca que puede leerse como soberbia.`,
    audio_script: "Poxa, três vezes é demais mesmo. Vamos fazer dessa a última, combinado?",
    lesson_type: "culture",
    duration_minutes: 6,
    sort_order: 4,
    phrases_json: [
      { pt: "Poxa, que chato isso", es: "Pucha, qué lata", note: "Validación coloquial" },
      { pt: "Combinado?", es: "¿Trato?", note: "Cierre colaborativo" },
    ],
  },
  {
    id: "c0000001-0000-0000-0000-000000000005",
    path_id: DEMO_PATH.id,
    slug: "voce-ou-o-senhor",
    title: "Você, tu u o senhor?",
    summary: "Niveles de formalidad según canal y edad.",
    content_md: `# Você, tu u o senhor?

## Regla práctica
- Chat / WhatsApp / menores de 40 → **você**
- Clientes mayores o B2B formal → **o senhor / a senhora**
- Evita *tu* fuera del sur de Brasil.`,
    audio_script: "Bom dia, senhora Ana. Como posso ajudá-la hoje?",
    lesson_type: "content",
    duration_minutes: 5,
    sort_order: 5,
    quiz_json: {
      questions: [
        {
          q: "En WhatsApp con un cliente de 28 años, ¿qué es más natural?",
          options: ["O senhor precisa de ajuda?", "Você precisa de uma ajuda?", "Tu precisas de ajuda?"],
          answer: 1,
        },
      ],
    },
    phrases_json: [
      { pt: "Como posso ajudá-lo?", es: "¿Cómo puedo ayudarlo?", note: "Formal" },
      { pt: "Posso te ajudar?", es: "¿Puedo ayudarte?", note: "Cercano" },
    ],
  },
  {
    id: "c0000001-0000-0000-0000-000000000006",
    path_id: DEMO_PATH.id,
    slug: "frases-de-ouro",
    title: "Frases de oro del soporte",
    summary: "Biblioteca corta de frases de alto impacto.",
    content_md: `# Frases de oro

Memoriza estas 8 — cubren el 80% de los momentos críticos.

1. *Pode me contar um pouco mais sobre o que aconteceu?*
2. *Entendi. Deixa eu repetir pra garantir que estamos alinhados...*
3. *Já localizei seu pedido.*
4. *Vou priorizar isso pra você.*
5. *O prazo é X; se mudar, te aviso.*
6. *Qualquer dúvida, me chama por aqui.*
7. *Obrigada pela paciência — de verdade.*
8. *Ficou alguma coisa pendente?*`,
    audio_script: "Já localizei seu pedido e vou priorizar isso pra você.",
    lesson_type: "practice",
    duration_minutes: 7,
    sort_order: 6,
    phrases_json: [
      { pt: "Pode me contar um pouco mais?", es: "¿Me cuentas un poco más?", note: "Descubrimiento" },
      { pt: "Já localizei seu pedido", es: "Ya ubiqué tu pedido", note: "Progreso" },
      { pt: "Vou priorizar isso pra você", es: "Voy a priorizar esto", note: "Cuidado" },
      { pt: "Ficou alguma coisa pendente?", es: "¿Quedó algo pendiente?", note: "Cierre" },
    ],
  },
  {
    id: "c0000001-0000-0000-0000-000000000007",
    path_id: DEMO_PATH.id,
    slug: "cliente-conversador",
    title: "El cliente muy conversador",
    summary: "Mantener rapport sin perder el hilo del caso.",
    content_md: `# Cliente conversador

## Técnica sandwich
1. Reconoce el comentario humano (1 frase).
2. Vuelve al caso con puente suave.
3. Cierra con siguiente paso claro.`,
    audio_script: "Que legal! Sobre a entrega: já vi o que aconteceu e vou liberar o reenvio hoje.",
    lesson_type: "culture",
    duration_minutes: 6,
    sort_order: 7,
    phrases_json: [
      { pt: "Que legal!", es: "¡Qué bueno!", note: "Validación" },
      { pt: "Sobre a entrega...", es: "Sobre la entrega...", note: "Puente" },
    ],
  },
  {
    id: "c0000001-0000-0000-0000-000000000008",
    path_id: DEMO_PATH.id,
    slug: "negociacao-suave",
    title: "Negociación suave de expectativas",
    summary: "Prometer menos, comunicar más — sin sonar burocrático.",
    content_md: `# Negociación suave

Cuando no puedes dar lo que piden:
1. Empatiza.
2. Explica el límite en lenguaje humano.
3. Ofrece la mejor alternativa real.
4. Pregunta si les sirve.`,
    audio_script:
      "Infelizmente não consigo o reembolso integral hoje, mas posso oferecer um crédito de 100% + frete grátis. Faz sentido pra você?",
    lesson_type: "content",
    duration_minutes: 7,
    sort_order: 8,
    quiz_json: {
      questions: [
        {
          q: "Orden correcto al negar una solicitud",
          options: [
            "Política → empatía → alternativa",
            "Empatía → límite → alternativa → confirmación",
            "Alternativa → silencio",
          ],
          answer: 1,
        },
      ],
    },
    phrases_json: [
      { pt: "Infelizmente não consigo...", es: "Lamentablemente no puedo...", note: "Negación suave" },
      { pt: "Faz sentido pra você?", es: "¿Te hace sentido?", note: "Co-creación" },
    ],
  },
  {
    id: "c0000001-0000-0000-0000-000000000009",
    path_id: DEMO_PATH.id,
    slug: "false-friends",
    title: "Falsos amigos ES→PT",
    summary: "Palabras que parecen iguales y generan malentendidos.",
    content_md: `# Falsos amigos

| Español | Evita en PT | Usa |
| --- | --- | --- |
| Exquisito | *esquisito* (= raro) | *delicioso / ótimo* |
| Apellido | *apelido* (= apodo) | *sobrenome* |
| Rato | *rato* (= ratón) | *um instante* |`,
    audio_script: "Cuidado: esquisito em português significa estranho, não delicioso!",
    lesson_type: "quiz",
    duration_minutes: 5,
    sort_order: 9,
    quiz_json: {
      questions: [
        {
          q: "¿Cómo dices apellido en portugués?",
          options: ["apelido", "sobrenome", "sobrenombre"],
          answer: 1,
        },
        {
          q: "esquisito significa...",
          options: ["delicioso", "extraño/raro", "elegante"],
          answer: 1,
        },
      ],
    },
    phrases_json: [
      { pt: "sobrenome", es: "apellido", note: "No confundir con apelido" },
      { pt: "um instante", es: "un rato", note: "No usar rato" },
    ],
  },
  {
    id: "c0000001-0000-0000-0000-00000000000a",
    path_id: DEMO_PATH.id,
    slug: "fechamento",
    title: "Cierre memorable",
    summary: "Cómo terminar dejando buena sensación y puerta abierta.",
    content_md: `# Cierre memorable

1. Resume lo acordado.
2. Agradece con sinceridad.
3. Deja canal abierto sin sonar desesperado.

"Pronto! Reenvio liberado com tracking novo. Qualquer coisa, me chama por aqui. Foi um prazer te ajudar!"`,
    audio_script: "Pronto! Foi um prazer te ajudar!",
    lesson_type: "practice",
    duration_minutes: 6,
    sort_order: 10,
    phrases_json: [
      { pt: "Pronto!", es: "¡Listo!", note: "Cierre" },
      { pt: "Foi um prazer te ajudar", es: "Fue un placer ayudarte", note: "Cálido" },
      { pt: "Qualquer coisa, me chama", es: "Cualquier cosa, escríbeme", note: "Disponibilidad" },
    ],
  },
];

export const DEMO_SCENARIOS: SimulationScenario[] = [
  {
    id: "d0000001-0000-0000-0000-000000000001",
    path_id: DEMO_PATH.id,
    slug: "cliente-irritado-atraso",
    title: "Cliente irritado por atraso",
    description: "Pedido atrasado 5 días; cliente ya escribió dos veces.",
    customer_persona: "Carlos, 34, São Paulo. Directo, impaciente.",
    situation: "El pedido #48291 lleva 5 días de atraso. Quiere solución hoy.",
    opening_message:
      "Oi. Meu pedido tá atrasado JÁ FAZ CINCO DIAS e ninguém resolve. Quero uma solução AGORA.",
    difficulty: 3,
    evaluation_rubric: { focus: ["empatia primero", "plan concreto", "português natural"] },
  },
  {
    id: "d0000001-0000-0000-0000-000000000002",
    path_id: DEMO_PATH.id,
    slug: "cliente-super-conversador",
    title: "Cliente muy conversador",
    description: "Quiere charlar antes de llegar al problema.",
    customer_persona: "Juliana, 29, BH. Cálida, usa emojis.",
    situation: "Duda sobre talla; empieza hablando de su viaje a Floripa.",
    opening_message:
      "Oiii! Acabei de voltar de Floripa, amei 😍 Antes de pedir: vocês têm a blusa azul no M?",
    difficulty: 2,
    evaluation_rubric: { focus: ["rapport breve", "puente al caso", "calidez"] },
  },
  {
    id: "d0000001-0000-0000-0000-000000000003",
    path_id: DEMO_PATH.id,
    slug: "cliente-formal-b2b",
    title: "Cliente formal B2B",
    description: "Gerente de compras, tono corporativo.",
    customer_persona: "Sr. Roberto Almeida, 52, Curitiba.",
    situation: "Factura con CNPJ incorrecto; necesita corrección mañana.",
    opening_message:
      "Bom dia. Sou Roberto Almeida. A nota fiscal 77421 está com CNPJ incorreto. Preciso da correção até amanhã.",
    difficulty: 3,
    evaluation_rubric: { focus: ["formalidad", "precisión", "plazos"] },
  },
  {
    id: "d0000001-0000-0000-0000-000000000004",
    path_id: DEMO_PATH.id,
    slug: "reclamo-produto-danificado",
    title: "Producto dañado",
    description: "Llegó roto; cliente envía foto y está molesto.",
    customer_persona: "Fernanda, 41, Recife.",
    situation: "Vaso quebrado; quiere reposición sin costo.",
    opening_message: "Recebi o vaso todo quebrado. Isso é um absurdo pelo valor que paguei.",
    difficulty: 3,
    evaluation_rubric: { focus: ["validar emoción", "ownership", "próximo paso"] },
  },
  {
    id: "d0000001-0000-0000-0000-000000000005",
    path_id: DEMO_PATH.id,
    slug: "cliente-confuso-processo",
    title: "Cliente confuso con el proceso",
    description: "No entiende cómo trackear ni plazos.",
    customer_persona: "Pedro, 23, primer pedido online.",
    situation: "Compró ayer; no encuentra tracking y teme estafa.",
    opening_message: "Oi... pedi ontem mas não acho o código de rastreio. Isso é normal? Tô com medo.",
    difficulty: 1,
    evaluation_rubric: { focus: ["tranquilizar", "educar", "pasos simples"] },
  },
  {
    id: "d0000001-0000-0000-0000-000000000006",
    path_id: DEMO_PATH.id,
    slug: "upgrade-negociacao",
    title: "Negociación de upgrade",
    description: "Cliente pide descuento agresivo; margen limitado.",
    customer_persona: "Bianca, 37, influencer pequeña.",
    situation: "Quiere 40% off; máximo autorizado 15% + frete grátis.",
    opening_message: "Adorei a linha nova! Consigo 40% off? Posso marcar vocês.",
    difficulty: 4,
    evaluation_rubric: { focus: ["negociar", "alternativa creativa", "calidez comercial"] },
  },
  {
    id: "d0000001-0000-0000-0000-000000000007",
    path_id: DEMO_PATH.id,
    slug: "cancelamento-em-andamento",
    title: "Cancelación en curso",
    description: "Quiere cancelar; el pedido ya salió.",
    customer_persona: "Lucas, 31. Ansioso.",
    situation: "Ofrecer rechazo en puerta o devolución.",
    opening_message: "Quero cancelar o pedido agora. Mudei de ideia. Tem como?",
    difficulty: 3,
    evaluation_rubric: { focus: ["opciones claras", "sin juicio", "tono calmado"] },
  },
  {
    id: "d0000001-0000-0000-0000-000000000008",
    path_id: DEMO_PATH.id,
    slug: "elogio-e-upsell",
    title: "Elogio + upsell",
    description: "Cliente feliz; momento para sugerir sin ser pushy.",
    customer_persona: "Aline, 27. Entusiasta.",
    situation: "Recibió bien; pregunta qué combina con lo comprado.",
    opening_message: "Gente, chegou perfeito!! Tem algo que combine com a camiseta verde?",
    difficulty: 2,
    evaluation_rubric: { focus: ["recibir elogio", "sugerir 1-2 opciones", "calidez"] },
  },
];

const TEAM_MATES: Profile[] = [
  DEMO_USERS.collaborator,
  {
    id: "u0000001-0000-0000-0000-000000000010",
    company_id: DEMO_COMPANY.id,
    email: "diego@demo-retail.cl",
    full_name: "Diego Soto",
    role: "collaborator",
    streak_days: 1,
    last_activity_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
  },
  {
    id: "u0000001-0000-0000-0000-000000000011",
    company_id: DEMO_COMPANY.id,
    email: "flora@demo-retail.cl",
    full_name: "Florencia Núñez",
    role: "collaborator",
    streak_days: 6,
    last_activity_at: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
  },
  {
    id: "u0000001-0000-0000-0000-000000000012",
    company_id: DEMO_COMPANY.id,
    email: "matias@demo-retail.cl",
    full_name: "Matías Contreras",
    role: "collaborator",
    streak_days: 0,
    last_activity_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
  },
];

export function getDemoTeamProgress(): TeamMemberProgress[] {
  return [
    {
      profile: TEAM_MATES[0],
      lessons_completed: 4,
      lessons_total: DEMO_LESSONS.length,
      avg_simulation_score: 78,
      last_activity_at: TEAM_MATES[0].last_activity_at ?? null,
      assigned_path_title: DEMO_PATH.title,
      is_behind: false,
    },
    {
      profile: TEAM_MATES[1],
      lessons_completed: 2,
      lessons_total: DEMO_LESSONS.length,
      avg_simulation_score: 64,
      last_activity_at: TEAM_MATES[1].last_activity_at ?? null,
      assigned_path_title: DEMO_PATH.title,
      is_behind: true,
    },
    {
      profile: TEAM_MATES[2],
      lessons_completed: 8,
      lessons_total: DEMO_LESSONS.length,
      avg_simulation_score: 88,
      last_activity_at: TEAM_MATES[2].last_activity_at ?? null,
      assigned_path_title: DEMO_PATH.title,
      is_behind: false,
    },
    {
      profile: TEAM_MATES[3],
      lessons_completed: 0,
      lessons_total: DEMO_LESSONS.length,
      avg_simulation_score: null,
      last_activity_at: TEAM_MATES[3].last_activity_at ?? null,
      assigned_path_title: DEMO_PATH.title,
      is_behind: true,
    },
  ];
}

export function getDefaultProgress(): LessonProgress[] {
  return DEMO_LESSONS.slice(0, 4).map((lesson, index) => ({
    lesson_id: lesson.id,
    status: index < 3 ? "completed" : "in_progress",
    score: index < 3 ? 80 + index * 5 : null,
    time_spent_seconds: 300 + index * 40,
    completed_at: index < 3 ? new Date().toISOString() : null,
  }));
}

export function getDemoAttempts(userId: string): SimulationAttempt[] {
  return [
    {
      id: "s0000001-0000-0000-0000-000000000001",
      user_id: userId,
      scenario_id: DEMO_SCENARIOS[0].id,
      messages: [],
      overall_score: 76,
      language_score: 74,
      tone_score: 80,
      culture_score: 72,
      empathy_score: 78,
      feedback: "Buen inicio empático. Suma un plan concreto con plazo en la primera respuesta.",
      suggestions: [
        "Usa 'Sinto muito pelo transtorno' antes de la solución.",
        "Cierra con 'combinado?' para co-crear el siguiente paso.",
      ],
      duration_seconds: 420,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
      scenario: DEMO_SCENARIOS[0],
    },
    {
      id: "s0000001-0000-0000-0000-000000000002",
      user_id: userId,
      scenario_id: DEMO_SCENARIOS[1].id,
      messages: [],
      overall_score: 84,
      language_score: 82,
      tone_score: 90,
      culture_score: 86,
      empathy_score: 80,
      feedback: "Excelente rapport. El puente al caso fue natural y cálido.",
      suggestions: ["Ofrece una sola pregunta de confirmación de talla para cerrar más rápido."],
      duration_seconds: 360,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
      scenario: DEMO_SCENARIOS[1],
    },
  ];
}
