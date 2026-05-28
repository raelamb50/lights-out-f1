import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { F1MonacoLockup } from "@/components/F1Logo";
import DriverPaddock from "@/components/DriverPaddock";
import MonacoCircuit from "@/components/MonacoCircuit";
import EmojiBar from "@/components/EmojiBar";
import { generateBlindPollInsights } from "@/utils/gameUtils";
import useGameSubscription from "@/hooks/useGameSubscription";
import { Clock, Eye, Users, Lock, BookOpen, Map } from "lucide-react";

const Game = base44.entities.Game;
const Player = base44.entities.Player;
const Prediction = base44.entities.Prediction;
const Category = base44.entities.Category;

export default function WaitingScreen() {
  const { gameId } = useParams();
  const [game, setGame] = useState(null);
  const [players, setPlayers] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [insights, setInsights] = useState([]);
  const [showInsights, setShowInsights] = useState(false);
  const [showPaddock, setShowPaddock] = useState(false);
  const [showCircuit, setShowCircuit] = useState(false);
  const [submittedCount, setSubmittedCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const playerId = sessionStorage.getItem("playerId");
  const isHost = sessionStorage.getItem("isHost") === "true";

  useGameSubscription(gameId);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, [gameId]);

  const loadData = async () => {
    try {
      const [gameData, playerData, predData, catData] = await Promise.all([
        Game.get(gameId),
        Player.filter({ game_id: gameId }),
        Prediction.filter({ game_id: gameId }),
        Category.filter({ game_id: gameId }),
      ]);
      setGame(gameData);
      setPlayers(playerData);
      setPredictions(predData);
      setCategories(catData);

      const playerIdsWithPredictions = [...new Set(predData.map(p => p.player_id))];
      setSubmittedCount(playerIdsWithPredictions.length);

      if (playerIdsWithPredictions.length === playerData.length && playerData.length > 0) {
        const blindInsights = generateBlindPollInsights(predData, catData);
        setInsights(blindInsights);
        setShowInsights(true);
      }
    } catch (e) {
      // silent
    } finally {
      setLoading(false);
    }
  };

  const lockPredictions = async () => {
    try {
      await Game.update(gameId, { phase: "locked" });
    } catch (e) {
      // silent
    }
  };

  const startLiveRounds = async () => {
    try {
      await Game.update(gameId, { phase: "live" });
    } catch (e) {
      // silent
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-f1-surface flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-f1-border border-t-f1-red rounded-full animate-spin" />
      </div>
    );
  }

  const allSubmitted = submittedCount === players.length && players.length > 0;
  const isLocked = game?.phase === "locked";

  return (
    <div className="min-h-screen bg-f1-surface">
      <div className="max-w-[430px] mx-auto px-4 py-5">
        <F1MonacoLockup />

        <h1 className="font-oswald text-2xl font-bold text-f1-navy uppercase mb-1">
          {isLocked ? "Locked In" : "Waiting Room"}
        </h1>
        <p className="text-f1-secondary text-sm mb-5">
          {isLocked ? "Ready for live rounds" : "Predictions are in progress"}
        </p>

        <div className="bg-white rounded-xl border border-f1-border shadow-sm p-5 mb-4 text-center">
          <div className="w-16 h-16 rounded-full bg-f1-surface flex items-center justify-center mx-auto mb-3">
            {allSubmitted ? (
              <Lock className="w-7 h-7 text-f1-green" />
            ) : (
              <Clock className="w-7 h-7 text-f1-muted animate-pulse" />
            )}
          </div>
          <p className="font-oswald text-lg font-semibold text-f1-navy uppercase">
            {allSubmitted ? "All predictions in" : "Waiting for players"}
          </p>
          <div className="flex items-center justify-center gap-2 mt-2">
            <Users className="w-4 h-4 text-f1-muted" />
            <span className="text-f1-secondary text-sm">
              {submittedCount} of {players.length} submitted
            </span>
          </div>

          <div className="flex gap-1.5 justify-center mt-4">
            {players.map((player) => {
              const hasSubmitted = predictions.some(p => p.player_id === player.id);
              return (
                <div
                  key={player.id}
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-oswald font-bold transition-all ${
                    hasSubmitted ? "ring-2 ring-f1-green ring-offset-2" : "opacity-40"
                  }`}
                  style={{ backgroundColor: player.avatar_color }}
                  title={player.display_name}
                >
                  {player.display_name?.charAt(0).toUpperCase()}
                </div>
              );
            })}
          </div>
        </div>

        {showInsights && insights.length > 0 && (
          <div className="bg-white rounded-xl border border-f1-border shadow-sm p-5 mb-4 animate-fade-in">
            <div className="flex items-center gap-2 mb-3">
              <Eye className="w-4 h-4 text-f1-gold" />
              <span className="font-oswald text-sm font-semibold text-f1-navy uppercase">
                Blind Poll
              </span>
            </div>
            {insights.map((insight, i) => (
              <div key={i} className="bg-f1-gold-bg rounded-lg p-3 mb-2 last:mb-0">
                <p className="text-sm text-f1-navy font-medium">{insight.text}</p>
                {insight.rogue && (
                  <p className="text-xs text-f1-gold mt-1">{insight.rogue}</p>
                )}
              </div>
            ))}
          </div>
        )}

        <EmojiBar gameId={gameId} playerId={playerId} />

        <div className="flex gap-3 mt-4">
          <button
            onClick={() => setShowPaddock(true)}
            className="flex-1 flex items-center justify-between bg-white rounded-xl border border-f1-border shadow-sm p-4 hover:border-f1-red transition-colors"
          >
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-f1-green" />
              <span className="font-oswald text-sm font-semibold text-f1-navy uppercase">
                Meet the Drivers
              </span>
            </div>
            <span className="text-f1-muted text-xs">22 drivers</span>
          </button>
        </div>

        <div className="flex gap-3 mt-3 mb-4">
          <button
            onClick={() => setShowCircuit(true)}
            className="flex-1 flex items-center justify-between bg-white rounded-xl border border-f1-border shadow-sm p-4 hover:border-f1-red transition-colors"
          >
            <div className="flex items-center gap-2">
              <Map className="w-4 h-4 text-f1-gold" />
              <span className="font-oswald text-sm font-semibold text-f1-navy uppercase">
                Circuit Guide
              </span>
            </div>
            <span className="text-f1-muted text-xs">10 corners</span>
          </button>
        </div>

        {isHost && (
          <div className="space-y-3 mt-4">
            {!isLocked && (
              <button
                onClick={lockPredictions}
                disabled={!allSubmitted}
                className="w-full bg-f1-navy text-white rounded-xl px-5 py-4 font-oswald text-base font-semibold uppercase tracking-wide hover:bg-f1-navy/90 transition-colors disabled:opacity-40 active:scale-[0.98]"
              >
                <span className="flex items-center justify-center gap-2">
                  <Lock className="w-4 h-4" />
                  Lock Predictions
                </span>
              </button>
            )}
            {isLocked && (
              <button
                onClick={startLiveRounds}
                className="w-full bg-f1-red text-white rounded-xl px-5 py-4 font-oswald text-base font-semibold uppercase tracking-wide hover:bg-red-700 transition-colors active:scale-[0.98]"
              >
                Start Live Rounds
              </button>
            )}
          </div>
        )}

        {!isHost && (
          <div className="text-center py-4">
            <p className="text-f1-muted text-sm">
              {isLocked ? "Host will start live rounds soon..." : "Sit tight while everyone makes their calls..."}
            </p>
          </div>
        )}
      </div>

      <DriverPaddock open={showPaddock} onClose={() => setShowPaddock(false)} />
      <MonacoCircuit open={showCircuit} onClose={() => setShowCircuit(false)} />
    </div>
  );
}
