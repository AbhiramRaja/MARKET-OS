import { useEffect, useState } from "react";
import { fetchAuthSession } from "aws-amplify/auth";
import LoginPage from "./LoginPage";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<"checking"|"signedOut"|"signedIn">("checking");
  useEffect(() => {
    (async () => {
      try {
        const s = await fetchAuthSession();
        const t = s.tokens?.idToken?.toString();
        setStatus(t ? "signedIn" : "signedOut");
      } catch {
        setStatus("signedOut");
      }
    })();
  }, []);
  if (status === "checking") return <div className="p-8 text-center">Checking session…</div>;
  if (status === "signedOut") return <LoginPage />;
  return <>{children}</>;
}
