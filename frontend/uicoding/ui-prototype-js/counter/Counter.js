import { useState } from "react";

export default function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="text-8xl font-bold tabular-nums text-white">{count}</div>
      <div className="flex items-center gap-4">
        <button
          onClick={() => setCount((c) => c - 1)}
          className="w-12 h-12 rounded-full border border-slate-600 bg-slate-800 text-white text-xl font-bold hover:bg-slate-700 hover:border-slate-500 transition-colors"
          aria-label="Decrement"
        >
          −
        </button>
        <button
          onClick={() => setCount(0)}
          className="px-4 py-2 rounded-lg border border-slate-600 bg-slate-800 text-slate-400 text-sm hover:bg-slate-700 hover:text-white hover:border-slate-500 transition-colors"
          aria-label="Reset"
        >
          Reset
        </button>
        <button
          onClick={() => setCount((c) => c + 1)}
          className="w-12 h-12 rounded-full border border-slate-600 bg-slate-800 text-white text-xl font-bold hover:bg-slate-700 hover:border-slate-500 transition-colors"
          aria-label="Increment"
        >
          +
        </button>
      </div>
    </div>
  );
}
