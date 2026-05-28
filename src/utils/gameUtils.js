export function generateRoomCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export function calculateScore(prediction, correctAnswer, category) {
  const { confidence_points, pick } = prediction;
  const { multiplier, category_type, has_partial_credit } = category;

  if (category_type === "single_driver") {
    if (pick === correctAnswer) {
      return confidence_points * multiplier;
    }
    return 0;
  }

  if (category_type === "multi_driver" && has_partial_credit) {
    const picks = JSON.parse(pick);
    const correct = JSON.parse(correctAnswer);
    const matches = picks.filter(p => correct.includes(p)).length;
    return Math.round(confidence_points * multiplier * (matches / correct.length));
  }

  if (category_type === "yes_no_count") {
    const playerPick = JSON.parse(pick);
    const actual = JSON.parse(correctAnswer);
    let score = 0;
    if (playerPick.yesNo === actual.yesNo) {
      score += confidence_points * multiplier * 0.5;
    }
    if (playerPick.overUnder === actual.overUnder) {
      score += confidence_points * multiplier * 0.5;
    }
    return Math.round(score);
  }

  if (category_type === "teammate_duel" && has_partial_credit) {
    const picks = JSON.parse(pick);
    const correct = JSON.parse(correctAnswer);
    let matches = 0;
    for (let i = 0; i < picks.length; i++) {
      if (picks[i] === correct[i]) matches++;
    }
    return Math.round(confidence_points * multiplier * (matches / picks.length));
  }

  return pick === correctAnswer ? confidence_points * multiplier : 0;
}

export function validateConfidencePoints(allocations, maxPerCategory = 30, total = 100) {
  const sum = Object.values(allocations).reduce((a, b) => a + b, 0);
  const anyOverMax = Object.values(allocations).some(v => v > maxPerCategory);
  return {
    isValid: sum === total && !anyOverMax,
    sum,
    anyOverMax,
    remaining: total - sum,
  };
}

export function generateBlindPollInsights(predictions, categories) {
  const insights = [];

  const winnerCategory = categories.find(c => c.name === "Race Winner");
  if (winnerCategory) {
    const winnerPicks = predictions
      .filter(p => p.category_id === winnerCategory.id)
      .map(p => p.pick);

    const counts = {};
    winnerPicks.forEach(p => { counts[p] = (counts[p] || 0) + 1; });
    const topPick = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    if (topPick) {
      const total = winnerPicks.length;
      const rogues = total - topPick[1];
      insights.push({
        text: `${topPick[1]} of ${total} players picked ${topPick[0]} for the win.`,
        rogue: rogues > 0 ? `${rogues} player${rogues > 1 ? "s" : ""} went rogue.` : null,
      });
    }
  }

  return insights;
}
