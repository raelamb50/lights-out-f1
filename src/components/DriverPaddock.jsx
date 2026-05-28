import { useState } from "react";
import { X, Search } from "lucide-react";
import { DRIVERS_2026 } from "@/data/drivers";
import DriverCard from "@/components/DriverCard";

const TEAMS = [...new Set(DRIVERS_2026.map(d => d.team))];

export default function DriverPaddock({ open, onClose }) {
  const [search, setSearch] = useState("");
  const [teamFilter, setTeamFilter] = useState(null);

  if (!open) return null;

  const filtered = DRIVERS_2026.filter(d => {
    const matchesSearch = !search || d.name.toLowerCase().includes(search.toLowerCase()) || d.team.toLowerCase().includes(search.toLowerCase());
    const matchesTeam = !teamFilter || d.team === teamFilter;
    return matchesSearch && matchesTeam;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div
        className="absolute inset-0 bg-black/40 animate-fade-in"
        onClick={onClose}
      />
      <div className="relative w-full max-w-[430px] bg-f1-surface rounded-t-2xl animate-slide-up max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-f1-border bg-white rounded-t-2xl">
          <h2 className="font-oswald text-lg font-semibold text-f1-navy uppercase">
            Driver Paddock
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-f1-surface transition-colors"
          >
            <X className="w-5 h-5 text-f1-secondary" />
          </button>
        </div>

        <div className="px-4 py-3 space-y-2 bg-white border-b border-f1-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-f1-muted" />
            <input
              type="text"
              placeholder="Search drivers or teams..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-f1-surface rounded-lg border border-f1-border focus:outline-none focus:border-f1-red transition-colors"
            />
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            <button
              onClick={() => setTeamFilter(null)}
              className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                !teamFilter ? "bg-f1-red text-white" : "bg-f1-surface text-f1-secondary hover:bg-f1-border"
              }`}
            >
              All
            </button>
            {TEAMS.map(team => (
              <button
                key={team}
                onClick={() => setTeamFilter(teamFilter === team ? null : team)}
                className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                  teamFilter === team ? "bg-f1-red text-white" : "bg-f1-surface text-f1-secondary hover:bg-f1-border"
                }`}
              >
                {team}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-3 gap-3">
            {filtered.map(driver => (
              <DriverCard key={driver.num} driver={driver} />
            ))}
          </div>
          {filtered.length === 0 && (
            <p className="text-center text-f1-muted text-sm py-8">No drivers found</p>
          )}
        </div>
      </div>
    </div>
  );
}
