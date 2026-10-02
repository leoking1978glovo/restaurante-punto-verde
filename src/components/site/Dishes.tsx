import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useMotionValue, animate } from "motion/react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { dishes } from "@/data/restaurant";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import type { Dish } from "@/data/restaurant";

const GAP = 24; // gap-6

export function Dishes() {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const [maxDrag, setMaxDrag] = useState(0);
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);

  const measure = useCallback(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track) return;
    setMaxDrag(Math.max(0, track.scrollWidth - viewport.clientWidth));
  }, []);

  useEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure]);

  const itemWidth = () => {
    const track = trackRef.current;
    if (!track || track.children.length === 0) return 400;
    return (track.children[0] as HTMLElement).offsetWidth + GAP;
  };

  const snapTo = useCallback(
    (target: number) => {
      const clamped = Math.max(-maxDrag, Math.min(0, target));
      const step = itemWidth();
      const snapped = Math.round(clamped / step) * step;
      animate(x, Math.max(-maxDrag, Math.min(0, snapped)), {
        type: "spring",
        stiffness: 300,
        damping: 32,
      });
    },
    [maxDrag, x],
  );

  const onDragEnd = () => {
    const velocity = x.getVelocity();
    const projected = x.get() + velocity * 0.2;
    snapTo(projected);
  };

  const go = (dir: 1 | -1) => {
    snapTo(x.get() - dir * itemWidth());
  };

  return (
    <section className="bg-ink py-24 md:py-40">
      <div className="mx-auto max-w-[1600px] px-6 md:px-12">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <motion.h2
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
            className="text-[clamp(2.75rem,8vw,6rem)] text-cream"
          >
            Platos <span className="text-fire">tradicionales</span>
          </motion.h2>
          <div className="flex items-center gap-6">
            <p className="text-sm tracking-widest text-cream/50 uppercase">Arrastra →</p>
            <div className="hidden gap-3 md:flex">
              <Button
                type="button"
                variant="outline"
                onClick={() => go(-1)}
                aria-label="Anterior"
                className="h-12 w-12 rounded-full border-cream/20 bg-transparent p-0 text-cream hover:border-primary hover:bg-primary hover:text-ink"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => go(1)}
                aria-label="Siguiente"
                className="h-12 w-12 rounded-full border-cream/20 bg-transparent p-0 text-cream hover:border-primary hover:bg-primary hover:text-ink"
              >
                <ArrowRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div ref={viewportRef} className="mt-14 overflow-hidden px-6 pb-4 md:px-12">
        <motion.div
          ref={trackRef}
          drag="x"
          style={{ x }}
          dragConstraints={{ left: -maxDrag, right: 0 }}
          dragElastic={0.08}
          onDragEnd={onDragEnd}
          className="flex cursor-grab touch-pan-y gap-6 active:cursor-grabbing"
        >
          {dishes.map((dish, i) => (
            <motion.article
              key={dish.name}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, delay: (i % 3) * 0.1 }}
              className="group relative w-[300px] shrink-0 overflow-hidden rounded-2xl bg-cream/5 md:w-[380px]"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={dish.image}
                  alt={dish.name}
                  loading="lazy"
                  draggable={false}
                  width={800}
                  height={600}
                  className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                {dish.tag && (
                  <span className="absolute top-4 left-4 rounded-full bg-secondary px-4 py-1.5 font-display text-xs tracking-tight text-ink uppercase">
                    {dish.tag}
                  </span>
                )}
                <div className="absolute inset-x-0 bottom-0 flex translate-y-full justify-center pb-5 transition-transform duration-300 ease-out group-hover:translate-y-0 group-focus-within:translate-y-0">
                  <Button
                    type="button"
                    onClick={() => setSelectedDish(dish)}
                    onPointerDownCapture={(event) => event.stopPropagation()}
                    className="rounded-full px-8 py-3 font-display text-sm text-primary-foreground uppercase shadow-lg"
                  >
                    Ver detalles
                  </Button>
                </div>
              </div>
              <div className="flex items-start justify-between gap-4 p-6">
                <div>
                  <h3 className="text-2xl text-cream">{dish.name}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-cream/60">{dish.description}</p>
                </div>
                <span className="shrink-0 font-display text-xl text-primary">{dish.price}</span>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </div>
      <Dialog open={selectedDish !== null} onOpenChange={(open) => { if (!open) setSelectedDish(null); }}>
        <DialogContent className="overflow-hidden border-border bg-background p-0 text-foreground">
          {selectedDish && (
            <>
              <img src={selectedDish.image} alt={selectedDish.name} className="aspect-[4/3] w-full object-cover" />
              <div className="p-6">
                <DialogTitle className="font-display text-3xl">{selectedDish.name}</DialogTitle>
                <DialogDescription className="mt-3 text-base leading-relaxed">{selectedDish.description}</DialogDescription>
                <p className="mt-5 font-display text-2xl text-primary">{selectedDish.price}</p>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
