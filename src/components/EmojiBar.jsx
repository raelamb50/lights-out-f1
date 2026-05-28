import { useState } from "react";
import { base44 } from "@/api/base44Client";

const Reaction = base44.entities.Reaction;

const EMOJIS = [
  { emoji: "\u{1F3CE}\u{FE0F}", label: "race car" },
  { emoji: "\u{1F525}", label: "fire" },
  { emoji: "\u{1F62C}", label: "grimace" },
  { emoji: "\u{1F389}", label: "party" },
  { emoji: "\u{1F4A5}", label: "boom" },
  { emoji: "\u{1F62D}", label: "cry" },
];

export default function EmojiBar({ gameId, playerId }) {
  const [recentEmoji, setRecentEmoji] = useState(null);
  const [cooldown, setCooldown] = useState(false);

  const sendReaction = async (emoji) => {
    if (cooldown) return;

    setCooldown(true);
    setRecentEmoji(emoji);

    try {
      await Reaction.create({
        game_id: gameId,
        player_id: playerId,
        emoji,
      });
    } catch (e) {
      // silent fail
    }

    setTimeout(() => {
      setCooldown(false);
      setRecentEmoji(null);
    }, 1500);
  };

  return (
    <div className="flex items-center justify-center gap-2 py-3">
      {EMOJIS.map(({ emoji, label }) => (
        <button
          key={label}
          onClick={() => sendReaction(emoji)}
          disabled={cooldown}
          className={`w-11 h-11 rounded-full flex items-center justify-center text-xl transition-all ${
            cooldown && recentEmoji !== emoji
              ? "opacity-40 scale-90"
              : recentEmoji === emoji
              ? "scale-125 bg-f1-gold-bg"
              : "hover:scale-110 hover:bg-f1-surface active:scale-95"
          }`}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}
