"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { setDemoRole } from "@/lib/demo-auth";

function CallbackInner() {
  const router = useRouter();
  const search = useSearchParams();
  const [message, setMessage] = useState("Confirmando sesión…");

  useEffect(() => {
    const next = search.get("next") || "/dashboard";
    const code = search.get("code");

    void (async () => {
      const supabase = createClient();
      if (supabase && code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          setMessage(error.message);
          return;
        }
        setDemoRole("collaborator");
        router.replace(next);
        return;
      }

      // Sin code (Pages / hash flow): si ya hay sesión, entra; si no, login.
      if (supabase) {
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          setDemoRole("collaborator");
          router.replace(next);
          return;
        }
      }
      setMessage("No hay sesión. Volviendo al login…");
      router.replace("/login");
    })();
  }, [router, search]);

  return (
    <div className="grid min-h-screen place-items-center bg-[var(--sand)] text-teal-900">
      {message}
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div className="grid min-h-screen place-items-center">Cargando…</div>}>
      <CallbackInner />
    </Suspense>
  );
}
