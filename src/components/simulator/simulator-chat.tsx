"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ScoreRing } from "@/components/dashboard/score-ring";
import { difficultyLabel } from "@/lib/utils";
import type { ChatMessage, SimulationScenario, SimulationScore } from "@/types";

export function SimulatorChat({ scenario }: { scenario: SimulationScenario }) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "customer", content: scenario.opening_message, at: new Date().toISOString() },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [score, setScore] = useState<SimulationScore | null>(null);
  const [startedAt] = useState(() => Date.now());

  const turns = useMemo(
    () => messages.filter((m) => m.role === "agent").length,
    [messages],
  );

  async function persistScore(nextScore: SimulationScore, msgs: ChatMessage[]) {
    setScore(nextScore);
    const { loadProgress, recordSimulation, saveProgress } = await import("@/lib/progress-local");
    saveProgress(recordSimulation(loadProgress(), nextScore.overall));
    window.dispatchEvent(new Event("atendebr-progress"));
    try {
      const { saveSimulationCloud } = await import("@/lib/cloud/session");
      await saveSimulationCloud(
        scenario.id,
        msgs,
        nextScore,
        Math.round((Date.now() - startedAt) / 1000),
      );
    } catch {
      /* demo */
    }
  }

  async function runClientContinue(next: ChatMessage[]) {
    const { heuristicCustomerReply } = await import("@/lib/ai/heuristic");
    const reply = heuristicCustomerReply(scenario, next);
    setMessages((prev) => [
      ...prev,
      { role: "customer", content: reply, at: new Date().toISOString() },
    ]);
  }

  async function runClientEvaluate(msgs: ChatMessage[]) {
    const { heuristicScore } = await import("@/lib/ai/heuristic");
    await persistScore(heuristicScore(scenario, msgs), msgs);
  }

  async function send() {
    const text = input.trim();
    if (!text || loading || score) return;

    const next: ChatMessage[] = [
      ...messages,
      { role: "agent", content: text, at: new Date().toISOString() },
    ];
    setMessages(next);
    setInput("");
    setLoading(true);

    try {
      const action = turns >= 2 ? "evaluate" : "continue";
      try {
        const res = await fetch("/api/simulator", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            scenarioId: scenario.id,
            messages: next,
            action,
            durationSeconds: Math.round((Date.now() - startedAt) / 1000),
          }),
        });
        if (!res.ok) throw new Error("api unavailable");
        const data = await res.json();
        if (data.reply) {
          setMessages((prev) => [
            ...prev,
            { role: "customer", content: data.reply, at: new Date().toISOString() },
          ]);
        }
        if (data.score) await persistScore(data.score, next);
      } catch {
        if (action === "evaluate") await runClientEvaluate(next);
        else await runClientContinue(next);
      }
    } finally {
      setLoading(false);
    }
  }

  async function finishNow() {
    if (loading || score || turns === 0) return;
    setLoading(true);
    try {
      try {
        const res = await fetch("/api/simulator", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            scenarioId: scenario.id,
            messages,
            action: "evaluate",
            durationSeconds: Math.round((Date.now() - startedAt) / 1000),
          }),
        });
        if (!res.ok) throw new Error("api unavailable");
        const data = await res.json();
        if (data.score) await persistScore(data.score, messages);
      } catch {
        await runClientEvaluate(messages);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
      <section className="overflow-hidden rounded-3xl border border-teal-900/10 bg-white shadow-sm">
        <div className="border-b border-teal-900/8 bg-gradient-to-r from-teal-900 to-teal-700 px-5 py-4 text-white">
          <p className="text-xs uppercase tracking-[0.2em] text-amber-200">Role-play</p>
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">{scenario.title}</h1>
          <p className="mt-1 text-sm text-teal-50/85">{scenario.customer_persona}</p>
        </div>
        <div className="flex max-h-[28rem] flex-col gap-3 overflow-y-auto p-5">
          <AnimatePresence initial={false}>
            {messages.map((message, index) => (
              <motion.div
                key={`${message.role}-${index}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={
                  message.role === "agent"
                    ? "ml-8 rounded-2xl rounded-br-md bg-teal-800 px-4 py-3 text-sm text-white"
                    : "mr-8 rounded-2xl rounded-bl-md bg-stone-100 px-4 py-3 text-sm text-teal-950"
                }
              >
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider opacity-60">
                  {message.role === "agent" ? "Tú" : "Cliente BR"}
                </p>
                {message.content}
              </motion.div>
            ))}
          </AnimatePresence>
          {loading && (
            <p className="text-xs font-medium text-teal-900/50">El cliente está escribiendo…</p>
          )}
        </div>
        {!score && (
          <div className="border-t border-teal-900/8 p-4">
            <div className="flex gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Responde en português brasileiro…"
                rows={2}
                className="min-h-[64px] flex-1 resize-none rounded-2xl border border-teal-900/15 bg-[var(--sand)] px-4 py-3 text-sm outline-none ring-teal-700/30 focus:ring-2"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void send();
                  }
                }}
              />
              <div className="flex flex-col gap-2">
                <Button onClick={() => void send()} disabled={loading || !input.trim()}>
                  Enviar
                </Button>
                <Button variant="secondary" onClick={() => void finishNow()} disabled={loading || turns === 0}>
                  Evaluar
                </Button>
              </div>
            </div>
            <p className="mt-2 text-xs text-teal-900/50">
              Tip: tras ~3 turnos puedes pedir evaluación. Enter envía · Shift+Enter nueva línea.
            </p>
          </div>
        )}
      </section>

      <aside className="space-y-4">
        <div className="rounded-3xl border border-teal-900/10 bg-white p-5 shadow-sm">
          <h2 className="font-[family-name:var(--font-display)] text-lg font-bold text-teal-950">
            Escenario
          </h2>
          <p className="mt-2 text-sm text-teal-900/70">{scenario.situation}</p>
          <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-teal-900/45">
            Dificultad · {difficultyLabel(scenario.difficulty)}
          </p>
          <ul className="mt-4 space-y-2">
            {(scenario.evaluation_rubric.focus ?? []).map((focus) => (
              <li key={focus} className="rounded-xl bg-teal-50 px-3 py-2 text-sm text-teal-900">
                {focus}
              </li>
            ))}
          </ul>
        </div>

        {score && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border border-teal-900/10 bg-white p-5 shadow-sm"
          >
            <h2 className="font-[family-name:var(--font-display)] text-lg font-bold text-teal-950">
              Feedback
            </h2>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <ScoreRing score={score.overall} label="Overall" />
              <ScoreRing score={score.empathy} label="Empatía" />
              <ScoreRing score={score.tone} label="Tono" />
              <ScoreRing score={score.culture} label="Cultura" />
            </div>
            <p className="mt-4 text-sm text-teal-900/80">{score.feedback}</p>
            <ul className="mt-3 space-y-2">
              {score.suggestions.map((s) => (
                <li key={s} className="rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-950">
                  {s}
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </aside>
    </div>
  );
}
