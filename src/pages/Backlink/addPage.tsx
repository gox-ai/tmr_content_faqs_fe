import { useState } from "react";

const ArrowLeft = ({
  size = 24,
  color = "currentColor",
}: {
  size?: number;
  color?: string;
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m12 19-7-7 7-7" />
    <path d="M19 12H5" />
  </svg>
);

export default function AddPage({
  onBack,
  initialData,
  onSave,
}: {
  onBack: () => void;
  initialData?: any;
  onSave: (data: any) => void;
}) {
  const [form, setForm] = useState({
    backlinks: initialData?.backlinks || "",
    anchor: initialData?.anchor || "",
    target: initialData?.target || "",
    published_at: initialData?.published_at
      ? initialData.published_at.split("T")[0]
      : "",
    link_category: initialData?.link_category || "",
    organization: initialData?.organization || "",
    contact_name: initialData?.contact_name || "",
    email: initialData?.email || "",
    linkedin_url: initialData?.linkedin_url || "",
    contacted_date: initialData?.contacted_date
      ? initialData.contacted_date.split("T")[0]
      : "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  function validate() {
    const newErrors: Record<string, string> = {};

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

    if (!form.link_category) {
      newErrors.link_category = "Type is required";
    }

    if (!form.target.trim()) {
      newErrors.target = "Target URL is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setIsSaving(true);
    try {
      await onSave(form);
    } finally {
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
            <ArrowLeft size={24} color="black" />
            Back to Dashboard
          </button>

          <div className="rounded-2xl border bg-white p-8 shadow-sm">
            <h2 className="text-lg font-bold text-black">
              {initialData ? "Modify Backlink" : "Add New Backlink"}
            </h2>

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
                  readOnly={!!initialData}
                  value={form.backlinks}
                  onChange={(e) => {
                    setForm({ ...form, backlinks: e.target.value });
                    if (errors.backlinks)
                      setErrors({ ...errors, backlinks: "" });
                  }}
                  placeholder="https://example.com/pages"
                  className={`mt-1 w-full rounded-lg border px-4 py-2.5 text-sm outline-none focus:border-black ${
                    initialData ? "opacity-50 cursor-not-allowed" : ""
                  } ${errors.backlinks ? "border-red-400" : ""}`}
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
                  readOnly={!!initialData}
                  value={form.anchor}
                  onChange={(e) => {
                    setForm({ ...form, anchor: e.target.value });
                    if (errors.anchor) setErrors({ ...errors, anchor: "" });
                  }}
                  placeholder="Anchor text"
                  className={`mt-1 w-full rounded-lg border px-4 py-2.5 text-sm outline-none focus:border-black ${
                    initialData ? "opacity-50 cursor-not-allowed" : ""
                  } ${errors.anchor ? "border-red-400" : ""}`}
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

              <div>
                <label className="text-sm font-medium text-black">Type</label>
                <p className="mt-1 text-xs text-gray-500">
                  Need to specify which domain is yours to determine link type
                </p>
                <select
                  value={form.link_category}
                  onChange={(e) =>
                    setForm({ ...form, link_category: e.target.value })
                  }
                  className="mt-1 w-full rounded-lg border px-4 py-2.5 text-sm outline-none focus:border-black"
                >
                  <option value="">Select type</option>
                  <option value="established">Established (backlink to external site)</option>
                  <option value="given">Given (link from your site)</option>
                </select>
                {errors.link_category && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.link_category}
                  </p>
                )}
              </div>

              <div className="border-t pt-4">
                <h3 className="text-sm font-bold text-black">Contact Details (Optional)</h3>
                <p className="mt-1 text-xs text-gray-500">
                  Enter contact info to track outreach. Organization can be auto-derived from domain.
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-black">Organization</label>
                <input
                  value={form.organization}
                  onChange={(e) =>
                    setForm({ ...form, organization: e.target.value })
                  }
                  placeholder="Company name (leave empty to auto-derive)"
                  className="mt-1 w-full rounded-lg border px-4 py-2.5 text-sm outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-black">Contact Name</label>
                <input
                  value={form.contact_name}
                  onChange={(e) =>
                    setForm({ ...form, contact_name: e.target.value })
                  }
                  placeholder="John Doe"
                  className="mt-1 w-full rounded-lg border px-4 py-2.5 text-sm outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-black">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    setForm({ ...form, email: e.target.value })
                  }
                  placeholder="john@example.com"
                  className="mt-1 w-full rounded-lg border px-4 py-2.5 text-sm outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-black">LinkedIn URL</label>
                <input
                  type="url"
                  value={form.linkedin_url}
                  onChange={(e) =>
                    setForm({ ...form, linkedin_url: e.target.value })
                  }
                  placeholder="https://linkedin.com/in/johndoe"
                  className="mt-1 w-full rounded-lg border px-4 py-2.5 text-sm outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-black">Contacted Date</label>
                <input
                  type="date"
                  value={form.contacted_date}
                  onChange={(e) =>
                    setForm({ ...form, contacted_date: e.target.value })
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
                  {isSaving
                    ? "Saving..."
                    : initialData
                      ? "Update Backlink"
                      : "Add Backlink"}
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

    </div>
  );
}
