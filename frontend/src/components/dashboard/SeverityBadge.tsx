import { clsx } from "clsx";

const colors: Record<number, string> = {
  1: "bg-green-700 text-green-100",
  2: "bg-green-600 text-green-100",
  3: "bg-yellow-600 text-yellow-100",
  4: "bg-yellow-500 text-yellow-100",
  5: "bg-orange-500 text-white",
  6: "bg-orange-600 text-white",
  7: "bg-red-500 text-white",
  8: "bg-red-600 text-white",
  9: "bg-red-700 text-white",
  10: "bg-purple-700 text-white animate-pulse",
};

export function SeverityBadge({ score }: { score: number }) {
  return (
    <span className={clsx("px-2 py-0.5 rounded text-xs font-bold", colors[score] ?? colors[5])}>
      {score}/10
    </span>
  );
}
