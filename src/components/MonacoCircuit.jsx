import { useState } from "react";
import { X } from "lucide-react";
import { F1Logo } from "@/components/F1Logo";

const HOTSPOTS = [
  {
    id: 1,
    name: "Sainte Devote",
    label: "Turn 1",
    x: 72,
    y: 78,
    description:
      "First corner after the start. Named after the patron saint of Monaco. Crashes here on lap 1 are a Monaco tradition.",
  },
  {
    id: 2,
    name: "Casino Square",
    label: "Turn 4",
    x: 82,
    y: 38,
    description:
      'The most glamorous corner in motorsport. The Casino de Monte-Carlo overlooks the track — James Bond territory.',
  },
  {
    id: 3,
    name: "Fairmont Hairpin",
    label: "Turn 6",
    x: 68,
    y: 28,
    description:
      "The slowest corner in F1 at ~50 km/h. Cars pass in front of the Fairmont Hotel. Once called Loews hairpin.",
  },
  {
    id: 4,
    name: "Tunnel",
    label: "Turns 8–9",
    x: 52,
    y: 38,
    description:
      "Drivers go from bright sunlight into darkness and back out at 260 km/h. Their visors auto-adjust — their nerves don't.",
  },
  {
    id: 5,
    name: "Nouvelle Chicane",
    label: "Turn 10",
    x: 35,
    y: 52,
    description:
      "Exit the tunnel into hard braking. The harbor and superyachts are right there — the most photographed spot on the calendar.",
  },
  {
    id: 6,
    name: "Tabac",
    label: "Turn 12",
    x: 30,
    y: 68,
    description:
      "Named after the old tobacco shop on the corner. A fast, unforgiving left — the barrier is inches from the car.",
  },
  {
    id: 7,
    name: "Swimming Pool",
    label: "Turns 13–14",
    x: 18,
    y: 60,
    description:
      "A fast left-right chicane next to the public swimming pool. Requires absolute commitment at 200+ km/h.",
  },
  {
    id: 8,
    name: "Rascasse",
    label: "Turn 17",
    x: 15,
    y: 82,
    description:
      "A tight hairpin before the pit straight. Michael Schumacher infamously parked here in 2006 to block qualifying.",
  },
  {
    id: 9,
    name: "Anthony Noghes",
    label: "Turn 19",
    x: 30,
    y: 88,
    description:
      "The final corner, named after the founder of the Monaco Grand Prix. Get this wrong and you wreck your lap.",
  },
  {
    id: 10,
    name: "Port Hercules",
    label: "Landmark",
    x: 38,
    y: 76,
    description:
      "The harbor where billionaires park their superyachts to watch the race. Best seats in F1 cost €100,000+.",
  },
];

/*
 * Simplified Monaco circuit SVG path.
 * The shape traces the iconic layout: pit straight along the harbor,
 * Sainte Devote climb, Casino hairpin, descent past the Fairmont hairpin,
 * tunnel, Nouvelle chicane at the waterfront, Tabac, Swimming Pool complex,
 * Rascasse hairpin, Anthony Noghes, and back onto the pit straight.
 */
const CIRCUIT_PATH =
  "M 55 90 L 70 90 Q 78 90 78 82 L 78 75 Q 78 70 82 65 " +
  "L 88 50 Q 90 45 88 40 L 85 35 Q 82 30 78 28 " +
  "L 70 25 Q 65 24 60 28 L 55 33 Q 50 38 48 40 " +
  "L 42 48 Q 38 52 35 55 L 30 62 Q 25 65 22 62 " +
  "L 18 55 Q 14 52 12 56 L 10 65 Q 8 72 12 78 " +
  "L 18 85 Q 22 90 28 90 L 38 90 Q 42 90 45 88 " +
  "Q 48 86 50 88 L 55 90";

const START_FINISH = { x: 55, y: 90 };

