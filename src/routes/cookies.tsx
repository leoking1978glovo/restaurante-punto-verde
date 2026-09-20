import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/cookies")({
  head: () => ({
    meta: [{ title: "Política de Cookies · Restaurante Punto Verde" }],
  }),
  component: CookiesPage,
});

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="text-xl font-bold text-primary uppercase tracking-wide">{title}</h2>
      <div className="mt-3 space-y-3 leading-relaxed text-[#333333]">{children}</div>
    </section>
  );
}

function CookiesPage() {
  return (
    <div className="min-h-screen bg-cream">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> Volver a la web
        </Link>

        <h1 className="mt-8 text-4xl font-bold text-ink">Política de Cookies</h1>
        <p className="mt-2 text-sm text-[#666666]">
          Restaurante Punto Verde · Última actualización: septiembre de 2026
        </p>

        <Section title="1. Qué son las cookies y tecnologías similares">
          <p>
            Las cookies y tecnologías similares (como el almacenamiento local del navegador) son
            pequeños datos que se guardan en tu dispositivo cuando visitas un sitio web.
          </p>
        </Section>

        <Section title="2. Cookies y almacenamiento que utiliza este sitio web">
          <p>
            <strong>Técnicas y funcionales (no requieren consentimiento):</strong>
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              <strong>Carrito de la compra:</strong> se guarda en tu navegador el contenido de tu
              carrito para que no se pierda mientras navegas por la web.
            </li>
            <li>
              <strong>Asistente virtual (chat):</strong> se guarda en tu navegador una clave técnica
              que permite mantener la conversación con el asistente mientras navegas. Al cerrar el
              chat con el botón X, esta clave se elimina y la siguiente conversación comienza de
              cero.
            </li>
          </ul>
          <p>
            <strong>Analítica (requieren tu consentimiento):</strong>
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              <strong>Google Analytics (Google Ireland Ltd.):</strong> cookies como _ga y _ga_* que
              recogen estadísticas anónimas de uso del sitio (páginas visitadas, tiempo de
              navegación). Duración: hasta 2 años. Estas cookies solo se instalan si das tu
              consentimiento. Más información en la política de privacidad de Google.
            </li>
          </ul>
        </Section>

        <Section title="3. Cómo aceptar, rechazar o retirar el consentimiento">
          <p>
            Al entrar por primera vez en el sitio se te muestra un aviso donde puedes aceptar o
            rechazar las cookies de analítica. Puedes retirar tu consentimiento en cualquier momento
            borrando las cookies desde la configuración de tu navegador (opción de borrar datos de
            navegación).
          </p>
        </Section>

        <Section title="4. Actualizaciones">
          <p>
            Esta política puede actualizarse si se incorporan nuevas cookies o servicios. Te
            recomendamos revisarla periódicamente.
          </p>
        </Section>
      </div>
    </div>
  );
}