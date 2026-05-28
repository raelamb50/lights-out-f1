export function F1Logo({ className = "", color = "#E10600" }) {
  return (
    <svg className={className} viewBox="8886 8002 12383 3170" fill="none">
      <path d="m19406.3 8004.18h1862.355l-3072.167 3095.182h-1862.355zm-8771.51 3095.18h-1748.68l2181.78-2203.35c612.54-654.53 1402.95-893.52 2390.78-893.52h5576.61l-1157.81 1166.64h-4489.81c-751.68-1.46-1048.07 218.34-1466.15 638.16z" fill={color}/>
      <path d="m12564.42 11070.96h-1600.06l1027.53-1031.72c699.89-702.75 861.3-675.25 2041.36-671.32h3641.05l-1043.98 1043.98-2719.29-2.22c-328.33-.27-667.9-2.72-988.63 311.06z" fill={color}/>
    </svg>
  );
}

export function F1MonacoLockup({ className = "" }) {
  return (
    <div className={`flex justify-end mb-2 ${className}`}>
      <div className="flex flex-col items-center">
        <F1Logo className="w-12 h-auto" />
        <span className="font-oswald text-[10px] tracking-[0.2em] text-f1-red font-medium uppercase mt-0.5">
          MONACO
        </span>
      </div>
    </div>
  );
}
