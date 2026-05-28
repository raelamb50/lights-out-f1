import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { F1Logo } from "@/components/F1Logo";
import { MONACO_2026 } from "@/data/races";
import { AVATAR_COLORS } from "@/data/drivers";
import { generateRoomCode } from "@/utils/gameUtils";
import { Users, Plus, ArrowRight, Zap } from "lucide-react";

const Game = base44.entities.Game;
const Player = base44.entities.Player;

export default function HomeScreen() {
  const navigate = useNavigate();
  const [mode, setMode] = useState(null);
  const [playerName, setPlayerName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCreate = async () => {
    if (!playerName.trim()) return;
    setLoading(true);
    setError("");

    try {
      const code = generateRoomCode();
      const hostId = "host_" + Date.now();
      const game = await Game.create({
        room_code: code,
        race_name: MONACO_2026.name,
        phase: "lobby",
        host_id: hostId,
        host_name: playerName.trim(),
        race_date: MONACO_2026.date,
        circuit_name: MONACO_2026.circuit,
        circuit_laps: MONACO_2026.laps,
        circuit_length_km: MONACO_2026.lengthKm,
        state_of_play: JSON.stringify(MONACO_2026.stateOfPlay),
      });

      const player = await Player.create({
        game_id: game.id,
        user_id: hostId,
        display_name: playerName.trim(),
        avatar_color: AVATAR_COLORS[0],
        is_host: true,
        has_submitted: false,
        total_score: 0,
        pre_race_score: 0,
        live_score: 0,
      });

      sessionStorage.setItem("playerId", player.id);
      sessionStorage.setItem("playerName", playerName.trim());
      sessionStorage.setItem("isHost", "true");
      navigate(`/game/${game.id}/lobby`);
    } catch (e) {
      setError("Failed to create game. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!playerName.trim() || !roomCode.trim()) return;
    setLoading(true);
    setError("");

    try {
      const games = await Game.filter({ room_code: roomCode.trim().toUpperCase() });
      if (!games || games.length === 0) {
        setError("Game not found. Check your code.");
        setLoading(false);
        return;
      }

      const game = games[0];
      if (game.phase !== "lobby") {
        setError("This game has already started.");
        setLoading(false);
        return;
      }

      const existingPlayers = await Player.filter({ game_id: game.id });
      const colorIndex = existingPlayers.length % AVATAR_COLORS.length;

      const player = await Player.create({
        game_id: game.id,
        user_id: "guest_" + Date.now(),
        display_name: playerName.trim(),
        avatar_color: AVATAR_COLORS[colorIndex],
        is_host: false,
        has_submitted: false,
        total_score: 0,
        pre_race_score: 0,
        live_score: 0,
      });

      sessionStorage.setItem("playerId", player.id);
      sessionStorage.setItem("playerName", playerName.trim());
      sessionStorage.setItem("isHost", "false");
      navigate(`/game/${game.id}/lobby`);
    } catch (e) {
      setError("Failed to join game. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-f1-warm flex items-center justify-center px-4">
      <div className="w-full max-w-[430px]">
        <div className="text-center mb-10">
          <F1Logo className="w-24 h-auto mx-auto mb-3" />
          <h1 className="font-oswald text-4xl font-bold text-f1-navy uppercase tracking-tight">
            Lights Out
          </h1>
          <p className="text-f1-secondary text-sm mt-1">
            The F1 prediction game
          </p>
          <div className="mt-4 inline-flex items-center gap-2 bg-white border border-f1-border rounded-full px-4 py-1.5">
            <Zap className="w-3.5 h-3.5 text-f1-red" />
            <span className="font-oswald text-xs font-medium text-f1-navy uppercase tracking-wide">
              {MONACO_2026.name} &middot; {new Date(MONACO_2026.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </span>
          </div>
        </div>

        {!mode && (
          <div className="space-y-3 animate-fade-in">
            <button
              onClick={() => setMode("create")}
              className="w-full flex items-center justify-between bg-f1-red text-white rounded-xl px-5 py-4 font-oswald text-lg font-semibold uppercase tracking-wide hover:bg-red-700 transition-colors active:scale-[0.98]"
            >
              <span className="flex items-center gap-3">
                <Plus className="w-5 h-5" />
                Create Game
              </span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => setMode("join")}
              className="w-full flex items-center justify-between bg-white border-2 border-f1-border text-f1-navy rounded-xl px-5 py-4 font-oswald text-lg font-semibold uppercase tracking-wide hover:border-f1-red hover:text-f1-red transition-colors active:scale-[0.98]"
            >
              <span className="flex items-center gap-3">
                <Users className="w-5 h-5" />
                Join Game
              </span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {mode && (
          <div className="bg-white rounded-2xl border border-f1-border shadow-sm p-5 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-oswald text-lg font-semibold text-f1-navy uppercase">
                {mode === "create" ? "Create Game" : "Join Game"}
              </h2>
              <button
                onClick={() => { setMode(null); setError(""); }}
                className="text-f1-muted text-sm hover:text-f1-navy transition-colors"
              >
                Back
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-f1-secondary uppercase tracking-wide mb-1 block">
                  Your Name
                </label>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Enter your name"
                  maxLength={20}
                  className="w-full px-4 py-3 bg-f1-surface rounded-lg border border-f1-border text-f1-navy font-medium focus:outline-none focus:border-f1-red transition-colors"
                />
              </div>

              {mode === "join" && (
                <div>
                  <label className="text-xs font-medium text-f1-secondary uppercase tracking-wide mb-1 block">
                    Room Code
                  </label>
                  <input
                    type="text"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    placeholder="XXXX"
                    maxLength={4}
                    className="w-full px-4 py-3 bg-f1-surface rounded-lg border border-f1-border text-f1-navy font-oswald text-xl font-bold text-center tracking-[0.3em] uppercase focus:outline-none focus:border-f1-red transition-colors"
                  />
                </div>
              )}

              {error && (
                <p className="text-f1-red text-sm text-center bg-f1-red-bg rounded-lg py-2">
                  {error}
                </p>
              )}

              <button
                onClick={mode === "create" ? handleCreate : handleJoin}
                disabled={loading || !playerName.trim() || (mode === "join" && roomCode.length < 4)}
                className="w-full bg-f1-red text-white rounded-xl px-5 py-3.5 font-oswald text-base font-semibold uppercase tracking-wide hover:bg-red-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {mode === "create" ? "Creating..." : "Joining..."}
                  </span>
                ) : mode === "create" ? (
                  "Create Game"
                ) : (
                  "Join Game"
                )}
              </button>
            </div>
          </div>
        )}

        <p className="text-center text-f1-muted text-xs mt-6">
          Tap cards. Make calls. Score points.
        </p>
      </div>
    </div>
  );
}
