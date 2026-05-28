import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { F1MonacoLockup } from "@/components/F1Logo";
import { calculateScore } from "@/utils/gameUtils";
import useGameSubscription from "@/hooks/useGameSubscription";
import { Trophy, Zap, Check, X, ChevronRight, Star } from "lucide-react";

const Game = base44.entities.Game;
const Player = base44.entities.Player;
const Category = base44.entities.Category;
const Prediction = base44.entities.Prediction;

export default function RevealScreen() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [players, setPlayers] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [revealIndex, setRevealIndex] = useState(-1);
  const [revealed, setRevealed] = useState(false);
  const [scores, setScores] = useState({});
  const [loading, setLoading] = useState(true);

  const isHost = sessionStorage.getItem("isHost") === "true";

  useGameSubscription(gameId);

  useEffect(() => {
    loadData();
  }, [gameId]);

  const loadData = async () => {
    try {
      const [catData, playerData, predData] = await Promise.all([
        Category.filter({ game_id: gameId }),
        Player.filter({ game_id: gameId }),
        Prediction.filter({ game_id: gameId }),
      ]);
      setCategories(catData.sort((a, b) => a.sort_order - b.sort_order));
      setPlayers(playerData);
      setPredictions(predData);

      const initialScores = {};
      playerData.forEach(p => { initialScores[p.id] = 0; });
      setScores(initialScores);
    } catch (e) {
      // silent
    } finally {
      setLoading(false);
    }
  };

  const revealNext = () => {
    const nextIndex = revealIndex + 1;
    if (nextIndex >= categories.length) {
      goToScoreboard();
      return;
    }
    setRevealIndex(nextIndex);
    setRevealed(false);

    setTimeout(() => {
      setRevealed(true);
      const cat = categories[nextIndex];
      if (!cat?.correct_answer) return;

      const newScores = { ...scores };
      players.forEach(player => {
        const pred = predictions.find(p => p.player_id === player.id && p.category_id === cat.id);
        if (pred) {
          const pts = calculateScore(pred, cat.correct_answer, cat);
          newScores[player.id] = (newScores[player.id] || 0) + pts;
        }
      });
      setScores(newScores);
    }, 1500);
  };

  const goToScoreboard = async () => {
    try {
      for (const player of players) {
        await Player.update(player.id, { total_score: scores[player.id] || 0 });
      }
      await Game.update(gameId, { phase: "scoreboard" });
      navigate(`/game/${gameId}/scoreboard`);
    } catch (e) {
      navigate(`/game/${gameId}/scoreboard`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-f1-surface flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-f1-border border-t-f1-red rounded-full animate-spin" />
      </div>
    );
  }

  const currentCat = revealIndex >= 0 ? categories[revealIndex] : null;

  return (
    <div className="min-h-screen bg-f1-surface">
      <div className="max-w-[430px] mx-auto px-4 py-5">
        <F1MonacoLockup />

        <h1 className="font-oswald text-2xl font-bold text-f1-navy uppercase mb-1">
          The Reveal
        </h1>
        <p className="text-f1-secondary text-sm mb-5">
          Category by category. How did you do?
        </p>

        <div className="flex items-center gap-1 mb-6">
          {categories.map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-1.5 rounded-full transition-all duration-500 ${
                i < revealIndex ? "bg-f1-green" : i === revealIndex ? "bg-f1-red" : "bg-f1-border"
              }`}
            />
          ))}
        </div>

        {revealIndex === -1 && (
          <div className="bg-white rounded-2xl border border-f1-border shadow-sm p-8 text-center animate-fade-in">
            <Star className="w-12 h-12 text-f1-gold mx-auto mb-4" />
            <p className="font-oswald text-xl font-bold text-f1-navy uppercase mb-2">
              Ready for the reveal?
            </p>
            <p className="text-f1-secondary text-sm mb-6">
              {categories.length} categories to score. One at a time.
            </p>
            {isHost ? (
              <button
                onClick={revealNext}
                className="bg-f1-red text-white rounded-xl px-8 py-3.5 font-oswald text-base font-semibold uppercase tracking-wide hover:bg-red-700 transition-colors active:scale-[0.98]"
              >
                Start Reveal
              </button>
            ) : (
              <p className="text-f1-muted text-sm">Waiting for host to start the reveal...</p>
            )}
          </div>
        )}

        {currentCat && (
          <div className="animate-fade-in">
            <div className="bg-white rounded-2xl border border-f1-border shadow-sm overflow-hidden mb-4">
              <div className="bg-f1-navy px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-f1-gold" />
                  <p className="font-oswald text-white text-lg font-semibold uppercase">
                    {currentCat.name}
                  </p>
                </div>
                <div className="flex items-center gap-1 bg-f1-gold/20 px-2 py-1 rounded-lg">
                  <Zap className="w-3 h-3 text-f1-gold" />
                  <span className="font-oswald text-f1-gold text-sm font-bold">
                    {currentCat.multiplier}x
                  </span>
                </div>
              </div>

              {!revealed && (
                <div className="p-8 text-center">
                  <div className="w-10 h-10 border-3 border-f1-border border-t-f1-red rounded-full animate-spin mx-auto" />
                  <p className="text-f1-muted text-sm mt-3">Revealing...</p>
                </div>
              )}

              {revealed && (
                <div className="p-4 animate-fade-in">
                  <div className="bg-f1-green-bg rounded-xl p-4 mb-4 text-center">
                    <p className="text-xs font-medium text-f1-green uppercase tracking-wide mb-1">
                      Correct Answer
                    </p>
                    <p className="font-oswald text-xl font-bold text-f1-navy">
                      {currentCat.correct_answer}
                    </p>
                  </div>

                  <div className="space-y-2">
                    {players.map(player => {
                      const pred = predictions.find(p => p.player_id === player.id && p.category_id === currentCat.id);
                      const pts = pred ? calculateScore(pred, currentCat.correct_answer, currentCat) : 0;
                      const isCorrect = pts > 0;

                      return (
                        <div
                          key={player.id}
                          className={`flex items-center justify-between px-3 py-2.5 rounded-lg ${
                            isCorrect ? "bg-f1-green-bg" : "bg-f1-surface"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {isCorrect ? (
                              <Check className="w-4 h-4 text-f1-green" />
                            ) : (
                              <X className="w-4 h-4 text-f1-muted" />
                            )}
                            <div
                              className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-oswald font-bold"
                              style={{ backgroundColor: player.avatar_color }}
                            >
                              {player.display_name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <span className="text-sm text-f1-navy font-medium block">{player.display_name}</span>
                              <span className="text-[10px] text-f1-muted">
                                Picked: {pred?.pick || "N/A"}
                              </span>
                            </div>
                          </div>
                          <span className={`font-oswald text-lg font-bold ${isCorrect ? "text-f1-green animate-score-pop" : "text-f1-muted"}`}>
                            {pts > 0 ? `+${pts}` : "0"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl border border-f1-border shadow-sm p-4 mb-4">
              <p className="text-xs font-medium text-f1-muted uppercase tracking-wide mb-2">
                Running Total
              </p>
              <div className="space-y-1.5">
                {[...players]
                  .sort((a, b) => (scores[b.id] || 0) - (scores[a.id] || 0))
                  .map((player, i) => (
                    <div key={player.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-oswald text-xs text-f1-muted w-4">{i + 1}</span>
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-oswald font-bold"
                          style={{ backgroundColor: player.avatar_color }}
                        >
                          {player.display_name?.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm text-f1-navy">{player.display_name}</span>
                      </div>
                      <span className="font-oswald text-sm font-bold text-f1-navy">{scores[player.id] || 0}</span>
                    </div>
                  ))}
              </div>
            </div>

            {isHost && revealed && (
              <button
                onClick={revealIndex < categories.length - 1 ? revealNext : goToScoreboard}
                className="w-full bg-f1-red text-white rounded-xl px-5 py-4 font-oswald text-base font-semibold uppercase tracking-wide hover:bg-red-700 transition-colors active:scale-[0.98]"
              >
                <span className="flex items-center justify-center gap-2">
                  {revealIndex < categories.length - 1 ? "Next Category" : "Final Scoreboard"}
                  <ChevronRight className="w-4 h-4" />
                </span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
