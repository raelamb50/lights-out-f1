import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { F1MonacoLockup } from "@/components/F1Logo";
import { DRIVERS_2026, TEAMMATE_MATCHUPS } from "@/data/drivers";
import useGameSubscription from "@/hooks/useGameSubscription";
import { Vote, Check, ChevronRight, Lock, Search } from "lucide-react";

const Game = base44.entities.Game;
const Category = base44.entities.Category;
const ResultVote = base44.entities.ResultVote;

export default function ResultsScreen() {
  const { gameId } = useParams();
  const [categories, setCategories] = useState([]);
  const [currentCatIndex, setCurrentCatIndex] = useState(0);
  const [votes, setVotes] = useState({});
  const [existingVotes, setExistingVotes] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const playerId = sessionStorage.getItem("playerId");
  const isHost = sessionStorage.getItem("isHost") === "true";

  useGameSubscription(gameId);

  useEffect(() => {
    loadData();
  }, [gameId]);

  const loadData = async () => {
    try {
      const [catData, voteData] = await Promise.all([
        Category.filter({ game_id: gameId }),
        ResultVote.filter({ game_id: gameId }),
      ]);
      setCategories(catData.sort((a, b) => a.sort_order - b.sort_order));
      setExistingVotes(voteData);

      const myVotes = {};
      voteData.filter(v => v.player_id === playerId).forEach(v => {
        myVotes[v.category_id] = v.voted_answer;
      });
      setVotes(myVotes);
    } catch (e) {
      // silent
    } finally {
      setLoading(false);
    }
  };

  const currentCat = categories[currentCatIndex];

  const handleVote = (value) => {
    if (!currentCat) return;
    setVotes(prev => ({ ...prev, [currentCat.id]: value }));
  };

  const submitVote = async () => {
    if (!currentCat || !votes[currentCat.id]) return;

    try {
      await ResultVote.create({
        game_id: gameId,
        category_id: currentCat.id,
        player_id: playerId,
        voted_answer: typeof votes[currentCat.id] === "object"
          ? JSON.stringify(votes[currentCat.id])
          : String(votes[currentCat.id]),
      });

      if (currentCatIndex < categories.length - 1) {
        setCurrentCatIndex(currentCatIndex + 1);
      }
    } catch (e) {
      // silent
    }
  };

  const lockResults = async () => {
    setSubmitting(true);
    try {
      const voteSummary = {};
      const allVotes = await ResultVote.filter({ game_id: gameId });

      for (const cat of categories) {
        const catVotes = allVotes.filter(v => v.category_id === cat.id);
        if (catVotes.length === 0) continue;

        const counts = {};
        catVotes.forEach(v => {
          counts[v.voted_answer] = (counts[v.voted_answer] || 0) + 1;
        });
        const winner = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
        if (winner) voteSummary[cat.id] = winner[0];
      }

      for (const cat of categories) {
        if (voteSummary[cat.id]) {
          await Category.update(cat.id, { correct_answer: voteSummary[cat.id] });
        }
      }

      await Game.update(gameId, { phase: "final" });
    } catch (e) {
      // silent
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-f1-surface flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-f1-border border-t-f1-red rounded-full animate-spin" />
      </div>
    );
  }

  const allVoted = categories.every(c => votes[c.id]);

  return (
    <div className="min-h-screen bg-f1-surface">
      <div className="max-w-[430px] mx-auto px-4 py-5">
        <F1MonacoLockup />

        <h1 className="font-oswald text-2xl font-bold text-f1-navy uppercase mb-1">
          Race Results
        </h1>
        <p className="text-f1-secondary text-sm mb-5">
          Crowdsource the real results. Vote on what actually happened.
        </p>

        <div className="flex items-center gap-1 mb-4">
          {categories.map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-1 rounded-full transition-colors ${
                i < currentCatIndex ? "bg-f1-green" : i === currentCatIndex ? "bg-f1-red" : "bg-f1-border"
              }`}
            />
          ))}
        </div>

        {currentCat && (
          <div className="animate-fade-in">
            <div className="bg-white rounded-2xl border border-f1-border shadow-sm overflow-hidden mb-4">
              <div className="bg-f1-navy px-4 py-3">
                <div className="flex items-center gap-2">
                  <Vote className="w-4 h-4 text-f1-red" />
                  <p className="font-oswald text-white text-lg font-semibold uppercase">
                    {currentCat.name}
                  </p>
                </div>
                <p className="text-white/60 text-xs mt-0.5">What actually happened?</p>
              </div>

              <div className="p-4">
                <ResultPicker
                  category={currentCat}
                  value={votes[currentCat.id]}
                  onChange={handleVote}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <button
                onClick={() => setCurrentCatIndex(Math.max(0, currentCatIndex - 1))}
                disabled={currentCatIndex === 0}
                className="text-f1-secondary text-sm disabled:opacity-30 hover:text-f1-navy transition-colors"
              >
                Back
              </button>
              <span className="text-f1-muted text-xs font-oswald">
                {currentCatIndex + 1} / {categories.length}
              </span>
              <button
                onClick={submitVote}
                disabled={!votes[currentCat.id]}
                className="flex items-center gap-1 text-f1-red text-sm font-semibold disabled:opacity-30 hover:text-red-700 transition-colors"
              >
                {currentCatIndex < categories.length - 1 ? "Next" : "Done"}
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {isHost && allVoted && (
          <button
            onClick={lockResults}
            disabled={submitting}
            className="w-full bg-f1-red text-white rounded-xl px-5 py-4 font-oswald text-base font-semibold uppercase tracking-wide hover:bg-red-700 transition-colors disabled:opacity-40 active:scale-[0.98] mt-6"
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Locking Results...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Lock className="w-4 h-4" />
                Lock Results & Score
              </span>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

function ResultPicker({ category, value, onChange }) {
  if (category.category_type === "single_driver") {
    return <DriverResultPicker value={value} onChange={onChange} />;
  }

  if (category.category_type === "multi_driver") {
    return <MultiDriverResultPicker value={value} onChange={onChange} count={3} />;
  }

  if (category.category_type === "yes_no_count") {
    return <YesNoResultPicker value={value} onChange={onChange} />;
  }

  if (category.category_type === "teammate_duel") {
    return <TeammateResultPicker value={value} onChange={onChange} />;
  }

  return null;
}

function DriverResultPicker({ value, onChange }) {
  const [search, setSearch] = useState("");
  const filtered = DRIVERS_2026.filter(d =>
    !search || d.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-f1-muted" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search driver..."
          className="w-full pl-9 pr-3 py-2 bg-f1-surface rounded-lg border border-f1-border text-sm focus:outline-none focus:border-f1-red transition-colors"
        />
      </div>
      <div className="grid grid-cols-2 gap-2 max-h-[280px] overflow-y-auto">
        {filtered.map(driver => (
          <button
            key={driver.num}
            onClick={() => onChange(driver.name)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-left transition-all text-sm ${
              value === driver.name
                ? "border-f1-green bg-f1-green-bg font-semibold"
                : "border-f1-border bg-white hover:border-f1-green/50"
            }`}
          >
            <div
              className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-white text-[10px] font-oswald font-bold"
              style={{ backgroundColor: driver.color }}
            >
              {driver.num}
            </div>
            <span className="truncate text-xs">{driver.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function MultiDriverResultPicker({ value, onChange, count }) {
  const selected = value || [];

  const toggleDriver = (name) => {
    if (selected.includes(name)) {
      onChange(selected.filter(n => n !== name));
    } else if (selected.length < count) {
      onChange([...selected, name]);
    }
  };

  return (
    <div>
      <p className="text-xs text-f1-muted mb-2">Select {count} drivers</p>
      <div className="grid grid-cols-2 gap-2 max-h-[280px] overflow-y-auto">
        {DRIVERS_2026.map(driver => {
          const isSelected = selected.includes(driver.name);
          return (
            <button
              key={driver.num}
              onClick={() => toggleDriver(driver.name)}
              disabled={!isSelected && selected.length >= count}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-left transition-all text-sm ${
                isSelected
                  ? "border-f1-green bg-f1-green-bg font-semibold"
                  : selected.length >= count
                  ? "border-f1-border bg-f1-surface opacity-50"
                  : "border-f1-border bg-white hover:border-f1-green/50"
              }`}
            >
              <div
                className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-white text-[10px] font-oswald font-bold"
                style={{ backgroundColor: driver.color }}
              >
                {driver.num}
              </div>
              <span className="truncate text-xs">{driver.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function YesNoResultPicker({ value, onChange }) {
  const current = value || {};

  const update = (field, val) => {
    onChange({ ...current, [field]: val });
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-medium text-f1-secondary uppercase tracking-wide mb-2">
          Was there a safety car?
        </p>
        <div className="flex gap-2">
          {["yes", "no"].map(opt => (
            <button
              key={opt}
              onClick={() => update("yesNo", opt)}
              className={`flex-1 py-3 rounded-lg border font-oswald text-sm font-semibold uppercase transition-all ${
                current.yesNo === opt
                  ? "border-f1-green bg-f1-green-bg text-f1-green"
                  : "border-f1-border bg-white hover:border-f1-green/50"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="text-xs font-medium text-f1-secondary uppercase tracking-wide mb-2">
          Over or under 1.5?
        </p>
        <div className="flex gap-2">
          {["over", "under"].map(opt => (
            <button
              key={opt}
              onClick={() => update("overUnder", opt)}
              className={`flex-1 py-3 rounded-lg border font-oswald text-sm font-semibold uppercase transition-all ${
                current.overUnder === opt
                  ? "border-f1-green bg-f1-green-bg text-f1-green"
                  : "border-f1-border bg-white hover:border-f1-green/50"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function TeammateResultPicker({ value, onChange }) {
  const selected = value || [];

  const togglePick = (index, driverName) => {
    const newPicks = [...selected];
    newPicks[index] = driverName;
    onChange(newPicks);
  };

  return (
    <div className="space-y-3">
      {TEAMMATE_MATCHUPS.map((matchup, i) => (
        <div key={matchup.team} className="bg-f1-surface rounded-lg p-3">
          <p className="text-[10px] font-semibold text-f1-muted uppercase tracking-wide mb-2 text-center">
            {matchup.team}
          </p>
          <div className="flex gap-2">
            {[matchup.driver1, matchup.driver2].map(driver => {
              const driverData = DRIVERS_2026.find(d => d.name === driver);
              return (
                <button
                  key={driver}
                  onClick={() => togglePick(i, driver)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border transition-all ${
                    selected[i] === driver
                      ? "border-f1-green bg-f1-green-bg font-semibold"
                      : "border-f1-border bg-white hover:border-f1-green/50"
                  }`}
                >
                  <div
                    className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-white text-[9px] font-oswald font-bold"
                    style={{ backgroundColor: driverData?.color }}
                  >
                    {driverData?.num}
                  </div>
                  <span className="text-xs text-f1-navy">{driver.split(" ")[1]}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
