# atendeBR

SaaS B2B para equipos chilenos que atienden clientes de Brasil: microlearning de portugués orientado a atención + simulador de conversaciones con IA.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- Framer Motion
- Supabase (Auth + Postgres + RLS multi-tenant)
- OpenAI opcional para el simulador (fallback heurístico sin API key)

## GitHub Pages

Sitio estático (mismo enfoque que Ulpan): archivos en la **raíz** del repo + `docs/`.

```bash
npm run build:ghpages   # export → raíz + docs/ con basePath /atendeBR
```

**URL:** https://oscarkleinkopf.github.io/atendeBR/

### Activar Pages (obligatorio, una vez)

Si ves **404 / Site not found**, Pages aún no está encendido:

1. Abre https://github.com/oscarkleinkopf/atendeBR/settings/pages
2. **Build and deployment → Source:** Deploy from a branch
3. **Branch:** `main`
4. **Folder:** `/ (root)`  ← importante (no `/docs` si usas la raíz)
5. **Save**
6. Espera 1–2 minutos y recarga https://oscarkleinkopf.github.io/atendeBR/

Alternativa: Folder `/docs` (también sincronizado).

En Pages el simulador y el progreso corren en el navegador (sin API server).

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
- **TTS pt-BR** en lecciones y frases (patrón de [Ulpan](https://github.com/oscarkleinkopf/Ulpan))
- Progreso local + rachas/XP (mismo enfoque de sync local que Ulpan)
- Magic link / Google vía Supabase Auth (+ demo multi-rol)

## Herencia de Ulpan

Reutilizamos patrones probados del repo **Ulpan Hibrit**:

| Ulpan | atendeBR |
| --- | --- |
| `speak.ts` + `/api/tts` (hebreo) | `speak.ts` + `/api/tts` (pt-BR) |
| `progress.ts` local + rachas/XP | `progress-local.ts` |
| Magic link / Google Supabase | Login + `/auth/callback` |
| Demo usable sin cloud | Roles demo por cookie |

El schema multi-tenant de atendeBR es propio (empresas, rutas, simulaciones); Ulpan aporta la UX de aprendizaje de idiomas.

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
