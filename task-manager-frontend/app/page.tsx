"use client";

import { useEffect, useState } from "react";

const API_BASE = "https://task-manager-tb5u.onrender.com";

type Task = {
  id: number;
  title: string;
  description?: string;
  status: "pending" | "in_progress" | "done";
  priority: "low" | "medium" | "high";
  due_date?: string | null;
};

export default function HomePage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"pending" | "in_progress" | "done">(
    "pending"
  );
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [dueDate, setDueDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "today" | "overdue" | "done">(
    "all"
  );

  // Load tasks
  async function loadTasks() {
    try {
      const res = await fetch(`${API_BASE}/tasks`, { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch tasks");
      const data = await res.json();
      setTasks(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Could not connect to backend. Is FastAPI running on 8000?");
    }
  }

  useEffect(() => {
    loadTasks();
  }, []);

  async function handleAddTask() {
    if (!title.trim()) return;

    try {
      const res = await fetch(`${API_BASE}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          status,
          priority,
          due_date: dueDate || null,
        }),
      });

      if (!res.ok) throw new Error("Failed to create task");

      setTitle("");
      setDescription("");
      setStatus("pending");
      setPriority("medium");
      setDueDate("");
      await loadTasks();
    } catch (err) {
      console.error(err);
      setError("Failed to create task");
    }
  }

  async function toggleStatus(task: Task) {
    const nextStatus =
      task.status === "pending"
        ? "in_progress"
        : task.status === "in_progress"
        ? "done"
        : "pending";

    try {
      const res = await fetch(`${API_BASE}/tasks/${task.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...task, status: nextStatus }),
      });
      if (!res.ok) throw new Error("Failed to update task");
      await loadTasks();
    } catch (err) {
      console.error(err);
      setError("Failed to update task");
    }
  }

  async function deleteTask(id: number) {
    try {
      const res = await fetch(`${API_BASE}/tasks/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete task");
      await loadTasks();
    } catch (err) {
      console.error(err);
      setError("Failed to delete task");
    }
  }

  // ---------- Smart filtering ----------
  const todayStr = new Date().toISOString().slice(0, 10);

  const filteredTasks = tasks.filter((t) => {
    if (!t.due_date) {
      if (filter === "done") return t.status === "done";
      if (filter === "all") return true;
      // for today / overdue, tasks without due date only appear in "all" and "done"
      return false;
    }

    if (filter === "today") return t.due_date === todayStr;
    if (filter === "overdue") return t.due_date < todayStr && t.status !== "done";
    if (filter === "done") return t.status === "done";
    return true;
  });

  // ---------- Stats ----------
  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === "done").length;
  const completion =
    total === 0 ? 0 : Math.round((completed / total) * 100);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50 flex justify-center px-4 py-10">
      <div className="w-full max-w-4xl space-y-8">
        {/* Header + stats */}
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">
              Task Manager
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Minimal, fast, and focused — track tasks with priority & due dates.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-700/80 rounded-2xl px-4 py-3 flex gap-6 text-sm">
            <div>
              <p className="text-slate-400 text-xs uppercase">Total</p>
              <p className="text-lg font-semibold">{total}</p>
            </div>
            <div>
              <p className="text-slate-400 text-xs uppercase">Completed</p>
              <p className="text-lg font-semibold">{completed}</p>
            </div>
            <div>
              <p className="text-slate-400 text-xs uppercase">Progress</p>
              <p className="text-lg font-semibold">{completion}%</p>
            </div>
          </div>
        </header>

        {/* Error banner */}
        {error && (
          <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        {/* Add task card */}
        <section className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-lg shadow-black/40 space-y-4">
          <h2 className="text-lg font-medium">Create a task</h2>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs uppercase text-slate-400">Title</label>
              <input
                className="w-full rounded-xl bg-slate-950/70 border border-slate-700 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Integrate login API"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase text-slate-400">Due date</label>
              <input
                type="date"
                className="w-full rounded-xl bg-slate-950/70 border border-slate-700 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase text-slate-400">
              Description
            </label>
            <textarea
              className="w-full rounded-xl bg-slate-950/70 border border-slate-700 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 min-h-[70px]"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional details to remember..."
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-xs uppercase text-slate-400">Status</label>
              <select
                className="w-full rounded-xl bg-slate-950/70 border border-slate-700 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value as "pending" | "in_progress" | "done")
                }
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In progress</option>
                <option value="done">Done</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase text-slate-400">Priority</label>
              <select
                className="w-full rounded-xl bg-slate-950/70 border border-slate-700 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                value={priority}
                onChange={(e) =>
                  setPriority(e.target.value as "low" | "medium" | "high")
                }
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleAddTask}
              className="rounded-xl bg-blue-500 hover:bg-blue-600 px-4 py-2 text-sm font-medium shadow-lg shadow-blue-500/30 transition"
            >
              Add Task
            </button>
          </div>
        </section>

        {/* Filter + list */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">Tasks</h2>

            <div className="flex gap-2 text-xs">
              {(["all", "today", "overdue", "done"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1 rounded-full border ${
                    filter === f
                      ? "bg-slate-100 text-slate-900 border-slate-100"
                      : "bg-slate-900/60 border-slate-700 text-slate-300"
                  }`}
                >
                  {f === "all"
                    ? "All"
                    : f === "today"
                    ? "Today"
                    : f === "overdue"
                    ? "Overdue"
                    : "Done"}
                </button>
              ))}
            </div>
          </div>

          {filteredTasks.length === 0 ? (
            <p className="text-sm text-slate-500">No tasks yet.</p>
          ) : (
            <ul className="space-y-3">
              {filteredTasks.map((task) => {
                const isOverdue =
                  task.due_date &&
                  task.due_date < todayStr &&
                  task.status !== "done";

                return (
                  <li
                    key={task.id}
                    className="flex items-start justify-between rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <button
                          className={`h-5 w-5 rounded-full border flex items-center justify-center text-[10px] ${
                            task.status === "done"
                              ? "bg-emerald-500 border-emerald-500 text-slate-950"
                              : "border-slate-500 text-slate-400"
                          }`}
                          onClick={() => toggleStatus(task)}
                          title="Toggle status"
                        >
                          {task.status === "done" ? "✓" : ""}
                        </button>
                        <span className="font-medium">{task.title}</span>
                        {isOverdue && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/15 text-red-300 border border-red-500/40">
                            Overdue
                          </span>
                        )}
                      </div>
                      {task.description && (
                        <p className="text-xs text-slate-400">
                          {task.description}
                        </p>
                      )}

                      <div className="flex gap-2 text-[10px] mt-1">
                        <span
                          className={`px-2 py-0.5 rounded-full border ${
                            task.priority === "high"
                              ? "bg-red-500/15 border-red-500/50 text-red-300"
                              : task.priority === "medium"
                              ? "bg-amber-500/10 border-amber-500/40 text-amber-200"
                              : "bg-emerald-500/10 border-emerald-500/40 text-emerald-200"
                          }`}
                        >
                          {task.priority.toUpperCase()} priority
                        </span>
                        <span className="px-2 py-0.5 rounded-full border border-slate-700 text-slate-300">
                          {task.status.replace("_", " ")}
                        </span>
                        {task.due_date && (
                          <span className="px-2 py-0.5 rounded-full border border-slate-700 text-slate-300">
                            Due {task.due_date}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      className="text-xs text-slate-400 hover:text-red-400"
                      onClick={() => deleteTask(task.id)}
                    >
                      Delete
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
