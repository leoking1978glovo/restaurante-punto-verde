import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/aviso-legal")({
  head: () => ({
    meta: [{ title: "Aviso Legal · Restaurante Punto Verde" }],
  }),
  component: AvisoLegalPage,
});

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="text-xl font-bold text-primary uppercase tracking-wide">{title}</h2>
      <div className="mt-3 space-y-3 leading-relaxed text-[#333333]">{children}</div>
    </section>
  );
}

function AvisoLegalPage() {
  return (
    <div className="min-h-screen bg-cream">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> Volver a la web
        </Link>

        <h1 className="mt-8 text-4xl font-bold text-ink">Aviso Legal</h1>
        <p className="mt-2 text-sm text-[#666666]">
          Restaurante Punto Verde · Última actualización: septiembre de 2026
        </p>

        <Section title="1. Datos identificativos del titular">
          <p>
            En cumplimiento del artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios de la
            Sociedad de la Información y de Comercio Electrónico (LSSI-CE), se informa de los datos
            del titular de este sitio web:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Titular:</strong> {"<<CAMBIAR: NOMBRE O RAZÓN SOCIAL DEL TITULAR>>"}</li>
            <li><strong>NIF/CIF:</strong> {"<<CAMBIAR: NIF O CIF>>"}</li>
            <li><strong>Domicilio:</strong> C. Miguel Rúa, 64, 04009 Almería, España</li>
            <li><strong>Teléfono:</strong> +34 950 67 45 42</li>
            <li><strong>Correo electrónico:</strong> {"<<CAMBIAR: EMAIL DE CONTACTO>>"}</li>
          </ul>
        </Section>

        <Section title="2. Objeto">
          <p>
            Este sitio web tiene por objeto dar a conocer los productos y servicios del Restaurante
            Punto Verde, así como facilitar la realización de pedidos y reservas a través de un
            asistente virtual automatizado.
          </p>
        </Section>

        <Section title="3. Condiciones de uso">
          <p>
            El acceso y uso de este sitio web atribuye la condición de usuario e implica la
            aceptación de las presentes condiciones. El usuario se compromete a hacer un uso lícito
            del sitio y a no emplearlo para fines contrarios a la ley, la moral o el orden público.
          </p>
          <p>
            Los pedidos y reservas realizados a través del asistente virtual quedan sujetos a
            confirmación por parte del establecimiento. Los precios mostrados incluyen IVA y pueden
            variar; el precio definitivo será el vigente en el establecimiento.
          </p>
        </Section>

        <Section title="4. Propiedad intelectual">
          <p>
            Todos los contenidos de este sitio web (textos, imágenes, logotipos, vídeos y diseño)
            son titularidad del Restaurante Punto Verde o de terceros que han autorizado su uso, y
            están protegidos por la normativa de propiedad intelectual. Queda prohibida su
            reproducción, distribución o comunicación pública sin autorización expresa.
          </p>
        </Section>

        <Section title="5. Responsabilidad">
          <p>
            El titular no se responsabiliza de los daños que puedan derivarse de interferencias,
            omisiones, interrupciones o desconexiones en el funcionamiento del sitio web por causas
            ajenas a su control, ni del uso indebido que terceros puedan hacer de la información
            publicada.
          </p>
        </Section>

        <Section title="6. Legislación aplicable">
          <p>
            Las presentes condiciones se rigen por la legislación española. Para cualquier
            controversia serán competentes los juzgados y tribunales de Almería, salvo que la
            normativa de consumidores disponga otro fuero.
          </p>
        </Section>
      </div>
    </div>
  );
}