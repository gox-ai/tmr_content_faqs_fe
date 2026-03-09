
import React, { useEffect, useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";

const BACKEND =
  import.meta.env.VITE_FAQ_BACKEND_URL?.replace(/\/$/, "") ||
  "http://localhost:5001/faqs/backlink";

function statusStyle(status) {
  if (status === "active") return "bg-green-100 text-green-700";
  if (status === "lost") return "bg-red-100 text-red-700";
  if (status === "error") return "bg-gray-100 text-gray-700";
  return "bg-yellow-100 text-yellow-700";
}

function displayStatus(status) {
  if (!status) return "";
  if (status === "error") return "CHECK FAILED";
  return status.toUpperCase();
}

function getLifeSpan(row) {
  const dateStr = row.published_at || row.created_at;
  if (!dateStr) return "-";
  const diffDays = Math.floor(
    (Date.now() - new Date(dateStr).getTime()) / (1000 * 3600 * 24)
  );
  return `${diffDays} days`;
}

function BacklinkDashboard({ onAdd, onEditRow }) {
  const [rows, setRows] = useState([]);
  const [checked, setChecked] = useState([]);
  const [filter, setFilter] = useState("all");
  const [todayFilter, setTodayFilter] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const selectedCount = checked.filter(Boolean).length;
  const allChecked = checked.length > 0 && checked.every(Boolean);
  const canRestore = rows.some((r, i) => checked[i] && r.skipped);
  const canModify = selectedCount === 1;

  async function refreshData() {
    setIsLoading(true);
    try {
      const res = await fetch(`${BACKEND}/`);
      if (!res.ok) {
        throw new Error(`Failed to load backlinks (HTTP ${res.status})`);
      }
      const data = await res.json();
      const r = (data.rows || []).map((row) => {
        // Normalize legacy "error" rows as LOST so they can be
        // reviewed and optionally restored, instead of pretending
        // they are still active.
        if (row.status === "error") {
          row.status = "lost";
        }

        // Auto mark as "not in use" only if it's been
        // non-active for 2+ days since last_lost
        if (row.status !== "active" && row.last_lost) {
          const diffDays =
            (Date.now() - new Date(row.last_lost).getTime()) /
            (1000 * 3600 * 24);
          if (diffDays >= 2) row.skipped = 1;
        }
        return row;
      });
      setRows(r);
      setChecked(new Array(r.length).fill(false));
    } catch (e) {
      console.error("Failed to load backlinks:", e);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    refreshData();
  }, []);

  async function runSelected() {
    setIsRunning(true);
    const updatedRows = [...rows];

    for (let i = 0; i < checked.length; i++) {
      if (!checked[i] || rows[i].skipped) continue;
      const r = rows[i];

      try {
        const res = await fetch(`${BACKEND}/check`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            backlink: r.backlinks,
            target: r.target,
            anchor: r.anchor,
          }),
        });

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const data = await res.json();

        // If the API reports a generic ERROR, treat it as LOST
        // so clearly missing/unreachable backlinks don't stay ACTIVE.
        if (data.status === "error") {
          data.status = "lost";
        }

        console.log("Backlink check result", {
          row: {
            backlinks: r.backlinks,
            anchor: r.anchor,
            target: r.target,
          },
          api: data,
        });
        let skipValue = 0;
        // After restore, we want 2 full days of "not found"
        // from the last_lost timestamp before auto-skipping again
        if (data.status !== "active" && r.last_lost) {
          const diffDays =
            (Date.now() - new Date(r.last_lost).getTime()) /
            (1000 * 3600 * 24);
          skipValue = diffDays >= 2 ? 1 : 0;
        }

        const patchRes = await fetch(`${BACKEND}/`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            backlinks: r.backlinks,
            anchor: r.anchor,
            target: r.target,
            status: data.status,
            link_type: data.link_type,
            skipped: data.status === "active" ? 0 : skipValue,
          }),
        });

        if (!patchRes.ok) {
          throw new Error(`Patch failed: HTTP ${patchRes.status}`);
        }

        const patchData = await patchRes.json();
        updatedRows[i] = {
          ...r,
          status: data.status,
          last_checked: patchData.last_checked,
          link_type: data.link_type,
          skipped: data.status === "active" ? 0 : skipValue,
        };
      } catch (e) {
        console.error(`Error checking ${r.backlinks}:`, e);
      }
    }

    setRows(updatedRows);
    setIsRunning(false);
  }

  async function handleRestore() {
    const updatedRows = [...rows];

    for (let i = 0; i < checked.length; i++) {
      if (!checked[i]) continue;
      const r = rows[i];
      try {
        const res = await fetch(`${BACKEND}/`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            backlinks: r.backlinks,
            anchor: r.anchor,
            target: r.target,
            status: r.status,
            skipped: 0,
          }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        updatedRows[i] = { ...r, skipped: 0 };
      } catch (e) {
        console.error("Restore error:", e);
      }
    }

    setRows(updatedRows);
  }

  function handleModify() {
    if (!canModify) return;
    const index = checked.findIndex(Boolean);
    if (index === -1) return;
    const row = rows[index];
    if (row && onEditRow) {
      onEditRow(row);
    }
  }

  function toggleAll(v) {
    setChecked(checked.map(() => v));
  }

  function toggleOne(i, v) {
    const c = [...checked];
    c[i] = v;
    setChecked(c);
  }

  const filteredRows = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    return rows.filter((r) => {
      if (filter === "active" && r.status !== "active") return false;
      if (filter === "lost" && r.status !== "lost") return false;

      if (filter === "today") {
        const isTodayActive =
          r.status === "active" && r.last_active?.split("T")[0] === today;
        const isTodayLost =
          r.status === "lost" && r.last_lost?.split("T")[0] === today;
        if (todayFilter === "active") return isTodayActive;
        if (todayFilter === "lost") return isTodayLost;
        if (!isTodayActive && !isTodayLost) return false;
      }
      return true;
    });
  }, [rows, filter, todayFilter]);

  function exportData() {
    const headers = [
      "Backlinks",
      "Anchor",
      "Target URL",
      "Status",
      "Link Type",
      "Life Span",
      "Last Checked",
    ];
    const csvRows = [headers.join(",")];

    rows.forEach((r) => {
      csvRows.push(
        [
          r.backlinks,
          r.anchor,
          r.target,
          r.status || "",
          r.dofollow ? "dofollow" : "nofollow",
          getLifeSpan(r),
          r.last_checked || "",
        ]
          .map((v) => `"${v ?? ""}"`)
          .join(",")
      );
    });

    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "backlink_tracker.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <div className="flex-1 w-full">
        <div className="w-full px-4 py-8">
          <h2 className="text-2xl font-semibold">Backlink Tracker</h2>

          <div className="mt-4 flex items-center justify-between">
            <div className="flex gap-2">
              <button
                className="flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm"
                onClick={onAdd}
              >
                <span className="text-lg">+</span>
                ADD
              </button>
              <button
                className={`rounded-md px-3 py-1.5 text-sm ${
                  filter === "all" ? "bg-black text-white" : "border"
                }`}
                onClick={() => setFilter("all")}
              >
                ALL
              </button>
              <button
                className={`rounded-md px-3 py-1.5 text-sm ${
                  filter === "active" ? "bg-black text-white" : "border"
                }`}
                onClick={() => setFilter("active")}
              >
                ACTIVE
              </button>
              <button
                className={`rounded-md px-3 py-1.5 text-sm ${
                  filter === "lost" ? "bg-black text-white" : "border"
                }`}
                onClick={() => setFilter("lost")}
              >
                LOST
              </button>
              <button
                className={`rounded-md px-3 py-1.5 text-sm ${
                  filter === "today" && todayFilter === "active"
                    ? "bg-black text-white"
                    : "border"
                }`}
                onClick={() => {
                  setFilter("today");
                  setTodayFilter("active");
                }}
              >
                TODAY ACTIVE
              </button>
              <button
                className={`rounded-md px-3 py-1.5 text-sm ${
                  filter === "today" && todayFilter === "lost"
                    ? "bg-black text-white"
                    : "border"
                }`}
                onClick={() => {
                  setFilter("today");
                  setTodayFilter("lost");
                }}
              >
                TODAY LOST
              </button>
            </div>
            <button
              onClick={exportData}
              className="flex items-center gap-2 rounded-md bg-black px-4 py-2 text-sm text-white"
            >
              EXPORT
            </button>
          </div>

          {selectedCount > 0 && (
            <div className="mt-4 flex items-center justify-between rounded-lg border px-4 py-2 bg-white sticky top-0 z-20 shadow-md">
              <span className="text-sm">{selectedCount} row selected</span>
              <div className="flex gap-2">
                <button
                  onClick={runSelected}
                  disabled={isRunning}
                  className={`relative overflow-hidden rounded-md px-4 py-1.5 text-sm text-white ${
                    isRunning ? "cursor-wait bg-gray-900" : "bg-black"
                  }`}
                >
                  {isRunning ? "Running… please wait" : "Run Selected"}
                </button>
                <button
                  className={`rounded-md border px-3 py-1.5 text-sm ${
                    canRestore ? "text-gray-800" : "cursor-not-allowed text-gray-400 bg-gray-100"
                  }`}
                  onClick={canRestore ? handleRestore : undefined}
                  disabled={!canRestore}
                >
                  Restore
                </button>
                <button
                  className={`rounded-md border px-3 py-1.5 text-sm ${
                    canModify ? "text-gray-800" : "cursor-not-allowed text-gray-400 bg-gray-100"
                  }`}
                  onClick={canModify ? handleModify : undefined}
                  disabled={!canModify}
                >
                  Modify
                </button>
              </div>
            </div>
          )}

          {isLoading && (
            <div className="mt-12 flex flex-col items-center justify-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-black" />
              <p className="text-sm text-gray-500">Loading backlinks…</p>
            </div>
          )}

          {!isLoading && rows.length === 0 && (
            <div className="mt-12 flex flex-col items-center justify-center gap-2">
              <p className="text-sm text-gray-500">No backlinks found</p>
              <button
                onClick={onAdd}
                className="mt-2 rounded-md bg-black px-4 py-2 text-sm text-white"
              >
                Add your first backlink
              </button>
            </div>
          )}

          {!isLoading && rows.length > 0 && (
            <div className="mt-6 w-full overflow-x-auto rounded-lg border">
              <table className="w-full table-auto text-sm">
                <thead className="border-b bg-gray-50 text-left text-xs font-semibold uppercase text-gray-600">
                  <tr>
                    <th className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={allChecked}
                        onChange={(e) => toggleAll(e.target.checked)}
                      />
                    </th>
                    <th className="px-4 py-3">Backlinks</th>
                    <th className="px-4 py-3">Anchor</th>
                    <th className="px-4 py-3">Target URL</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Link Type</th>
                    <th className="px-4 py-3">Life Span</th>
                    <th className="px-4 py-3">Last Checked</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((r, i) => (
                    <tr
                      key={`${r.backlinks}-${i}`}
                      className={`border-b last:border-0 ${
                        r.skipped ? "line-through opacity-50" : ""
                      }`}
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={checked[i] || false}
                          onChange={(e) => toggleOne(i, e.target.checked)}
                        />
                      </td>
                      <td className="px-4 py-3 text-blue-600">
                        <a href={r.backlinks} target="_blank">
                          {r.backlinks}
                        </a>
                      </td>
                      <td className="px-4 py-3">{r.anchor}</td>
                      <td className="px-4 py-3 text-blue-600">
                        <a href={r.target} target="_blank">
                          {r.target}
                        </a>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-medium ${statusStyle(
                            r.status
                          )}`}
                        >
                          {displayStatus(r.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex whitespace-nowrap rounded-full px-2 py-1 text-sm text-black">
                          {r.link_type || (r.dofollow ? "dofollow" : "nofollow")}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {getLifeSpan(r)}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {r.last_checked || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <footer className="bg-black py-3 text-center text-xs text-gray-400">
        by <span className="text-orange-500">Two Minute Reports</span>
      </footer>
    </div>
  );
}

function AddBacklinkForm({ onBack, onSaved, mode = "add", initialRow }) {
  const [form, setForm] = useState(
    initialRow
      ? {
          backlinks: initialRow.backlinks || "",
          anchor: initialRow.anchor || "",
          target: initialRow.target || "",
          published_at: (initialRow.published_at || "").slice(0, 10),
          id: initialRow.id,
        }
      : {
          backlinks: "",
          anchor: "",
          target: "",
          published_at: "",
        }
  );
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  function validate() {
    const newErrors = {};
    if (!form.backlinks.trim()) {
      newErrors.backlinks = "Backlink URL is required";
    } else {
      try {
        new URL(form.backlinks);
      } catch {
        newErrors.backlinks = "Please enter a valid URL";
      }
    }
    if (!form.anchor.trim()) {
      newErrors.anchor = "Anchor text is required";
    }
    if (!form.target.trim()) {
      newErrors.target = "Target URL is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    setIsSaving(true);
    try {
      const url =
        mode === "edit" && form.id != null ? `${BACKEND}/modify` : `${BACKEND}/`;
      const method = mode === "edit" && form.id != null ? "PATCH" : "POST";

      const payload =
        mode === "edit" && form.id != null
          ? {
              id: form.id,
              backlinks: form.backlinks,
              anchor: form.anchor,
              target: form.target,
              published_at: form.published_at,
            }
          : form;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      onSaved();
    } catch (err) {
      console.error("Failed to add backlink:", err);
      setIsSaving(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <main className="flex flex-1 justify-center px-4 py-12">
        <div className="w-full max-w-2xl">
          <button
            onClick={onBack}
            className="mb-6 flex items-center gap-2 text-sm font-medium text-gray-700"
          >
            <ArrowLeft size={18} className="text-gray-700" />
            Back to Dashboard
          </button>

          <div className="rounded-2xl border bg-white p-8 shadow-sm">
            <h2 className="text-lg font-bold text-black">Add New Backlink</h2>
            <p className="mt-1 text-sm text-emerald-600">
              Enter the details of the backlink you want to track
            </p>

            <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
              <div>
                <label className="text-sm font-medium text-black">
                  Backlink
                </label>
                <input
                  required
                  value={form.backlinks}
                  onChange={(e) => {
                    setForm({ ...form, backlinks: e.target.value });
                    if (errors.backlinks) setErrors({ ...errors, backlinks: "" });
                  }}
                  placeholder="https://example.com/pages"
                  className={`mt-1 w-full rounded-lg border px-4 py-2.5 text-sm outline-none focus:border-black ${
                    errors.backlinks ? "border-red-400" : ""
                  }`}
                />
                {errors.backlinks && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.backlinks}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-black">Anchor</label>
                <input
                  required
                  value={form.anchor}
                  onChange={(e) => {
                    setForm({ ...form, anchor: e.target.value });
                    if (errors.anchor) setErrors({ ...errors, anchor: "" });
                  }}
                  placeholder="Anchor text"
                  className={`mt-1 w-full rounded-lg border px-4 py-2.5 text-sm outline-none focus:border-black ${
                    errors.anchor ? "border-red-400" : ""
                  }`}
                />
                {errors.anchor && (
                  <p className="mt-1 text-xs text-red-500">{errors.anchor}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-black">
                  Target URL
                </label>
                <input
                  required
                  value={form.target}
                  onChange={(e) => {
                    setForm({ ...form, target: e.target.value });
                    if (errors.target) setErrors({ ...errors, target: "" });
                  }}
                  placeholder="target"
                  className={`mt-1 w-full rounded-lg border px-4 py-2.5 text-sm outline-none focus:border-black ${
                    errors.target ? "border-red-400" : ""
                  }`}
                />
                {errors.target && (
                  <p className="mt-1 text-xs text-red-500">{errors.target}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-black">
                  Published At
                </label>
                <input
                  type="date"
                  value={form.published_at}
                  onChange={(e) =>
                    setForm({ ...form, published_at: e.target.value })
                  }
                  className="mt-1 w-full rounded-lg border px-4 py-2.5 text-sm outline-none focus:border-black"
                />
              </div>

              <div className="flex items-center gap-4 pt-4">
                <button
                  type="submit"
                  disabled={isSaving}
                  className={`flex-1 rounded-lg py-3 text-sm font-semibold text-white transition-colors ${
                    isSaving
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-black hover:bg-gray-900"
                  }`}
                >
                  {isSaving ? "Saving..." : "Add Backlink"}
                </button>

                <button
                  type="button"
                  onClick={onBack}
                  disabled={isSaving}
                  className="rounded-lg border px-6 py-3 text-sm font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      <footer className="bg-black py-3 text-center text-xs text-gray-400">
        by <span className="text-orange-500">Two Minute Reports</span>
      </footer>
    </div>
  );
}

export default function BacklinkTrackerPage() {
  const [mode, setMode] = useState("list"); // "list" | "add" | "edit"
  const [rowToEdit, setRowToEdit] = useState(null);

  if (mode === "add") {
    return (
      <AddBacklinkForm
        onBack={() => setMode("list")}
        onSaved={() => setMode("list")}
      />
    );
  }

  if (mode === "edit" && rowToEdit) {
    return (
      <AddBacklinkForm
        mode="edit"
        initialRow={rowToEdit}
        onBack={() => setMode("list")}
        onSaved={() => {
          setRowToEdit(null);
          setMode("list");
        }}
      />
    );
  }

  return (
    <BacklinkDashboard
      onAdd={() => setMode("add")}
      onEditRow={(row) => {
        setRowToEdit(row);
        setMode("edit");
      }}
    />
  );
}
