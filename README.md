# atendeBR

SaaS B2B para equipos chilenos que atienden clientes de Brasil: microlearning de portugués orientado a atención + simulador de conversaciones con IA.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- Framer Motion
- Supabase (Auth + Postgres + RLS multi-tenant)
- OpenAI opcional para el simulador (fallback heurístico sin API key)

## Demo rápida

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) → **Probar demo** → elige rol:

| Rol | Qué verás |
| --- | --- |
| Colaborador | Dashboard, ruta, lecciones, simulador, frases |
| Supervisor / Admin | + dashboard de equipo |

## Features MVP

- Multi-tenant (`company_id`) + roles: `super_admin`, `company_admin`, `supervisor`, `collaborator`
- Ruta **Atención al Cliente** (10 lecciones microlearning)
- 8 escenarios de simulación con score (lenguaje, tono, cultura, empatía)
- Dashboard colaborador (progreso, rachas, badges, historial)
- Dashboard supervisor (avance, atrasados, scores)
- Biblioteca de frases descargable (CSV)

## Variables de entorno

Copia `.env.example` a `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
OPENAI_API_KEY=          # opcional
OPENAI_MODEL=gpt-4o-mini
```

El schema y seed viven en `supabase/migrations/`. El proyecto Supabase vinculado al MVP ya tiene tablas + contenido base.

## Scripts

- `npm run dev` — desarrollo
- `npm run build` — build de producción
- `npm run lint` — ESLint
