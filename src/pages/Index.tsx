import { useState, useEffect, useRef } from "react";

const WEDDING_DATE = new Date("2026-07-22T11:20:00");
const CHERUB_IMG = "https://cdn.poehali.dev/projects/fc57372d-59e0-429a-8d8b-89671d7994c5/files/709f0a29-c676-48f6-9500-3b3fa2f73350.jpg";
const AURORA_IMG = "https://cdn.poehali.dev/projects/fc57372d-59e0-429a-8d8b-89671d7994c5/bucket/261e3444-b41a-41a1-827a-5fc5d07a202f.jpeg";
const GUESTS_API = "https://functions.poehali.dev/9935c4a5-21a7-49c9-8947-4e964e307a6c";
// Прямая ссылка на трек Golden Brown (Slowed) GhalyProd
const TRACK_URL = "https://music.yandex.ru/search?text=GhalyProd+Golden+Brown+Slowed";

function useCountdown(target: Date) {
  const [diff, setDiff] = useState(target.getTime() - Date.now());
  useEffect(() => {
    const id = setInterval(() => setDiff(target.getTime() - Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const total = Math.max(0, diff);
  return {
    days: Math.floor(total / 86400000),
    hours: Math.floor((total % 86400000) / 3600000),
    minutes: Math.floor((total % 3600000) / 60000),
    seconds: Math.floor((total % 60000) / 1000),
  };
}

function MusicBar() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);

  const toggle = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current.play().catch(() => {});
      setPlaying(true);
    }
  };

  return (
    <div style={{ background: "#6b1429", padding: "16px 20px", textAlign: "center" }}>
      {/* Скрытый аудио-плеер через iframe Яндекс.Музыки */}
      <button
        onClick={toggle}
        style={{
          display: "inline-flex", alignItems: "center", gap: "10px",
          background: "#f5ede0", border: "none", borderRadius: "100px",
          padding: "14px 36px", cursor: "pointer",
          fontFamily: "'Montserrat', sans-serif", fontWeight: 500,
          fontSize: "13px", letterSpacing: "0.15em", textTransform: "uppercase",
          color: "#6b1429", boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
          transition: "transform 0.2s",
        }}
        onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.04)")}
        onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
      >
        <span style={{ fontSize: "15px" }}>{playing ? "⏸" : "▷"}</span>
        <span>♪</span>
        <span>{playing ? "Пауза" : "Включить музыку"}</span>
      </button>

      <p style={{
        fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic",
        color: "rgba(245,237,224,0.6)", fontSize: "13px", margin: "8px 0 4px",
      }}>
        {playing ? "Golden Brown (Slowed) — GhalyProd" : "Нажмите, чтобы включить музыку"}
      </p>

      <a
        href={TRACK_URL}
        target="_blank"
        rel="noreferrer"
        style={{
          fontFamily: "'Montserrat', sans-serif",
          fontSize: "11px",
          color: "rgba(245,237,224,0.4)",
          textDecoration: "underline",
          letterSpacing: "0.05em",
        }}
      >
        Открыть трек в Яндекс.Музыке ↗
      </a>

      {/* Встроенный плеер Яндекс.Музыка */}
      <div style={{ marginTop: "12px", display: "flex", justifyContent: "center" }}>
        <iframe
          src="https://music.yandex.ru/iframe/#search/GhalyProd%20Golden%20Brown%20Slowed/tracks"
          width="290"
          height="80"
          frameBorder="0"
          allow="autoplay"
          style={{ borderRadius: "12px", border: "1px solid rgba(245,237,224,0.15)" }}
          title="Яндекс.Музыка"
        />
      </div>
    </div>
  );
}

