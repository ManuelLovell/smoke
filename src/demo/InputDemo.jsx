import { useState, useRef, useCallback } from "react";

const INK = "#EDEAE3";
const INK_DIM = "#8B9190";
const PANEL = "#24282A";
const PANEL_DEEP = "#1B1E1F";
const TRACK = "#31363A";

const STAT_COLORS = [
  "#C98A3E", // brass
  "#4E8C82", // teal
  "#8C6E9C", // plum
  "#B3583F", // rust
  "#5B7FA6", // steel
  "#9AA53F", // olive
];

const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

export function NumberRoller({ value, onChange, min = 0, max = 99, accent = STAT_COLORS[0] }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));
  const drag = useRef(null); // { startY, startVal, moved }
  const maxLen = String(max).length;

  const commitDraft = (raw) => {
    const n = clamp(parseInt(raw, 10) || 0, min, max);
    onChange(n);
    setEditing(false);
  };

  const onPointerDown = (e) => {
    if (editing) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { startY: e.clientY, startVal: value, moved: false };
  };

  const onPointerMove = (e) => {
    if (!drag.current) return;
    const dy = drag.current.startY - e.clientY; // up = increase
    if (Math.abs(dy) > 4) drag.current.moved = true;
    if (!drag.current.moved) return;
    const next = clamp(drag.current.startVal + Math.round(dy / 6), min, max);
    if (next !== value) onChange(next);
  };

  const onPointerUp = (e) => {
    if (!drag.current) return;
    const wasDrag = drag.current.moved;
    drag.current = null;
    if (!wasDrag) {
      setDraft(String(value));
      setEditing(true);
      requestAnimationFrame(() => e.target.querySelector?.("input")?.focus());
    }
  };

  const step = (delta, ev) => {
    ev.stopPropagation();
    onChange(clamp(value + delta, min, max));
  };

  const fillPct = ((value - min) / (max - min)) * 100;

  return (
    <div
      style={{
        width: 56,
        height: 40,
        borderRadius: 8,
        position: "relative",
        background: TRACK,
        overflow: "hidden",
        touchAction: "none",
        userSelect: "none",
        cursor: editing ? "text" : "ns-resize",
        border: `1px solid ${PANEL_DEEP}`,
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      {/* fill indicating value fraction */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: `${fillPct}%`,
          background: accent,
          opacity: 0.35,
          transition: drag.current ? "none" : "height 120ms ease",
        }}
      />
      {/* tick marks every 5 units */}
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column-reverse" }}>
        {Array.from({ length: Math.floor((max - min) / 5) + 1 }).map((_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 0,
              bottom: `${(i * 5 * 100) / (max - min)}%`,
              width: 6,
              height: 1,
              background: "rgba(237,234,227,0.25)",
            }}
          />
        ))}
      </div>

      {editing ? (
        <input
          value={draft}
          onChange={(ev) => setDraft(ev.target.value.replace(/\D/g, "").slice(0, maxLen))}
          onBlur={(ev) => commitDraft(ev.target.value)}
          onKeyDown={(ev) => {
            if (ev.key === "Enter") commitDraft(ev.currentTarget.value);
            if (ev.key === "Escape") setEditing(false);
          }}
          inputMode="numeric"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            background: "transparent",
            border: "none",
            outline: "none",
            color: INK,
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 15,
            fontWeight: 600,
            textAlign: "center",
          }}
        />
      ) : (
        <>
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 15,
              fontWeight: 600,
              color: INK,
              pointerEvents: "none",
            }}
          >
            {value}
          </div>
          <button
            onPointerDown={(ev) => ev.stopPropagation()}
            onClick={(ev) => step(1, ev)}
            aria-label="increase"
            style={chevronStyle("top")}
          >
            ▲
          </button>
          <button
            onPointerDown={(ev) => ev.stopPropagation()}
            onClick={(ev) => step(-1, ev)}
            aria-label="decrease"
            style={chevronStyle("bottom")}
          >
            ▼
          </button>
        </>
      )}
    </div>
  );
}

const chevronStyle = (pos) => ({
  position: "absolute",
  [pos]: 1,
  left: "50%",
  transform: "translateX(-50%)",
  background: "transparent",
  border: "none",
  color: "rgba(237,234,227,0.45)",
  fontSize: 8,
  lineHeight: 1,
  padding: 2,
  cursor: "pointer",
});

const WHEEL_DELTAS = [10, 5, 1, -1, -5, -10]; // clockwise from top

