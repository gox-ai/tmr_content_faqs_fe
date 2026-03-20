import { useEffect, useState, useMemo } from "react";
import Filter from "../../components/Filter";
import { useToast } from "../../components/Toast";

interface BacklinkRow {
  id: number;
  backlinks: string;
  anchor: string;
  target: string;
  status: string;
  link_type?: string;
  dofollow?: boolean;
  last_active?: string;
  last_lost?: string;
  last_checked?: string;
  published_at?: string;
  created_at?: string;
  skipped?: number;
}

interface DashboardProps {
  onAdd: () => void;
  onModify: (row: BacklinkRow) => void;
}

export default function Dashboard({ onAdd, onModify }: DashboardProps) {
  const BACKEND = `${import.meta.env.VITE_API_URL}/api/backlinks`;
  const [editingRow, setEditingRow] = useState<BacklinkRow | null>(null);
  const [originalRow, setOriginalRow] = useState<BacklinkRow | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [rows, setRows] = useState<BacklinkRow[]>([]);
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const [filter, setFilter] = useState<string>("all");
  const [todayFilter, setTodayFilter] = useState<"active" | "lost" | null>(
    null,
  );
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [extraFilters, setExtraFilters] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { showToast } = useToast();

  async function runSelected() {
    setIsRunning(true);
    const updatedRows = [...rows];
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < updatedRows.length; i++) {
      const r = updatedRows[i];
      if (!checked.has(r.id) || r.skipped) continue;

      try {
        const res = await fetch(`${BACKEND}/check-backlink`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            backlink: r.backlinks,
            target: r.target,
            anchor: r.anchor,
          }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `HTTP ${res.status}`);
        }

        const data = await res.json();
        let skipValue = 0;

        if (data.status !== "active" && r.last_active) {
          const diffDays =
            (Date.now() - new Date(r.last_active).getTime()) /
            (1000 * 3600 * 24);
          skipValue = diffDays >= 2 ? 1 : 0;
        }

        const patchRes = await fetch(`${BACKEND}/backlinks`, {
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
          const errData = await patchRes.json().catch(() => ({}));
          throw new Error(
            errData.error || `Patch failed: HTTP ${patchRes.status}`,
          );
        }

        const patchData = await patchRes.json();

        updatedRows[i] = {
          ...r,
          status: data.status,
          last_checked: patchData.last_checked,
          link_type: data.link_type,
          skipped: data.status === "active" ? 0 : skipValue,
        };
        successCount++;
      } catch (e: any) {
        errorCount++;
        console.error(`Error checking ${r.backlinks}:`, e.message);
      }
    }

    setRows(updatedRows);
    setIsRunning(false);

    if (errorCount > 0) {
      showToast(
        "warning",
        `Done — ${successCount} checked, ${errorCount} failed`,
      );
    } else {
      showToast("success", `${successCount} backlinks checked successfully`);
    }
  }

  async function refreshData() {
    setIsLoading(true);
    try {
      const res = await fetch(`${BACKEND}/backlinks`);

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(
          errData.error || `Failed to load backlinks (HTTP ${res.status})`,
        );
      }

      const data = await res.json();

      const r = (data.rows || []).map((row: BacklinkRow) => {
        if (row.status !== "active" && row.last_active) {
          const diffDays =
            (Date.now() - new Date(row.last_active).getTime()) /
            (1000 * 3600 * 24);
          if (diffDays >= 2) row.skipped = 1;
        }
        return row;
      });

      setRows(r);
      setChecked(new Set());
    } catch (e: any) {
      console.error("Failed to load backlinks:", e.message);
      showToast("error", `Failed to load backlinks: ${e.message}`);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    refreshData();
  }, []);

  function statusStyle(status: string) {
    if (status === "active") return "bg-green-100 text-green-700";
    if (status === "lost") return "bg-red-100 text-red-700";
    if (status === "anchor_match_link_mismatch")
      return "bg-orange-100 text-orange-700";
    if (status === "unchecked") return "bg-gray-100 text-gray-500";
    return "bg-yellow-100 text-yellow-700";
  }

  async function handleRestore() {
    const updatedRows = [...rows];
    let errorCount = 0;

    for (let i = 0; i < updatedRows.length; i++) {
      const r = updatedRows[i];
      if (!checked.has(r.id)) continue;

      try {
        const res = await fetch(`${BACKEND}/backlinks`, {
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

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        updatedRows[i] = { ...r, skipped: 0 };
      } catch (e: any) {
        errorCount++;
        console.error(`Restore error for ${r.backlinks}:`, e.message);
      }
    }

    setRows(updatedRows);

    if (errorCount > 0) {
      showToast("error", `${errorCount} backlink(s) failed to restore`);
    } else {
      showToast("success", "Backlinks restored successfully");
    }
  }

  function toggleAll(isChecked: boolean) {
    if (isChecked) {
      setChecked(new Set(filteredRows.map((row) => row.id)));
    } else {
      setChecked(new Set());
    }
  }

  function toggleOne(id: number, isChecked: boolean) {
    setChecked((prevSet) => {
      const nextSet = new Set(prevSet);
      if (isChecked) nextSet.add(id);
      else nextSet.delete(id);
      return nextSet;
    });
  }

  function getLifeSpan(row: BacklinkRow) {
    const dateStr = row.published_at || row.created_at;
    if (!dateStr) return "-";

    const diffDays = Math.floor(
      (Date.now() - new Date(dateStr).getTime()) / (1000 * 3600 * 24),
    );
    return `${diffDays} days`;
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

        if (extraFilters.today_status) {
          if (extraFilters.today_status === "active") return isTodayActive;
          if (extraFilters.today_status === "lost") return isTodayLost;
        }

        if (!isTodayActive && !isTodayLost) return false;
      }

      for (const [key, value] of Object.entries(extraFilters)) {
        if (!value) continue;

        if (key === "dofollow") {
          const isDoFollow = r.dofollow ? "dofollow" : "nofollow";
          if (isDoFollow !== value) return false;
          continue;
        }

        if (key === "today_status") continue;

        if (key === "status") {
          if (r.status !== value) return false;
          continue;
        }

        if (key === "lifeSpan") {
          const dateStr = r.published_at || r.created_at;
          if (!dateStr) return false;
          const diffDays = Math.floor(
            (Date.now() - new Date(dateStr).getTime()) / (1000 * 3600 * 24),
          );
          if (value === "90+") {
            if (diffDays < 90) return false;
          } else {
            if (diffDays > Number(value)) return false;
          }
          continue;
        }

        if (key === "lastChecked") {
          if (value === "never") {
            if (r.last_checked) return false;
          } else {
            if (!r.last_checked) return false;
            const checkedDate = new Date(r.last_checked);
            const diffDays = Math.floor(
              (Date.now() - checkedDate.getTime()) / (1000 * 3600 * 24),
            );
            if (value === "today" && diffDays > 0) return false;
            if (value === "7" && diffDays > 7) return false;
            if (value === "30" && diffDays > 30) return false;
          }
          continue;
        }

        if (
          key in r &&
          r[key as keyof BacklinkRow]
            ?.toString()
            .toLowerCase()
            .includes(value.toLowerCase())
        )
          continue;

        return false;
      }

      return true;
    });
  }, [rows, filter, extraFilters]);

  const selectedCount = checked.size;
  const allChecked =
    filteredRows.length > 0 && filteredRows.every((row) => checked.has(row.id));

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
          .map((v) => `"${v}"`)
          .join(","),
      );
    });

    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "backlink_tracker.csv";
    a.click();
    URL.revokeObjectURL(url);

    showToast("success", "CSV exported successfully");
  }

  return (
    <>
      {
        <div className="min-h-screen flex flex-col bg-white">
          <div className="flex-1">
            <div className="mx-auto max-w-8xl px-3 py-4 sm:px-6 sm:py-8">
              <h2 className="text-lg sm:text-2xl font-semibold">
                Backlink Tracker
              </h2>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex gap-2">
                  <button
                    className="flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm"
                    onClick={onAdd}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-plus-icon lucide-plus"
                    >
                      <path d="M5 12h14" />
                      <path d="M12 5v14" />
                    </svg>
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
                      setExtraFilters((f: any) => ({
                        ...f,
                        today_status: "active",
                      }));
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
                      setExtraFilters((f: any) => ({
                        ...f,
                        today_status: "lost",
                      }));
                    }}
                  >
                    TODAY LOST
                  </button>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="p-2 rounded-md border"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-list-filter-icon lucide-list-filter"
                    >
                      <path d="M2 5h20" />
                      <path d="M6 12h12" />
                      <path d="M9 19h6" />
                    </svg>
                  </button>
                  <button
                    onClick={exportData}
                    className="flex items-center gap-2 rounded-md bg-black px-4 py-2 text-sm text-white"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#ffffff"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-hard-drive-download-icon lucide-hard-drive-download"
                    >
                      <path d="M12 2v8" />
                      <path d="m16 6-4 4-4-4" />
                      <rect width="20" height="8" x="2" y="14" rx="2" />
                      <path d="M6 18h.01" />
                      <path d="M10 18h.01" />
                    </svg>
                    EXPORT
                  </button>
                </div>
              </div>
              {showFilters && (
                <Filter
                  page={filter}
                  onFilterChange={setExtraFilters}
                  filters={extraFilters}
                />
              )}
              {selectedCount > 0 && (
                <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between rounded-lg border px-3 py-2 bg-white sticky top-0 z-20 shadow-md">
                  <span className="text-sm">{selectedCount} row selected</span>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    <button
                      onClick={runSelected}
                      disabled={isRunning}
                      className={`relative overflow-hidden rounded-md px-4 py-1.5 text-sm text-white ${
                        isRunning ? "cursor-wait bg-gray-900" : "bg-black"
                      }`}
                    >
                      <span className="relative z-10">
                        {isRunning ? "Running… please wait" : "Run Selected"}
                      </span>

                      {isRunning && (
                        <span className="absolute inset-0 animate-loading bg-[repeating-linear-gradient(60deg,transparent,transparent_10px,#000_10px,#000_20px)] opacity-20" />
                      )}
                    </button>
                    <button
                      className="rounded-md border px-3 py-1.5 text-sm"
                      onClick={handleRestore}
                    >
                      Restore
                    </button>
                    <button
                      className="rounded-md border px-3 py-1.5 text-sm"
                      disabled={selectedCount !== 1}
                      onClick={() => {
                        const row = rows.find((item) => checked.has(item.id));
                        if (!row) return;

                        setOriginalRow(row);
                        setEditingRow(row);
                        onModify(row);
                      }}
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
                <div className="mt-6 overflow-x-auto rounded-lg border">
                  <table className="min-w-[900px] w-full text-xs sm:text-sm">
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
                      {filteredRows.map((row) => (
                        <tr
                          key={row.id}
                          className={`border-b last:border-0 ${
                            row.skipped ? "line-through opacity-50" : ""
                          }`}
                        >
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              checked={checked.has(row.id)}
                              onChange={(e) =>
                                toggleOne(row.id, e.target.checked)
                              }
                            />
                          </td>
                          <td className="px-4 py-3 text-blue-600">
                            <a
                              href={row.backlinks}
                              target="_blank"
                              rel="noreferrer"
                            >
                              {row.backlinks}
                            </a>
                          </td>
                          <td className="px-4 py-3">{row.anchor}</td>
                          <td className="px-4 py-3 text-blue-600">
                            <a
                              href={row.target}
                              target="_blank"
                              rel="noreferrer"
                            >
                              {row.target}
                            </a>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`rounded-full px-2 py-1 text-xs font-medium ${statusStyle(
                                row.status,
                              )}`}
                            >
                              {row.status?.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="inline-flex whitespace-nowrap rounded-full px-2 py-1 text-sm text-black">
                              {row.link_type ||
                                (row.dofollow ? "dofollow" : "nofollow")}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-600">
                            {getLifeSpan(row)}
                          </td>
                          <td className="px-4 py-3 text-gray-600">
                            {row.last_checked || "-"}
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
      }
    </>
  );
}
