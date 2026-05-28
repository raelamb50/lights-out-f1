import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { F1MonacoLockup } from "@/components/F1Logo";
import DriverPaddock from "@/components/DriverPaddock";
import { DRIVERS_2026, TEAMMATE_MATCHUPS } from "@/data/drivers";
import { validateConfidencePoints } from "@/utils/gameUtils";
import useGameSubscription from "@/hooks/useGameSubscription";
import { ChevronLeft, ChevronRight, BookOpen, Check, Lock, Trophy, Zap } from "lucide-react";

const Category = base44.entities.Category;
const Prediction = base44.entities.Prediction;
const Player = base44.entities.Player;

export default function PredictionsScreen() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [picks, setPicks] = useState({});
  const [confidence, setConfidence] = useState({});
  const [showConfidence, setShowConfidence] = useState(false);
  const [showPaddock, setShowPaddock] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const cardRef = useRef(null);

  const playerId = sessionStorage.getItem("playerId");

  useGameSubscription(gameId);

  useEffect(() => {
    loadCategories();
  }, [gameId]);

  const loadCategories = async () => {
    try {
      const cats = await Category.filter({ game_id: gameId });
      const sorted = cats.sort((a, b) => a.sort_order - b.sort_order);
      setCategories(sorted);
      const initial = {};
      sorted.forEach(c => { initial[c.id] = Math.floor(100 / sorted.length); });
      const remainder = 100 - Object.values(initial).reduce((a, b) => a + b, 0);
      if (sorted.length > 0) initial[sorted[0].id] += remainder;
      setConfidence(initial);
    } catch (e) {
      // silent
    } finally {
      setLoading(false);
    }
  };

  const currentCategory = categories[currentIndex];
  const totalCategories = categories.length;
  const allPicked = categories.every(c => picks[c.id] !== undefined);

  const handlePick = (categoryId, value) => {
    setPicks(prev => ({ ...prev, [categoryId]: value }));
  };

  const handleNext = () => {
    if (currentIndex < totalCategories - 1) {
      setCurrentIndex(currentIndex + 1);
    } else if (allPicked) {
      setShowConfidence(true);
    }
  };

  const handlePrev = () => {
    if (showConfidence) {
      setShowConfidence(false);
    } else if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleConfidenceChange = (catId, value) => {
    setConfidence(prev => ({ ...prev, [catId]: parseInt(value) }));
  };

  const validation = validateConfidencePoints(confidence);

  const handleSubmit = async () => {
    if (!validation.isValid) return;
    setSubmitting(true);

    try {
      for (const cat of categories) {
        const pickValue = typeof picks[cat.id] === "object"
          ? JSON.stringify(picks[cat.id])
          : String(picks[cat.id]);

        await Prediction.create({
          game_id: gameId,
          player_id: playerId,
          category_id: cat.id,
          pick: pickValue,
          confidence_points: confidence[cat.id],
        });
      }

      await Player.update(playerId, { has_submitted: true });
      navigate(`/game/${gameId}/waiting`);
    } catch (e) {
      console.error("Submit error:", e);
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

  return (
    <div className="min-h-screen bg-f1-surface">
      <div className="max-w-[430px] mx-auto px-4 py-5">
        <F1MonacoLockup />

        <div className="flex items-center justify-between mb-4">
          <h1 className="font-oswald text-2xl font-bold text-f1-navy uppercase">
            {showConfidence ? "Confidence" : "Predictions"}
          </h1>
          <button
            onClick={() => setShowPaddock(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-f1-border text-f1-secondary text-xs hover:border-f1-red transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5" />
            Drivers
          </button>
        </div>

        {!showConfidence && (
          <>
            <div className="flex items-center gap-1 mb-4">
              {categories.map((_, i) => (
                <div
                  key={i}
                  className={`flex-1 h-1 rounded-full transition-colors ${
                    i < currentIndex ? "bg-f1-green" : i === currentIndex ? "bg-f1-red" : "bg-f1-border"
                  }`}
                />
              ))}
            </div>

            {currentCategory && (
              <div ref={cardRef} className="animate-fade-in">
                <div className="bg-white rounded-2xl border border-f1-border shadow-sm overflow-hidden mb-4">
                  <div className="bg-f1-navy px-4 py-3 flex items-center justify-between">
                    <div>
                      <p className="font-oswald text-white text-lg font-semibold uppercase">
                        {currentCategory.name}
                      </p>
                      <p className="text-white/60 text-xs">{currentCategory.description}</p>
                    </div>
                    <div className="flex items-center gap-1 bg-f1-gold/20 px-2 py-1 rounded-lg">
                      <Zap className="w-3 h-3 text-f1-gold" />
                      <span className="font-oswald text-f1-gold text-sm font-bold">
                        {currentCategory.multiplier}x
                      </span>
                    </div>
                  </div>

                  <div className="p-4">
                    <CategoryPicker
                      category={currentCategory}
                      value={picks[currentCategory.id]}
                      onChange={(val) => handlePick(currentCategory.id, val)}
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="flex items-center gap-1 text-f1-secondary text-sm disabled:opacity-30 hover:text-f1-navy transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
              <span className="text-f1-muted text-xs font-oswald">
                {currentIndex + 1} / {totalCategories}
              </span>
              <button
                onClick={handleNext}
                disabled={picks[currentCategory?.id] === undefined}
                className="flex items-center gap-1 text-f1-red text-sm font-semibold disabled:opacity-30 hover:text-red-700 transition-colors"
              >
                {currentIndex === totalCategories - 1 && allPicked ? "Confidence" : "Next"}
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </>
        )}

        {showConfidence && (
          <div className="animate-fade-in">
            <p className="text-f1-secondary text-sm mb-4">
              Distribute 100 points across categories. More points = more at stake.
              Max 30 per category.
            </p>

            <div className="space-y-3 mb-6">
              {categories.map(cat => (
                <div key={cat.id} className="bg-white rounded-xl border border-f1-border shadow-sm p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-oswald text-sm font-semibold text-f1-navy uppercase">
                      {cat.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-oswald text-lg font-bold text-f1-red">
                        {confidence[cat.id]}
                      </span>
                      <span className="text-f1-muted text-xs">pts</span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={30}
                    value={confidence[cat.id] || 0}
                    onChange={(e) => handleConfidenceChange(cat.id, e.target.value)}
                    className="w-full"
                  />
                  <div className="flex items-center gap-1 mt-1.5">
                    <Check className="w-3 h-3 text-f1-green" />
                    <span className="text-[11px] text-f1-muted truncate">
                      {typeof picks[cat.id] === "object"
                        ? JSON.stringify(picks[cat.id])
                        : picks[cat.id]}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className={`text-center mb-4 px-4 py-2 rounded-lg ${
              validation.isValid ? "bg-f1-green-bg text-f1-green" : "bg-f1-red-bg text-f1-red"
            }`}>
              <span className="font-oswald text-sm font-semibold">
                {validation.isValid
                  ? "100 points allocated"
                  : `${validation.sum} / 100 points used (${validation.remaining > 0 ? validation.remaining + " remaining" : Math.abs(validation.remaining) + " over"})`
                }
              </span>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handlePrev}
                className="flex-1 bg-white border border-f1-border text-f1-navy rounded-xl px-4 py-3.5 font-oswald text-sm font-semibold uppercase hover:border-f1-red transition-colors"
              >
                Edit Picks
              </button>
              <button
                onClick={handleSubmit}
                disabled={!validation.isValid || submitting}
                className="flex-1 bg-f1-red text-white rounded-xl px-4 py-3.5 font-oswald text-sm font-semibold uppercase hover:bg-red-700 transition-colors disabled:opacity-40 active:scale-[0.98]"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Lock className="w-4 h-4" />
                    Lock In
                  </span>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      <DriverPaddock open={showPaddock} onClose={() => setShowPaddock(false)} />
    </div>
  );
}

function CategoryPicker({ category, value, onChange }) {
  if (category.category_type === "single_driver") {
    return (
      <SingleDriverPicker value={value} onChange={onChange} />
    );
  }

  if (category.category_type === "multi_driver") {
    return (
      <MultiDriverPicker value={value} onChange={onChange} count={3} />
    );
  }

  if (category.category_type === "yes_no_count") {
    return (
      <YesNoCountPicker value={value} onChange={onChange} />
    );
  }

  if (category.category_type === "teammate_duel") {
    return (
      <TeammateDuelPicker value={value} onChange={onChange} />
    );
  }

  return null;
}

function SingleDriverPicker({ value, onChange }) {
  const [search, setSearch] = useState("");
  const filtered = DRIVERS_2026.filter(d =>
    !search || d.name.toLowerCase().includes(search.toLowerCase()) || d.team.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search driver..."
        className="w-full px-3 py-2 bg-f1-surface rounded-lg border border-f1-border text-sm mb-3 focus:outline-none focus:border-f1-red transition-colors"
      />
      <div className="grid grid-cols-2 gap-2 max-h-[320px] overflow-y-auto pr-1">
        {filtered.map(driver => (
          <button
            key={driver.num}
            onClick={() => onChange(driver.name)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-left transition-all text-sm ${
              value === driver.name
                ? "border-f1-red bg-f1-red-bg text-f1-navy font-semibold"
                : "border-f1-border bg-white text-f1-navy hover:border-f1-red/50"
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

function MultiDriverPicker({ value, onChange, count }) {
  const selected = value || [];
  const [search, setSearch] = useState("");
  const filtered = DRIVERS_2026.filter(d =>
    !search || d.name.toLowerCase().includes(search.toLowerCase()) || d.team.toLowerCase().includes(search.toLowerCase())
  );

  const toggleDriver = (name) => {
    if (selected.includes(name)) {
      onChange(selected.filter(n => n !== name));
    } else if (selected.length < count) {
      onChange([...selected, name]);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search driver..."
          className="flex-1 px-3 py-2 bg-f1-surface rounded-lg border border-f1-border text-sm focus:outline-none focus:border-f1-red transition-colors"
        />
        <span className={`ml-2 font-oswald text-sm font-bold ${selected.length === count ? "text-f1-green" : "text-f1-muted"}`}>
          {selected.length}/{count}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2 max-h-[320px] overflow-y-auto pr-1">
        {filtered.map(driver => {
          const isSelected = selected.includes(driver.name);
          const position = isSelected ? selected.indexOf(driver.name) + 1 : null;
          return (
            <button
              key={driver.num}
              onClick={() => toggleDriver(driver.name)}
              disabled={!isSelected && selected.length >= count}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-left transition-all text-sm ${
                isSelected
                  ? "border-f1-green bg-f1-green-bg text-f1-navy font-semibold"
                  : selected.length >= count
                  ? "border-f1-border bg-f1-surface text-f1-muted opacity-50 cursor-not-allowed"
                  : "border-f1-border bg-white text-f1-navy hover:border-f1-green/50"
              }`}
            >
              <div
                className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-white text-[10px] font-oswald font-bold"
                style={{ backgroundColor: driver.color }}
              >
                {isSelected ? position : driver.num}
              </div>
              <span className="truncate text-xs">{driver.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function YesNoCountPicker({ value, onChange }) {
  const current = value || {};

  const update = (field, val) => {
    onChange({ ...current, [field]: val });
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-medium text-f1-secondary uppercase tracking-wide mb-2">
          Safety Car?
        </p>
        <div className="flex gap-2">
          {["yes", "no"].map(opt => (
            <button
              key={opt}
              onClick={() => update("yesNo", opt)}
              className={`flex-1 py-3 rounded-lg border font-oswald text-sm font-semibold uppercase transition-all ${
                current.yesNo === opt
                  ? "border-f1-red bg-f1-red-bg text-f1-red"
                  : "border-f1-border bg-white text-f1-navy hover:border-f1-red/50"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="text-xs font-medium text-f1-secondary uppercase tracking-wide mb-2">
          Over / Under 1.5 safety cars
        </p>
        <div className="flex gap-2">
          {["over", "under"].map(opt => (
            <button
              key={opt}
              onClick={() => update("overUnder", opt)}
              className={`flex-1 py-3 rounded-lg border font-oswald text-sm font-semibold uppercase transition-all ${
                current.overUnder === opt
                  ? "border-f1-gold bg-f1-gold-bg text-f1-gold"
                  : "border-f1-border bg-white text-f1-navy hover:border-f1-gold/50"
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

function TeammateDuelPicker({ value, onChange }) {
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
