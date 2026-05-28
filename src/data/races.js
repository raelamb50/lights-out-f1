export const MONACO_2026 = {
  name: "Monaco Grand Prix",
  date: "2026-06-07",
  circuit: "Circuit de Monaco",
  city: "Monte Carlo",
  laps: 78,
  lengthKm: "3.337",
  stateOfPlay: [
    { label: "In form", text: "Norris leads the championship by 18pts; McLaren have won 3 of the last 4 races" },
    { label: "Track", text: "Street circuit = low overtaking, qualifying is king, safety cars almost guaranteed" },
    { label: "Wild stat", text: "No driver has won Monaco from outside the top 3 on the grid since 1996" },
  ],
};

export const DEFAULT_CATEGORIES = [
  {
    name: "Race Winner",
    description: "Who crosses the line first? Pick one driver.",
    category_type: "single_driver",
    multiplier: 2,
    has_partial_credit: false,
    sort_order: 1,
  },
  {
    name: "Podium",
    description: "Pick 3 drivers who finish on the podium (any order). 1/3 credit per correct driver.",
    category_type: "multi_driver",
    multiplier: 2,
    has_partial_credit: true,
    sort_order: 2,
  },
  {
    name: "First Retirement",
    description: "Which driver retires from the race first?",
    category_type: "single_driver",
    multiplier: 3,
    has_partial_credit: false,
    sort_order: 3,
  },
  {
    name: "Safety Car",
    description: "Will there be a safety car? And how many? (Over/Under 1.5)",
    category_type: "yes_no_count",
    multiplier: 1.5,
    has_partial_credit: true,
    sort_order: 4,
  },
  {
    name: "Fastest Lap",
    description: "Who sets the fastest lap of the race?",
    category_type: "single_driver",
    multiplier: 2,
    has_partial_credit: false,
    sort_order: 5,
  },
  {
    name: "Teammate Duel",
    description: "Pick which teammate finishes ahead in each matchup. 1/3 credit per correct pair.",
    category_type: "teammate_duel",
    multiplier: 2,
    has_partial_credit: true,
    sort_order: 6,
  },
];
