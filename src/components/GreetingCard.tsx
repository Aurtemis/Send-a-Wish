"use client";

interface GreetingCardProps {
  name: string;
  age: number;
  message: string;
  musicUrl?: string | null;
  senderName?: string | null;
}

export default function GreetingCard({
  name,
  message,
  musicUrl,
  senderName,
}: GreetingCardProps) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl shadow-[0_30px_70px_rgba(0,0,0,0.6)]"
      style={{
        width: "min(96vw, 700px)",
        backgroundImage: "url('/card-bg.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        aspectRatio: "7 / 4",
      }}
    >
      {/* Text panel — right side */}
      <div
        style={{
          position: "absolute",
          left: "42%",
          top: "12%",
          right: "4%",
          bottom: "8%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
        }}
      >
        {/* Happy Birthday heading */}
        <div
          style={{
            fontFamily: "var(--font-brusher)",
            fontSize: "clamp(15px, 4.8vw, 38px)",
            lineHeight: 1.15,
            marginBottom: "3%",
          }}
        >
          <span style={{ color: "#8B5030" }}>Happy Birthday, </span>
          <span style={{ color: "#C9705A" }}>{name}</span>
        </div>

        {/* Message */}
        <div
          style={{
            marginTop: "-1%",
            marginBottom: "auto",
            width: "95%",
          }}
          >
            <p
            style={{
              fontFamily: "var(--font-patrick-hand)",
              fontSize: "clamp(10px, 1.9vw, 20px)",
              color: "#7a4a2c",
              lineHeight: 1.2,
              margin:0,
              whiteSpace: "pre-wrap",
              alignItems: "justify-end",
            }}
          >
            {message}
          </p>
        </div>        

        {/* Sender + music */}
        <div style={{ 
          width: "80%", 
          marginTop: "auto",
          marginBottom: "8%",
          display: "flex", 
          justifyContent: "flex-end", 
          alignItems: "flex-end", }}>

          {senderName && (
            <span
              style={{
                fontFamily: "var(--font-asly-brush)",
                fontSize: "clamp(15px, 3vw, 34px)",
                color: "#8B5030",
                margin: 0,
                lineHeight: 0.6,
              }}
            >
              -{senderName}
            </span>
          )}
          {musicUrl && (
            <a
              href={musicUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                flexShrink: 0,
                borderRadius: "9999px",
                background: "rgba(140,47,57,0.1)",
                padding: "4px 12px",
                fontSize: "11px",
                fontWeight: 500,
                color: "#8c2f39",
                textDecoration: "none",
                border: "1px solid rgba(140,47,57,0.25)",
              }}
            >
              🎵 Play song
            </a>
          )}
        </div>
      </div>
    </div>
  );
}