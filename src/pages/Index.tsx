import { useState, useEffect, useRef } from "react";
import Icon from "@/components/ui/icon";

const BG_IMAGE =
  "https://cdn.poehali.dev/projects/fc57372d-59e0-429a-8d8b-89671d7994c5/files/dca192fc-ccf4-4554-b167-64544980bfae.jpg";

const WEDDING_DATE = new Date("2026-06-14T14:00:00");

function useCountdown(target: Date) {
  const [diff, setDiff] = useState(target.getTime() - Date.now());
  useEffect(() => {
    const id = setInterval(() => setDiff(target.getTime() - Date.now()), 1000);
    return () => clearInterval(id);
  }, [target]);
  const total = Math.max(0, diff);
  const days = Math.floor(total / 86400000);
  const hours = Math.floor((total % 86400000) / 3600000);
  const minutes = Math.floor((total % 3600000) / 60000);
  const seconds = Math.floor((total % 60000) / 1000);
  return { days, hours, minutes, seconds };
}

function FloatingPetals() {
  const petals = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    left: `${(i * 8.3) % 100}%`,
    top: `${(i * 13 + 5) % 100}%`,
    size: `${14 + (i % 4) * 5}px`,
    opacity: 0.15 + (i % 5) * 0.07,
    delay: `${(i % 6) * 1.1}s`,
    duration: `${6 + (i % 4) * 2}s`,
  }));
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {petals.map((p) => (
        <div
          key={p.id}
          className="absolute select-none"
          style={{
            left: p.left,
            top: p.top,
            fontSize: p.size,
            opacity: p.opacity,
            animation: `floatPetal ${p.duration} ease-in-out ${p.delay} infinite alternate`,
          }}
        >
          🌸
        </div>
      ))}
    </div>
  );
}

function CountdownBlock({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div
        className="text-4xl md:text-5xl font-light tabular-nums"
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          color: "#c5a878",
          textShadow: "0 2px 20px rgba(197,168,120,0.5)",
        }}
      >
        {String(value).padStart(2, "0")}
      </div>
      <div
        className="text-xs uppercase mt-1"
        style={{
          fontFamily: "'Montserrat', sans-serif",
          color: "rgba(245,237,224,0.6)",
          letterSpacing: "0.2em",
        }}
      >
        {label}
      </div>
    </div>
  );
}

function MusicPlayer() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const togglePlayer = () => {
    if (!isMounted) setIsMounted(true);
    setIsOpen((v) => !v);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {isOpen && isMounted && (
        <div
          style={{
            borderRadius: "16px",
            overflow: "hidden",
            boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
            border: "1px solid rgba(197,168,120,0.3)",
            animation: "scaleUp 0.3s cubic-bezier(0.34,1.56,0.64,1)",
            transformOrigin: "bottom right",
          }}
        >
          <iframe
            src="https://music.yandex.ru/iframe/#playlist/yamusic-bestsongs/1048"
            width="300"
            height="320"
            frameBorder="0"
            allow="autoplay"
            style={{ display: "block" }}
            title="Яндекс.Музыка — Свадьба"
          />
        </div>
      )}
      <button
        onClick={togglePlayer}
        className="w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
        style={{
          background: "linear-gradient(135deg, #c5a878 0%, #e8d5a3 50%, #c5a878 100%)",
          boxShadow: "0 4px 30px rgba(197,168,120,0.6)",
          color: "#2a1f14",
        }}
        aria-label="Плеер"
      >
        <Icon name={isOpen ? "X" : "Music2"} size={22} />
      </button>
    </div>
  );
}

