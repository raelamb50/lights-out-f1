import { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";

const Game = base44.entities.Game;

const PHASE_ORDER = ["lobby", "predictions", "locked", "live", "scoring", "final", "scoreboard"];

const PHASE_ROUTES = {
  lobby: "lobby",
  predictions: "predictions",
  locked: "waiting",
  live: "live",
  scoring: "results",
  final: "reveal",
  scoreboard: "scoreboard",
};

const ROUTE_PHASE_INDEX = {
  lobby: 0,
  predictions: 1,
  waiting: 2,
  live: 3,
  results: 4,
  reveal: 5,
  scoreboard: 6,
};

export default function useGameSubscription(gameId) {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPhaseRef = useRef(null);

  useEffect(() => {
    if (!gameId) return;

    const getCurrentRouteIndex = () => {
      const path = location.pathname;
      const segment = path.split("/").pop();
      return ROUTE_PHASE_INDEX[segment] ?? -1;
    };

    const handlePhaseChange = (phase) => {
      if (phase === currentPhaseRef.current) return;
      currentPhaseRef.current = phase;

      const phaseIndex = PHASE_ORDER.indexOf(phase);
      const routeIndex = getCurrentRouteIndex();

      if (phaseIndex > routeIndex) {
        const route = PHASE_ROUTES[phase];
        if (route) {
          navigate(`/game/${gameId}/${route}`, { replace: true });
        }
      }
    };

    const checkPhase = async () => {
      try {
        const game = await Game.get(gameId);
        if (game) handlePhaseChange(game.phase);
      } catch (e) {
        // silent
      }
    };

    checkPhase();

    const unsubscribe = Game.subscribe((games) => {
      if (!Array.isArray(games)) return;
      const game = games.find(g => g.id === gameId);
      if (game) handlePhaseChange(game.phase);
    });

    const interval = setInterval(checkPhase, 5000);

    return () => {
      unsubscribe?.();
      clearInterval(interval);
    };
  }, [gameId, navigate, location.pathname]);
}
