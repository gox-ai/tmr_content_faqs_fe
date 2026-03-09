import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/faqs/HomePage.jsx";
import NewPage from "./pages/faqs/NewPage.jsx";
import ExistingPage from "./pages/faqs/ExistingPage.jsx";
import BacklinkTrackerPage from "./pages/backlink-tacker/BacklinkTrackerPage.jsx";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />

        {/* FAQ generator tool */}
        <Route path="/content-faqs/new" element={<NewPage />} />
        <Route path="/content-faqs/existing" element={<ExistingPage />} />
        {/* Backwards-compatible old paths, in case you still use them */}
        <Route path="/new" element={<NewPage />} />
        <Route path="/existing" element={<ExistingPage />} />

        {/* Backlink tracker */}
        <Route path="/backlink-tracker" element={<BacklinkTrackerPage />} />
        {/* Old misspelled path kept as alias */}
        <Route path="/backlink-tacker" element={<BacklinkTrackerPage />} />
      </Routes>
    </Router>
  );
}

