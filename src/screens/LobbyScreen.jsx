import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { F1MonacoLockup } from "@/components/F1Logo";
import DriverPaddock from "@/components/DriverPaddock";
import MonacoCircuit from "@/components/MonacoCircuit";
import { MONACO_2026, DEFAULT_CATEGORIES } from "@/data/races";
import useGameSubscription from "@/hooks/useGameSubscription";
import { Copy, Check, Users, ChevronDown, ChevronUp, Flag, BookOpen, Map } from "lucide-react";

const Game = base44.entities.Game;
const Player = base44.entities.Player;
const Category = base44.entities.Category;

export default function LobbyScreen() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const [game, setGame] = useState(null);
  const [players, setPlayers] = useState([]);
  const [copied, setCopied] = useState(false);
  const [showStateOfPlay, setShowStateOfPlay] = useState(false);
  const [showPaddock, setShowPaddock] = useState(false);
  const [showCircuit, setShowCircuit] = useState(false);
  const [loading, setLoading] = useState(true);
  const [openingPredictions, setOpeningPredictions] = useState(false);

  const isHost = sessionStorage.getItem("isHost") === "true";

  useGameSubscription(gameId);

  useEffect(() => {
    loadData();
    const unsubPlayers = Player.subscribe(() => loadPlayers());
    return () => unsubPlayers?.();
  }, [gameId]);

  const loadData = async () => {
    try {
      const [gameData, playerData] = await Promise.all([
        Game.get(gameId),
        Player.filter({ game_id: gameId }),
      ]);
      setGame(gameData);
      setPlayers(playerData);
    } catch (e) {
      // silent
    } finally {
      setLoading(false);
    }
  };

  const loadPlayers = async () => {
    try {
      const data = await Player.filter({ game_id: gameId });
      setPlayers(data);
    } catch (e) {
      // silent
    }
  };

  const copyCode = () => {
    if (!game) return;
    navigator.clipboard.writeText(game.room_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openPredictions = async () => {
    setOpeningPredictions(true);
    try {
      for (const cat of DEFAULT_CATEGORIES) {
        await Category.create({
          game_id: gameId,
          ...cat,
        });
      }
      await Game.update(gameId, { phase: "predictions" });
    } catch (e) {
      // silent
    } finally {
      setOpeningPredictions(false);
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

        <h1 className="font-oswald text-2xl font-bold text-f1-navy uppercase mb-1">
          Game Lobby
        </h1>
        <p className="text-f1-secondary text-sm mb-5">
          {MONACO_2026.name} &middot; {MONACO_2026.circuit}
        </p>

        <div className="bg-white rounded-xl border border-f1-border shadow-sm p-4 mb-4">
          <p className="text-xs font-medium text-f1-muted uppercase tracking-wide mb-2">
            Room Code
          </p>
          <div className="flex items-center justify-between">
            <span className="font-oswald text-4xl font-bold text-f1-navy tracking-[0.2em]">
              {game?.room_code}
            </span>
            <button
              onClick={copyCode}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-f1-surface text-f1-secondary text-sm hover:bg-f1-border transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-f1-green" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-f1-border shadow-sm p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-f1-red" />
              <span className="font-oswald text-sm font-semibold text-f1-navy uppercase">
                Players ({players.length})
              </span>
            </div>
          </div>
          <div className="space-y-2">
            {players.map((player) => (
              <div
                key={player.id}
                className="flex items-center gap-3 px-3 py-2 rounded-lg bg-f1-surface"
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white font-oswald text-sm font-bold"
                  style={{ backgroundColor: player.avatar_color }}
                >
                  {player.display_name?.charAt(0).toUpperCase()}
                </div>
                <span className="font-medium text-f1-navy text-sm flex-1">
                  {player.display_name}
                </span>
                {player.is_host && (
                  <span className="text-[10px] font-semibold text-f1-red bg-f1-red-bg px-2 py-0.5 rounded-full uppercase">
                    Host
                  </span>
                )}
              </div>
            ))}
            {players.length === 0 && (
              <p className="text-f1-muted text-sm text-center py-3">
                Waiting for players to join...
              </p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-f1-border shadow-sm mb-4 overflow-hidden">
          <button
            onClick={() => setShowStateOfPlay(!showStateOfPlay)}
            className="w-full flex items-center justify-between p-4"
          >
            <div className="flex items-center gap-2">
              <Flag className="w-4 h-4 text-f1-gold" />
              <span className="font-oswald text-sm font-semibold text-f1-navy uppercase">
                State of Play
              </span>
            </div>
            {showStateOfPlay ? (
              <ChevronUp className="w-4 h-4 text-f1-muted" />
            ) : (
              <ChevronDown className="w-4 h-4 text-f1-muted" />
            )}
          </button>
          {showStateOfPlay && (
            <div className="px-4 pb-4 space-y-3 animate-fade-in">
              {MONACO_2026.stateOfPlay.map((item, i) => (
                <div key={i} className="bg-f1-surface rounded-lg p-3">
                  <p className="text-[10px] font-semibold text-f1-red uppercase tracking-wide mb-1">
                    {item.label}
                  </p>
                  <p className="text-sm text-f1-navy leading-snug">{item.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={() => setShowPaddock(true)}
          className="w-full flex items-center justify-between bg-white rounded-xl border border-f1-border shadow-sm p-4 mb-3 hover:border-f1-red transition-colors"
        >
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-f1-green" />
            <span className="font-oswald text-sm font-semibold text-f1-navy uppercase">
              Meet the Drivers
            </span>
          </div>
          <span className="text-f1-muted text-xs">22 drivers</span>
        </button>

        <button
          onClick={() => setShowCircuit(true)}
          className="w-full flex items-center justify-between bg-white rounded-xl border border-f1-border shadow-sm p-4 mb-6 hover:border-f1-red transition-colors"
        >
          <div className="flex items-center gap-2">
            <Map className="w-4 h-4 text-f1-gold" />
            <span className="font-oswald text-sm font-semibold text-f1-navy uppercase">
              Circuit Guide
            </span>
          </div>
          <span className="text-f1-muted text-xs">10 corners</span>
        </button>

        {isHost && (
          <button
            onClick={openPredictions}
            disabled={openingPredictions || players.length < 1}
            className="w-full bg-f1-red text-white rounded-xl px-5 py-4 font-oswald text-base font-semibold uppercase tracking-wide hover:bg-red-700 transition-colors disabled:opacity-40 active:scale-[0.98]"
          >
            {openingPredictions ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Opening...
              </span>
            ) : (
              "Open Predictions"
            )}
          </button>
        )}

        {!isHost && (
          <div className="text-center py-4">
            <p className="text-f1-muted text-sm">Waiting for host to open predictions...</p>
          </div>
        )}
      </div>

      <DriverPaddock open={showPaddock} onClose={() => setShowPaddock(false)} />
      <MonacoCircuit open={showCircuit} onClose={() => setShowCircuit(false)} />
    </div>
  );
}
