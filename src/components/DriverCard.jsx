import { useState } from "react";

export default function DriverCard({ driver }) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div
      className="perspective-1000 cursor-pointer"
      onClick={() => setFlipped(!flipped)}
    >
      <div
        className={`relative w-full aspect-[3/4] transition-transform duration-500 preserve-3d ${
          flipped ? "rotate-y-180" : ""
        }`}
      >
        <div className="absolute inset-0 backface-hidden bg-white rounded-xl border border-f1-border shadow-sm overflow-hidden">
          <div
            className="h-2 w-full"
            style={{ backgroundColor: driver.color }}
          />
          <div className="p-3 flex flex-col items-center justify-center h-[calc(100%-8px)]">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center text-white font-oswald text-xl font-bold mb-2"
              style={{ backgroundColor: driver.color }}
            >
              {driver.num}
            </div>
            <p className="font-oswald text-sm font-semibold text-f1-navy text-center uppercase leading-tight">
              {driver.name}
            </p>
            <p className="text-[11px] text-f1-secondary mt-0.5">{driver.team}</p>
            <p className="text-xs mt-1">{driver.country}</p>
          </div>
        </div>

        <div className="absolute inset-0 backface-hidden rotate-y-180 bg-white rounded-xl border border-f1-border shadow-sm overflow-hidden">
          <div
            className="h-2 w-full"
            style={{ backgroundColor: driver.color }}
          />
          <div className="p-3 flex flex-col h-[calc(100%-8px)] text-[11px]">
            <p className="font-oswald text-xs font-semibold text-f1-navy uppercase mb-2">
              {driver.name}
            </p>
            <div className="space-y-1 text-f1-secondary flex-1">
              <div className="flex justify-between">
                <span>Standing</span>
                <span className="font-semibold text-f1-navy">{driver.standing}</span>
              </div>
              <div className="flex justify-between">
                <span>Wins</span>
                <span className="font-semibold text-f1-navy">{driver.wins}</span>
              </div>
              <div className="flex justify-between">
                <span>Podiums</span>
                <span className="font-semibold text-f1-navy">{driver.podiums}</span>
              </div>
              <div className="flex justify-between">
                <span>Poles</span>
                <span className="font-semibold text-f1-navy">{driver.poles}</span>
              </div>
              <div className="flex justify-between">
                <span>Titles</span>
                <span className="font-semibold text-f1-navy">{driver.titles}</span>
              </div>
              <div className="flex justify-between">
                <span>Best here</span>
                <span className="font-semibold text-f1-navy text-right">{driver.bestHere}</span>
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-f1-border">
              <p className="text-[10px] text-f1-muted italic leading-tight">{driver.fact}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
