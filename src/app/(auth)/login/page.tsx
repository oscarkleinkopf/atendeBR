import { Suspense } from "react";
import LoginPage from "./login-client";

export default function Page() {
  return (
    <Suspense fallback={<div className="grid min-h-screen place-items-center text-teal-900">Cargando…</div>}>
      <LoginPage />
    </Suspense>
  );
}
