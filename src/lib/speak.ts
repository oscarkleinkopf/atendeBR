/** Pronunciación pt-BR — adaptado del speak.ts de Ulpan (hebreo → portugués). */

export type SpeakResult = "ok" | "unsupported" | "empty";

let currentAudio: HTMLAudioElement | null = null;
let voicesReady: Promise<SpeechSynthesisVoice[]> | null = null;
let proxyKnownDead = false;
const ttsBlobCache = new Map<string, string>();

function normalizePt(text: string): string {
  return text
    .replace(/[""']/g, "")
    .replace(/[־–—]/g, " ")
    .replace(/[?!¡¿.,;:()[\]{}]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 180);
}

function stopAll(): void {
  if (currentAudio) {
    try {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    } catch {
      /* ignore */
    }
    currentAudio.removeAttribute("src");
    currentAudio.load();
    currentAudio = null;
  }
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

function googleTtsUrl(text: string): string {
  const q = encodeURIComponent(text);
  return `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=pt-BR&q=${q}`;
}

async function fetchWithTimeout(url: string, ms: number): Promise<Response | null> {
  const ctrl = new AbortController();
  const timer = window.setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, { signal: ctrl.signal });
  } catch {
    return null;
  } finally {
    window.clearTimeout(timer);
  }
}

function playHtmlAudio(src: string, timeoutMs = 2500): Promise<SpeakResult> {
  return new Promise((resolve) => {
    stopAll();
    const audio = document.createElement("audio");
    audio.preload = "auto";
    audio.setAttribute("referrerpolicy", "no-referrer");
    audio.crossOrigin = "anonymous";
    audio.src = src;
    currentAudio = audio;

    let settled = false;
    const finish = (result: SpeakResult) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      if (currentAudio === audio) currentAudio = null;
      resolve(result);
    };

    const timer = window.setTimeout(() => {
      if (!audio.paused && !audio.ended) return;
      finish("unsupported");
    }, timeoutMs);

    audio.onended = () => finish("ok");
    audio.onerror = () => finish("unsupported");
    audio.onplaying = () => window.clearTimeout(timer);
    void audio.play().then(
      () => undefined,
      () => finish("unsupported"),
    );
  });
}

async function playBlob(blob: Blob): Promise<SpeakResult> {
  if (blob.size < 400) return "unsupported";
  const url = URL.createObjectURL(blob);
  return playHtmlAudio(url, 4000);
}

async function speakViaProxy(text: string): Promise<SpeakResult | null> {
  if (proxyKnownDead) return null;
  try {
    const endpoint = new URL("/api/tts", window.location.origin);
    endpoint.searchParams.set("q", text);
    endpoint.searchParams.set("tl", "pt-BR");
    const res = await fetchWithTimeout(endpoint.toString(), 1200);
    if (!res || !res.ok) {
      proxyKnownDead = true;
      return null;
    }
    const type = res.headers.get("content-type") || "";
    if (!type.includes("audio")) {
      proxyKnownDead = true;
      return null;
    }
    return await playBlob(await res.blob());
  } catch {
    proxyKnownDead = true;
    return null;
  }
}

function getPtVoiceSync(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  return (
    voices.find((v) => v.lang.toLowerCase() === "pt-br") ??
    voices.find((v) => v.lang.toLowerCase().startsWith("pt")) ??
    voices.find((v) => /brazil|portugu/i.test(v.name)) ??
    null
  );
}

function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  if (typeof window === "undefined" || !window.speechSynthesis) return Promise.resolve([]);
  const synth = window.speechSynthesis;
  const now = synth.getVoices();
  if (now.length) return Promise.resolve(now);
  if (!voicesReady) {
    voicesReady = new Promise((resolve) => {
      const done = () => {
        synth.removeEventListener("voiceschanged", done);
        resolve(synth.getVoices());
      };
      synth.addEventListener("voiceschanged", done);
      window.setTimeout(() => resolve(synth.getVoices()), 400);
    });
  }
  return voicesReady;
}

async function speakViaWebSpeech(
  text: string,
  voice?: SpeechSynthesisVoice | null,
): Promise<SpeakResult> {
  if (typeof window === "undefined" || !window.speechSynthesis) return "unsupported";
  const pt =
    voice ??
    getPtVoiceSync() ??
    (await loadVoices()).find(
      (v) => v.lang.toLowerCase().startsWith("pt") || /brazil|portugu/i.test(v.name),
    );
  if (!pt) return "unsupported";

  const synth = window.speechSynthesis;
  synth.cancel();

  return await new Promise((resolve) => {
    const utter = new SpeechSynthesisUtterance(text);
    utter.voice = pt;
    utter.lang = pt.lang || "pt-BR";
    utter.rate = 0.95;
    let settled = false;
    const finish = (result: SpeakResult) => {
      if (settled) return;
      settled = true;
      resolve(result);
    };
    utter.onend = () => finish("ok");
    utter.onerror = () => finish("unsupported");
    try {
      synth.speak(utter);
      window.setTimeout(() => {
        if (!settled && !synth.speaking) finish("unsupported");
      }, 900);
    } catch {
      finish("unsupported");
    }
  });
}

async function fetchGoogleTtsBlob(text: string): Promise<Blob | null> {
  const target = googleTtsUrl(text);
  const proxies = [
    `https://corsproxy.io/?${encodeURIComponent(target)}`,
    `https://api.allorigins.win/raw?url=${encodeURIComponent(target)}`,
  ];

  for (const proxy of proxies) {
    const res = await fetchWithTimeout(proxy, 1800);
    if (!res || !res.ok) continue;
    try {
      const blob = await res.blob();
      if (blob.size < 800) continue;
      return blob;
    } catch {
      /* next */
    }
  }
  return null;
}

export function prefetchPortuguese(text: string): void {
  const clean = normalizePt(text);
  if (!clean || ttsBlobCache.has(clean)) return;
  void (async () => {
    const blob = await fetchGoogleTtsBlob(clean);
    if (!blob) return;
    ttsBlobCache.set(clean, URL.createObjectURL(blob));
  })();
}

export async function speakPortuguese(text: string): Promise<SpeakResult> {
  const clean = normalizePt(text);
  if (!clean) return "empty";

  stopAll();

  const cached = ttsBlobCache.get(clean);
  if (cached) {
    const played = await playHtmlAudio(cached, 4000);
    if (played === "ok") return "ok";
    ttsBlobCache.delete(clean);
  }

  const ready = getPtVoiceSync();
  if (ready) {
    const local = await speakViaWebSpeech(clean, ready);
    if (local === "ok") return "ok";
  }

  const viaProxy = await speakViaProxy(clean);
  if (viaProxy === "ok") return "ok";

  const blob = await fetchGoogleTtsBlob(clean);
  if (blob) {
    const url = URL.createObjectURL(blob);
    ttsBlobCache.set(clean, url);
    const played = await playHtmlAudio(url, 4000);
    if (played === "ok") return "ok";
  }

  const viaGoogle = await playHtmlAudio(googleTtsUrl(clean), 1200);
  if (viaGoogle === "ok") return "ok";

  return speakViaWebSpeech(clean);
}

export function stopSpeaking(): void {
  stopAll();
}
