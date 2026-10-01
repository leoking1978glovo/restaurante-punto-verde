import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

// Volumen matizado: 0.1 = 10% (muy suave). Si aun te parece alto, baja a 0.06.
const VOLUME = 0.06;

export function AmbientAudio() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const mutedRef = useRef(true);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    const audio = new Audio("/sanjuanero.mp3");
    audio.loop = true;
    audio.volume = VOLUME;
    audioRef.current = audio;

    const onVisibility = () => {
      if (document.hidden) {
        audio.pause();
      } else if (!mutedRef.current) {
        void audio.play().catch(() => {});
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
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
      onClick={toggle}
      aria-label={muted ? "Activar música" : "Silenciar música"}
      title={muted ? "Activar música" : "Silenciar música"}
      className="fixed top-20 right-4 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-ink/10 bg-white/90 text-ink shadow-lg backdrop-blur transition-colors hover:bg-white"
    >
      {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
    </button>
  );
}