export default function Index() {
  const { days, hours, minutes, seconds } = useCountdown(WEDDING_DATE);

  return (
    <>
      <style>{`
        @keyframes floatPetal {
          0% { transform: translateY(0) rotate(0deg); }
          100% { transform: translateY(-28px) rotate(15deg); }
        }
        @keyframes scaleUp {
          from { transform: scale(0.6); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes fadeRise {
          from { opacity: 0; transform: translateY(28px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .anim-0 { animation: fadeRise 1.1s ease 0s forwards; opacity: 0; }
        .anim-1 { animation: fadeRise 1.1s ease 0.25s forwards; opacity: 0; }
        .anim-2 { animation: fadeRise 1.1s ease 0.5s forwards; opacity: 0; }
        .anim-3 { animation: fadeRise 1.1s ease 0.75s forwards; opacity: 0; }
        .anim-4 { animation: fadeRise 1.1s ease 1s forwards; opacity: 0; }
        .gold-line {
          display: block;
          width: 80px;
          height: 1px;
          background: linear-gradient(90deg, transparent, #c5a878, transparent);
          margin: 0 auto;
        }
      `}</style>

      <main style={{ minHeight: "100vh", background: "#1a130c", fontFamily: "'Montserrat', sans-serif", overflowX: "hidden" }}>

        {/* HERO */}
        <section style={{ position: "relative", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "0 24px" }}>
          <div
            style={{
              position: "absolute", inset: 0,
              backgroundImage: `url(${BG_IMAGE})`,
              backgroundSize: "cover", backgroundPosition: "center",
            }}
          />
          <div
            style={{
              position: "absolute", inset: 0,
              background: "linear-gradient(to bottom, rgba(20,14,8,0.55) 0%, rgba(20,14,8,0.3) 40%, rgba(20,14,8,0.7) 80%, rgba(20,14,8,0.95) 100%)",
            }}
          />
          <FloatingPetals />

          <div style={{ position: "relative", zIndex: 10, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <p className="anim-0" style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300, color: "rgba(245,237,224,0.65)", textTransform: "uppercase", letterSpacing: "0.35em", fontSize: "11px", marginBottom: "28px" }}>
              Приглашение на бракосочетание
            </p>

            <span className="gold-line anim-1" style={{ marginBottom: "28px" }} />

            <h1 className="anim-1" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(54px, 12vw, 110px)", fontWeight: 300, color: "#f5ede0", lineHeight: 1, textShadow: "0 4px 40px rgba(20,14,8,0.8)", margin: 0 }}>
              Анастасия
            </h1>
            <p className="anim-2" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(24px, 5vw, 44px)", fontStyle: "italic", fontWeight: 300, color: "#c5a878", margin: "8px 0 0" }}>
              &amp; Михаил
            </p>

            <span className="gold-line anim-2" style={{ marginTop: "28px", marginBottom: "28px" }} />

            <div className="anim-3">
              <p style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 400, color: "#f5ede0", letterSpacing: "0.25em", fontSize: "clamp(13px, 2.5vw, 17px)", margin: 0 }}>
                14 ИЮНЯ 2026
              </p>
              <p style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300, color: "rgba(245,237,224,0.5)", letterSpacing: "0.2em", fontSize: "12px", marginTop: "6px" }}>
                Москва · Усадьба Кусково
              </p>
            </div>

            {/* Countdown */}
            <div className="anim-4" style={{ marginTop: "52px" }}>
              <p style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300, color: "rgba(245,237,224,0.45)", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.3em", marginBottom: "20px" }}>
                До торжества осталось
              </p>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "clamp(16px, 4vw, 40px)" }}>
                <CountdownBlock value={days} label="дней" />
                <span style={{ color: "rgba(197,168,120,0.35)", fontSize: "28px", fontWeight: 300, marginTop: "4px" }}>·</span>
                <CountdownBlock value={hours} label="часов" />
                <span style={{ color: "rgba(197,168,120,0.35)", fontSize: "28px", fontWeight: 300, marginTop: "4px" }}>·</span>
                <CountdownBlock value={minutes} label="минут" />
                <span style={{ color: "rgba(197,168,120,0.35)", fontSize: "28px", fontWeight: 300, marginTop: "4px" }}>·</span>
                <CountdownBlock value={seconds} label="секунд" />
              </div>
            </div>
          </div>

          {/* Scroll hint */}
          <div style={{ position: "absolute", bottom: "32px", left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", opacity: 0.4 }}>
            <div style={{ width: "1px", height: "48px", background: "linear-gradient(to bottom, transparent, #c5a878, transparent)", animation: "floatPetal 2s ease-in-out infinite alternate" }} />
          </div>
        </section>

        {/* DETAILS */}
        <section style={{ position: "relative", padding: "96px 24px", background: "linear-gradient(180deg, #1a130c 0%, #221910 50%, #1a130c 100%)" }}>
          <div style={{ maxWidth: "720px", margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "56px" }}>
              <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontWeight: 300, color: "#c5a878", fontSize: "clamp(24px, 4vw, 36px)", margin: 0, lineHeight: 1.5 }}>
                С радостью приглашаем вас<br />разделить этот особенный день
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
              {[
                { icon: "Calendar", title: "Дата", value: "14 июня 2026", sub: "Воскресенье" },
                { icon: "Clock", title: "Время", value: "14:00", sub: "Регистрация начинается" },
                { icon: "MapPin", title: "Место", value: "Усадьба Кусково", sub: "Москва, ул. Юности, 2" },
              ].map((item) => (
                <div
                  key={item.title}
                  style={{
                    background: "rgba(245,237,224,0.05)",
                    border: "1px solid rgba(197,168,120,0.18)",
                    borderRadius: "18px",
                    padding: "28px 20px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    textAlign: "center",
                    gap: "12px",
                    backdropFilter: "blur(12px)",
                  }}
                >
                  <div style={{ width: "42px", height: "42px", borderRadius: "50%", background: "rgba(197,168,120,0.12)", border: "1px solid rgba(197,168,120,0.28)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon name={item.icon as "Calendar" | "Clock" | "MapPin"} size={18} style={{ color: "#c5a878" }} />
                  </div>
                  <div>
                    <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.2em", color: "rgba(245,237,224,0.38)", margin: "0 0 4px" }}>
                      {item.title}
                    </p>
                    <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "20px", color: "#f5ede0", fontWeight: 300, margin: 0 }}>
                      {item.value}
                    </p>
                    <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "11px", color: "rgba(245,237,224,0.45)", marginTop: "4px" }}>
                      {item.sub}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <div style={{ marginTop: "56px", textAlign: "center" }}>
              <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "13px", color: "rgba(245,237,224,0.45)", marginBottom: "24px", letterSpacing: "0.05em" }}>
                Пожалуйста, подтвердите своё присутствие до 1 июня
              </p>
              <button
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontSize: "12px",
                  textTransform: "uppercase",
                  letterSpacing: "0.25em",
                  padding: "16px 40px",
                  borderRadius: "100px",
                  border: "none",
                  cursor: "pointer",
                  background: "linear-gradient(135deg, #c5a878 0%, #e8d5a3 50%, #c5a878 100%)",
                  color: "#2a1f14",
                  fontWeight: 500,
                  boxShadow: "0 4px 30px rgba(197,168,120,0.35)",
                  transition: "transform 0.2s, box-shadow 0.2s",
                }}
                onMouseEnter={(e) => { (e.target as HTMLElement).style.transform = "scale(1.05)"; (e.target as HTMLElement).style.boxShadow = "0 8px 40px rgba(197,168,120,0.5)"; }}
                onMouseLeave={(e) => { (e.target as HTMLElement).style.transform = "scale(1)"; (e.target as HTMLElement).style.boxShadow = "0 4px 30px rgba(197,168,120,0.35)"; }}
              >
                Подтвердить присутствие
              </button>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer style={{ padding: "48px 24px", textAlign: "center", borderTop: "1px solid rgba(197,168,120,0.1)" }}>
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontWeight: 300, color: "#c5a878", fontSize: "24px", margin: 0 }}>
            Анастасия &amp; Михаил
          </p>
          <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "10px", color: "rgba(245,237,224,0.25)", marginTop: "12px", letterSpacing: "0.3em", textTransform: "uppercase" }}>
            14 · 06 · 2026
          </p>
        </footer>
      </main>

      <MusicPlayer />
    </>
  );
}
