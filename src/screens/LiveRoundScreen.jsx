import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { F1MonacoLockup } from "@/components/F1Logo";
import TimerRing from "@/components/TimerRing";
import EmojiBar from "@/components/EmojiBar";
import useGameSubscription from "@/hooks/useGameSubscription";
import { Zap, Check, Trophy } from "lucide-react";

const Game = base44.entities.Game;
const Player = base44.entities.Player;
const LiveRound = base44.entities.LiveRound;
const LiveAnswer = base44.entities.LiveAnswer;

export default function LiveRoundScreen() {
  const { gameId } = useParams();
  const [game, setGame] = useState(null);
  const [players, setPlayers] = useState([]);
  const [currentRound, setCurrentRound] = useState(null);
  const [rounds, setRounds] = useState([]);
  const [myAnswer, setMyAnswer] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [timerRunning, setTimerRunning] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(true);

  const playerId = sessionStorage.getItem("playerId");
  const isHost = sessionStorage.getItem("isHost") === "true";

  useGameSubscription(gameId);

  useEffect(() => {
    loadData();
    const unsubRounds = LiveRound.subscribe(() => loadRounds());
    const unsubAnswers = LiveAnswer.subscribe(() => loadAnswers());
    return () => { unsubRounds?.(); unsubAnswers?.(); };
  }, [gameId]);

  const loadData = async () => {
    try {
      const [gameData, playerData, roundData] = await Promise.all([
        Game.get(gameId),
        Player.filter({ game_id: gameId }),
        LiveRound.filter({ game_id: gameId }),
      ]);
      setGame(gameData);
      setPlayers(playerData);
      setRounds(roundData);

      const active = roundData.find(r => r.is_active === true);
      if (active) {
        setCurrentRound(active);
        const answerData = await LiveAnswer.filter({ round_id: active.id });
        setAnswers(answerData);
        const mine = answerData.find(a => a.player_id === playerId);
        setMyAnswer(mine || null);
      }
    } catch (e) {
      // silent
    } finally {
      setLoading(false);
    }
  };

  const loadRounds = async () => {
    try {
      const roundData = await LiveRound.filter({ game_id: gameId });
      setRounds(roundData);
      const active = roundData.find(r => r.is_active === true);
      if (active) {
        setCurrentRound(active);
        setShowResults(false);
        setMyAnswer(null);
        setTimerRunning(true);
      }
    } catch (e) {
      // silent
    }
  };

  const loadAnswers = async () => {
    if (!currentRound) return;
    try {
      const answerData = await LiveAnswer.filter({ round_id: currentRound.id });
      setAnswers(answerData);
    } catch (e) {
      // silent
    }
  };

  const submitAnswer = async (answer) => {
    if (myAnswer) return;

    try {
      const created = await LiveAnswer.create({
        round_id: currentRound.id,
        player_id: playerId,
        pick: answer,
      });
      setMyAnswer(created);
    } catch (e) {
      // silent
    }
  };

  const handleTimerComplete = useCallback(() => {
    setTimerRunning(false);
    setShowResults(true);
  }, []);

  const createNewRound = async () => {
    const roundNum = rounds.length + 1;
    try {
      if (currentRound) {
        await LiveRound.update(currentRound.id, { is_active: false });
      }
      await LiveRound.create({
        game_id: gameId,
        round_number: roundNum,
        question: `Lightning Round ${roundNum}`,
        options: JSON.stringify(["Option A", "Option B", "Option C", "Option D"]),
        correct_answer: "Option A",
        time_limit_seconds: 20,
        is_active: true,
      });
      setShowResults(false);
      setMyAnswer(null);
      setTimerRunning(true);
    } catch (e) {
      // silent
    }
  };

  const endLiveRounds = async () => {
    try {
      if (currentRound) {
        await LiveRound.update(currentRound.id, { is_active: false });
      }
      await Game.update(gameId, { phase: "scoring" });
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

  const options = currentRound?.options ? JSON.parse(currentRound.options) : [];

  return (
    <div className="min-h-screen bg-f1-surface">
      <div className="max-w-[430px] mx-auto px-4 py-5">
        <F1MonacoLockup />

        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="font-oswald text-2xl font-bold text-f1-navy uppercase">
              Live Round
            </h1>
            <p className="text-f1-secondary text-sm">
              {currentRound ? `Round ${currentRound.round_number}` : "Waiting for round..."}
            </p>
          </div>
          <div className="flex items-center gap-1 bg-f1-red-bg px-3 py-1 rounded-full">
            <Zap className="w-3 h-3 text-f1-red" />
            <span className="font-oswald text-xs font-bold text-f1-red uppercase">Live</span>
          </div>
        </div>

        {currentRound && !showResults && (
          <div className="animate-fade-in">
            <div className="flex justify-center mb-6">
              <TimerRing
                duration={currentRound.time_limit_seconds || 20}
                onComplete={handleTimerComplete}
                running={timerRunning}
              />
            </div>

            <div className="bg-white rounded-2xl border border-f1-border shadow-sm p-5 mb-4">
              <p className="font-oswald text-lg font-semibold text-f1-navy text-center mb-4">
                {currentRound.question}
              </p>

              <div className="space-y-2">
                {options.map((option, i) => (
                  <button
                    key={i}
                    onClick={() => submitAnswer(option)}
                    disabled={!!myAnswer}
                    className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${
                      myAnswer?.pick === option
                        ? "border-f1-green bg-f1-green-bg font-semibold"
                        : myAnswer
                        ? "border-f1-border bg-f1-surface text-f1-muted"
                        : "border-f1-border bg-white hover:border-f1-red active:scale-[0.98]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-full bg-f1-surface flex items-center justify-center font-oswald text-xs font-bold text-f1-navy">
                        {String.fromCharCode(65 + i)}
                      </span>
                      <span className="text-sm text-f1-navy">{option}</span>
                      {myAnswer?.pick === option && (
                        <Check className="w-4 h-4 text-f1-green ml-auto" />
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {myAnswer && (
                <p className="text-center text-f1-green text-xs font-medium mt-3">
                  Answer locked in
                </p>
              )}
            </div>

            <div className="flex items-center justify-center gap-2 text-f1-muted text-xs">
              <span>{answers.length} of {players.length} answered</span>
            </div>
          </div>
        )}

        {showResults && currentRound && (
          <div className="animate-fade-in">
            <div className="bg-white rounded-2xl border border-f1-border shadow-sm p-5 mb-4">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Trophy className="w-5 h-5 text-f1-gold" />
                <span className="font-oswald text-lg font-semibold text-f1-navy uppercase">
                  Round Results
                </span>
              </div>

              <p className="text-center text-sm text-f1-secondary mb-4">
                Correct: <span className="font-semibold text-f1-green">{currentRound.correct_answer}</span>
              </p>

              <div className="space-y-2">
                {players.map(player => {
                  const answer = answers.find(a => a.player_id === player.id);
                  const isCorrect = answer?.pick === currentRound.correct_answer;
                  return (
                    <div
                      key={player.id}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg ${
                        isCorrect ? "bg-f1-green-bg" : "bg-f1-surface"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-oswald font-bold"
                          style={{ backgroundColor: player.avatar_color }}
                        >
                          {player.display_name?.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm text-f1-navy font-medium">{player.display_name}</span>
                      </div>
                      <span className={`text-xs font-semibold ${isCorrect ? "text-f1-green" : "text-f1-muted"}`}>
                        {answer ? (isCorrect ? "Correct" : answer.pick) : "No answer"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {!currentRound && (
          <div className="bg-white rounded-2xl border border-f1-border shadow-sm p-8 text-center">
            <Zap className="w-10 h-10 text-f1-muted mx-auto mb-3" />
            <p className="font-oswald text-lg font-semibold text-f1-navy uppercase mb-1">
              Live rounds
            </p>
            <p className="text-f1-muted text-sm">
              {isHost ? "Create the first round to get started" : "Waiting for host to start a round..."}
            </p>
          </div>
        )}

        <EmojiBar gameId={gameId} playerId={playerId} />

        {isHost && (
          <div className="space-y-3 mt-4">
            <button
              onClick={createNewRound}
              className="w-full bg-f1-red text-white rounded-xl px-5 py-4 font-oswald text-base font-semibold uppercase tracking-wide hover:bg-red-700 transition-colors active:scale-[0.98]"
            >
              {currentRound ? "Next Round" : "Start Round 1"}
            </button>
            {rounds.length > 0 && (
              <button
                onClick={endLiveRounds}
                className="w-full bg-white border border-f1-border text-f1-navy rounded-xl px-5 py-3.5 font-oswald text-sm font-semibold uppercase tracking-wide hover:border-f1-red transition-colors"
              >
                End Live Rounds
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
