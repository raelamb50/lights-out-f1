import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomeScreen from "@/screens/HomeScreen";
import LobbyScreen from "@/screens/LobbyScreen";
import PredictionsScreen from "@/screens/PredictionsScreen";
import WaitingScreen from "@/screens/WaitingScreen";
import LiveRoundScreen from "@/screens/LiveRoundScreen";
import ResultsScreen from "@/screens/ResultsScreen";
import RevealScreen from "@/screens/RevealScreen";
import ScoreboardScreen from "@/screens/ScoreboardScreen";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/game/:gameId/lobby" element={<LobbyScreen />} />
        <Route path="/game/:gameId/predictions" element={<PredictionsScreen />} />
        <Route path="/game/:gameId/waiting" element={<WaitingScreen />} />
        <Route path="/game/:gameId/live" element={<LiveRoundScreen />} />
        <Route path="/game/:gameId/results" element={<ResultsScreen />} />
        <Route path="/game/:gameId/reveal" element={<RevealScreen />} />
        <Route path="/game/:gameId/scoreboard" element={<ScoreboardScreen />} />
      </Routes>
    </BrowserRouter>
  );
}
