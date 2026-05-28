import { useEffect, useState, useRef } from "react";

export default function TimerRing({ duration = 20, onComplete, size = 120, strokeWidth = 6, running = true }) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const intervalRef = useRef(null);

  useEffect(() => {
    setTimeLeft(duration);
  }, [duration]);

  useEffect(() => {
    if (!running) return;

    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          onComplete?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [running, duration, onComplete]);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = timeLeft / duration;
  const dashOffset = circumference * (1 - progress);

  const urgentColor = timeLeft <= 5 ? "#E10600" : timeLeft <= 10 ? "#C8850A" : "#0A7D6C";

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#E4E4EA"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={urgentColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          className="transition-all duration-1000 ease-linear"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className={`font-oswald text-3xl font-bold ${
            timeLeft <= 5 ? "text-f1-red" : "text-f1-navy"
          }`}
        >
          {timeLeft}
        </span>
      </div>
      {timeLeft <= 5 && timeLeft > 0 && (
        <div
          className="absolute inset-0 rounded-full border-2 animate-pulse-ring"
          style={{ borderColor: urgentColor }}
        />
      )}
    </div>
  );
}
