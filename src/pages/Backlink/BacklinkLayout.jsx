import React, { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import Dashboard from "./monitorPage";
import AddPage from "./addPage";

const BACKEND = `${import.meta.env.VITE_API_URL}/api/backlinks`;

export default function BacklinkLayout() {
  const [view, setView] = useState("monitor");
  const [modifyData, setModifyData] = useState(null);
  const [refreshSignal, setRefreshSignal] = useState(0);

  // After an add, check the new backlink in the background so the user sees a
  // real status (active/lost) instead of "unchecked" without pressing Run.
  async function checkNewBacklink(data) {
    try {
      const checkRes = await fetch(`${BACKEND}/check-backlink`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          backlink: data.backlinks,
          target: data.target,
          anchor: data.anchor,
        }),
      });
      if (!checkRes.ok) return;
      const check = await checkRes.json();
      if (!check.status) return;

      await fetch(`${BACKEND}/backlinks`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          backlinks: data.backlinks,
          anchor: data.anchor,
          target: data.target,
          status: check.status,
          link_type: check.link_type,
          skipped: 0,
        }),
      });
      setRefreshSignal((s) => s + 1);
    } catch {
      // silent by design — the daily cron will pick it up anyway
    }
  }

  if (view === "add" || view === "modify") {
    return (
      <>
        <Toaster position="top-right" />
        <AddPage
          onBack={() => {
            setView("monitor");
            setModifyData(null);
          }}
          initialData={view === "modify" ? modifyData : undefined}
          onSave={async (data) => {
            const isModify = view === "modify";
            const res = await fetch(`${BACKEND}/backlinks`, {
              method: isModify ? "PUT" : "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(
                isModify
                  ? {
                      oldBacklinks: modifyData.backlinks,
                      oldAnchor: modifyData.anchor,
                      oldTarget: modifyData.target,
                      ...data,
                    }
                  : data,
              ),
            });
            if (res.ok) {
              toast.success(
                isModify
                  ? "Backlink modified successfully"
                  : "Backlink added successfully",
              );
              setView("monitor");
              setModifyData(null);
              if (!isModify) checkNewBacklink(data);
            } else {
              toast.error("Failed to save backlink");
            }
          }}
        />
      </>
    );
  }

  return (
    <>
      <Toaster position="top-right" />
      <Dashboard
        refreshSignal={refreshSignal}
        onAdd={() => setView("add")}
        onModify={(row) => {
          setModifyData(row);
          setView("modify");
        }}
      />
    </>
  );
}
