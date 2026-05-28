import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { F1MonacoLockup } from "@/components/F1Logo";
import { MONACO_2026 } from "@/data/races";
import { Trophy, Medal, Share2, Home, Crown } from "lucide-react";

const Player = base44.entities.Player;

const PODIUM_STYLES = [
  { bg: "bg-f1-gold-bg", border: "border-f1-gold", text: "text-f1-gold", label: "1ST", height: "h-28" },
  { bg: "bg-f1-surface", border: "border-f1-border", text: "text-f1-secondary", label: "2ND", height: "h-20" },
  { bg: "bg-f1-surface", border: "border-f1-border", text: "text-f1-secondary", label: "3RD", height: "h-16" },
];

export default function ScoreboardScreen() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showShare, setShowShare] = useState(false);

  useEffect(() => {
    loadData();
  }, [gameId]);

  const loadData = async () => {
    try {
      const data = await Player.filter({ game_id: gameId });
      setPlayers(data.sort((a, b) => (b.total_score || 0) - (a.total_score || 0)));
    } catch (e) {
      // silent
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    const winner = players[0];
    const text = [
      `LIGHTS OUT - ${MONACO_2026.name}`,
      "",
      "Final Standings:",
      ...players.map((p, i) => `${i + 1}. ${p.display_name} - ${p.total_score || 0} pts`),
      "",
      winner ? `${winner.display_name} wins!` : "",
    ].join("\n");

    if (navigator.share) {
      try {
        await navigator.share({ title: "Lights Out - F1 Predictions", text });
      } catch (e) {
        // user cancelled
      }
    } else {
      await navigator.clipboard.writeText(text);
      setShowShare(true);
      setTimeout(() => setShowShare(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-f1-surface flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-f1-border border-t-f1-red rounded-full animate-spin" />
      </div>
    );
  }

  const podiumPlayers = players.slice(0, 3);
  const restPlayers = players.slice(3);
  const podiumOrder = podiumPlayers.length >= 3
    ? [podiumPlayers[1], podiumPlayers[0], podiumPlayers[2]]
    : podiumPlayers;

  return (
    <div className="min-h-screen bg-f1-surface">
      <div className="max-w-[430px] mx-auto px-4 py-5">
        <F1MonacoLockup />

        <h1 className="font-oswald text-2xl font-bold text-f1-navy uppercase mb-1">
          Scoreboard
        </h1>
        <p className="text-f1-secondary text-sm mb-6">
          {MONACO_2026.name} &middot; Final Results
        </p>

        {podiumPlayers.length > 0 && (
          <div className="bg-white rounded-2xl border border-f1-border shadow-sm p-5 mb-4">
            <div className="flex items-center justify-center gap-2 mb-6">
              <Trophy className="w-5 h-5 text-f1-gold" />
              <span className="font-oswald text-lg font-semibold text-f1-navy uppercase">
                Podium
              </span>
            </div>

            <div className="flex items-end justify-center gap-3 mb-4">
              {podiumOrder.map((player, displayIdx) => {
                if (!player) return null;
                const actualRank = players.indexOf(player);
                const style = PODIUM_STYLES[actualRank] || PODIUM_STYLES[2];
                const isWinner = actualRank === 0;

                return (
                  <div key={player.id} className="flex flex-col items-center" style={{ flex: isWinner ? 1.2 : 1 }}>
                    <div className="relative mb-2">
                      {isWinner && (
                        <Crown className="w-6 h-6 text-f1-gold absolute -top-5 left-1/2 -translate-x-1/2" />
                      )}
                      <div
                        className={`rounded-full flex items-center justify-center text-white font-oswald font-bold ${
                          isWinner ? "w-16 h-16 text-2xl ring-4 ring-f1-gold ring-offset-2" : "w-12 h-12 text-lg"
                        }`}
                        style={{ backgroundColor: player.avatar_color }}
                      >
                        {player.display_name?.charAt(0).toUpperCase()}
                      </div>
                    </div>
                    <p className={`font-oswald font-semibold text-f1-navy text-center ${isWinner ? "text-sm" : "text-xs"}`}>
                      {player.display_name}
                    </p>
                    <p className={`font-oswald font-bold ${isWinner ? "text-2xl text-f1-gold" : "text-lg text-f1-navy"}`}>
                      {player.total_score || 0}
                    </p>
                    <div className={`w-full ${style.height} ${style.bg} border-t-2 ${style.border} rounded-t-lg mt-2 flex items-start justify-center pt-2`}>
                      <span className={`font-oswald text-xs font-bold ${style.text}`}>
                        {style.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {restPlayers.length > 0 && (
          <div className="bg-white rounded-xl border border-f1-border shadow-sm overflow-hidden mb-4">
            <div className="px-4 py-3 border-b border-f1-border">
              <span className="font-oswald text-sm font-semibold text-f1-navy uppercase">
                Full Standings
              </span>
            </div>
            <div className="divide-y divide-f1-border">
              {restPlayers.map((player, i) => (
                <div key={player.id} className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="font-oswald text-sm text-f1-muted w-6 text-right">{i + 4}</span>
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-oswald font-bold"
                      style={{ backgroundColor: player.avatar_color }}
                    >
                      {player.display_name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm text-f1-navy font-medium">{player.display_name}</span>
                  </div>
                  <span className="font-oswald text-lg font-bold text-f1-navy">{player.total_score || 0}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {players.length > 0 && (
          <div className="bg-white rounded-xl border border-f1-border shadow-sm p-4 mb-4">
            <div className="divide-y divide-f1-border">
              {players.map((player, i) => {
                const isFirst = i === 0;
                return (
                  <div key={player.id} className={`flex items-center justify-between py-2 ${i === 0 ? "" : "pt-2"}`}>
                    <div className="flex items-center gap-2">
                      <span className={`font-oswald text-sm w-5 text-right ${isFirst ? "text-f1-gold font-bold" : "text-f1-muted"}`}>
                        {i + 1}
                      </span>
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-oswald font-bold"
                        style={{ backgroundColor: player.avatar_color }}
                      >
                        {player.display_name?.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm text-f1-navy font-medium">{player.display_name}</span>
                    </div>
                    <span className={`font-oswald text-base font-bold ${isFirst ? "text-f1-gold" : "text-f1-navy"}`}>
                      {player.total_score || 0}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex gap-3 mt-6">
          <button
            onClick={handleShare}
            className="flex-1 bg-f1-navy text-white rounded-xl px-4 py-3.5 font-oswald text-sm font-semibold uppercase tracking-wide hover:bg-f1-navy/90 transition-colors active:scale-[0.98]"
          >
            <span className="flex items-center justify-center gap-2">
              <Share2 className="w-4 h-4" />
              {showShare ? "Copied!" : "Share"}
            </span>
          </button>
          <button
            onClick={() => navigate("/")}
            className="flex-1 bg-white border border-f1-border text-f1-navy rounded-xl px-4 py-3.5 font-oswald text-sm font-semibold uppercase tracking-wide hover:border-f1-red transition-colors active:scale-[0.98]"
          >
            <span className="flex items-center justify-center gap-2">
              <Home className="w-4 h-4" />
              New Game
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