function polar(cx, cy, r, angleDeg) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function wedgePath(cx, cy, rOuter, rInner, startDeg, endDeg) {
  const p1 = polar(cx, cy, rOuter, startDeg);
  const p2 = polar(cx, cy, rOuter, endDeg);
  const p3 = polar(cx, cy, rInner, endDeg);
  const p4 = polar(cx, cy, rInner, startDeg);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return [
    `M ${p1.x} ${p1.y}`,
    `A ${rOuter} ${rOuter} 0 ${large} 1 ${p2.x} ${p2.y}`,
    `L ${p3.x} ${p3.y}`,
    `A ${rInner} ${rInner} 0 ${large} 0 ${p4.x} ${p4.y}`,
    "Z",
  ].join(" ");
}

export function FlyWheel({ value, onChange, min = 0, max = 99, accent = STAT_COLORS[0] }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));
  const [activeSlice, setActiveSlice] = useState(null);
  const [center, setCenter] = useState(null); // {x,y} in viewport coords
  const btnRef = useRef(null);
  const drag = useRef(null);
  const maxLen = String(max).length;

  const commitDraft = (raw) => {
    const n = clamp(parseInt(raw, 10) || 0, min, max);
    onChange(n);
    setEditing(false);
  };

  const onPointerDown = (e) => {
    if (editing) return;
    const rect = btnRef.current.getBoundingClientRect();
    const c = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    setCenter(c);
    btnRef.current.setPointerCapture(e.pointerId);
    drag.current = { moved: false };
  };

  const onPointerMove = (e) => {
    if (!drag.current || !center) return;
    const dx = e.clientX - center.x;
    const dy = e.clientY - center.y;
    const dist = Math.hypot(dx, dy);
    if (dist > 14) {
      drag.current.moved = true;
      let angle = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
      angle = (angle + 360) % 360;
      const idx = Math.round(angle / 60) % 6;
      setActiveSlice(idx);
    } else {
      setActiveSlice(null);
    }
  };

  const onPointerUp = () => {
    if (!drag.current) return;
    const wasDrag = drag.current.moved;
    const idx = activeSlice;
    drag.current = null;
    setActiveSlice(null);
    setCenter(null);
    if (wasDrag && idx != null) {
      onChange(clamp(value + WHEEL_DELTAS[idx], min, max));
    } else {
      setDraft(String(value));
      setEditing(true);
      requestAnimationFrame(() => btnRef.current?.querySelector("input")?.focus());
    }
  };

  const showOverlay = center != null;

  return (
    <>
      <div
        ref={btnRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        style={{
          width: 44,
          height: 44,
          borderRadius: "50%",
          background: PANEL,
          border: `2px solid ${accent}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          touchAction: "none",
          userSelect: "none",
          cursor: editing ? "text" : "grab",
          position: "relative",
        }}
      >
        {editing ? (
          <input
            value={draft}
            onChange={(ev) => setDraft(ev.target.value.replace(/\D/g, "").slice(0, maxLen))}
            onBlur={(ev) => commitDraft(ev.target.value)}
            onKeyDown={(ev) => {
              if (ev.key === "Enter") commitDraft(ev.currentTarget.value);
              if (ev.key === "Escape") setEditing(false);
            }}
            inputMode="numeric"
            style={{
              width: "100%",
              height: "100%",
              borderRadius: "50%",
              background: "transparent",
              border: "none",
              outline: "none",
              color: INK,
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 14,
              fontWeight: 600,
              textAlign: "center",
            }}
          />
        ) : (
          <span
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 14,
              fontWeight: 600,
              color: INK,
              pointerEvents: "none",
            }}
          >
            {value}
          </span>
        )}
      </div>

      {showOverlay && (
        <div
          style={{
            position: "fixed",
            left: center.x - 90,
            top: center.y - 90,
            width: 180,
            height: 180,
            pointerEvents: "none",
            zIndex: 50,
          }}
        >
          <svg width="180" height="180" style={{ overflow: "visible" }}>
            {WHEEL_DELTAS.map((delta, i) => {
              const start = i * 60 - 30;
              const end = i * 60 + 30;
              const isActive = activeSlice === i;
              const mid = polar(90, 90, 66, i * 60);
              return (
                <g key={i}>
                  <path
                    d={wedgePath(90, 90, 82, 40, start, end)}
                    fill={delta > 0 ? accent : PANEL_DEEP}
                    opacity={isActive ? 0.95 : 0.55}
                    stroke={PANEL_DEEP}
                    strokeWidth={2}
                    style={{ transition: "opacity 80ms ease" }}
                  />
                  <text
                    x={mid.x}
                    y={mid.y}
                    fill={isActive ? PANEL_DEEP : INK}
                    fontFamily="'IBM Plex Mono', monospace"
                    fontSize={isActive ? 15 : 13}
                    fontWeight={600}
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    {delta > 0 ? `+${delta}` : delta}
                  </text>
                </g>
              );
            })}
            <circle cx={90} cy={90} r={38} fill={PANEL} stroke={accent} strokeWidth={2} />
          </svg>
        </div>
      )}
    </>
  );
}

const STAT_NAMES = ["Power", "Guard", "Speed", "Focus", "Resolve", "Luck"];

const INITIAL_UNITS = [
  { id: 1, name: "Kestrel-9", stats: [62, 40, 71, 55, 33, 20] },
  { id: 2, name: "Old Bramble", stats: [45, 78, 22, 60, 65, 15] },
  { id: 3, name: "Thistledown", stats: [30, 25, 88, 40, 20, 70] },
  { id: 4, name: "Voss", stats: [70, 60, 45, 35, 50, 45] },
];

export default function StatRosterDemo() {
  const [mode, setMode] = useState("roller"); // "roller" | "flywheel"
  const [units, setUnits] = useState(INITIAL_UNITS);

  const updateStat = (unitId, statIdx, value) => {
    setUnits((prev) =>
      prev.map((u) =>
        u.id === unitId ? { ...u, stats: u.stats.map((s, i) => (i === statIdx ? value : s)) } : u
      )
    );
  };

  return (
    <div
      style={{
        minHeight: "100%",
        background: PANEL_DEEP,
        padding: "32px 24px",
        fontFamily: "'IBM Plex Sans', sans-serif",
      }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600&display=swap');`}</style>

      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 6 }}>
          <h1 style={{ color: INK, fontSize: 22, fontWeight: 600, margin: 0 }}>Field roster</h1>
          <div style={{ display: "flex", gap: 4, background: PANEL, borderRadius: 8, padding: 3 }}>
            {["roller", "flywheel"].map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                style={{
                  border: "none",
                  borderRadius: 6,
                  padding: "6px 12px",
                  fontSize: 13,
                  fontFamily: "'IBM Plex Sans', sans-serif",
                  fontWeight: 500,
                  cursor: "pointer",
                  background: mode === m ? STAT_COLORS[0] : "transparent",
                  color: mode === m ? PANEL_DEEP : INK_DIM,
                }}
              >
                {m === "roller" ? "Roller" : "Fly-wheel"}
              </button>
            ))}
          </div>
        </div>

        <p style={{ color: INK_DIM, fontSize: 13, marginTop: 0, marginBottom: 24, maxWidth: 480 }}>
          {mode === "roller"
            ? "Drag a value up or down to change it. Click without dragging to type a number directly."
            : "Press and drag a dial outward toward a slice to apply it — up adds, down subtracts, and distance from center picks the size. Click without dragging to type a number directly."}
        </p>

        <div style={{ background: PANEL, borderRadius: 12, padding: "16px 20px", overflowX: "auto" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `140px repeat(6, 1fr)`,
              rowGap: 18,
              columnGap: 12,
              minWidth: 620,
            }}
          >
            <div />
            {STAT_NAMES.map((name) => (
              <div
                key={name}
                style={{ color: INK_DIM, fontSize: 12, textAlign: "center", fontWeight: 500 }}
              >
                {name}
              </div>
            ))}

            {units.map((unit) => (
              <FragmentRow key={unit.id}>
                <div style={{ color: INK, fontSize: 14, fontWeight: 500, alignSelf: "center" }}>
                  {unit.name}
                </div>
                {unit.stats.map((val, i) =>
                  mode === "roller" ? (
                    <div key={i} style={{ display: "flex", justifyContent: "center" }}>
                      <NumberRoller
                        value={val}
                        onChange={(v) => updateStat(unit.id, i, v)}
                        accent={STAT_COLORS[i]}
                      />
                    </div>
                  ) : (
                    <div key={i} style={{ display: "flex", justifyContent: "center" }}>
                      <FlyWheel
                        value={val}
                        onChange={(v) => updateStat(unit.id, i, v)}
                        accent={STAT_COLORS[i]}
                      />
                    </div>
                  )
                )}
              </FragmentRow>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function FragmentRow({ children }) {
  return <>{children}</>;
}
