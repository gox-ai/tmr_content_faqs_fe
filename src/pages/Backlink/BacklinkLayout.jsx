import React, { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import Dashboard from "./monitorPage";
import AddPage from "./addPage";

const BACKEND = `${import.meta.env.REACT_APP_API_URL}/api/backlinks`;

export default function BacklinkLayout() {
  const [view, setView] = useState("monitor");
  const [modifyData, setModifyData] = useState(null);

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
        onAdd={() => setView("add")}
        onModify={(row) => {
          setModifyData(row);
          setView("modify");
        }}
      />
    </>
  );
}
