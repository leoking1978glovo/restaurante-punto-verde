import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import { Hero } from "@/components/site/Hero";
import { Marquee } from "@/components/site/Marquee";
import { Dishes } from "@/components/site/Dishes";
import { MenuPreview } from "@/components/site/MenuPreview";
import { Story } from "@/components/site/Story";
import { VideoSection } from "@/components/site/VideoSection";
import { Reservation } from "@/components/site/Reservation";
import { MapSection } from "@/components/site/MapSection";
import { Footer } from "@/components/site/Footer";

const title = "Restaurante Punto Verde | Comida colombiana en Almería";
const description =
  "Restaurante colombiano en Almería. Sancocho, bandeja paisa, arepas y platos típicos con sazón de casa, en C. Miguel Rúa 64. Martes a domingo de 12:00 a 16:30. ¡Reserva tu mesa!";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "restaurant" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="bg-ink">
      <Navbar />
      <main>
        <Hero />
        <Marquee />
        <Dishes />
        <MenuPreview />
        <Story />
        <VideoSection />
        <Reservation />
        <MapSection />
      </main>
      <Footer />
    </div>
  );
}