import { useId, useRef, useState } from "react";

export default function TodoList() {
  const [text, setText] = useState("");
  const [tasks, setTasks] = useState([]);
  const [turn, setTurn] = useState(0);
  const inputId = useId();
  const inputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setTasks((prev) => [...prev, { turn, task: text.trim() }]);
    setTurn((t) => t + 1);
    setText("");
    inputRef.current?.focus();
  };

  const handleDelete = (value) => {
    setTasks((prev) => prev.filter((item) => item.turn !== value.turn));
    inputRef.current?.focus();
  };

  return (
    <section aria-label="Todo list" className="w-full max-w-md mx-auto flex flex-col gap-6">
      <form onSubmit={handleSubmit} className="flex flex-col gap-2" noValidate>
        <label htmlFor={inputId} className="text-sm font-medium text-slate-300">
          New task
        </label>
        <div className="flex gap-2">
          <input
            ref={inputRef}
            id={inputId}
            type="text"
            value={text}
            placeholder="Add your task…"
            autoComplete="off"
            onChange={(e) => setText(e.target.value)}
            className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 transition-colors"
          />
          <button
            type="submit"
            disabled={!text.trim()}
            className="px-4 py-2.5 rounded-lg bg-slate-700 text-white text-sm font-medium hover:bg-slate-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Add
          </button>
        </div>
      </form>

      {/* Live region announces task count changes to screen readers */}
      <p
        aria-live="polite"
        aria-atomic="true"
        className="text-xs text-slate-500 text-center"
      >
        {tasks.length === 0
          ? "No tasks yet."
          : `${tasks.length} task${tasks.length !== 1 ? "s" : ""}`}
      </p>

      {tasks.length > 0 && (
        <ul aria-label="Task list" className="flex flex-col gap-2">
          {tasks.map((task) => (
            <li
              key={task.turn}
              className="flex items-center justify-between gap-3 rounded-lg border border-slate-800 bg-slate-900 px-4 py-3"
            >
              <span className="text-sm text-slate-200 flex-1">{task.task}</span>
              <button
                type="button"
                onClick={() => handleDelete(task)}
                aria-label={`Delete "${task.task}"`}
                className="text-slate-500 hover:text-red-400 transition-colors text-xs shrink-0"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
