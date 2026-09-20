import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/privacidad")({
  head: () => ({
    meta: [{ title: "Política de Privacidad · Restaurante Punto Verde" }],
  }),
  component: PrivacidadPage,
});

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="text-xl font-bold text-primary uppercase tracking-wide">{title}</h2>
      <div className="mt-3 space-y-3 leading-relaxed text-[#333333]">{children}</div>
    </section>
  );
}

function PrivacidadPage() {
  return (
    <div className="min-h-screen bg-cream">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> Volver a la web
        </Link>

        <h1 className="mt-8 text-4xl font-bold text-ink">Política de Privacidad</h1>
        <p className="mt-2 text-sm text-[#666666]">
          Restaurante Punto Verde · Última actualización: septiembre de 2026
        </p>

        <Section title="1. Responsable del tratamiento">
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Responsable:</strong> {"<<CAMBIAR: NOMBRE O RAZÓN SOCIAL DEL TITULAR>>"}</li>
            <li><strong>NIF/CIF:</strong> {"<<CAMBIAR: NIF O CIF>>"}</li>
            <li><strong>Domicilio:</strong> C. Miguel Rúa, 64, 04007 Almería, España</li>
            <li><strong>Correo electrónico:</strong> {"<<CAMBIAR: EMAIL DE CONTACTO>>"}</li>
          </ul>
        </Section>

        <Section title="2. Datos que recogemos y finalidad">
          <p>
            Cuando realizas un pedido o una reserva a través del asistente virtual del sitio web,
            podemos tratar los siguientes datos personales: nombre, número de teléfono, dirección de
            correo electrónico y el contenido de tu pedido o reserva.
          </p>
          <p>
            La finalidad del tratamiento es exclusivamente la gestión de tu pedido o reserva, así
            como la comunicación contigo en relación con el mismo. La base jurídica es la ejecución
            del servicio solicitado por ti (art. 6.1.b del RGPD).
          </p>
        </Section>

        <Section title="3. Asistente virtual con inteligencia artificial">
          <p>
            El chat de este sitio web funciona mediante un asistente virtual con inteligencia
            artificial llamado Santiago. No estás hablando con una persona: las respuestas son
            generadas automáticamente por un sistema de IA.
          </p>
          <p>
            El servicio del asistente es prestado por un proveedor tecnológico externo (Relevance
            AI), que actúa como encargado del tratamiento y puede procesar las conversaciones en
            servidores ubicados fuera de la Unión Europea, con las garantías adecuadas conforme al
            RGPD. Te recomendamos no compartir en el chat datos especialmente sensibles (salud,
            datos bancarios, etc.).
          </p>
        </Section>

        <Section title="4. Conservación de los datos">
          <p>
            Los datos se conservarán durante el tiempo necesario para gestionar tu pedido o reserva
            y, una vez finalizado, durante los plazos legalmente exigibles para atender posibles
            responsabilidades.
          </p>
        </Section>

        <Section title="5. Tus derechos">
          <p>
            Puedes ejercer tus derechos de acceso, rectificación, supresión, oposición, limitación y
            portabilidad escribiendo a {"<<CAMBIAR: EMAIL DE CONTACTO>>"}, adjuntando un documento
            que acredite tu identidad. También tienes derecho a reclamar ante la Agencia Española de
            Protección de Datos (www.aepd.es).
          </p>
        </Section>
      </div>
    </div>
  );
}