function CountdownBlock({ value, label }: { value: number; label: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: "52px" }}>
      <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(30px,8vw,46px)", fontWeight: 400, color: "#6b1429", lineHeight: 1 }}>
        {String(value).padStart(2, "0")}
      </span>
      <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "9px", textTransform: "uppercase", letterSpacing: "0.15em", color: "#9b7b85", marginTop: "4px" }}>
        {label}
      </span>
    </div>
  );
}

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background: "#f5ede0", borderRadius: "16px", padding: "32px 24px", margin: "0 16px 16px", ...style }}>
      {children}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{ fontFamily: "'Great Vibes', cursive", fontSize: "clamp(36px,9vw,52px)", color: "#6b1429", textAlign: "center", margin: "0 0 24px", fontWeight: 400 }}>
      {children}
    </h2>
  );
}

function Divider() {
  return <div style={{ height: "1px", background: "linear-gradient(90deg, transparent, rgba(107,20,41,0.2), transparent)", margin: "18px 0" }} />;
}

export default function Index() {
  const { days, hours, minutes, seconds } = useCountdown(WEDDING_DATE);
  const [guestName, setGuestName] = useState("");
  const [attending, setAttending] = useState<"yes" | "no" | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submitGuest = async () => {
    if (!guestName.trim() || !attending) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(GUESTS_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: guestName.trim(), attending }),
      });
      if (res.ok) {
        setSubmitted(true);
      } else {
        setError("Ошибка. Попробуйте ещё раз.");
      }
    } catch {
      setError("Ошибка соединения. Попробуйте ещё раз.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Great+Vibes&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Montserrat:wght@300;400;500&display=swap');
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #6b1429 !important; }
      `}</style>

      <main style={{ minHeight: "100vh", background: "#6b1429", maxWidth: "500px", margin: "0 auto" }}>

        {/* MUSIC */}
        <MusicBar />

        {/* HERO */}
        <div style={{ background: "#6b1429", padding: "40px 24px 28px", textAlign: "center" }}>
          <p style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300, color: "rgba(245,237,224,0.6)", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.3em", marginBottom: "16px" }}>
            Свадебное приглашение
          </p>
          <h1 style={{ fontFamily: "'Great Vibes', cursive", fontSize: "clamp(44px,13vw,68px)", color: "#f5ede0", fontWeight: 400, lineHeight: 1.15, marginBottom: "16px" }}>
            Свадебное<br />приглашение
          </h1>
          <p style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 400, color: "rgba(245,237,224,0.75)", fontSize: "11px", letterSpacing: "0.25em", textTransform: "uppercase" }}>
            Евгений &amp; София · 22 июля 2026
          </p>
        </div>

        {/* NAMES CARD */}
        <Card>
          <p style={{ fontFamily: "'Great Vibes', cursive", fontSize: "clamp(22px,6vw,30px)", color: "#6b1429", textAlign: "center", marginBottom: "4px", fontWeight: 400 }}>
            Мы женимся!
          </p>
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", color: "#9b7b85", fontSize: "16px", textAlign: "center", marginBottom: "24px" }}>
            и счастливы пригласить вас
          </p>
          <div style={{ border: "1.5px solid #6b1429", borderRadius: "12px", padding: "32px 20px 28px", textAlign: "center", position: "relative" }}>
            <div style={{ position: "absolute", top: "-18px", left: "50%", transform: "translateX(-50%)", width: "36px", height: "36px", borderRadius: "50%", background: "#6b1429", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: "17px" }}>💍</span>
            </div>
            <h2 style={{ fontFamily: "'Great Vibes', cursive", fontSize: "clamp(42px,12vw,62px)", color: "#6b1429", fontWeight: 400, lineHeight: 1.1, margin: 0 }}>
              Евгений
            </h2>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "22px", color: "#9b7b85", margin: "8px 0" }}>&amp;</p>
            <h2 style={{ fontFamily: "'Great Vibes', cursive", fontSize: "clamp(42px,12vw,62px)", color: "#6b1429", fontWeight: 400, lineHeight: 1.1, margin: 0 }}>
              София
            </h2>
          </div>
        </Card>

        {/* SAVE THE DATE + COUNTDOWN */}
        <Card>
          <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.25em", color: "#9b7b85", textAlign: "center", marginBottom: "12px" }}>
            Save the Date
          </p>
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(40px,10vw,54px)", color: "#6b1429", textAlign: "center", fontWeight: 300, letterSpacing: "0.05em" }}>
            22 / 07 / 26
          </p>

          <Divider />

          <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.2em", color: "#9b7b85", textAlign: "center", marginBottom: "16px" }}>
            Обратный отсчёт
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: "clamp(10px,3vw,22px)", alignItems: "center" }}>
            <CountdownBlock value={days} label="дней" />
            <span style={{ color: "rgba(107,20,41,0.25)", fontSize: "22px" }}>:</span>
            <CountdownBlock value={hours} label="часов" />
            <span style={{ color: "rgba(107,20,41,0.25)", fontSize: "22px" }}>:</span>
            <CountdownBlock value={minutes} label="минут" />
            <span style={{ color: "rgba(107,20,41,0.25)", fontSize: "22px" }}>:</span>
            <CountdownBlock value={seconds} label="секунд" />
          </div>

          <Divider />

          <img src={CHERUB_IMG} alt="купидон" style={{ display: "block", width: "150px", margin: "0 auto 16px", borderRadius: "8px" }} />
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", color: "#9b7b85", fontSize: "15px", textAlign: "center", lineHeight: 1.75 }}>
            Мы так счастливы пригласить вас разделить с нами радость нашей любви…
          </p>
        </Card>

        {/* LOCATION */}
        <Card>
          <SectionTitle>Локация</SectionTitle>
          <div style={{ border: "1px solid rgba(107,20,41,0.15)", borderRadius: "12px", overflow: "hidden" }}>
            <div style={{ padding: "20px", textAlign: "center" }}>
              <div style={{ fontSize: "22px", marginBottom: "14px" }}>🌸🌺🌸</div>
              <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "18px", color: "#3d0a17", fontWeight: 600, margin: "0 0 4px" }}>
                г/к «Аврора», 1 этаж
              </p>
              <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "12px", color: "#9b7b85", marginBottom: "16px" }}>
                ул. Поворотникова, д. 6
              </p>
            </div>
            <img
              src={AURORA_IMG}
              alt="Аврора Комплекс"
              style={{ width: "100%", display: "block", height: "200px", objectFit: "cover" }}
            />
            <div style={{ padding: "14px", textAlign: "center", fontSize: "22px" }}>🌺🌸🌺</div>
          </div>
        </Card>

        {/* TIMING */}
        <Card>
          <SectionTitle>Тайминг</SectionTitle>
          {[
            { time: "11:20", title: "Церемония в ЗАГСе", sub: "Центральный ЗАГС" },
            { time: "16:30", title: "Сбор гостей", sub: "г/к «Аврора»" },
            { time: "17:00", title: "Праздничный банкет", sub: "Торжество и угощения" },
            { time: "23:00", title: "Окончание вечера", sub: "Свадебный торт & Прощание" },
          ].map((item, i, arr) => (
            <div key={item.time}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "14px 0", textAlign: "center" }}>
                <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(32px,8vw,44px)", color: "#6b1429", fontWeight: 400, lineHeight: 1 }}>
                  {item.time}
                </span>
                <p style={{ fontFamily: "'Great Vibes', cursive", fontSize: "22px", color: "#3d0a17", margin: "4px 0 2px", fontWeight: 400 }}>
                  {item.title}
                </p>
                <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "12px", color: "#9b7b85" }}>
                  {item.sub}
                </p>
              </div>
              {i < arr.length - 1 && <Divider />}
            </div>
          ))}
        </Card>

        {/* DRESS CODE */}
        <Card>
          <SectionTitle>Дресс-код</SectionTitle>
          <div style={{ display: "flex", justifyContent: "center", gap: "16px", marginBottom: "20px" }}>
            {[
              { color: "#6b1429", border: false },
              { color: "#f5ede0", border: true },
              { color: "#c97fa0", border: false },
              { color: "#c9b8a8", border: false },
            ].map(({ color, border }) => (
              <div key={color} style={{ width: "50px", height: "50px", borderRadius: "50%", background: color, border: border ? "1px solid rgba(107,20,41,0.2)" : "none", boxShadow: "0 3px 10px rgba(0,0,0,0.12)" }} />
            ))}
          </div>
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", color: "#9b7b85", fontSize: "15px", textAlign: "center", lineHeight: 1.75 }}>
            Нам будет приятно видеть вас в тёплых, элегантных нарядах цветовой гаммы нашей свадьбы
          </p>
          <div style={{ textAlign: "center", marginTop: "16px", fontSize: "32px" }}>☀️</div>
        </Card>

        {/* GUEST FORM */}
        <Card>
          <SectionTitle>Форма гостя</SectionTitle>
          {submitted ? (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>💌</div>
              <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "20px", color: "#6b1429" }}>
                {attending === "yes" ? "Спасибо! Мы вас ждём 🤍" : "Жаль, что не сможете. Будем скучать 🌸"}
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "12px", color: "#9b7b85", textAlign: "center" }}>
                Сможете ли вы присутствовать?
              </p>
              <input
                value={guestName}
                onChange={e => setGuestName(e.target.value)}
                placeholder="Имя Фамилия"
                style={{ width: "100%", padding: "14px 16px", borderRadius: "10px", border: "1px solid rgba(107,20,41,0.2)", fontFamily: "'Montserrat', sans-serif", fontSize: "14px", color: "#3d0a17", background: "#fdf8f2", outline: "none" }}
              />
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {[
                  { value: "yes", label: "Да, с удовольствием буду!" },
                  { value: "no", label: "К сожалению, не смогу" },
                ].map(opt => (
                  <label key={opt.value} style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
                    <input
                      type="radio"
                      name="attending"
                      value={opt.value}
                      checked={attending === opt.value}
                      onChange={() => setAttending(opt.value as "yes" | "no")}
                      style={{ accentColor: "#6b1429", width: "18px", height: "18px" }}
                    />
                    <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "13px", color: "#3d0a17" }}>
                      {opt.label}
                    </span>
                  </label>
                ))}
              </div>
              {error && (
                <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "12px", color: "#c0392b", textAlign: "center" }}>
                  {error}
                </p>
              )}
              <button
                onClick={submitGuest}
                disabled={!guestName.trim() || !attending || loading}
                style={{
                  width: "100%", padding: "16px", border: "none", borderRadius: "10px",
                  fontFamily: "'Montserrat', sans-serif", fontWeight: 500, fontSize: "13px",
                  letterSpacing: "0.15em", textTransform: "uppercase", color: "#f5ede0",
                  background: guestName.trim() && attending && !loading ? "#6b1429" : "rgba(107,20,41,0.3)",
                  cursor: guestName.trim() && attending && !loading ? "pointer" : "default",
                  transition: "background 0.3s",
                }}
              >
                {loading ? "Отправляем…" : "Отправить ответ"}
              </button>
            </div>
          )}
        </Card>

        {/* FOOTER */}
        <div style={{ padding: "32px 24px 56px", textAlign: "center" }}>
          <p style={{ fontFamily: "'Great Vibes', cursive", fontSize: "34px", color: "#f5ede0", fontWeight: 400 }}>
            Евгений &amp; София
          </p>
          <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "10px", color: "rgba(245,237,224,0.35)", marginTop: "8px", letterSpacing: "0.25em", textTransform: "uppercase" }}>
            22 · 07 · 2026
          </p>
          <div style={{ fontSize: "20px", marginTop: "16px", opacity: 0.5 }}>🌸 💍 🌸</div>
        </div>

      </main>
    </>
  );
}
