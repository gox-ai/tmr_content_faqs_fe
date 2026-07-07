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
  const [linkCategory, setLinkCategory] = useState(filters.linkCategory || "");
  const [publishedDate, setPublishedDate] = useState(filters.publishedDate || "");

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
        onChange={(e) => update("lastChecked", e.target.value, setLastChecked)}
        className="rounded border px-2 py-1 text-sm"
      >
        <option value="">All</option>
        <option value="today">Today</option>
        <option value="7">Last 7 days</option>
        <option value="30">Last 30 days</option>
        <option value="never">Never checked</option>
      </select>

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
        onChange={(e) => update("publishedDate", e.target.value, setPublishedDate)}
        className="rounded border px-2 py-1 text-sm"
      >
        <option value="">All</option>
        <option value="today">Today</option>
        <option value="7">Last 7 days</option>
        <option value="30">Last 30 days</option>
        <option value="90">Last 90 days</option>
      </select>

      {Object.values(filters).some(Boolean) && (
        <button
          onClick={() => {
            setDofollow("");
            setStatus("");
            setLifeSpan("");
            setLastChecked("");
            setLinkCategory("");
            setPublishedDate("");
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
