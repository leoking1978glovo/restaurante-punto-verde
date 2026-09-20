import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Cookie } from "lucide-react";

const CONSENT_KEY = "pv-cookie-consent";
const GA_ID = "G-Y3V39LHJZZ";

type Consent = "accepted" | "rejected" | null;

function loadGoogleAnalytics() {
  if (document.getElementById("ga-script")) return;

  const script = document.createElement("script");
  script.id = "ga-script";
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  script.async = true;
  document.head.appendChild(script);

  const inline = document.createElement("script");
  inline.id = "ga-inline";
  inline.textContent = `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_ID}');`;
  document.head.appendChild(inline);
}

export function CookieBanner() {
  const [consent, setConsent] = useState<Consent>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(CONSENT_KEY) as Consent;
    if (stored === "accepted") {
      loadGoogleAnalytics();
    }
    setConsent(stored);
    setReady(true);
  }, []);

  const decide = (value: "accepted" | "rejected") => {
    localStorage.setItem(CONSENT_KEY, value);
    setConsent(value);
    if (value === "accepted") {
      loadGoogleAnalytics();
    }
  };

  if (!ready || consent !== null) return null;

  return (
    <div
      role="dialog"
      aria-label="Aviso de cookies"
      className="fixed bottom-0 left-0 right-0 z-[90] bg-ink border-t border-cream/15 shadow-2xl"
    >
      <div className="mx-auto max-w-[1600px] px-6 py-5 md:px-12 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3 max-w-2xl">
          <Cookie className="h-6 w-6 shrink-0 text-primary mt-0.5" />
          <p className="text-sm leading-relaxed text-cream/80">
            Usamos cookies propias necesarias para el funcionamiento de la web y cookies de{" "}
            <strong className="text-cream">Google Analytics</strong> para estadísticas anónimas de
            uso. Puedes aceptarlas o rechazarlas. Más información en nuestra{" "}
            <Link to="/cookies" className="underline text-cream hover:text-primary">
              Política de Cookies
            </Link>
            .
          </p>
        </div>
        <div className="flex shrink-0 gap-3">
          <button
            onClick={() => decide("rejected")}
            className="rounded-md border border-cream/30 px-5 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-cream/10"
          >
            Rechazar
          </button>
          <button
            onClick={() => decide("accepted")}
            className="rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
}