export default function MonacoCircuit({ open, onClose }) {
  const [activeHotspot, setActiveHotspot] = useState(null);

  if (!open) return null;

  const active = HOTSPOTS.find((h) => h.id === activeHotspot);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div
        className="absolute inset-0 bg-black/40 animate-fade-in"
        onClick={onClose}
      />
      <div className="relative w-full max-w-[430px] bg-white rounded-t-2xl animate-slide-up max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-f1-border rounded-t-2xl">
          <div className="flex items-center gap-2">
            <F1Logo className="w-8 h-auto" />
            <h2 className="font-oswald text-lg font-semibold text-f1-navy uppercase">
              Monaco Circuit Guide
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-f1-surface transition-colors"
          >
            <X className="w-5 h-5 text-f1-secondary" />
          </button>
        </div>

        {/* Handle bar */}
        <div className="flex justify-center pt-1 pb-0">
          <div className="w-10 h-1 rounded-full bg-f1-border" />
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Instruction */}
          <p className="text-f1-secondary text-xs text-center mb-3">
            Tap a numbered marker to learn about each corner
          </p>

          {/* Circuit SVG */}
          <div className="bg-f1-surface rounded-xl border border-f1-border p-3 mb-4">
            <svg viewBox="0 0 100 100" className="w-full" style={{ aspectRatio: "1" }}>
              {/* Track outline */}
              <path
                d={CIRCUIT_PATH}
                stroke="#E10600"
                strokeWidth="2.2"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Start/finish line */}
              <line
                x1={START_FINISH.x}
                y1={START_FINISH.y - 2.5}
                x2={START_FINISH.x}
                y2={START_FINISH.y + 2.5}
                stroke="#1A1A2E"
                strokeWidth="1.2"
              />
              {/* Checkered flag indicator */}
              <rect
                x={START_FINISH.x - 1}
                y={START_FINISH.y - 4}
                width="2"
                height="1.5"
                fill="#1A1A2E"
              />
              <rect
                x={START_FINISH.x + 1}
                y={START_FINISH.y - 5.5}
                width="2"
                height="1.5"
                fill="#1A1A2E"
              />
              <rect
                x={START_FINISH.x - 1}
                y={START_FINISH.y - 5.5}
                width="2"
                height="1.5"
                fill="#9494A8"
              />
              <rect
                x={START_FINISH.x + 1}
                y={START_FINISH.y - 4}
                width="2"
                height="1.5"
                fill="#9494A8"
              />

              {/* Hotspot markers */}
              {HOTSPOTS.map((spot) => (
                <g
                  key={spot.id}
                  onClick={() =>
                    setActiveHotspot(activeHotspot === spot.id ? null : spot.id)
                  }
                  className="cursor-pointer"
                >
                  <circle
                    cx={spot.x}
                    cy={spot.y}
                    r={activeHotspot === spot.id ? 4 : 3.2}
                    fill={activeHotspot === spot.id ? "#E10600" : "#1A1A2E"}
                    stroke="white"
                    strokeWidth="0.8"
                  />
                  <text
                    x={spot.x}
                    y={spot.y + 1.2}
                    textAnchor="middle"
                    fill="white"
                    fontSize="3.2"
                    fontWeight="bold"
                    fontFamily="Oswald, sans-serif"
                    style={{ pointerEvents: "none" }}
                  >
                    {spot.id}
                  </text>
                </g>
              ))}
            </svg>
          </div>

          {/* Info card */}
          {active && (
            <div className="bg-white rounded-xl border border-f1-border shadow-sm overflow-hidden mb-4 animate-fade-in">
              <div className="bg-f1-red px-4 py-2 flex items-center justify-between">
                <span className="font-oswald text-white text-sm font-semibold uppercase">
                  {active.name}
                </span>
                <span className="text-white/70 text-xs font-medium">
                  {active.label}
                </span>
              </div>
              <div className="px-4 py-3">
                <p className="text-sm text-f1-navy leading-relaxed">
                  {active.description}
                </p>
              </div>
            </div>
          )}

          {/* All corners list */}
          <div className="space-y-2">
            {HOTSPOTS.map((spot) => (
              <button
                key={spot.id}
                onClick={() =>
                  setActiveHotspot(activeHotspot === spot.id ? null : spot.id)
                }
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border text-left transition-all ${
                  activeHotspot === spot.id
                    ? "border-f1-red bg-f1-red-bg"
                    : "border-f1-border bg-f1-surface hover:border-f1-red/50"
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-oswald font-bold flex-shrink-0 ${
                    activeHotspot === spot.id ? "bg-f1-red" : "bg-f1-navy"
                  }`}
                >
                  {spot.id}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-oswald text-xs font-semibold text-f1-navy uppercase">
                    {spot.name}
                  </span>
                  <span className="text-f1-muted text-[10px] ml-2">
                    {spot.label}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
