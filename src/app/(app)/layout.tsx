import { AuthGate } from "@/components/layout/auth-gate";

export default function AppSectionLayout({ children }: { children: React.ReactNode }) {
  return <AuthGate>{children}</AuthGate>;
}
