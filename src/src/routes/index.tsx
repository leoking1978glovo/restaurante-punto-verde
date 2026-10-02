import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import { Hero } from "@/components/site/Hero";
import { Marquee } from "@/components/site/Marquee";
import { Dishes } from "@/components/site/Dishes";
import { MenuPreview } from "@/components/site/MenuPreview";
import { Story } from "@/components/site/Story";
import { VideoSection } from "@/components/site/VideoSection";
import { Reservation } from "@/components/site/Reservation";
import { Footer } from "@/components/site/Footer";

const title = "Punto Verde";
const description =
  "Punto Verde — Cocina con alma y sabor natural. Un espacio donde cada plato cuenta una historia.";

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
      </main>
      <Footer />
    </div>
  );
}
