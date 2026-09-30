import { useState } from "react";

interface FilterProps {
  page: string;
  onFilterChange: (filters: Record<string, any>) => void;
  filters: Record<string, any>;
}

export default function Filter({ page, onFilterChange, filters }: FilterProps) {
  const [dofollow, setDofollow] = useState(filters.dofollow || "");
  const [status, setStatus] = useState(filters.status || "");
  const [lifeSpan, setLifeSpan] = useState(filters.lifeSpan || "");
  const [lastChecked, setLastChecked] = useState(filters.lastChecked || "");
  const [lastCheckedFrom, setLastCheckedFrom] = useState(filters.lastCheckedFrom || "");
  const [lastCheckedTo, setLastCheckedTo] = useState(filters.lastCheckedTo || "");
  const [linkCategory, setLinkCategory] = useState(filters.linkCategory || "");
  const [publishedDate, setPublishedDate] = useState(filters.publishedDate || "");
  const [publishedFrom, setPublishedFrom] = useState(filters.publishedFrom || "");
  const [publishedTo, setPublishedTo] = useState(filters.publishedTo || "");

  function update(key: string, val: string, setter: (v: string) => void) {
    setter(val);
    onFilterChange({ ...filters, [key]: val || undefined });
  }

  return (
    <div className="mt-3 flex flex-wrap items-center gap-3 rounded-lg border bg-gray-50 px-4 py-3">
      <label className="text-xs font-medium text-gray-600">Status</label>
      <select
        value={status}
        onChange={(e) => update("status", e.target.value, setStatus)}
        className="rounded border px-2 py-1 text-sm"
      >
        <option value="">All</option>
        <option value="active">Active</option>
        <option value="lost">Lost</option>
      </select>

      <label className="text-xs font-medium text-gray-600">Link Type</label>
      <select
        value={dofollow}
        onChange={(e) => update("dofollow", e.target.value, setDofollow)}
        className="rounded border px-2 py-1 text-sm"
      >
        <option value="">All</option>
        <option value="dofollow">Dofollow</option>
        <option value="nofollow">Nofollow</option>
      </select>

      <label className="text-xs font-medium text-gray-600">Life Span</label>
      <select
        value={lifeSpan}
        onChange={(e) => update("lifeSpan", e.target.value, setLifeSpan)}
        className="rounded border px-2 py-1 text-sm"
      >
        <option value="">All</option>
        <option value="7">≤ 7 days</option>
        <option value="30">≤ 30 days</option>
        <option value="90">≤ 90 days</option>
        <option value="90+">90+ days</option>
      </select>

      <label className="text-xs font-medium text-gray-600">Last Checked</label>
      <select
        value={lastChecked}
        onChange={(e) => {
          const val = e.target.value;
          setLastChecked(val);
          if (val !== "custom") {
            setLastCheckedFrom("");
            setLastCheckedTo("");
          }
          onFilterChange({
            ...filters,
            lastChecked: val || undefined,
            lastCheckedFrom: val === "custom" ? lastCheckedFrom || undefined : undefined,
            lastCheckedTo: val === "custom" ? lastCheckedTo || undefined : undefined,
          });
        }}
        className="rounded border px-2 py-1 text-sm"
      >
        <option value="">All</option>
        <option value="today">Today</option>
        <option value="7">Last 7 days</option>
        <option value="30">Last 30 days</option>
        <option value="never">Never checked</option>
        <option value="custom">Custom range</option>
      </select>

      {lastChecked === "custom" && (
        <>
          <input
            type="date"
            value={lastCheckedFrom}
            max={lastCheckedTo || undefined}
            onChange={(e) => update("lastCheckedFrom", e.target.value, setLastCheckedFrom)}
            className="rounded border px-2 py-1 text-sm"
            aria-label="Last checked from"
          />
          <span className="text-xs text-gray-500">to</span>
          <input
            type="date"
            value={lastCheckedTo}
            min={lastCheckedFrom || undefined}
            onChange={(e) => update("lastCheckedTo", e.target.value, setLastCheckedTo)}
            className="rounded border px-2 py-1 text-sm"
            aria-label="Last checked to"
          />
        </>
      )}

      <label className="text-xs font-medium text-gray-600">Type</label>
      <select
        value={linkCategory}
        onChange={(e) => update("linkCategory", e.target.value, setLinkCategory)}
        className="rounded border px-2 py-1 text-sm"
      >
        <option value="">All</option>
        <option value="established">Established</option>
        <option value="given">Given</option>
      </select>

      <label className="text-xs font-medium text-gray-600">Published</label>
      <select
        value={publishedDate}
        onChange={(e) => {
          const val = e.target.value;
          setPublishedDate(val);
          if (val !== "custom") {
            setPublishedFrom("");
            setPublishedTo("");
          }
          onFilterChange({
            ...filters,
            publishedDate: val || undefined,
            publishedFrom: val === "custom" ? publishedFrom || undefined : undefined,
            publishedTo: val === "custom" ? publishedTo || undefined : undefined,
          });
        }}
        className="rounded border px-2 py-1 text-sm"
      >
        <option value="">All</option>
        <option value="today">Today</option>
        <option value="7">Last 7 days</option>
        <option value="30">Last 30 days</option>
        <option value="90">Last 90 days</option>
        <option value="custom">Custom range</option>
      </select>

      {publishedDate === "custom" && (
        <>
          <input
            type="date"
            value={publishedFrom}
            max={publishedTo || undefined}
            onChange={(e) => update("publishedFrom", e.target.value, setPublishedFrom)}
            className="rounded border px-2 py-1 text-sm"
            aria-label="Published from"
          />
          <span className="text-xs text-gray-500">to</span>
          <input
            type="date"
            value={publishedTo}
            min={publishedFrom || undefined}
            onChange={(e) => update("publishedTo", e.target.value, setPublishedTo)}
            className="rounded border px-2 py-1 text-sm"
            aria-label="Published to"
          />
        </>
      )}

      {Object.values(filters).some(Boolean) && (
        <button
          onClick={() => {
            setDofollow("");
            setStatus("");
            setLifeSpan("");
            setLastChecked("");
            setLastCheckedFrom("");
            setLastCheckedTo("");
            setLinkCategory("");
            setPublishedDate("");
            setPublishedFrom("");
            setPublishedTo("");
            onFilterChange({});
          }}
          className="ml-auto text-xs text-red-500 hover:underline"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
