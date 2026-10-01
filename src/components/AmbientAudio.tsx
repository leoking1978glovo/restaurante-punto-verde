import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

// Volumen matizado: 0.1 = 10%. Ajusta entre 0.06 y 0.15 a gusto.
const VOLUME = 0.1;

export function AmbientAudio() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const mutedRef = useRef(true);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    const audio = new Audio("/sanjuanero.mp3");
    audio.loop = true;
    audio.volume = VOLUME;
    audioRef.current = audio;

    // Arranque en el primer gesto del visitante. Los navegadores prohiben
    // el autoplay con sonido puro; esto es lo maximo permitido y cubre
    // click, toque, tecla y scroll.
    const tryAutoStart = (e: Event) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest?.("[data-audio-btn]")) return; // no pisar el boton
      removeGestures();
      if (!mutedRef.current) return; // el usuario ya decidio
      mutedRef.current = false;
      setMuted(false);
      void audio.play().catch(() => {
        mutedRef.current = true;
        setMuted(true);
      });
    };

    const removeGestures = () => {
      document.removeEventListener("pointerdown", tryAutoStart);
      document.removeEventListener("touchstart", tryAutoStart);
      document.removeEventListener("click", tryAutoStart);
      document.removeEventListener("keydown", tryAutoStart);
      document.removeEventListener("scroll", tryAutoStart, true);
    };

    document.addEventListener("pointerdown", tryAutoStart);
    document.addEventListener("touchstart", tryAutoStart);
    document.addEventListener("click", tryAutoStart);
    document.addEventListener("keydown", tryAutoStart);
    document.addEventListener("scroll", tryAutoStart, true);

    const onVisibility = () => {
      if (document.hidden) {
        audio.pause();
      } else if (!mutedRef.current) {
        void audio.play().catch(() => {});
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      removeGestures();
      document.removeEventListener("visibilitychange", onVisibility);
      audio.pause();
      audioRef.current = null;
    };
  }, []);

  const toggle = () => {
    const next = !muted;
    mutedRef.current = next;
    setMuted(next);
    const audio = audioRef.current;
    if (!audio) return;
    if (next) {
      audio.pause();
    } else {
      void audio.play().catch(() => {
        mutedRef.current = true;
        setMuted(true);
      });
    }
  };

  return (
    <button
      type="button"
      data-audio-btn
      onClick={toggle}
      aria-label={muted ? "Activar música" : "Silenciar música"}
      title={muted ? "Activar música" : "Silenciar música"}
      className="fixed top-20 right-4 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-ink/10 bg-white/90 text-ink shadow-lg backdrop-blur transition-colors hover:bg-white"
    >
      {muted ? (
        <VolumeX className="h-5 w-5 animate-pulse" />
      ) : (
        <Volume2 className="h-5 w-5" />
      )}
    </button>
  );
}